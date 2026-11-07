"use client";

import { Bot, Clapperboard, Pause, Play } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __AGENTS_ON?: boolean;
    __BOOT_AT?: number;
  }
}

const CREW: { name: string; color: string }[] = [
  { name: "Scout", color: "#ff3b2f" },
  { name: "Layout", color: "#38bdf8" },
  { name: "Typeset", color: "#f5c16c" },
  { name: "Motion", color: "#3ddc97" },
  { name: "QA", color: "#fb7185" },
  { name: "Deploy", color: "#60a5fa" },
  { name: "Copy", color: "#f97316" },
  { name: "Lint", color: "#c0e060" },
  { name: "Index", color: "#2dd4bf" },
  { name: "Render", color: "#f472b6" },
  { name: "Palette", color: "#facc15" },
  { name: "Review", color: "#d4d4d8" },
];

let tourLatch = false;

function inkFor(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const y = ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
  return y > 160 ? "#09090b" : "#ffffff";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch] ?? ch;
  });
}

function easeInOut(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
}

function easeOut(p: number) {
  return 1 - (1 - p) ** 3;
}

function tourDistance(t: number, total: number, distance: number) {
  const accel = total * 0.18;
  const decel = total * 0.18;
  const cruise = total - accel - decel;
  const velocity = distance / (0.5 * accel + cruise + 0.5 * decel);
  if (t <= 0) return 0;
  if (t >= total) return distance;
  if (t < accel) return 0.5 * (velocity / accel) * t * t;
  if (t < accel + cruise) return 0.5 * velocity * accel + velocity * (t - accel);
  const tau = t - accel - cruise;
  return 0.5 * velocity * accel + velocity * cruise + velocity * tau - 0.5 * (velocity / decel) * tau * tau;
}

type Cursor = {
  name: string;
  el: HTMLDivElement;
  x: number;
  y: number;
  enabled: boolean;
  busy: boolean;
};

type Job = {
  el: HTMLElement;
  cursor: Cursor;
  wire: HTMLDivElement;
  phase: "glide" | "frame" | "reveal";
  t: number;
  dur: number;
  sx: number;
  sy: number;
  text: string;
  chars: number;
  acc: number;
  step: number;
};

export function AgentRuntime() {
  const layerRef = useRef<HTMLDivElement>(null);
  const api = useRef({
    togglePause: () => {},
    toggleAgents: () => {},
    tour: () => {},
  });
  const [agentsOn, setAgentsOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [touring, setTouring] = useState(false);

  useLayoutEffect(() => {
    const on = window.__AGENTS_ON !== false;
    document.documentElement.classList.toggle("build-mode", on);
    document.documentElement.classList.toggle("agents-off", !on);
    document.documentElement.dataset.agents = on ? "on" : "off";
    setAgentsOn(on);
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let dead = false;
    let raf = 0;
    let booted = false;
    const bootMark = window.__BOOT_AT;
    const bootAt =
      typeof bootMark === "number" && bootMark < 1e11 ? bootMark : performance.now();
    const agentsRef = { on: window.__AGENTS_ON !== false };
    const pausedRef = { on: false };
    const setTouringRef = { current: setTouring };
    const setPausedRef = { current: setPaused };
    const setAgentsRef = { current: setAgentsOn };

    try {
      if (sessionStorage.getItem("portfolio-tour") === "1") {
        tourLatch = true;
        sessionStorage.removeItem("portfolio-tour");
      }
    } catch {
      /* storage unavailable */
    }

    let tourArmed = tourLatch;
    const tour = { active: false, elapsed: 0, duration: 0, distance: 0, origin: 0 };
    let expected = window.scrollY;
    let ignoreScrollUntil = 0;
    const graceUntil = performance.now() + 500;

    const nodes = [...document.querySelectorAll<HTMLElement>("[data-build]")];
    nodes.forEach((el, index) => {
      el.dataset.order = String(index);
      if (el.dataset.build === "type" && !("fulltext" in el.dataset)) {
        el.dataset.fulltext = el.textContent ?? "";
      }
    });

    const queue: HTMLElement[] = [];
    const active: Job[] = [];
    const cursors: Cursor[] = [];

    function phone() {
      return window.matchMedia("(max-width: 760px)").matches;
    }

    function makeCursor(agent: { name: string; color: string }, index: number) {
      const el = document.createElement("div");
      el.className = "agent-cursor";
      el.style.setProperty("--agent", agent.color);
      el.style.setProperty("--ink", inkFor(agent.color));
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M2.2 1.6 2.2 16.2 6.7 12.1 9.5 17.8 12.1 16.5 9.3 10.7 15.6 10.4Z" fill="#fff" stroke="#09090b" stroke-width="1"/>
        </svg>
        <div class="agent-meta">
          <div class="bot">
            <span class="antenna"><span class="antenna-tip" style="animation-delay:${index * 0.15}s"></span></span>
            <span class="bot-head">
              <i class="eye" style="animation-delay:${index * 0.23}s"></i>
              <i class="eye" style="animation-delay:${index * 0.23 + 0.08}s"></i>
            </span>
          </div>
          <span class="agent-tag">${escapeHtml(agent.name)}</span>
        </div>`;
      document.body.appendChild(el);
      return el;
    }

    if (agentsRef.on) {
      CREW.forEach((agent, index) => {
        const el = makeCursor(agent, index);
        cursors.push({
          name: agent.name,
          el,
          x: index % 2 === 0 ? -36 : window.innerWidth + 24,
          y: 48 + (index % 6) * 78,
          enabled: phone() ? index < 6 : true,
          busy: false,
        });
      });
    }

    function finishInstant(el: HTMLElement) {
      if (el.dataset.build === "type" && "fulltext" in el.dataset) {
        el.textContent = el.dataset.fulltext ?? "";
      }
      el.classList.add("is-built");
      el.classList.remove("is-building");
      el.style.clipPath = "";
      el.style.opacity = "";
      el.style.transform = "";
      el.style.minHeight = "";
      el.dataset.phase = "done";
    }

    function revealAll() {
      nodes.forEach((el) => finishInstant(el));
      queue.splice(0, queue.length);
    }

    function ancestorsReady(el: HTMLElement) {
      let parent = el.parentElement;
      while (parent) {
        if (parent.dataset.build) {
          const phase = parent.dataset.phase;
          const ready = phase === "reveal" || phase === "done" || parent.classList.contains("is-building") || parent.classList.contains("is-built");
          if (!ready) return false;
        }
        parent = parent.parentElement;
      }
      return true;
    }

    function enqueue(el: HTMLElement) {
      const phase = el.dataset.phase || "";
      if (phase && phase !== "wait") return;
      el.dataset.phase = "queued";
      queue.push(el);
      queue.sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    }

    function dequeue(el: HTMLElement) {
      const index = queue.indexOf(el);
      if (index >= 0) queue.splice(index, 1);
      if (el.dataset.phase === "queued") el.dataset.phase = "wait";
    }

    function placeWire(job: Job, rect: DOMRect, grow: number) {
      const wire = job.wire;
      wire.style.display = "block";
      wire.style.left = `${rect.left}px`;
      wire.style.top = `${rect.top}px`;
      wire.style.width = `${Math.max(2, rect.width * grow)}px`;
      wire.style.height = `${Math.max(2, rect.height * grow)}px`;
      const label = wire.querySelector("em");
      if (label instanceof HTMLElement) label.style.top = rect.top < 22 ? "4px" : "-18px";
    }

    function beginGlide(cursor: Cursor, el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      const dist = Math.hypot(rect.left - cursor.x, rect.top - cursor.y);
      const wire = document.createElement("div");
      wire.className = "wire";
      wire.style.display = "none";
      const label = `${cursor.name} · ${el.dataset.label || el.dataset.build || "Build"}`;
      wire.innerHTML = `<b class="tl"></b><b class="tr"></b><b class="bl"></b><b class="br"></b><em>${escapeHtml(label)}</em>`;
      layer?.appendChild(wire);
      const text = el.dataset.fulltext ?? el.textContent ?? "";
      const step = Math.min(22, Math.max(7, 1100 / Math.max(1, text.length)));
      const job: Job = {
        el,
        cursor,
        wire,
        phase: "glide",
        t: 0,
        dur: Math.max(320, Math.min(760, dist * 0.55)),
        sx: cursor.x,
        sy: cursor.y,
        text,
        chars: 0,
        acc: 0,
        step,
      };
      cursor.busy = true;
      el.dataset.phase = "glide";
      active.push(job);
    }

    function startReveal(job: Job) {
      const el = job.el;
      job.phase = "reveal";
      job.t = 0;
      el.dataset.phase = "reveal";
      const kind = el.dataset.build;
      if (kind === "type") {
        const height = el.getBoundingClientRect().height;
        el.style.minHeight = `${Math.max(height, 1)}px`;
        el.textContent = "";
        job.chars = 0;
        job.acc = 0;
        job.dur = job.step * Math.max(1, job.text.length);
      } else if (kind === "wipe") {
        job.dur = 680;
        el.style.clipPath = "inset(0 100% 0 0)";
      } else {
        job.dur = 420;
        el.style.opacity = "0";
        el.style.transform = "scale(0.94)";
      }
      el.classList.add("is-building");
      placeWire(job, el.getBoundingClientRect(), 1);
    }

    function retire(job: Job, index: number, instant: boolean) {
      job.wire.remove();
      job.cursor.busy = false;
      if (instant) finishInstant(job.el);
      else {
        if (job.el.dataset.build === "type") job.el.textContent = job.text;
        job.el.classList.add("is-built");
        job.el.classList.remove("is-building");
        job.el.style.clipPath = "";
        job.el.style.opacity = "";
        job.el.style.transform = "";
        job.el.style.minHeight = "";
        job.el.dataset.phase = "done";
      }
      active.splice(index, 1);
    }

    function releasePast(el: HTMLElement) {
      const index = active.findIndex((job) => job.el === el);
      if (index >= 0) retire(active[index], index, true);
      else {
        dequeue(el);
        finishInstant(el);
      }
    }

    function scan() {
      const viewHeight = window.innerHeight;
      for (const el of nodes) {
        if (el.dataset.phase === "done") continue;
        const rect = el.getBoundingClientRect();
        const past = rect.bottom <= 1 && rect.top < 0;
        const inView = el.dataset.view === "in" || (rect.top < viewHeight * 0.97 && rect.bottom > 8);
        if (past || el.dataset.view === "past") {
          if (rect.bottom <= 1 && rect.top < viewHeight * 0.2) {
            releasePast(el);
            continue;
          }
        }
        const phase = el.dataset.phase || "";
        if (inView && rect.bottom > 0 && rect.top < viewHeight && (phase === "" || phase === "wait")) enqueue(el);
        else if (!inView && phase === "queued") dequeue(el);
      }
    }

    function assign() {
      let guard = 0;
      while (active.length < 6 && queue.length && guard < 40) {
        guard += 1;
        const el = queue[0];
        if (!ancestorsReady(el)) return;
        const cursor = cursors.find((item) => item.enabled && !item.busy);
        if (!cursor) return;
        queue.shift();
        beginGlide(cursor, el);
      }
    }

    function updateJobs(dt: number) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        const job = active[index];
        const rect = job.el.getBoundingClientRect();
        if (rect.bottom <= 1 && rect.top < 0) {
          retire(job, index, true);
          continue;
        }
        job.t += dt;
        if (job.phase === "glide") {
          const progress = Math.min(1, job.t / job.dur);
          const eased = easeInOut(progress);
          job.cursor.x = job.sx + (rect.left - job.sx) * eased;
          job.cursor.y = job.sy + (rect.top - job.sy) * eased;
          if (progress >= 1) {
            job.phase = "frame";
            job.t = 0;
            job.dur = 340;
            job.el.dataset.phase = "frame";
          }
        } else if (job.phase === "frame") {
          const progress = Math.min(1, job.t / job.dur);
          const grow = easeOut(progress);
          placeWire(job, rect, grow);
          job.cursor.x = rect.left + rect.width * grow;
          job.cursor.y = rect.top + rect.height * grow;
          if (progress >= 1) startReveal(job);
        } else {
          placeWire(job, rect, 1);
          const kind = job.el.dataset.build;
          if (kind === "type") {
            job.acc += dt;
            while (job.acc >= job.step && job.chars < job.text.length) {
              job.acc -= job.step;
              job.chars += 1;
            }
            job.el.textContent = job.text.slice(0, job.chars);
            const progress = job.text.length ? job.chars / job.text.length : 1;
            job.cursor.x = rect.left + rect.width * progress;
            job.cursor.y = rect.top + Math.min(rect.height * 0.7, 16);
            if (job.chars >= job.text.length) retire(job, index, false);
          } else if (kind === "wipe") {
            const progress = Math.min(1, job.t / job.dur);
            const eased = easeOut(progress);
            job.el.style.clipPath = `inset(0 ${(1 - eased) * 100}% 0 0)`;
            job.cursor.x = rect.left + rect.width * eased;
            job.cursor.y = rect.top + Math.min(20, rect.height);
            if (progress >= 1) retire(job, index, false);
          } else {
            const progress = Math.min(1, job.t / job.dur);
            const eased = easeOut(progress);
            job.el.style.opacity = String(eased);
            job.el.style.transform = `scale(${0.94 + 0.06 * eased})`;
            job.cursor.x = rect.right - 6;
            job.cursor.y = rect.bottom - 6;
            if (progress >= 1) retire(job, index, false);
          }
        }
      }
    }

    function paintCursors(dt: number) {
      const narrow = phone();
      const enabled = cursors.filter((_, index) => (narrow ? index < 6 : true));
      cursors.forEach((cursor, index) => {
        cursor.enabled = narrow ? index < 6 : true;
        if (!cursor.enabled && !cursor.busy) {
          cursor.el.style.display = "none";
          return;
        }
        cursor.el.style.display = "block";
        if (cursor.busy) return;
        const slot = Math.max(0, enabled.indexOf(cursor));
        const gap = 58;
        const total = Math.max(0, enabled.length - 1) * gap;
        const targetX = window.innerWidth / 2 - total / 2 + slot * gap;
        const targetY = window.innerHeight - 118;
        const blend = Math.min(1, dt / 360);
        cursor.x += (targetX - cursor.x) * blend;
        cursor.y += (targetY - cursor.y) * blend;
      });
      for (const cursor of cursors) {
        cursor.el.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
      }
    }

    function openingReady() {
      const opening = document.querySelectorAll<HTMLElement>("header [data-build], #hero [data-build]");
      if (!opening.length) return false;
      for (const el of opening) {
        const rect = el.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inView && !el.classList.contains("is-built")) return false;
      }
      return true;
    }

    function stopTour() {
      tour.active = false;
      tourArmed = false;
      tourLatch = false;
      setTouringRef.current(false);
    }

    function beginTour() {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (max < 8) {
        stopTour();
        return;
      }
      ignoreScrollUntil = performance.now() + 120;
      window.scrollTo(0, 0);
      tour.active = true;
      tour.elapsed = 0;
      tour.origin = 0;
      tour.distance = max;
      tour.duration = Math.min(52000, Math.max(28000, max * 11));
      tourArmed = false;
      setTouringRef.current(true);
    }

    function updateTour(dt: number, now: number) {
      if (tourArmed && !tour.active) {
        if (openingReady() || now - bootAt > 14000) beginTour();
      }
      if (!tour.active) return;
      tour.elapsed += dt;
      const y = tour.origin + tourDistance(Math.min(tour.elapsed, tour.duration), tour.duration, tour.distance);
      expected = y;
      ignoreScrollUntil = performance.now() + 90;
      window.scrollTo(0, y);
      if (tour.elapsed >= tour.duration) stopTour();
    }

    function disableAgents() {
      agentsRef.on = false;
      window.__AGENTS_ON = false;
      try {
        localStorage.setItem("portfolio-agents", "off");
      } catch {
        /* ignore */
      }
      document.documentElement.classList.remove("build-mode");
      document.documentElement.classList.add("agents-off");
      document.documentElement.dataset.agents = "off";
      for (let index = active.length - 1; index >= 0; index -= 1) retire(active[index], index, true);
      revealAll();
      cursors.forEach((cursor) => {
        cursor.busy = false;
        cursor.el.style.display = "none";
      });
      const url = new URL(window.location.href);
      url.searchParams.set("agents", "off");
      history.replaceState(null, "", url);
      pausedRef.on = false;
      setPausedRef.current(false);
      setAgentsRef.current(false);
    }

    function enableAgents() {
      try {
        localStorage.setItem("portfolio-agents", "on");
      } catch {
        /* ignore */
      }
      const url = new URL(window.location.href);
      url.searchParams.set("agents", "on");
      window.location.assign(url.toString());
    }

    api.current.togglePause = () => {
      if (!agentsRef.on) return;
      pausedRef.on = !pausedRef.on;
      setPausedRef.current(pausedRef.on);
    };
    api.current.toggleAgents = () => {
      if (agentsRef.on) disableAgents();
      else enableAgents();
    };
    api.current.tour = () => {
      if (tour.active || tourArmed) {
        stopTour();
        return;
      }
      try {
        sessionStorage.setItem("portfolio-tour", "1");
      } catch {
        /* ignore */
      }
      window.location.reload();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.dataset.view = "in";
          else if (entry.boundingClientRect.top < 0) el.dataset.view = "past";
          else el.dataset.view = "out";
        }
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    nodes.forEach((el) => io.observe(el));

    function onUserMove() {
      if (performance.now() < graceUntil) return;
      if (tour.active || tourArmed) stopTour();
    }

    function onScroll() {
      if (!tour.active) return;
      if (performance.now() < ignoreScrollUntil) return;
      if (Math.abs(window.scrollY - expected) > 48) stopTour();
    }

    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      if (event.key === "Escape") {
        stopTour();
        return;
      }
      if (key === "p") {
        event.preventDefault();
        api.current.togglePause();
        return;
      }
      if (key === "a") {
        event.preventDefault();
        api.current.toggleAgents();
        return;
      }
      if (key === "t") {
        event.preventDefault();
        api.current.tour();
        return;
      }
      if (tour.active && ["arrowdown", "arrowup", "pageup", "pagedown", "home", "end", " "].includes(key)) {
        stopTour();
      }
    }

    window.addEventListener("wheel", onUserMove, { passive: true });
    window.addEventListener("touchmove", onUserMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);

    let last = performance.now();
    const tick = (now: number) => {
      if (dead) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(34, now - last);
      last = now;
      if (!booted) {
        const wait = agentsRef.on ? 1100 : 0;
        if (now - bootAt < wait && agentsRef.on) return;
        booted = true;
        document.documentElement.classList.add("boot-done");
        if (!agentsRef.on) revealAll();
      }
      if (pausedRef.on) return;
      if (agentsRef.on) {
        scan();
        updateJobs(dt);
        assign();
        paintCursors(dt);
      }
      updateTour(dt, now);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("wheel", onUserMove);
      window.removeEventListener("touchmove", onUserMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      for (let index = active.length - 1; index >= 0; index -= 1) {
        active[index].wire.remove();
        active[index].cursor.busy = false;
      }
      active.splice(0, active.length);
      cursors.forEach((cursor) => cursor.el.remove());
      layer.replaceChildren();
      nodes.forEach((el) => {
        if (el.dataset.build === "type" && "fulltext" in el.dataset) {
          el.textContent = el.dataset.fulltext ?? "";
        }
        el.classList.remove("is-built", "is-building");
        el.style.clipPath = "";
        el.style.opacity = "";
        el.style.transform = "";
        el.style.minHeight = "";
        delete el.dataset.phase;
        delete el.dataset.view;
      });
      document.documentElement.classList.remove("boot-done");
      api.current = { togglePause: () => {}, toggleAgents: () => {}, tour: () => {} };
    };
  }, []);

  return (
    <>
      <div id="build-layer" ref={layerRef} />
      <div className="dock">
        <div className="dock-bar" role="toolbar" aria-label="Build crew controls">
          <button
            type="button"
            className="btn"
            onClick={() => api.current.togglePause()}
            disabled={!agentsOn}
            aria-pressed={paused}
            aria-keyshortcuts="P"
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => api.current.toggleAgents()}
            aria-pressed={agentsOn}
            aria-keyshortcuts="A"
          >
            <Bot size={14} aria-hidden="true" />
            Agents
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => api.current.tour()}
            aria-pressed={touring}
            aria-keyshortcuts="T"
          >
            <Clapperboard size={14} aria-hidden="true" />
            {touring ? "Stop" : "Tour"}
          </button>
        </div>
        <p className="dock-keys">T tour · A agents · P pause · Esc stops tour</p>
      </div>
    </>
  );
}

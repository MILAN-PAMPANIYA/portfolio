import { tools } from "@/lib/content";

export function Stack() {
  const loop = [0, 1];
  return (
    <section className="section" id="stack">
      <div className="wrap">
        <p className="eyebrow mono" data-build="type" data-label="Stack label">
          Toolbox
        </p>
        <h2 className="display" data-build="wipe" data-label="Stack heading">
          Stack
        </h2>
        <p className="lede" data-build="type" data-label="Stack intro">
          Languages, web technologies, MySQL, editors, and core concepts from the
          resume. Python is marked as learning.
        </p>
      </div>
      <div className="marquee" data-build="pop" data-label="Marquee">
        <div className="marquee-track">
          {loop.map((copy) => (
            <ul className="tool-row" key={copy} aria-hidden={copy === 1}>
              {tools.map((tool) => (
                <li className="tool" key={`${copy}-${tool}`}>
                  <i aria-hidden="true" />
                  {tool}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

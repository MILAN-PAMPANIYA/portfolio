import { heroStats, person, summary } from "@/lib/content";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Introduction">
      <p className="wordmark" data-build="wipe" data-label="Wordmark" aria-hidden="true">
        <span className="wordmark-fill">PORTFOLIO</span>
        <span className="wordmark-sheen">PORTFOLIO</span>
      </p>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hello script" data-build="type" data-label="Hello">
            {summary.hello}
          </p>
          <h1 className="hero-name display" data-build="wipe" data-label="Name">
            {person.first}
            <br />
            {person.last}
          </h1>
          <p className="role" data-build="type" data-label="Role">
            {person.title} · {person.role}
          </p>
          <p className="bio" data-build="type" data-label="Bio">
            {summary.line1}
          </p>
          <p className="bio" data-build="type" data-label="Bio">
            {summary.line2}
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#work" data-build="pop" data-label="View work">
              View work
              <svg className="arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2.5v9M4.5 8.5 8 12l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>
            <p className="where" data-build="type" data-label="City">
              Based in {person.city}
            </p>
          </div>
        </div>
        <div className="hero-stats">
          {heroStats.map((stat) => (
            <p key={stat.label}>
              <strong className="stat-value display" data-build="wipe" data-label={stat.label}>
                {stat.value}
              </strong>
              <span className="stat-label mono" data-build="type" data-label={`${stat.label} label`}>
                {stat.label}
              </span>
            </p>
          ))}
        </div>
        <div className="hero-figure" data-build="pop" data-label="Portrait">
          <div className="hero-glow" aria-hidden="true" />
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/portrait.png?v=2`}
            alt={`Portrait of ${person.name}`}
            width={819}
            height={1024}
          />
        </div>
      </div>
    </section>
  );
}

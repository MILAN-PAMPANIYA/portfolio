import { project, workStats } from "@/lib/content";

export function Work() {
  return (
    <section className="section" id="work">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow mono" data-build="type" data-label="Work label">
              Project
            </p>
            <h2 className="display" data-build="wipe" data-label="Work heading">
              Work that ships
            </h2>
            <p className="lede" data-build="type" data-label="Work intro">
              A Java and MySQL ticket booking system for bus, train, and flight
              reservations. College faculty appreciated the build.
            </p>
          </div>
          <div className="work-stats">
            {workStats.map((stat) => (
              <p className="work-stat" key={stat.label} data-build="pop" data-label={stat.label}>
                <strong className="display">{stat.value}</strong>
                <span>{stat.label}</span>
                <small>{stat.detail}</small>
              </p>
            ))}
          </div>
        </div>

        <article className="project" data-build="pop" data-label="Project card">
          <h3 data-build="type" data-label="Project title">
            {project.name}
          </h3>
          <ul className="bullets">
            {project.bullets.map((item) => (
              <li key={item} data-build="type" data-label="Bullet">
                {item}
              </li>
            ))}
          </ul>
          <p className="note" data-build="type" data-label="Faculty note">
            {project.note}
          </p>
          <ul className="chips" data-build="pop" data-label="Tech">
            {project.tech.map((item) => (
              <li className="chip" key={item}>
                {item}
              </li>
            ))}
          </ul>
          <div className="link-row" data-build="pop" data-label="Links">
            <button type="button" className="btn btn-ghost" disabled>
              Live demo
            </button>
            <button type="button" className="btn btn-ghost" disabled>
              Source code
            </button>
          </div>
          <p className="fine" data-build="type" data-label="Link note">
            No public live or code link is listed on the resume.
          </p>
        </article>
      </div>
    </section>
  );
}

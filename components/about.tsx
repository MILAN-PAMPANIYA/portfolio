import { principles, skillGroups, summary } from "@/lib/content";

export function About() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <p className="eyebrow mono" data-build="type" data-label="About label">
          Profile
        </p>
        <h2 className="display" data-build="wipe" data-label="About heading">
          About
        </h2>
        <div className="about-grid">
          {summary.about.map((paragraph) => (
            <p key={paragraph} data-build="type" data-label="About copy">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="skills">
          {skillGroups.map((group) => (
            <article className="skill" key={group.label} data-build="pop" data-label={group.label}>
              <p className="mono">{group.label}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="principles">
          {principles.map((item, index) => (
            <article className="principle" key={item.title} data-build="pop" data-label={item.title}>
              <em>0{index + 1}</em>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

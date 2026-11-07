import { experience, person, project } from "@/lib/content";

const items = [
  {
    kicker: "Experience",
    title: experience.title,
    lines: [] as string[],
    points: experience.points,
  },
  {
    kicker: "Project",
    title: project.name,
    lines: [
      project.tech.join(" · "),
      "Received positive appreciation from college faculty.",
    ],
    points: [] as string[],
  },
  {
    kicker: "Education",
    title: person.institute,
    lines: [
      person.degree,
      `Currently pursuing ${person.semester}`,
      `Expected graduation: ${person.graduation}`,
    ],
    points: [] as string[],
  },
  {
    kicker: "Education",
    title: "Higher Secondary Education (Class 12)",
    lines: [`Percentage: ${person.class12}`],
    points: [] as string[],
  },
];

export function Record() {
  return (
    <section className="section" id="record">
      <div className="wrap">
        <p className="eyebrow mono" data-build="type" data-label="Record label">
          Timeline
        </p>
        <h2 className="display" data-build="wipe" data-label="Record heading">
          Record
        </h2>
        <p className="lede" data-build="type" data-label="Record intro">
          Independent practice, the faculty-recognized ticket system, and studies
          at LJ Institute of Engineering.
        </p>
        <ol className="record-list">
          {items.map((item) => (
            <li className="record-item" key={item.title} data-build="pop" data-label={item.kicker}>
              <p className="record-kicker mono">{item.kicker}</p>
              <div>
                <h3>{item.title}</h3>
                {item.lines.map((line) => (
                  <p className="meta-line" key={line}>
                    {line}
                  </p>
                ))}
                {item.points.length > 0 && (
                  <ul className="bullets">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import { person } from "@/lib/content";

const links = [
  ["Work", "#work"],
  ["Stack", "#stack"],
  ["Record", "#record"],
  ["About", "#about"],
  ["Contact", "#contact"],
] as const;

export function Header() {
  return (
    <header className="site-header" data-build="pop" data-label="Navigation">
      <a className="brand" href="#top">
        <i aria-hidden="true" />
        {person.name}
      </a>
      <nav className="nav" aria-label="Sections">
        {links.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

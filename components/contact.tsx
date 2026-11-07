import { Mail } from "lucide-react";
import { person } from "@/lib/content";

export function Contact() {
  const year = new Date().getFullYear();
  return (
    <section className="section page-pad" id="contact">
      <div className="wrap">
        <div className="contact-layout">
          <div>
            <p className="eyebrow mono" data-build="type" data-label="Contact label">
              Reach
            </p>
            <h2 className="display" data-build="wipe" data-label="Contact heading">
              Contact
            </h2>
            <p className="lede" data-build="type" data-label="Contact intro">
              Write about software, databases, or the ticket booking system.
              I&apos;m based in {person.city}, {person.region}.
            </p>
            <p className="email-block" data-build="pop" data-label="Email">
              <a className="mail" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </p>
          </div>
          <aside className="cta" data-build="pop" data-label="Call to action">
            <h3 className="display">Let&apos;s build something practical.</h3>
            <p>
              {person.city}, {person.region}. {person.degree}. Currently pursuing{" "}
              {person.semester}. Expected graduation {person.graduation}.
            </p>
            <a className="btn btn-primary" href={`mailto:${person.email}`}>
              <Mail size={16} aria-hidden="true" />
              Email {person.first}
            </a>
          </aside>
        </div>
        <footer className="site-footer" data-build="pop" data-label="Footer">
          <p>
            <strong>{person.formalName}</strong>
          </p>
          <p>
            {person.city}, {person.region}
          </p>
          <p>
            {person.title} · {person.role}
          </p>
          <p>© {year}</p>
        </footer>
      </div>
    </section>
  );
}

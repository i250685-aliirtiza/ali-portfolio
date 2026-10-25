import React, { Component, useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import {
  academicsSchema,
  projectsSchema,
  emptyAcademics,
  owner,
  type Academics,
  type Projects,
} from "../shared/contracts";
import { caseStudies, featured, notes, milestones } from "../shared/content";
import "./style.css";

const github = `https://github.com/${owner}`;
const date = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true">{diagonal ? "↗" : "↗".replace("↗", "→")}</span>
  );
}
function useFeed<T>(path: string, schema: z.ZodType<T>, initial: T) {
  const [feed, setFeed] = useState({ data: initial, failed: false });
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(path, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((v) => setFeed({ data: schema.parse(v), failed: false }))
      .catch(() => setFeed((f) => ({ ...f, failed: true })))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [path, schema]);
  return feed;
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="shell recovery">
        <h1>Something didn’t load.</h1>
        <p>Please reload the page, or explore my work on GitHub.</p>
        <a href={github}>
          Visit GitHub <Arrow diagonal />
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}
function SectionTitle({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{number}</span> / {label}
        </p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Work", "work"],
    ["Academics", "academics"],
    ["CP", "cp"],
    ["About", "about"],
    ["Contact", "contact"],
  ];
  return (
    <header className="shell header">
      <a className="wordmark" href="#top" aria-label="Ali Irtiza home">
        ali.irtiza<span> /</span>
      </a>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="navigation"
        onClick={() => setOpen(!open)}
      >
        Menu <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <nav
        id="navigation"
        aria-label="Main"
        className={open ? "is-open" : ""}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
          }
        }}
      >
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
function ProjectDiagram({ name }: { name: (typeof featured)[number] }) {
  if (name === "Neural-Network")
    return (
      <div className="network-diagram" aria-hidden="true">
        <div className="diagram-label mono">
          VALUES FORWARD · GRADIENTS BACKWARD
        </div>
        <div className="computation-flow">
          <span>x</span>
          <i>→</i>
          <span>w · x + b</span>
          <i>→</i>
          <span>tanh</span>
          <i>→</i>
          <span>L</span>
        </div>
        <div className="backward-flow mono">← CHAIN RULE / BACKPROPAGATION</div>
        <div className="arena-pair">
          <div>
            <span className="mono">PERSISTENT ARENA</span>
            <strong>Weights + biases</strong>
          </div>
          <div>
            <span className="mono">TEMPORARY ARENA</span>
            <strong>Computation graph</strong>
          </div>
        </div>
        <p className="diagram-footnote mono">Neuron → Layer → MLP</p>
      </div>
    );
  if (name === "Blackwood-Hargrove-Editor")
    return (
      <div className="editor-diagram" aria-hidden="true">
        <div className="editor-tabs mono">
          <span>Document 01</span>
          <span>Document 02</span>
        </div>
        <div className="editor-layout">
          <div>
            <span />
            <span />
            <span className="marked-line" />
            <span />
          </div>
          <div>
            <span />
            <span />
            <span />
            <span className="short-line" />
          </div>
        </div>
        <p className="mono">BUFFER → LINES → COLUMNS → PAGES</p>
      </div>
    );
  if (name === "PF_Project")
    return (
      <div className="game-diagram" aria-hidden="true">
        <div className="tile-grid">
          {Array.from({ length: 40 }, (_, i) => (
            <span
              key={i}
              className={
                [
                  4, 5, 12, 13, 24, 25, 26, 32, 33, 34, 35, 36, 37, 38, 39,
                ].includes(i)
                  ? "solid"
                  : ""
              }
            />
          ))}
        </div>
        <div className="game-systems mono">
          <span>INPUT & MOVEMENT</span>
          <span>GRAVITY & COLLISION</span>
          <span>SPRITE ANIMATION</span>
        </div>
      </div>
    );
  return (
    <div className="watcher-diagram" aria-hidden="true">
      <span>Observe</span>
      <i>→</i>
      <span>Compare</span>
      <i>→</i>
      <span>Notify</span>
    </div>
  );
}
function Work({ data, failed }: { data: Projects; failed: boolean }) {
  return (
    <section id="work" className="section shell">
      <SectionTitle
        number="01"
        label="SELECTED WORK"
        title="Selected engineering work."
      >
        <p className="work-intro">
          Four projects, with a look at the decisions underneath.
        </p>
      </SectionTitle>
      <div className="project-grid">
        {featured.map((name, i) => {
          const meta = data.projects.find((p) => p.name === name);
          const story = caseStudies[name];
          return (
            <article
              key={name}
              className={`project project-${i}`}
              data-project={name}
              aria-labelledby={`project-title-${i}`}
            >
              <div className="project-top">
                <span className="mono">
                  {String(i + 1).padStart(2, "0")} / {story.category}
                </span>
                <Arrow diagonal />
              </div>
              <div className="project-art">
                <ProjectDiagram name={name} />
              </div>
              <div className="project-copy">
                <h3 id={`project-title-${i}`}>{story.title}</h3>
                <p>{story.intro}</p>
                <div className="engineering-note">
                  <h4>Engineering choices</h4>
                  <p>{story.decision}</p>
                </div>
                <div className="tags">
                  {story.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="project-actions">
                  <a href={`${github}/${name}`}>
                    View source <Arrow diagonal />
                  </a>
                  <span className="project-updated mono">
                    {meta
                      ? `Updated ${date(meta.updatedAt)}`
                      : "Curated project · metadata unavailable"}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="sync-note">
        <span className={`status-dot ${data.stale || failed ? "saved" : ""}`} />
        {data.lastUpdated
          ? `${data.stale || failed ? "Saved repository metadata" : "Metadata refreshed hourly for these four projects"} · Last synced ${date(data.lastUpdated)}`
          : "Curated project notes · GitHub metadata is temporarily unavailable."}
      </p>
    </section>
  );
}
function AcademicRecord({
  data,
  failed,
}: {
  data: Academics;
  failed: boolean;
}) {
  const [selected, setSelected] = useState("");
  const semester =
    data.semesters.find((s) => s.key === selected) ?? data.semesters[0];
  const columns = [
    ["code", "Code"],
    ["title", "Course"],
    ["credits", "Credits"],
    ["grade", "Grade"],
  ] as const;
  const visible = columns.filter(([key]) =>
    semester?.courses.some((c) => c[key] !== undefined),
  );
  return (
    <section id="academics" className="section shell">
      <SectionTitle
        number="03"
        label="ACADEMICS"
        title="Learning, on the record."
      />
      <div className="academics-grid">
        <div className="academic-summary">
          <p className="eyebrow">CURRENT CGPA</p>
          <div className="gpa">
            {data.cgpa.toFixed(2)}
            <span> / 4.00</span>
          </div>
          <p className="provenance">
            {data.provenance === "self-reported"
              ? "Self-reported · awaiting transcript sync"
              : data.provenance === "owner-provided"
                ? "Owner-provided transcript · live sync pending"
                : "Verified transcript record"}
          </p>
          <div className="academic-school">
            <strong>BS Computer Science</strong>
            <p>
              FAST-NUCES
              <br />
              Islamabad
            </p>
          </div>
        </div>
        <div className="academic-detail">
          {semester ? (
            <>
              <div className="semester-heading">
                <div>
                  <label htmlFor="semester">Semester</label>
                  <select
                    id="semester"
                    value={semester.key}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    {data.semesters.map((s, i) => (
                      <option key={s.key} value={s.key}>
                        {s.label ?? `Semester ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                {semester.sgpa !== undefined && (
                  <p>
                    SGPA{" "}
                    <strong>
                      {semester.sgpa === null
                        ? semester.status === "in-progress"
                          ? "In progress"
                          : "Not available"
                        : semester.sgpa.toFixed(2)}
                    </strong>
                  </p>
                )}
              </div>
              {semester.cgpa !== undefined && (
                <p className="semester-cgpa">
                  Cumulative GPA after this term:{" "}
                  <strong>{semester.cgpa.toFixed(2)}</strong>
                  {semester.status === "in-progress"
                    ? " · carried forward while results are pending"
                    : ""}
                </p>
              )}
              {visible.length > 0 && (
                <div className="table-wrap">
                  <table>
                    <caption className="sr-only">
                      Published course results for{" "}
                      {semester.label ?? "selected semester"}
                    </caption>
                    <thead>
                      <tr>
                        {visible.map(([key, label]) => (
                          <th scope="col" key={key}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((c, i) => (
                        <tr key={i}>
                          {visible.map(([key]) => (
                            <td key={key}>
                              {key === "grade" &&
                              ["I", "IP"].includes(c.grade ?? "") ? (
                                <span className="grade-pending">
                                  {c.grade} · In progress
                                </span>
                              ) : (
                                (c[key] ?? "—")
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="academic-empty">
              <span className="record-symbol" aria-hidden="true">
                ≡
              </span>
              <h3>The detail comes with the data.</h3>
              <p>
                Detailed semester results are not yet synchronized. Verified
                course grades and semester records will appear here once they’re
                available for publication.
              </p>
              <span className="mono">TRANSCRIPT DETAILS PENDING</span>
            </div>
          )}
          <p className="sync-note">
            {data.lastSuccessfulSync
              ? `${data.stale || failed ? "Saved academic record · " : ""}Last successful academic sync: ${date(data.lastSuccessfulSync)}`
              : data.recordImportedAt
                ? `Owner-provided record imported ${date(data.recordImportedAt)} · Live sync pending.`
                : "No official transcript synchronized yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
function App() {
  const projects = useFeed("/api/public/projects", projectsSchema, {
    projects: [],
    lastUpdated: null,
    stale: true,
  });
  const academics = useFeed(
    "/api/public/academics",
    academicsSchema,
    emptyAcademics,
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <main id="main">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero-main">
            <p className="eyebrow">
              <span className="status-dot" /> COMPUTER SCIENCE STUDENT ·
              ISLAMABAD
            </p>
            <h1 id="hero-title">
              Ali Irtiza<span>.</span>
            </h1>
            <p className="hero-intro">
              I build useful software, study algorithms,
              <br className="desktop-break" /> and explore how systems work.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#work">
                View projects <Arrow />
              </a>
              <a className="button secondary" href="#academics">
                See academic record <Arrow />
              </a>
            </div>
            <p className="hero-footnote mono">
              FAST-NUCES ISLAMABAD <span> / </span> BS COMPUTER SCIENCE
            </p>
          </div>
          <aside className="focus-panel" aria-label="Current focus">
            <div className="panel-heading mono">
              <span>THE WORKBENCH</span>
              <span aria-hidden="true">[ a.i. ]</span>
            </div>
            <p>
              Curious about the details.
              <br />
              <span>Building to understand.</span>
            </p>
            <div className="focus-row">
              <span>01</span>
              <div>
                <strong>Algorithms</strong>
                <small>Graphs & dynamic programming</small>
              </div>
            </div>
            <div className="focus-row">
              <span>02</span>
              <div>
                <strong>Useful software</strong>
                <small>Tools that take care of the routine</small>
              </div>
            </div>
            <div className="focus-row">
              <span>03</span>
              <div>
                <strong>Systems & graphics</strong>
                <small>An interest in what’s underneath</small>
              </div>
            </div>
            <div className="panel-footer mono">
              <span className="status-dot" /> Always a student of the craft.
            </div>
          </aside>
        </section>
        <div className="intro-strip shell">
          <span className="mono">A PERSONAL WORK IN PROGRESS</span>
          <p>
            Code, coursework, and the things I’m figuring out along the way.
          </p>
          <span aria-hidden="true">↓</span>
        </div>
        <Work data={projects.data} failed={projects.failed} />
        <section className="section shell focus-section">
          <SectionTitle
            number="02"
            label="IN PROGRESS"
            title="What I’m working on."
          />
          <div className="interests">
            <article>
              <span className="mono">01 / PRACTICE</span>
              <h3>Thinking in algorithms</h3>
              <p>
                Working through data structures, graphs, and dynamic
                programming. Learning to find an approach before reaching for
                the code.
              </p>
            </article>
            <article>
              <span className="mono">02 / BUILD</span>
              <h3>Tools with a purpose</h3>
              <p>
                Exploring software automation and small, dependable systems that
                make everyday tasks easier.
              </p>
            </article>
            <article>
              <span className="mono">03 / EXPLORE</span>
              <h3>Closer to the machine</h3>
              <p>
                Learning C++ and exploring graphics programming. Building a game
                engine is a longer-term interest.
              </p>
            </article>
          </div>
        </section>
        <AcademicRecord data={academics.data} failed={academics.failed} />
        <section id="cp" className="section shell cp-section">
          <div>
            <p className="eyebrow">
              <span>04</span> / COMPETITIVE PROGRAMMING
            </p>
            <h2>
              A practice in
              <br />
              clear thinking.
            </h2>
          </div>
          <div>
            <p className="large-copy">
              Learning to meet an unfamiliar problem with a better set of
              questions.
            </p>
            <p>
              I’m focusing on graphs, dynamic programming, and solving problems
              without knowing the technique in advance. Codeforces and ICPC
              preparation give that practice a direction.
            </p>
            <div className="cp-topics">
              <span>Graphs</span>
              <span>Dynamic programming</span>
              <span>Problem solving</span>
            </div>
            {milestones.length > 0 && (
              <ul>
                {milestones.map((m) => (
                  <li key={m.title}>
                    <a href={m.evidence}>
                      {m.date} — {m.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a className="text-link" href={`${github}/CP-WATCHER`}>
              The tool I built to follow contests <Arrow diagonal />
            </a>
          </div>
        </section>
        <section id="about" className="section shell about-section">
          <div>
            <p className="eyebrow">
              <span>05</span> / BEYOND CODE
            </p>
            <h2>
              Away from
              <br />
              the keyboard.
            </h2>
          </div>
          <div className="about-copy">
            <p className="large-copy">
              Badminton was a big part of my school years.
            </p>
            <p>
              I enjoyed competing and getting better at it. It’s an interest
              that has stayed with me alongside computer science.
            </p>
            <span className="mono about-signature">ALI IRTIZA / ISLAMABAD</span>
          </div>
        </section>
        <section className="section shell notes-section">
          <SectionTitle
            number="06"
            label="NOTES / LEARNING LOG"
            title="Room for reflection."
          />
          {notes.length ? (
            notes.map((n) => (
              <a key={n.url} href={n.url}>
                {n.title} — {n.date}
              </a>
            ))
          ) : (
            <div className="notes-empty">
              <span className="mono">NO ENTRIES YET</span>
              <p>
                A place for notes on what I’m learning.
                <br />
                Nothing published just yet.
              </p>
              <span aria-hidden="true">✳</span>
            </div>
          )}
        </section>
        <section id="contact" className="contact-section">
          <div className="shell contact-inner">
            <div>
              <p className="eyebrow">KEEP IN TOUCH</p>
              <h2>Start with the code.</h2>
              <p>My projects and ongoing experiments live on GitHub.</p>
            </div>
            <a className="button primary" href={github}>
              Find me on GitHub <Arrow diagonal />
            </a>
          </div>
        </section>
      </main>
      <footer className="shell footer">
        <a className="wordmark" href="#top">
          ali.irtiza<span> /</span>
        </a>
        <p>Made with care. Still learning.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Boundary>
      <App />
    </Boundary>
  </React.StrictMode>,
);

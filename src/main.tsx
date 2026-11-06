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
import { projectImages } from "../shared/media";
import { Competitions } from "./Competitions";
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
    <div className="section-heading reveal">
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
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("work");
  const links = [
    ["Work", "work"],
    ["Academics", "academics"],
    ["CP", "cp"],
    ["Competitions", "competitions"],
    ["About", "about"],
    ["Contact", "contact"],
  ];
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const sections = links
      .map(([, id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: [0.1, 0.35, 0.7] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return (
    <header className={`shell header${scrolled ? " is-scrolled" : ""}`}>
      <a className="wordmark" href="#top" aria-label="Ali Irtiza Ahmed home">
        ali.irtiza.ahmed<span> /</span>
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
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "location" : undefined}
            onClick={() => {
              setActive(id);
              setOpen(false);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
function ProjectDiagram({ name }: { name: (typeof featured)[number] }) {
  const media = projectImages[name];
  if (media)
    return (
      <figure className="project-image">
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
        />
        <figcaption>
          {media.caption}
          {media.reference && (
            <>
              {" "}
              <a href={media.reference.url}>{media.reference.label}</a>
            </>
          )}
        </figcaption>
      </figure>
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
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".project"));
    const cleanups = cards.map((card) => {
      let frame = 0;
      const move = (event: PointerEvent) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || event.pointerType === "touch") return;
        const rect = card.getBoundingClientRect();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty("--tilt-x", `${(-y * 2.2).toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${(x * 2.2).toFixed(2)}deg`);
        });
      };
      const reset = () => { cancelAnimationFrame(frame); card.style.removeProperty("--tilt-x"); card.style.removeProperty("--tilt-y"); };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
      return () => { cancelAnimationFrame(frame); card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", reset); };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
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
              className={`project project-${i} reveal reveal-delay-${i + 1}`}
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
                  <a href={`/projects/${projectSlugs[name]}`}>
                    Case study <Arrow />
                  </a>
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
const projectSlugs: Record<(typeof featured)[number], string> = {
  "Neural-Network": "neural-network",
  "Blackwood-Hargrove-Editor": "arcanum-editor",
  PF_Project: "tumblepop",
  "FLEX-WATCHER": "flex-watcher",
};
function ProjectCaseStudy({ name }: { name: (typeof featured)[number] }) {
  const story = caseStudies[name];
  const media = projectImages[name];
  return (
    <main className="case-study shell">
      <a className="back-link" href="/#work">← Back to selected work</a>
      <header className="case-header">
        <p className="eyebrow"><span>PROJECT</span> / {story.category}</p>
        <h1>{story.title}</h1>
        <p className="case-intro">{story.intro}</p>
        <div className="tags">{story.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </header>
      {media && (
        <figure className="case-media">
          <img src={media.src} alt={media.alt} width={media.width} height={media.height} />
          {media.caption && <figcaption>{media.caption}</figcaption>}
        </figure>
      )}
      <div className="case-grid">
        <section>
          <p className="eyebrow">01 / ENGINEERING DECISIONS</p>
          <h2>What sits underneath.</h2>
          <p>{story.decision}</p>
          {name === "Neural-Network" && <NeuralNetworkDemo />}
          {name === "Blackwood-Hargrove-Editor" && <EditorBufferDemo />}
          {name === "PF_Project" && <TumblepopDemo />}
          {name === "FLEX-WATCHER" && <FlexWatcherDemo />}
        </section>
        <aside className="case-facts">
          <p className="eyebrow">PROJECT RECORD</p>
          <dl>
            <div><dt>Repository</dt><dd><a href={`${github}/${name}`}>View source ↗</a></dd></div>
            <div><dt>Format</dt><dd>{story.category.split(" /")[0]}</dd></div>
            <div><dt>Status</dt><dd>Curated project record</dd></div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
type NeuralModel = { w1: number[][]; b1: number[]; w2: number[]; b2: number };
const xorData = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
const initialNeuralModel = (): NeuralModel => ({
  w1: [[-0.8, 0.7], [0.6, -0.9]], b1: [0.1, -0.1], w2: [0.8, 0.8], b2: 0,
});
function predictXor(model: NeuralModel, x: number[]) {
  const hidden = model.w1.map((row, i) => Math.tanh(row[0] * x[0] + row[1] * x[1] + model.b1[i]));
  return Math.tanh(hidden[0] * model.w2[0] + hidden[1] * model.w2[1] + model.b2);
}
function trainXor(model: NeuralModel, epochs: number) {
  const next = { w1: model.w1.map((r) => [...r]), b1: [...model.b1], w2: [...model.w2], b2: model.b2 };
  for (let e = 0; e < epochs; e++) for (const [a, b, target] of xorData) {
    const h = next.w1.map((row, i) => Math.tanh(row[0] * a + row[1] * b + next.b1[i]));
    const out = Math.tanh(h[0] * next.w2[0] + h[1] * next.w2[1] + next.b2);
    const deltaOut = (out - target) * (1 - out * out);
    const deltaH = h.map((value, i) => deltaOut * next.w2[i] * (1 - value * value));
    next.w2 = next.w2.map((weight, i) => weight - 0.08 * deltaOut * h[i]);
    next.b2 -= 0.08 * deltaOut;
    next.w1 = next.w1.map((row, i) => [row[0] - 0.08 * deltaH[i] * a, row[1] - 0.08 * deltaH[i] * b]);
    next.b1 = next.b1.map((value, i) => value - 0.08 * deltaH[i]);
  }
  return next;
}
function NeuralNetworkDemo() {
  const [model, setModel] = useState(initialNeuralModel);
  const [epoch, setEpoch] = useState(0);
  const predictions = xorData.map(([a, b]) => predictXor(model, [a, b]));
  const loss = xorData.reduce((sum, [, , target], i) => sum + (predictions[i] - target) ** 2, 0) / 4;
  return (
    <div className="neural-demo" aria-label="Interactive XOR neural network demonstration">
      <div className="neural-demo-heading"><div><p className="eyebrow">INTERACTIVE STUDY</p><h3>Watch a tiny network learn XOR.</h3></div><span className="mono">{epoch} EPOCHS</span></div>
      <div className="neural-network-diagram" aria-hidden="true"><span className="neuron-col"><i /><i /></span><span className="network-lines">↗ ↘<br />↘ ↗</span><span className="neuron-col"><i /></span></div>
      <div className="xor-results">{xorData.map(([a, b, target], i) => <div key={`${a}${b}`}><span className="mono">{a} ⊕ {b}</span><strong>{predictions[i].toFixed(2)}</strong><small>target {target}</small></div>)}</div>
      <div className="neural-demo-footer"><span>Mean squared error <strong>{loss.toFixed(3)}</strong></span><div><button className="button secondary" onClick={() => { setModel(trainXor(model, 250)); setEpoch((value) => value + 250); }}>Train 250</button><button className="button primary" onClick={() => { setModel(initialNeuralModel()); setEpoch(0); }}>Reset</button></div></div>
    </div>
  );
}
function EditorBufferDemo() {
  const [text, setText] = useState("A line in the current page.");
  return (
    <div className="study-demo editor-demo">
      <div className="study-demo-heading"><p className="eyebrow">BUFFER STUDY</p><span className="mono">CURRENT PAGE</span></div>
      <label htmlFor="buffer-input">Edit the current page buffer</label>
      <textarea id="buffer-input" value={text} onChange={(event) => setText(event.target.value)} rows={3} />
      <div className="study-demo-meta mono"><span>{text.length} characters</span><span>{text.split(/\n/).length} lines</span><span>tab 01</span></div>
    </div>
  );
}
function TumblepopDemo() {
  const [captured, setCaptured] = useState(false);
  return (
    <div className="study-demo tumble-demo">
      <div className="study-demo-heading"><p className="eyebrow">COLLISION STUDY</p><span className="mono">SYNTHETIC</span></div>
      <div className="tumble-stage" aria-live="polite"><span className="player">◉</span><span className={`enemy ${captured ? "captured" : ""}`}>◆</span><span className="floor" /></div>
      <p>{captured ? "Enemy captured by the directional vacuum." : "A compact model of the project’s capture interaction."}</p>
      <button className="button secondary" onClick={() => setCaptured((value) => !value)}>{captured ? "Release enemy" : "Capture enemy"}</button>
    </div>
  );
}
function FlexWatcherDemo() {
  const [stage, setStage] = useState<"idle" | "changed" | "error">("idle");
  const changed = stage === "changed";
  const error = stage === "error";
  return (<div className="study-demo watcher-demo" aria-label="Synthetic FLEX Watcher workflow demonstration">
    <div className="study-demo-heading"><div><p className="eyebrow">SYNTHETIC SIMULATION</p><h3>Detect → compare → notify.</h3></div><span className="mono">NO AUTH REQUESTS</span></div>
    <p className="watcher-boundary">All marks below are fictional. The browser never contacts FLEX or the watcher service.</p>
    <div className="watcher-flow" aria-label="Monitoring workflow"><span className="flow-node is-active">poll<br /><small>authorized response</small></span><i>→</i><span className={"flow-node " + (changed || error ? "is-active" : "")}>compare<br /><small>last-good snapshot</small></span><i>→</i><span className={"flow-node " + (changed ? "is-active" : "")}>notify<br /><small>email queued</small></span></div>
    <div className="snapshot-grid"><div><span className="mono">LAST GOOD SNAPSHOT</span><strong>2.74</strong><small>Algorithms · 3 credits</small></div><span className="snapshot-arrow">→</span><div className={changed ? "snapshot-new" : ""}><span className="mono">LATEST POLL</span><strong>{error ? "—" : changed ? "2.80" : "2.74"}</strong><small>{error ? "Simulated challenge" : changed ? "Diff: +0.06" : "No changes"}</small></div></div>
    <p className={`watcher-message ${error ? "is-error" : changed ? "is-change" : ""}`} role="status">{error ? "Poll failed safely. The last-good snapshot remains available." : changed ? "Change detected. A sample notification is ready below." : "Polling a synthetic snapshot. No notification needed."}</p>
    {changed && <div className="watcher-notification"><span className="mono">SAMPLE NOTIFICATION</span><strong>FLEX marks changed</strong><span>Algorithms: 2.74 → 2.80</span></div>}
    <div className="watcher-actions"><button className="button secondary" onClick={() => setStage(changed ? "idle" : "changed")}>{changed ? "Restore baseline" : "Simulate mark change"}</button><button className="button secondary" onClick={() => setStage(error ? "idle" : "error")}>{error ? "Clear error" : "Simulate error"}</button>{(changed || error) && <button className="button ghost" onClick={() => setStage("idle")}>Reset flow</button>}</div>
  </div>);
}
function ProjectRoute() {
  const slug = window.location.pathname.replace(/^\/projects\//, "").replace(/\/$/, "");
  const name = featured.find((project) => projectSlugs[project] === slug);
  if (!name) return null;
  return <ProjectCaseStudy name={name} />;
}
function AcademicRecord({
  data,
  failed,
}: {
  data: Academics;
  failed: boolean;
}) {
  const [selected, setSelected] = useState("");
  const [displayCgpa, setDisplayCgpa] = useState(data.cgpa);
  useEffect(() => {
    if (!data.cgpa || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplayCgpa(data.cgpa); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => { const progress = Math.min((now - start) / 700, 1); setDisplayCgpa(data.cgpa * (1 - Math.pow(1 - progress, 3))); if (progress < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data.cgpa]);
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
    <section id="academics" className="section shell reveal">
      <SectionTitle
        number="03"
        label="ACADEMICS"
        title="Learning, on the record."
      />
      <div className="academics-grid">
        <div className="academic-summary">
          <p className="eyebrow">CURRENT CGPA</p>
          <div className="gpa">
            {displayCgpa.toFixed(2)}
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
                  <span className="semester-course-count mono">{semester.courses.length} courses</span>
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
              {semester.status === "in-progress" && <p className="academic-status" role="status">In progress · pending results stay separate from completed grades.</p>}
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
          <p className="sync-note" aria-live="polite">
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
  const route = ProjectRoute();
  if (route) return route;
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
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { nodes.forEach((node) => node.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8%" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
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
              Ali Irtiza Ahmed<span>.</span>
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
        <Competitions />
        <section id="about" className="section shell about-section">
          <div>
            <p className="eyebrow">
              <span>06</span> / BEYOND CODE
            </p>
            <h2>
              Away from
              <br />
              the keyboard.
            </h2>
          </div>
          <div className="about-copy">
            <figure className="badminton-photo">
              <img
                src="/images/badminton.webp"
                width="1200"
                height="900"
                alt="Four school students seated together outdoors with badminton trophies."
                loading="lazy"
                decoding="async"
              />
            </figure>
            <p className="large-copy">
              Badminton was a big part of my school years.
            </p>
            <p>
              I enjoyed competing and getting better at it. It’s an interest
              that has stayed with me alongside computer science.
            </p>
            <span className="mono about-signature">
              ALI IRTIZA AHMED / ISLAMABAD
            </span>
          </div>
        </section>
        {notes.length > 0 && (
          <section className="section shell notes-section">
            <SectionTitle number="07" label="NOTES / LEARNING LOG" title="Room for reflection." />
            {notes.map((n) => <a key={n.url} href={n.url}>{n.title} — {n.date}</a>)}
          </section>
        )}
        <section id="contact" className="contact-section">
          <div className="shell contact-inner">
            <div>
              <p className="eyebrow">KEEP IN TOUCH</p>
              <h2>Let’s connect.</h2>
              <p>Explore my work, connect on LinkedIn, or send me an email.</p>
            </div>
            <div className="contact-links">
              <a className="button primary" href={github}>
                Find me on GitHub <Arrow diagonal />
              </a>
              <a
                className="text-link"
                href="https://www.linkedin.com/in/ali-irtiza-b208ba21b/"
              >
                LinkedIn <Arrow diagonal />
              </a>
              <a className="text-link" href="mailto:i250685@isb.nu.edu.pk">
                i250685@isb.nu.edu.pk <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="shell footer">
        <a className="wordmark" href="#top">
          ali.irtiza.ahmed<span> /</span>
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


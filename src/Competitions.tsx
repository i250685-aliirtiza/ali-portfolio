import { competitions, newestFirst } from "../shared/competitions";

export function Competitions() {
  return (
    <section
      id="competitions"
      className="section shell"
      aria-labelledby="competitions-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span>05</span> / COMPETITIONS
          </p>
          <h2 id="competitions-title">Learning under pressure.</h2>
        </div>
        <p className="work-intro">
          A record of contests, hackathons, and technical competitions.
        </p>
      </div>
      <div className="competition-archive">
        {newestFirst(competitions).map((event) => (
          <article
            className="competition-event"
            key={event.id}
            aria-labelledby={event.id}
          >
            <div className="competition-copy">
              <p className="eyebrow">
                {event.date ? (
                  <time dateTime={event.date}>{event.date}</time>
                ) : (
                  <time dateTime={String(event.year)}>{event.year}</time>
                )}{" "}
                / PARTICIPATION
              </p>
              <h3 id={event.id}>{event.name}</h3>
              <p className="competition-organizer">
                {event.organizer}
                {event.location && !event.organizer.includes(event.location)
                  ? ` · ${event.location}`
                  : ""}
              </p>
              <dl className="competition-results">
                {event.categories.map((category) => (
                  <div key={category.name}>
                    <dt>{category.name}</dt>
                    <dd>{category.result}</dd>
                  </div>
                ))}
              </dl>
              {event.commentary && <p>{event.commentary}</p>}
              {event.distinctions?.map((item, i) => (
                <p key={i}>
                  {item.category}:{" "}
                  {[item.award, item.ranking].filter(Boolean).join(" · ")}
                </p>
              ))}
              {event.references?.map((ref) => (
                <a className="text-link" href={ref.url} key={ref.url}>
                  {ref.label}
                </a>
              ))}
            </div>
            <div className="competition-photographs">
              {event.photographs?.length ? (
                event.photographs.map((photo) => (
                  <figure key={photo.src}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{photo.caption}</figcaption>
                  </figure>
                ))
              ) : (
                <div className="photo-placeholder">
                  <span className="mono">FROM THE EVENT</span>
                  <p>A photograph will be added here.</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

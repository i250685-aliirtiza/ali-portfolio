import { load } from "cheerio";
import { transcriptSchema } from "../shared/contracts.js";

/** Reviewed against the owner's redacted /Student/Transcript capture.
 * Private columns (section, points, type, remarks) are deliberately discarded.
 */
export function parseFlexTranscript(html: string) {
  if (
    !html.trim() ||
    html.length > 2_000_000 ||
    /cf-chl-|challenge-platform|cf-turnstile|verify you are human|checking your browser/i.test(
      html,
    )
  )
    throw new Error("transcript_unverified");
  const $ = load(html, { sourceCodeLocationInfo: true });
  if (
    $(
      'input[type="password"],form[action*="login" i],script[src*="challenges.cloudflare.com"]',
    ).length
  )
    throw new Error("transcript_auth_required");
  function closed(nodes: ReturnType<typeof $>) {
    if (
      nodes.length !== 1 ||
      !(nodes[0] as unknown as { sourceCodeLocation?: { endTag?: unknown } })
        .sourceCodeLocation?.endTag
    )
      throw new Error("transcript_incomplete_or_ambiguous");
    return nodes;
  }
  const text = (nodes: ReturnType<typeof $>) =>
    closed(nodes).text().replace(/\s+/g, " ").trim();
  const number = (value: string) => {
    if (!/^\d+(?:\.\d+)?$/.test(value))
      throw new Error("transcript_invalid_number");
    return Number(value);
  };
  const heading = $(".m-portlet__head-text").filter(
    (_, e) => $(e).text().trim() === "Student Transcript",
  );
  const root = closed(closed(heading).closest(".m-portlet")).children(
    ".m-portlet__body",
  );
  closed(root);
  const tables = root.find("table");
  if (!tables.length) throw new Error("transcript_empty");
  const records = tables
    .toArray()
    .map((table) => {
      const t = closed($(table));
      const semester = closed(t.parent(".col-md-6"));
      if (semester.children("table").length !== 1)
        throw new Error("transcript_ambiguous_term");
      const label = text(semester.find("h5"));
      const match = /^(Spring|Summer|Fall) (20\d{2})$/.exec(label);
      if (!match) throw new Error("transcript_unknown_term_order");
      const order =
        Number(match[2]) * 3 + ["Spring", "Summer", "Fall"].indexOf(match[1]);
      const summary = (name: string) => {
        const spans = semester
          .find(".pull-right > span")
          .filter((_, e) => $(e).text().trim().startsWith(`${name}:`));
        return number(
          text(spans)
            .slice(name.length + 1)
            .trim(),
        );
      };
      const cgpa = summary("CGPA");
      const sgpa = summary("SGPA");
      const headers = closed(t.children("thead"))
        .find("th")
        .toArray()
        .map((e) => text($(e)));
      const expected = [
        "Code",
        "Course Name",
        "Section",
        "CrdHrs",
        "Grade",
        "Points",
        "Type",
        "Remarks",
      ];
      if (
        headers.length !== expected.length ||
        new Set(headers).size !== headers.length ||
        expected.some((h) => !headers.includes(h))
      )
        throw new Error("transcript_columns_changed");
      const body = closed(t.children("tbody"));
      const courses = body
        .children("tr")
        .toArray()
        .map((row) => {
          const cells = closed($(row)).children("td");
          if (cells.length !== headers.length)
            throw new Error("transcript_incomplete_course");
          const field = (name: string) => text(cells.eq(headers.indexOf(name)));
          return {
            code: field("Code"),
            title: field("Course Name"),
            credits: number(field("CrdHrs")),
            grade: field("Grade"),
          };
        });
      const inProgress = courses.some((c) =>
        ["I", "IP", "NG", "-", "N/A"].includes(c.grade),
      );
      return {
        label,
        order,
        cgpa,
        sgpa: inProgress ? null : sgpa,
        status: inProgress ? "in-progress" : "completed",
        courses,
      };
    })
    .sort((a, b) => a.order - b.order);
  // Source-reported cumulative value only; never average semester GPAs.
  return transcriptSchema.parse({
    cgpa: records.at(-1)!.cgpa,
    semesters: records,
  });
}

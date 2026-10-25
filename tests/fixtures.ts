// Explicitly synthetic. This is a parser contract exercise, NOT the FLEX DOM.
import type { Profile } from "../server/transcript.js";
export const profile: Profile = {
  evidenceSha256: "0".repeat(64),
  root: "#synthetic-record",
  cgpa: ".cgpa",
  semester: ".semester",
  semesterLabel: "h2",
  orderAttribute: "data-order",
  sgpa: ".sgpa",
  row: "tbody tr",
  code: ".code",
  title: ".title",
  grade: ".grade",
  credits: ".credits",
};
export const html = `<!doctype html><html><body><div id="synthetic-record"><p class="cgpa">2.70</p>
<section class="semester" data-order="2"><h2>Example term B</h2><p class="sgpa">2.90</p><table><tbody><tr><td class="code">TEST202</td><td class="title">Synthetic Algorithms</td><td class="grade">B</td><td class="credits">3</td></tr><tr><td class="code">TEST203</td><td class="title">Synthetic Elective</td><td class="grade">W</td><td class="credits">0</td></tr></tbody></table></section>
<section class="semester" data-order="1"><h2>Example term A</h2><p class="sgpa">2.50</p><table><tbody><tr><td class="code">TEST101</td><td class="title">Synthetic Foundations</td><td class="grade">C+</td><td class="credits">3</td></tr></tbody></table></section>
</div></body></html>`;

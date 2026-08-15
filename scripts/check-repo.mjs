import { readFileSync, existsSync } from "node:fs";

const required = [
  "README.md",
  "LICENSE",
  "CITATION.cff",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "OPEN_CORE.md",
  "app/index.html",
  "app/styles.css",
  "app/script.js"
];

for (const path of required) {
  if (!existsSync(path)) throw new Error(`Missing required file: ${path}`);
}

const html = readFileSync("app/index.html", "utf8");
const js = readFileSync("app/script.js", "utf8");

for (const token of ["simCanvas", "ttc", "pet"]) {
  if (!html.includes(token)) throw new Error(`index.html does not contain expected token: ${token}`);
}

for (const token of ["collision", "pet", "ttc"]) {
  if (!js.toLowerCase().includes(token)) throw new Error(`script.js does not contain expected token: ${token}`);
}

console.log("Repository structure checks passed.");

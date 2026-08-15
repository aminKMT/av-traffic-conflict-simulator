import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../app/index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../app/script.js", import.meta.url), "utf8");

test("HTML wires simulator assets", () => {
  assert.match(html, /styles\.css/);
  assert.match(html, /script\.js/);
  assert.match(html, /id="simCanvas"/);
});

test("HTML exposes TTC and PET metrics", () => {
  assert.match(html, /id="ttc"/);
  assert.match(html, /id="pet"/);
});

test("JavaScript contains collision and PET logic", () => {
  assert.match(js, /collision/i);
  assert.match(js, /pet/i);
  assert.match(js, /predicted/i);
});

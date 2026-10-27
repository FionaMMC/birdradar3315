import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import type { ComponentType } from "react";
import type { BirdStamp } from "../components/atlas/StampCard.tsx";

const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync(new URL("../components/atlas/StampCard.tsx", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const module = { exports: {} as { default?: ComponentType<Record<string, unknown>> } };
new Function("require", "module", "exports", compiled)((id: string) => id === "@/lib/site-path" ? { assetUrl: (path: string) => path } : require(id), module, module.exports);
const StampCard = module.exports.default!;
const illustrated: BirdStamp = { id: "osprey", name: "Osprey", scientificName: "Pandion haliaetus", image: "/test/osprey.png", color: "#a8cbf1" };
const render = (props: Record<string, unknown> = {}) => renderToStaticMarkup(createElement(StampCard, { stamp: illustrated, finish: "polychrome", ...props }));

test("a stamp stays sealed by default, including legacy saved and quiz flags", () => {
  const html = render({ saved: true, quizCompleted: true });
  assert.match(html, /Locked · Lights Out reward/);
  assert.match(html, /bird-stamp__sealed/);
  assert.doesNotMatch(html, /<img|bird-stamp__foil|bird-stamp__earned|osprey\.png/);
});

test("an earned stamp reveals its artwork, optical finish and action date", () => {
  const html = render({ unlocked: true, rewardDate: "2026-10-27" });
  assert.match(html, /src="\/test\/osprey\.png"/);
  assert.match(html, /bird-stamp__surface--polychrome/);
  assert.match(html, /Unlocked · 2026-10-27/);
  assert.match(html, /bird-stamp__earned/);
  assert.doesNotMatch(html, /bird-stamp__sealed/);
});

test("photographic rewards include source, license and display changes", () => {
  const photo: BirdStamp = { ...illustrated, image: undefined, photo: "/test/real-bird.jpg", photoCredit: "A Bird Photographer", photoLicense: "CC BY-SA 4.0", photoLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", photoSource: "https://commons.wikimedia.org/wiki/File:Bird.jpg" };
  const html = render({ stamp: photo, unlocked: true });
  assert.match(html, /src="\/test\/real-bird\.jpg"/);
  assert.match(html, /A Bird Photographer/);
  assert.match(html, /href="https:\/\/creativecommons.org\/licenses\/by-sa\/4.0\/"/);
  assert.match(html, /Cropped for display/);
  const noPhoto = render({ stamp: { ...illustrated, image: undefined }, unlocked: true });
  assert.match(noPhoto, /FIELD NOTES EDITION/);
  assert.doesNotMatch(noPhoto, /<img/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { ARTWORK_STYLES, ArtworkStyle, DEFAULT_PARAMS, FLOW_MODES, FlowMode } from "./engine";
import { normalizeParams, paramsFromQuery, paramsToQuery } from "./params";

test("legacy links keep their original dot settings and blank text", () => {
  const params = paramsFromQuery(new URLSearchParams("seed=623918&palette=solar&curves=68&turbulence=0.72&text="));
  assert.equal(params.style, "dots");
  assert.equal(params.flow, "organic");
  assert.equal(params.seed, 623918);
  assert.equal(params.curves, 68);
  assert.equal(params.turbulence, 0.72);
  assert.equal(params.text, "");
  assert.equal(params.zoom, 1);
  assert.equal(params.rotation, 0);
});

test("every style and flow round-trips all composition and color settings exactly", () => {
  for (const style of Object.keys(ARTWORK_STYLES) as ArtworkStyle[]) {
    for (const flow of Object.keys(FLOW_MODES) as FlowMode[]) {
      const params = { ...DEFAULT_PARAMS, style, flow, offsetX: -0.37, offsetY: 0.21, rotation: 67, zoom: 1.45, wavelength: 0.85, amplitude: 1.3, relief: 0.72, palette: "custom" as const, customColors: { background: "#101520", primary: "#82abcd", secondary: "#734aff" }, text: "A + B & C / 空" };
      assert.deepEqual(paramsFromQuery(paramsToQuery(params)), params);
    }
  }
});

test("invalid links cannot send non-finite values, prototype keys, or zero zoom to the shader", () => {
  const params = paramsFromQuery(new URLSearchParams("style=toString&flow=constructor&palette=__proto__&font=constructor&zoom=0&wavelength=-9&amplitude=Infinity&seed=NaN&rotation=999&background=invalid&grain="));
  assert.equal(params.style, "dots");
  assert.equal(params.flow, "organic");
  assert.equal(params.palette, DEFAULT_PARAMS.palette);
  assert.equal(params.textFont, DEFAULT_PARAMS.textFont);
  assert.equal(params.zoom, 0.4);
  assert.equal(params.wavelength, 0.3);
  assert.equal(params.amplitude, DEFAULT_PARAMS.amplitude);
  assert.equal(params.seed, DEFAULT_PARAMS.seed);
  assert.equal(params.rotation, 180);
  assert.equal(params.grain, DEFAULT_PARAMS.grain);
  assert.equal(params.customColors.background, DEFAULT_PARAMS.customColors.background);
});

test("old saved artwork receives defaults without mutating the original data", () => {
  const saved = { seed: 492076, text: "Saved", customColors: { background: "#123456", primary: "#123456", secondary: "#123456" } };
  const params = normalizeParams(saved);
  assert.equal(params.style, "dots");
  assert.equal(params.seed, 492076);
  params.customColors.background = "#ffffff";
  assert.equal(saved.customColors.background, "#123456");
});

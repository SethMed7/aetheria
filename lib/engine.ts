export type PaletteId =
  | "obsidian"
  | "solar"
  | "violet"
  | "emerald"
  | "coral"
  | "cobalt"
  | "citron"
  | "mono"
  | "custom";
export type BlendMode = "screen" | "overlay";
export type TextFont = "grotesk" | "serif" | "mono" | "rounded";
export type ArtworkStyle = "dots" | "discs" | "capsules" | "tiles" | "cells" | "ribbons" | "terraces";
export type FlowMode = "organic" | "sweep" | "radial" | "rows";

export const ARTWORK_STYLES: Record<ArtworkStyle, { label: string; description: string }> = {
  dots: { label: "Dots", description: "Soft pigment and a fine halftone field." },
  discs: { label: "Discs", description: "Tilted discs catching a soft directional light." },
  capsules: { label: "Capsules", description: "Rounded forms carried along the current." },
  tiles: { label: "Tiles", description: "Small beveled planes with a shifting rhythm." },
  cells: { label: "Cells", description: "Open frames, sculpted edges, and quiet space." },
  ribbons: { label: "Ribbons", description: "Continuous folds with a satin finish." },
  terraces: { label: "Terraces", description: "Layered steps cut through a flowing surface." },
};

export const FLOW_MODES: Record<FlowMode, string> = {
  organic: "Organic",
  sweep: "Sweep",
  radial: "Ripple",
  rows: "Rows",
};

export const TEXT_FONTS: Record<TextFont, { label: string; family: string; weight: number; tracking: number }> = {
  grotesk: { label: "Grotesk", family: "Arial, Helvetica, sans-serif", weight: 800, tracking: 0.055 },
  serif: { label: "Serif", family: "Georgia, 'Times New Roman', serif", weight: 700, tracking: 0.018 },
  mono: { label: "Mono", family: "'SFMono-Regular', Menlo, Consolas, monospace", weight: 700, tracking: 0.075 },
  rounded: { label: "Rounded", family: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: 700, tracking: 0.04 },
};

export interface CustomColors {
  background: string;
  primary: string;
  secondary: string;
}

export interface AetheriaParams {
  style: ArtworkStyle;
  flow: FlowMode;
  offsetX: number;
  offsetY: number;
  rotation: number;
  zoom: number;
  wavelength: number;
  amplitude: number;
  relief: number;
  seed: number;
  palette: PaletteId;
  curves: number;
  turbulence: number;
  spread: number;
  thickness: number;
  grain: number;
  blendMode: BlendMode;
  customColors: CustomColors;
  text: string;
  textFont: TextFont;
  textColor: string;
}

type Rgb = readonly [number, number, number];

export interface AetheriaPalette {
  name: string;
  base: Rgb;
  primary: Rgb;
  secondary: Rgb;
  shade: Rgb;
}

export const PALETTES: Record<PaletteId, AetheriaPalette> = {
  obsidian: {
    name: "Cyan Drift",
    base: [0.86, 0.88, 0.88],
    primary: [0.0, 0.72, 0.82],
    secondary: [0.0, 0.43, 0.76],
    shade: [0.32, 0.39, 0.41],
  },
  solar: {
    name: "Solar Flare",
    base: [0.88, 0.84, 0.76],
    primary: [0.94, 0.39, 0.08],
    secondary: [0.72, 0.12, 0.07],
    shade: [0.42, 0.32, 0.24],
  },
  violet: {
    name: "Cyber Violet",
    base: [0.79, 0.8, 0.86],
    primary: [0.52, 0.23, 0.91],
    secondary: [0.13, 0.42, 0.86],
    shade: [0.31, 0.29, 0.42],
  },
  emerald: {
    name: "Emerald Flow",
    base: [0.79, 0.85, 0.82],
    primary: [0.0, 0.62, 0.47],
    secondary: [0.0, 0.4, 0.48],
    shade: [0.27, 0.39, 0.35],
  },
  coral: {
    name: "Coral Pulse",
    base: [0.9, 0.82, 0.82],
    primary: [0.95, 0.25, 0.35],
    secondary: [0.66, 0.08, 0.26],
    shade: [0.42, 0.28, 0.31],
  },
  cobalt: {
    name: "Cobalt Bloom",
    base: [0.81, 0.84, 0.9],
    primary: [0.08, 0.35, 0.95],
    secondary: [0.15, 0.12, 0.65],
    shade: [0.25, 0.29, 0.43],
  },
  citron: {
    name: "Citron Field",
    base: [0.86, 0.88, 0.75],
    primary: [0.63, 0.88, 0.05],
    secondary: [0.16, 0.53, 0.18],
    shade: [0.31, 0.39, 0.25],
  },
  mono: {
    name: "Silver Ink",
    base: [0.87, 0.87, 0.86],
    primary: [0.16, 0.17, 0.18],
    secondary: [0.42, 0.43, 0.44],
    shade: [0.1, 0.11, 0.12],
  },
  custom: {
    name: "Custom Mix",
    base: [0.86, 0.88, 0.88],
    primary: [0.0, 0.72, 0.82],
    secondary: [0.0, 0.43, 0.76],
    shade: [0.32, 0.39, 0.41],
  },
};

export const DEFAULT_PARAMS: AetheriaParams = {
  style: "dots",
  flow: "organic",
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  zoom: 1,
  wavelength: 1,
  amplitude: 1,
  relief: 0.65,
  seed: 184729,
  palette: "obsidian",
  curves: 78,
  turbulence: 0.64,
  spread: 0.82,
  thickness: 1.08,
  grain: 0.08,
  blendMode: "screen",
  customColors: {
    background: "#dbe0e0",
    primary: "#00b8d1",
    secondary: "#006ec2",
  },
  text: "DO MORE",
  textFont: "grotesk",
  textColor: "#ffffff",
};

const VERTEX_SHADER = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = position;
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSeed;
uniform float uDensity;
uniform float uTurbulence;
uniform float uSpread;
uniform float uThickness;
uniform float uGrain;
uniform float uBlend;
uniform vec3 uBase;
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uShade;
uniform int uStyle;
uniform int uFlow;
uniform vec2 uOffset;
uniform float uRotation;
uniform float uZoom;
uniform float uWavelength;
uniform float uAmplitude;
uniform float uRelief;

mat2 rotate2d(float angle) {
  float s = sin(angle), c = cos(angle);
  return mat2(c, s, -s, c);
}

float roundedBox(vec2 p, vec2 bounds, float radius) {
  vec2 q = abs(p) - bounds + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float softField(vec2 p, float phase, float time) {
  vec2 firstWarp = vec2(
    sin(p.y * 1.18 + sin(p.x * 0.71 + phase) + time * 0.13),
    cos(p.x * 1.03 - sin(p.y * 0.77 - phase) - time * 0.11)
  );
  p += firstWarp * (0.28 + uTurbulence * 0.64) * uAmplitude;

  float a = sin(p.x * 1.17 + sin(p.y * 1.43 + phase) * 1.28);
  float b = cos(p.y * 1.31 - p.x * 0.41 + cos(p.x * 0.79 - phase));
  float c = sin((p.x + p.y) * 0.73 + phase * 1.61 + time * 0.08);
  float d = cos(length(p * vec2(0.78, 1.04)) * 1.16 - phase + time * 0.06);
  return clamp(0.5 + a * 0.16 + b * 0.145 + c * 0.105 + d * 0.07, 0.0, 1.0);
}

float compositionField(vec2 p, float phase, float time) {
  p /= uWavelength;
  if (uFlow == 1) {
    float bend = sin(p.x * 1.1 + phase + time * 0.09) * uAmplitude * (0.4 + uTurbulence * 0.9);
    return 0.5 + sin(p.y * 2.0 + bend + phase) * 0.32;
  }
  if (uFlow == 2) {
    float bend = sin(atan(p.y, p.x) * 3.0 + phase) * uTurbulence * uAmplitude * 0.6;
    return 0.5 + cos(length(p) * 3.0 + bend - time * 0.12) * 0.32;
  }
  if (uFlow == 3) return 0.58 + sin(p.y * 2.0 + phase) * 0.16;
  return softField(p, phase, time);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float phase = uSeed * 0.000071;
  vec2 world = rotate2d(uRotation) * ((uv - 0.5 - uOffset * vec2(1.0, -1.0)) * vec2(aspect, 1.0)) / uZoom;
  vec2 p = world * 3.7;
  if (uFlow != 2) p += vec2(sin(phase * 1.7), cos(phase * 1.13)) * 1.9;
  float field = compositionField(p, phase, uTime);
  float companion = compositionField(p * 0.72 + vec2(2.4, -1.7), phase * 1.81, -uTime * 0.73);
  if (uFlow == 0) field = clamp(field * 0.82 + companion * 0.27 - 0.045, 0.0, 1.0);

  float cellSize = mix(7.2, 3.35, uDensity);
  vec2 latticeWarp = vec2(
    sin(p.y * 1.7 + field * 5.2 + phase),
    cos(p.x * 1.45 - companion * 4.6 - phase)
  );
  vec2 lattice = (world + vec2(aspect, 1.0) * 0.5) * uResolution.y / cellSize;
  lattice += latticeWarp * (0.46 + uTurbulence * 2.35) * uAmplitude * (uFlow == 3 ? 0.0 : 1.0);
  vec2 dotPoint = fract(lattice) - 0.5;
  float dotDistance = length(dotPoint);
  float tonalSpread = mix(0.78, 1.22, uSpread);
  float radius = clamp((field - 0.345) * 1.24 * tonalSpread * uThickness, 0.0, 0.74);
  float antialias = max(fwidth(dotDistance) * 0.92, 0.012);
  float dots = 1.0 - smoothstep(radius - antialias, radius + antialias, dotDistance);
  float solid = smoothstep(0.79, 0.91, field) * smoothstep(0.5, 0.67, uThickness);
  float coverage = max(dots, solid);
  float transitionBand = (1.0 - smoothstep(0.035, 0.19, abs(field - 0.57))) * dots;
  float mist = smoothstep(0.54, 0.88, field) * 0.13;
  float shadowCloud = (1.0 - smoothstep(0.16, 0.58, companion)) * (0.08 + uTurbulence * 0.08);
  vec3 color = mix(uBase, uShade, shadowCloud);
  color = mix(color, uPrimary, mist);
  color = mix(color, uPrimary, coverage);
  color = mix(color, uSecondary, transitionBand * 0.46);

  if (uStyle > 0 && uStyle < 5) {
    float spacing = mix(76.0, 30.0, uDensity);
    vec2 grid = world * 1000.0 / spacing;
    if (uFlow != 3) grid += latticeWarp * uTurbulence * uAmplitude * 1.15;
    vec2 cell = fract(grid) - 0.5;
    float tilt = uFlow == 3 ? 0.42 : 0.42 + (field - 0.5) * 1.4;
    vec2 local = rotate2d(tilt) * cell;
    float size = clamp((0.2 + field * 0.3 * tonalSpread) * sqrt(uThickness), 0.12, 0.46);
    float distance;
    if (uStyle == 1) distance = (length(local / vec2(1.0, 0.58)) - size) * 0.58;
    else if (uStyle == 2) {
      vec2 capsule = local;
      capsule.y -= clamp(capsule.y, -size * 0.56, size * 0.56);
      distance = length(capsule) - size * 0.39;
    } else {
      distance = roundedBox(local, vec2(size * 0.82), 0.025);
      if (uStyle == 4) distance = abs(distance + 0.038) - 0.038;
    }
    // Use the continuous grid footprint: derivatives across fract() seams draw false cell borders.
    float aa = max(length(fwidth(grid)) * 0.55, 0.0005);
    float mask = 1.0 - smoothstep(-aa, aa, distance);
    float bevel = 1.0 - smoothstep(0.0, 0.045, -distance);
    vec2 normal = vec2(dFdx(distance), dFdy(distance)) / max(fwidth(distance), 0.00001);
    float light = dot(normal, normalize(vec2(-0.65, 0.85)));
    float face = clamp(0.67 + local.y * 0.46 - local.x * 0.26, 0.3, 1.0);
    vec3 pigment = mix(uPrimary, uSecondary, smoothstep(0.3, 0.8, field) * 0.6);
    vec3 material = pigment * mix(1.0, face * 1.13, uRelief);
    material += max(light, 0.0) * bevel * uRelief * 0.32;
    material *= 1.0 - max(-light, 0.0) * bevel * uRelief * 0.5;
    float shadow = (1.0 - smoothstep(0.0, 0.1, max(distance, 0.0))) * (1.0 - mask);
    shadow *= 1.0 - smoothstep(0.4, 0.5, max(abs(cell.x), abs(cell.y)));
    color = mix(uBase, uShade, shadow * uRelief * 0.28 + shadowCloud * 0.35);
    color = mix(color, material, mask);
  }

  if (uStyle >= 5) {
    float bands = mix(7.0, 23.0, uDensity);
    float height = field * bands * mix(0.8, 1.4, uSpread);
    float footprint = max(fwidth(height), 0.0001);
    color = vec3(0.0);
    // Integrate across the pixel footprint so terrace edges stay clean at preview sizes.
    for (int sampleIndex = 0; sampleIndex < 4; sampleIndex++) {
      float sampleHeight = height + (float(sampleIndex) - 1.5) * footprint * 0.25;
      float fold = fract(sampleHeight);
      float profile = uStyle == 5
        ? pow(0.5 - 0.5 * cos(fold * 6.283185), 0.75 / uThickness)
        : smoothstep(0.0, 0.17 * uThickness, fold);
      float tint = 0.5 + 0.5 * sin((uStyle == 5 ? sampleHeight : floor(sampleHeight)) * 0.46 + phase);
      vec3 pigment = mix(uPrimary, uSecondary, tint * 0.72);
      vec3 material = mix(pigment, pigment * mix(0.34, 1.12, profile), uRelief);
      if (uStyle == 5) {
        float sheen = pow(max(cos((fold - 0.35) * 6.283185), 0.0), 10.0);
        material += sheen * uRelief * 0.08;
      } else {
        float bevel = 1.0 - smoothstep(0.0, 0.035, fold);
        material += bevel * uRelief * 0.1;
      }
      color += material * 0.25;
    }
    color = mix(color, uBase, (1.0 - smoothstep(0.12, 0.4, field)) * 0.32);
  }

  if (uBlend > 0.5) {
    color = mix(color, smoothstep(vec3(0.0), vec3(1.0), color * color * (3.0 - 2.0 * color)), 0.3);
  }

  float grain = hash21(gl_FragCoord.xy + vec2(phase * 991.0, floor(uTime * 10.0)));
  color += (grain - 0.5) * uGrain * 0.16;

  float vignette = smoothstep(0.95, 0.25, length((uv - 0.5) * vec2(0.9, 1.08)));
  color *= mix(0.88, 1.0, vignette);
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate a WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to allocate a WebGL program.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown WebGL link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

type UniformName =
  | "uResolution"
  | "uTime"
  | "uSeed"
  | "uDensity"
  | "uTurbulence"
  | "uSpread"
  | "uThickness"
  | "uGrain"
  | "uBlend"
  | "uBase"
  | "uPrimary"
  | "uSecondary"
  | "uShade"
  | "uStyle"
  | "uFlow"
  | "uOffset"
  | "uRotation"
  | "uZoom"
  | "uWavelength"
  | "uAmplitude"
  | "uRelief";

function hexToRgb(value: string, fallback: Rgb): Rgb {
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return fallback;
  const numeric = Number.parseInt(match[1], 16);
  return [
    ((numeric >> 16) & 255) / 255,
    ((numeric >> 8) & 255) / 255,
    (numeric & 255) / 255,
  ];
}

function resolvePalette(params: AetheriaParams): AetheriaPalette {
  const fallback = PALETTES.custom;
  if (params.palette !== "custom") return PALETTES[params.palette];
  const base = hexToRgb(params.customColors.background, fallback.base);
  const primary = hexToRgb(params.customColors.primary, fallback.primary);
  const secondary = hexToRgb(params.customColors.secondary, fallback.secondary);
  return {
    name: "Custom Mix",
    base,
    primary,
    secondary,
    shade: [
      base[0] * 0.38 + secondary[0] * 0.08,
      base[1] * 0.38 + secondary[1] * 0.08,
      base[2] * 0.38 + secondary[2] * 0.08,
    ],
  };
}

function colorIsLight(value: string) {
  const rgb = hexToRgb(value, [1, 1, 1]);
  const linear = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 > 0.44;
}

export function drawArtworkText(
  context: CanvasRenderingContext2D,
  params: Pick<AetheriaParams, "text" | "textFont" | "textColor">,
  width = context.canvas.width,
  height = context.canvas.height,
) {
  const text = params.text.trim();
  if (!text) return;

  const font = TEXT_FONTS[params.textFont] ?? TEXT_FONTS.grotesk;
  const glyphs = Array.from(text);
  const maxWidth = width * 0.78;
  let fontSize = Math.min(width * 0.068, height * 0.14);

  const setFont = () => {
    context.font = `${font.weight} ${fontSize}px ${font.family}`;
  };
  const measure = () => {
    const tracking = fontSize * font.tracking;
    return glyphs.reduce((sum, glyph) => sum + context.measureText(glyph).width, 0) + tracking * Math.max(0, glyphs.length - 1);
  };

  setFont();
  const initialWidth = measure();
  if (initialWidth > maxWidth) {
    fontSize *= maxWidth / initialWidth;
    setFont();
  }

  const tracking = fontSize * font.tracking;
  const measuredWidth = measure();
  const metrics = context.measureText(text);
  const baseline = height * 0.5 + ((metrics.actualBoundingBoxAscent || fontSize * 0.72) - (metrics.actualBoundingBoxDescent || fontSize * 0.18)) * 0.5;
  let cursor = (width - measuredWidth) * 0.5;

  context.save();
  context.font = `${font.weight} ${fontSize}px ${font.family}`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = /^#[0-9a-f]{6}$/i.test(params.textColor) ? params.textColor : DEFAULT_PARAMS.textColor;
  context.shadowColor = colorIsLight(params.textColor) ? "rgba(0, 0, 0, 0.34)" : "rgba(255, 255, 255, 0.28)";
  context.shadowBlur = Math.max(4, fontSize * 0.09);
  context.shadowOffsetY = Math.max(1, fontSize * 0.012);
  for (const glyph of glyphs) {
    context.fillText(glyph, cursor, baseline);
    cursor += context.measureText(glyph).width + tracking;
  }
  context.restore();
}

export class AetheriaRenderer {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms: Record<UniformName, WebGLUniformLocation>;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      desynchronized: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("Aetheria requires WebGL 2 support.");
    this.gl = gl;
    this.program = createProgram(gl);
    const names: UniformName[] = [
      "uResolution",
      "uTime",
      "uSeed",
      "uDensity",
      "uTurbulence",
      "uSpread",
      "uThickness",
      "uGrain",
      "uBlend",
      "uBase",
      "uPrimary",
      "uSecondary",
      "uShade",
      "uStyle", "uFlow", "uOffset", "uRotation", "uZoom", "uWavelength", "uAmplitude", "uRelief",
    ];
    this.uniforms = Object.fromEntries(
      names.map((name) => {
        const location = gl.getUniformLocation(this.program, name);
        if (!location) throw new Error(`Missing shader uniform: ${name}`);
        return [name, location];
      }),
    ) as Record<UniformName, WebGLUniformLocation>;
  }

  render(params: AetheriaParams, options: { time?: number; sync?: boolean } = {}) {
    const gl = this.gl;
    const palette = resolvePalette(params);
    const density = (Math.max(50, Math.min(100, params.curves)) - 50) / 50;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(this.uniforms.uTime, options.time ?? 0);
    gl.uniform1f(this.uniforms.uSeed, params.seed);
    gl.uniform1f(this.uniforms.uDensity, density);
    gl.uniform1f(this.uniforms.uTurbulence, params.turbulence);
    gl.uniform1f(this.uniforms.uSpread, params.spread);
    gl.uniform1f(this.uniforms.uThickness, params.thickness);
    gl.uniform1f(this.uniforms.uGrain, params.grain);
    gl.uniform1f(this.uniforms.uBlend, params.blendMode === "overlay" ? 1 : 0);
    gl.uniform3fv(this.uniforms.uBase, palette.base);
    gl.uniform3fv(this.uniforms.uPrimary, palette.primary);
    gl.uniform3fv(this.uniforms.uSecondary, palette.secondary);
    gl.uniform3fv(this.uniforms.uShade, palette.shade);
    gl.uniform1i(this.uniforms.uStyle, Object.keys(ARTWORK_STYLES).indexOf(params.style ?? "dots"));
    gl.uniform1i(this.uniforms.uFlow, Object.keys(FLOW_MODES).indexOf(params.flow ?? "organic"));
    gl.uniform2f(this.uniforms.uOffset, params.offsetX ?? 0, params.offsetY ?? 0);
    gl.uniform1f(this.uniforms.uRotation, (params.rotation ?? 0) * Math.PI / 180);
    gl.uniform1f(this.uniforms.uZoom, params.zoom ?? 1);
    gl.uniform1f(this.uniforms.uWavelength, params.wavelength ?? 1);
    gl.uniform1f(this.uniforms.uAmplitude, params.amplitude ?? 1);
    gl.uniform1f(this.uniforms.uRelief, params.relief ?? 0.65);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (options.sync) gl.finish();
  }

  destroy(releaseContext = false) {
    this.gl.deleteProgram(this.program);
    if (releaseContext) this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

export function createArtworkPreviews(
  artworks: AetheriaParams[],
  width = 240,
  height = 156,
) {
  if (artworks.length === 0) return [];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const renderer = new AetheriaRenderer(canvas);
  const composed = document.createElement("canvas");
  composed.width = width;
  composed.height = height;
  const context = composed.getContext("2d");
  if (!context) {
    renderer.destroy(true);
    throw new Error("Unable to create the artwork preview canvas.");
  }
  const previews = artworks.map((params) => {
    renderer.render(params, { time: 0, sync: true });
    context.clearRect(0, 0, width, height);
    context.drawImage(canvas, 0, 0, width, height);
    drawArtworkText(context, params, width, height);
    return composed.toDataURL("image/webp", 0.84);
  });
  renderer.destroy(true);
  return previews;
}

export function randomSeed() {
  return Math.floor(100000 + Math.random() * 899999);
}

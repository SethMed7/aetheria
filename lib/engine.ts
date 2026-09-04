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
export type RenderMode = "dots" | "waves" | "sheaths" | "blend";

export interface CustomColors {
  background: string;
  primary: string;
  secondary: string;
}

export interface AetheriaParams {
  seed: number;
  palette: PaletteId;
  curves: number;
  turbulence: number;
  spread: number;
  thickness: number;
  grain: number;
  blendMode: BlendMode;
  renderMode: RenderMode;
  customColors: CustomColors;
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
  seed: 184729,
  palette: "obsidian",
  curves: 78,
  turbulence: 0.64,
  spread: 0.82,
  thickness: 1.08,
  grain: 0.08,
  blendMode: "screen",
  renderMode: "dots",
  customColors: {
    background: "#dbe0e0",
    primary: "#00b8d1",
    secondary: "#006ec2",
  },
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
uniform float uMode;
uniform vec3 uBase;
uniform vec3 uPrimary;
uniform vec3 uSecondary;
uniform vec3 uShade;

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
  p += firstWarp * (0.28 + uTurbulence * 0.64);

  float a = sin(p.x * 1.17 + sin(p.y * 1.43 + phase) * 1.28);
  float b = cos(p.y * 1.31 - p.x * 0.41 + cos(p.x * 0.79 - phase));
  float c = sin((p.x + p.y) * 0.73 + phase * 1.61 + time * 0.08);
  float d = cos(length(p * vec2(0.78, 1.04)) * 1.16 - phase + time * 0.06);
  return clamp(0.5 + a * 0.16 + b * 0.145 + c * 0.105 + d * 0.07, 0.0, 1.0);
}

float terrainHeight(float x, float depth, float phase) {
  float broad = sin(x * 2.05 + depth * 5.1 + phase) * 0.48;
  float cross = sin(x * 5.4 - depth * 3.15 - phase * 1.7) * (0.12 + uTurbulence * 0.17);
  float ripple = cos(x * 1.18 + depth * 9.4 + phase * 0.43) * 0.15;
  return broad + cross + ripple;
}

vec3 waveMesh(vec2 uv, float phase, float layer) {
  float x = (uv.x - 0.5) * 3.4 + layer * 0.37;
  float nearEdge = 0.13 + layer * 0.075;
  float run = 0.56;
  float amplitude = mix(0.055, 0.13, uTurbulence) * mix(0.72, 1.18, uSpread);
  float depth = (uv.y - nearEdge) / run;

  // Invert the projected height field so every fragment can address the
  // perspective mesh without allocating thousands of individual particles.
  for (int iteration = 0; iteration < 3; iteration++) {
    float height = terrainHeight(x, depth, phase + layer * 2.31);
    float projected = nearEdge + depth * run + height * amplitude * (1.0 - depth * 0.22);
    depth -= (projected - uv.y) / run;
  }

  float valid = step(0.0, depth) * step(depth, 1.0);
  depth = clamp(depth, 0.0, 1.0);
  float height = terrainHeight(x, depth, phase + layer * 2.31);
  float xCount = mix(116.0, 190.0, uDensity) * mix(0.76, 1.08, depth);
  float zCount = mix(34.0, 68.0, uDensity);
  vec2 grid = vec2(
    (uv.x + sin(depth * 5.7 + phase) * 0.009 * uTurbulence) * xCount,
    depth * zCount + sin(x * 1.4 + phase) * 0.32
  );
  vec2 cell = fract(grid) - 0.5;
  float pointDistance = length(cell);
  float pointRadius = mix(0.16, 0.09, depth) * mix(0.72, 1.34, (uThickness - 0.5) / 2.1);
  float aa = max(fwidth(pointDistance), 0.008);
  float points = 1.0 - smoothstep(pointRadius - aa, pointRadius + aa, pointDistance);
  float glow = exp(-pointDistance * pointDistance * 13.0) * 0.17;

  float crest = smoothstep(-0.42, 0.72, height);
  float distanceFade = mix(1.0, 0.46, depth);
  float edgeFade = smoothstep(0.0, 0.055, depth) * smoothstep(1.0, 0.9, depth);
  float sideFade = smoothstep(0.0, 0.055, uv.x) * smoothstep(1.0, 0.945, uv.x);
  float energy = valid * edgeFade * sideFade * distanceFade * mix(0.58, 1.22, crest);
  return vec3(points * energy, glow * energy, energy);
}

vec3 sheathRibbon(vec2 uv, float aspect, float phase) {
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.0;
  float tilt = -0.1 + sin(phase * 0.37) * 0.08;
  mat2 rotation = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
  p = rotation * p;

  float t = p.x + sin(p.y * 2.2 + phase) * 0.055 * uTurbulence;
  float center = sin(t * 1.42 + phase * 0.34) * 0.2
    + sin(t * 2.86 - phase * 0.18) * 0.055;
  float fold = sin(t * 1.24 - phase * 0.27);
  float width = 0.035 + mix(0.095, 0.255, uSpread) * pow(abs(fold), 0.58);
  float local = (p.y - center) / width;
  float envelope = 1.0 - smoothstep(0.92, 1.04, abs(local));
  float taper = 1.0 - smoothstep(1.43, 1.86, abs(t));
  envelope *= taper;

  float lineCount = mix(44.0, 88.0, uDensity);
  float strandCoordinate = (local * 0.5 + 0.5) * lineCount
    + sin(t * 2.5 + phase) * (0.7 + uTurbulence * 1.9);
  float lineDistance = min(fract(strandCoordinate), 1.0 - fract(strandCoordinate));
  float lineWidth = mix(0.018, 0.07, clamp((uThickness - 0.5) / 2.1, 0.0, 1.0));
  float lineAa = max(fwidth(strandCoordinate) * 0.36, 0.012);
  float strands = (1.0 - smoothstep(lineWidth, lineWidth + lineAa, lineDistance)) * envelope;
  float glow = exp(-lineDistance * 18.0) * envelope * 0.16;
  float highlight = mix(0.48, 1.15, smoothstep(-1.0, 0.72, local));
  highlight *= mix(0.7, 1.12, smoothstep(-0.8, 0.8, fold));
  return vec3(strands * highlight, glow * highlight, envelope);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float phase = uSeed * 0.000071;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 3.7;
  p += vec2(sin(phase * 1.7), cos(phase * 1.13)) * 1.9;
  vec3 color;
  if (uMode < 0.5) {
    float field = softField(p, phase, uTime);
    float companion = softField(p * 0.72 + vec2(2.4, -1.7), phase * 1.81, -uTime * 0.73);
    field = clamp(field * 0.82 + companion * 0.27 - 0.045, 0.0, 1.0);

    float cellSize = mix(7.2, 3.35, uDensity);
    vec2 latticeWarp = vec2(
      sin(p.y * 1.7 + field * 5.2 + phase),
      cos(p.x * 1.45 - companion * 4.6 - phase)
    );
    vec2 lattice = gl_FragCoord.xy / cellSize + latticeWarp * (0.46 + uTurbulence * 2.35);
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
    color = mix(uBase, uShade, shadowCloud);
    color = mix(color, uPrimary, mist);
    color = mix(color, uPrimary, coverage);
    color = mix(color, uSecondary, transitionBand * 0.46);
  } else if (uMode < 1.5) {
    vec3 backMesh = waveMesh(uv, phase + uTime * 0.13, 1.0);
    vec3 frontMesh = waveMesh(uv, phase - uTime * 0.1, 0.0);
    vec3 mesh = max(backMesh * vec3(0.62, 0.8, 0.65), frontMesh);
    vec3 night = mix(vec3(0.003, 0.012, 0.045), uShade * 0.14, 0.38);
    vec3 signal = mix(max(uPrimary, vec3(0.035)), vec3(0.48, 0.82, 1.0), 0.2);
    color = night;
    color += uSecondary * mesh.y * 0.82;
    color += signal * mesh.x * 1.35;
    color += uSecondary * mesh.z * 0.025;
  } else if (uMode < 2.5) {
    vec3 ribbon = sheathRibbon(uv, aspect, phase + uTime * 0.09);
    vec3 night = mix(vec3(0.002, 0.006, 0.035), uShade * 0.11, 0.32);
    vec3 signal = mix(max(uPrimary, vec3(0.045)), vec3(0.72, 0.8, 1.0), 0.25);
    color = night;
    color += uSecondary * ribbon.y * 0.72;
    color += signal * ribbon.x * 1.22;
    color += uSecondary * ribbon.z * 0.018;
  } else {
    vec3 mesh = max(
      waveMesh(uv, phase + uTime * 0.12, 0.0),
      waveMesh(uv, phase - uTime * 0.08, 1.0) * 0.62
    );
    vec3 ribbon = sheathRibbon(uv, aspect, phase + 1.7 + uTime * 0.08);
    vec3 night = mix(vec3(0.003, 0.009, 0.04), uShade * 0.13, 0.35);
    vec3 signal = mix(max(uPrimary, vec3(0.04)), vec3(0.58, 0.8, 1.0), 0.2);
    color = night;
    color += uSecondary * (mesh.y * 0.6 + ribbon.y * 0.45);
    color += signal * (mesh.x * 1.0 + ribbon.x * 0.74);
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
  | "uMode"
  | "uBase"
  | "uPrimary"
  | "uSecondary"
  | "uShade";

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
      "uMode",
      "uBase",
      "uPrimary",
      "uSecondary",
      "uShade",
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
    const modeValue = params.renderMode === "dots" ? 0 : params.renderMode === "waves" ? 1 : params.renderMode === "sheaths" ? 2 : 3;
    gl.uniform1f(this.uniforms.uMode, modeValue);
    gl.uniform3fv(this.uniforms.uBase, palette.base);
    gl.uniform3fv(this.uniforms.uPrimary, palette.primary);
    gl.uniform3fv(this.uniforms.uSecondary, palette.secondary);
    gl.uniform3fv(this.uniforms.uShade, palette.shade);
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
  const previews = artworks.map((params) => {
    renderer.render(params, { time: 0, sync: true });
    return canvas.toDataURL("image/webp", 0.84);
  });
  renderer.destroy(true);
  return previews;
}

export function randomSeed() {
  return Math.floor(100000 + Math.random() * 899999);
}

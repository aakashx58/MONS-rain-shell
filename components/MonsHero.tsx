'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair, X } from 'lucide-react';

const CF_A =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261121_020044_2a50481c-2879-4750-9ba5-f6e6e1c4237e.png';
const CF_B =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261121_020045_d3d98f0d-73d5-4c45-b4eb-72294778af75.png';

const IMG_A =
  'https://images.higgs.ai/?default=1&output=webp&url=' +
  encodeURIComponent(CF_A) +
  '&w=2048&q=85';
const IMG_B =
  'https://images.higgs.ai/?default=1&output=webp&url=' +
  encodeURIComponent(CF_B) +
  '&w=2048&q=85';

interface SpecData {
  id: string;
  name: string;
  specs: [string, string, string];
}

const KIT_PIECES: SpecData[] = [
  {
    id: 'visor',
    name: 'RAIN VISOR',
    specs: ['Smoked anti-fog lens', 'Wraps under the hood', 'Beads and sheds rain'],
  },
  {
    id: 'mask',
    name: 'FILTER MASK',
    specs: ['Washable mesh shell', 'Swap-in filter insert', 'Magnetic quick release'],
  },
  {
    id: 'hood',
    name: 'STORM HOOD',
    specs: ['Three-point adjust', 'Wired brim holds shape', 'Glove-friendly cord locks'],
  },
  {
    id: 'sling',
    name: 'DRY SLING',
    specs: ['Welded roll-top body', 'Four litre volume', 'One-hand buckle release'],
  },
  {
    id: 'shell',
    name: 'TAPED SHELL',
    specs: ['Three-layer membrane', 'Fully taped seams', 'Pit zips for airflow'],
  },
];

const NAV_PANELS: Record<'shop' | 'tech' | 'journal', SpecData> = {
  shop: {
    id: 'nav-shop',
    name: 'FIELD SYSTEM 08',
    specs: [
      'Modular shell, hood, visor & mask',
      'Paired 4L welded dry sling',
      'Click any kit piece on figure',
    ],
  },
  tech: {
    id: 'nav-tech',
    name: '3L MEMBRANE TECH',
    specs: [
      '28,000 mm hydrostatic head',
      '13 mm micro-taped internal seams',
      'Breathable ePTFE storm barrier',
    ],
  },
  journal: {
    id: 'nav-journal',
    name: 'DISPATCH / 08',
    specs: [
      'Monsoon commuter field trials',
      'Crosswind & downpour testing',
      'Tokyo · Taipei · Bergen routes',
    ],
  },
};

function hitTestPiece(x: number, y: number): SpecData | null {
  if (x >= 592 && x <= 818 && y >= 200 && y <= 300) {
    return KIT_PIECES[0];
  }
  if (x >= 624 && x <= 792 && y >= 300 && y <= 420) {
    return KIT_PIECES[1];
  }
  if (((x - 705) / 150) ** 2 + ((y - 235) / 180) ** 2 <= 1) {
    return KIT_PIECES[2];
  }
  if (
    (x >= 585 && x <= 915 && y >= 590 && y <= 900) ||
    (x >= 505 && x <= 640 && y >= 470 && y <= 640)
  ) {
    return KIT_PIECES[3];
  }
  if (
    y > 420 &&
    x >= 270 &&
    x <= 1125 &&
    ((x - 697) / 440) ** 2 + ((y - 930) / 520) ** 2 <= 1
  ) {
    return KIT_PIECES[4];
  }
  return null;
}

const SLICE_OFFSETS = [-115, 86, -64, 128, -92, 48];
const SLICE_DELAYS = [0, 24, 48, 72, 96, 120];
const STRIP_DELAYS = [18, 94, 42, 138, 12, 162, 68, 115, 34, 84];

const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uTrail;
uniform float uTime;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec4 texA = texture2D(uA, vUv);
  vec4 texB = texture2D(uB, vUv);

  float nz = vnoise(vUv * vec2(14.0, 9.3) + uTime * vec2(0.35, -0.2)) * 0.55
           + vnoise(vUv * vec2(34.0, 22.0) - uTime * 0.5) * 0.45;

  float tVal = texture2D(uTrail, vUv).r;
  float tr = tVal + (nz - 0.5) * 0.16;

  float m = smoothstep(0.40, 0.47, tr);
  vec3 rgb = mix(texA.rgb, texB.rgb, m);
  float a = mix(texA.a, texB.a, m);

  vec2 px = vec2(1.6 / 360.0, 1.6 / 239.0);
  float gx = texture2D(uTrail, vUv + vec2(px.x, 0.0)).r - texture2D(uTrail, vUv - vec2(px.x, 0.0)).r;
  float gy = texture2D(uTrail, vUv + vec2(0.0, px.y)).r - texture2D(uTrail, vUv - vec2(0.0, px.y)).r;
  float grad = length(vec2(gx, gy));
  float edge = smoothstep(0.012, 0.07, grad);

  float glow = edge * (1.0 - smoothstep(0.0, 0.2, abs(tr - 0.43)));
  float line = edge * smoothstep(0.405, 0.43, tr) * (1.0 - smoothstep(0.43, 0.455, tr));

  vec3 red = vec3(0.878, 0.192, 0.247);
  rgb = mix(rgb, red, glow * 0.78);
  rgb = mix(rgb, vec3(1.0, 0.86, 0.87), line * 0.9);
  rgb += red * glow * glow * 0.25;

  gl_FragColor = vec4(rgb * a, a);
}
`;

export default function MonsHero({ contourUrl }: { contourUrl: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackImgRef = useRef<HTMLImageElement>(null);

  const texRef = useRef<HTMLDivElement>(null);
  const chevLWrapRef = useRef<HTMLDivElement>(null);
  const chevRWrapRef = useRef<HTMLDivElement>(null);
  const wmRef = useRef<HTMLDivElement>(null);
  const g1Ref = useRef<HTMLDivElement>(null);
  const g2Ref = useRef<HTMLDivElement>(null);
  const decoRef = useRef<SVGSVGElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardBorderRef = useRef<SVGSVGElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [slicesRemoved, setSlicesRemoved] = useState(false);
  const [loaderRemoved, setLoaderRemoved] = useState(false);
  const [glActive, setGlActive] = useState(false);
  const [hoveredPiece, setHoveredPiece] = useState<SpecData | null>(null);
  const [activeSpec, setActiveSpec] = useState<{
    data: SpecData;
    x: number;
    y: number;
    mobileSheet: boolean;
  } | null>(null);

  // Mutable simulation state stored in refs to avoid React re-renders on every pointer frame
  const metricsRef = useRef({
    vw: 1440,
    vh: 900,
    s: 1,
    fx: 0,
    fy: 0,
    k: 1,
    tier: 'L' as 'L' | 'S' | 'P',
  });
  const reducedMotionRef = useRef(false);

  // WebGL & trail state
  const glStateRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    uTimeLoc: WebGLUniformLocation | null;
    trailTex: WebGLTexture;
    trailCanvas: HTMLCanvasElement;
    trailCtx: CanvasRenderingContext2D;
    energy: number;
    hasPrev: boolean;
    prevX: number;
    prevY: number;
    rafId: number;
    lastTs: number;
    startTs: number;
  } | null>(null);

  // Parallax state
  const parallaxRef = useRef({
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    rafId: 0,
    lastTs: 0,
  });

  // Layout computation across L, S, P tiers
  const updateLayout = useCallback(() => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    const card = cardRef.current;
    const hint = hintRef.current;
    if (!stage || !frame || !card || !hint) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ar = vw / Math.max(1, vh);

    let tier: 'L' | 'S' | 'P';
    let s = 1;
    let fx = 0;
    let fy = 0;
    let k = 1;
    let colW = 220;

    if (ar >= 1.05 && vh >= 560) {
      tier = 'L';
      stage.setAttribute('data-tier', 'L');
      s = vw / 1440;
      fx = 0;
      fy = ar > 1.6 ? 0 : vh - 900 * s;
      k = Math.min(vw / 1440, vh / 900);
      stage.style.setProperty('--k', String(k));
    } else if (ar >= 1.05 && vh < 560) {
      tier = 'S';
      stage.setAttribute('data-tier', 'S');
      s = vh / 900;
      fx = 0.64 * vw - 700 * s;
      fy = 0;
      k = s;
      colW = Math.max(190, Math.min(330, fx + 300 * s - 32));
      stage.style.setProperty('--k', String(k));
      stage.style.setProperty('--colw', `${colW}px`);
    } else {
      tier = 'P';
      stage.setAttribute('data-tier', 'P');
      k = Math.min(1, vw / 900);
      stage.style.setProperty('--k', String(k));
      const cardH = card.offsetHeight || 96;
      const hintTop = 64 + cardH + 10;
      stage.style.setProperty('--hint-top', `${hintTop}px`);
      const hintH = hint.offsetHeight || 56;
      const stackBottom = hintTop + hintH + 12;
      s = Math.min(vw / 420, Math.max(0.2, (vh - stackBottom) / 780), (vw / 900) * 1.9);
      fx = vw / 2 - 705 * s;
      fy = vh - 900 * s;
    }

    frame.style.setProperty('--s', String(s));
    frame.style.setProperty('--fx', `${fx}px`);
    frame.style.setProperty('--fy', `${fy}px`);

    if (tier === 'L') {
      frame.style.setProperty('--wmf', '326px');
      frame.style.setProperty('--wml', '70px');
      frame.style.setProperty('--wmt', '96px');
      frame.style.setProperty('--clx', '0px');
      frame.style.setProperty('--crx', '0px');
      frame.style.setProperty('--tagx', '0px');
      frame.setAttribute('data-hide-tags', 'false');
    } else {
      const colR = tier === 'S' ? 16 + colW : 0;
      const winL = (colR - fx) / s;
      const winR = (vw - fx) / s;
      const avail = Math.max(120, winR - winL - 40 / s);
      const font = 326 * Math.min(1, avail / 1280);
      const inkW = 1280 * (font / 326);
      const mid = (winL + winR) / 2;
      const wml = mid - inkW / 2 - 0.0755 * font;
      const wmt = 131 - 0.107 * font;
      const clx = -fx / s;
      const crx = winR - 1440;
      const tagx = Math.max(0, (colR - fx) / s + 16 / s - 255);
      const hideTags = (tier === 'P' && vw < 640) || (tier === 'S' && vw < 700);

      frame.style.setProperty('--wmf', `${font}px`);
      frame.style.setProperty('--wml', `${wml}px`);
      frame.style.setProperty('--wmt', `${wmt}px`);
      frame.style.setProperty('--clx', `${clx}px`);
      frame.style.setProperty('--crx', `${crx}px`);
      frame.style.setProperty('--tagx', `${tagx}px`);
      frame.setAttribute('data-hide-tags', hideTags ? 'true' : 'false');
    }

    metricsRef.current = { vw, vh, s, fx, fy, k, tier };

    // Keep chamfered card border aligned with exact 14px corner cuts at every viewport size
    const cardBorder = cardBorderRef.current;
    if (cardBorder) {
      const cw = Math.max(40, card.offsetWidth);
      const ch = Math.max(40, card.offsetHeight);
      cardBorder.setAttribute('viewBox', `0 0 ${cw} ${ch}`);
      const poly = cardBorder.querySelector('polygon');
      if (poly) {
        poly.setAttribute('points', `14,0 ${cw},0 ${cw},${ch - 14} ${cw - 14},${ch} 0,${ch} 0,14`);
      }
    }

    // Resize WebGL backing store if active
    const glState = glStateRef.current;
    const canvas = canvasRef.current;
    if (glState && canvas) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.min(2048, Math.round(1440 * s * dpr)));
      const h = Math.max(1, Math.round(w * (956 / 1440)));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        glState.gl.viewport(0, 0, w, h);
        glState.gl.drawArrays(glState.gl.TRIANGLE_STRIP, 0, 4);
      }
    }
  }, []);

  // Draw one WebGL frame
  const renderGlFrame = useCallback((now: number) => {
    const tick = (ts: number) => {
      const state = glStateRef.current;
      if (!state) return;

      const dt = state.lastTs ? Math.min(100, ts - state.lastTs) : 16;
      state.lastTs = ts;

      const decayAlpha = 1 - Math.pow(0.05, dt / 850);
      state.trailCtx.globalCompositeOperation = 'source-over';
      state.trailCtx.fillStyle = `rgba(0,0,0,${decayAlpha})`;
      state.trailCtx.fillRect(0, 0, 360, 239);

      state.energy *= Math.pow(0.05, dt / 900);

      const gl = state.gl;
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, state.trailTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.trailCanvas);

      if (state.uTimeLoc) {
        gl.uniform1f(state.uTimeLoc, (ts - state.startTs) * 0.001);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (state.energy > 0.004) {
        state.rafId = requestAnimationFrame(tick);
      } else {
        state.energy = 0;
        state.lastTs = 0;
        state.rafId = 0;
        state.trailCtx.globalCompositeOperation = 'source-over';
        state.trailCtx.fillStyle = '#000000';
        state.trailCtx.fillRect(0, 0, 360, 239);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, state.trailTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.trailCanvas);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };
    tick(now);
  }, []);

  // Stamp blob into trail buffer
  const stampTrail = useCallback(
    (frameX: number, frameY: number, startNew: boolean) => {
      const state = glStateRef.current;
      if (!state || reducedMotionRef.current) return;

      const tx = (frameX / 1440) * 360;
      const ty = ((frameY + 28) / 956) * 239;

      const ctx = state.trailCtx;
      ctx.globalCompositeOperation = 'lighter';

      const stampBlob = (bx: number, by: number, r: number) => {
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.9)');
        grad.addColorStop(0.6, 'rgba(255,255,255,0.55)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      };

      const dx = tx - state.prevX;
      const dy = ty - state.prevY;
      const d = Math.hypot(dx, dy);

      if (startNew || !state.hasPrev || d > 70) {
        stampBlob(tx, ty, 24);
      } else {
        const r = 24 + 10 * Math.min(1, d / 18);
        const step = Math.max(2, r * 0.25);
        const steps = Math.max(1, Math.ceil(d / step));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          stampBlob(state.prevX + dx * t, state.prevY + dy * t, r);
        }
      }

      state.prevX = tx;
      state.prevY = ty;
      state.hasPrev = true;
      state.energy = 1;

      if (!state.rafId) {
        state.lastTs = performance.now();
        state.rafId = requestAnimationFrame(renderGlFrame);
      }
    },
    [renderGlFrame]
  );

  // Parallax rAF loop
  const stepParallax = useCallback((now: number) => {
    const tick = (ts: number) => {
      const p = parallaxRef.current;
      if (reducedMotionRef.current) {
        p.rafId = 0;
        return;
      }

      const dt = p.lastTs ? Math.min(100, ts - p.lastTs) : 16;
      p.lastTs = ts;

      const alpha = 1 - Math.exp(-dt / 220);
      p.cx += (p.tx - p.cx) * alpha;
      p.cy += (p.ty - p.cy) * alpha;

      const done = Math.abs(p.tx - p.cx) < 0.0005 && Math.abs(p.ty - p.cy) < 0.0005;
      if (done) {
        p.cx = p.tx;
        p.cy = p.ty;
      }

      const { cx, cy } = p;
      const { k } = metricsRef.current;

      const setTr = (el: HTMLElement | SVGElement | null, d: number, mult = 1) => {
        if (!el) return;
        if (cx === 0 && cy === 0) {
          el.style.translate = '0px 0px';
        } else {
          el.style.translate = `${(-cx * d * mult).toFixed(2)}px ${(-cy * d * 0.7 * mult).toFixed(2)}px`;
        }
      };

      setTr(chevLWrapRef.current, 24);
      setTr(chevRWrapRef.current, 24);
      setTr(tagsRef.current, 20);
      setTr(decoRef.current, 18);
      setTr(wmRef.current, 14);
      setTr(g1Ref.current, 9);
      setTr(g2Ref.current, 9);
      setTr(texRef.current, 8, k);
      setTr(cardRef.current, 7, k);
      setTr(hintRef.current, 7, k);

      if (!done) {
        p.rafId = requestAnimationFrame(tick);
      } else {
        p.rafId = 0;
        p.lastTs = 0;
      }
    };
    tick(now);
  }, []);

  const setParallaxTarget = useCallback(
    (tx: number, ty: number) => {
      if (reducedMotionRef.current) return;
      const p = parallaxRef.current;
      p.tx = Math.max(-1, Math.min(1, tx));
      p.ty = Math.max(-1, Math.min(1, ty));
      if (!p.rafId) {
        p.lastTs = performance.now();
        p.rafId = requestAnimationFrame(stepParallax);
      }
    },
    [stepParallax]
  );

  // Initialize WebGL with loaded Layer A & B images
  const initWebGL = useCallback((imgA: HTMLImageElement, imgB: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotionRef.current) return false;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return false;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return false;

    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;

    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const setupTex = (unit: number, source: TexImageSource) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      return tex;
    };

    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = 360;
    trailCanvas.height = 239;
    const trailCtx = trailCanvas.getContext('2d');
    if (!trailCtx) return false;
    trailCtx.fillStyle = '#000000';
    trailCtx.fillRect(0, 0, 360, 239);

    setupTex(0, imgA);
    setupTex(1, imgB);
    const trailTex = setupTex(2, trailCanvas);
    if (!trailTex) return false;

    gl.uniform1i(gl.getUniformLocation(program, 'uA'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uB'), 1);
    gl.uniform1i(gl.getUniformLocation(program, 'uTrail'), 2);
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');

    const { s } = metricsRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.min(2048, Math.round(1440 * s * dpr)));
    const h = Math.max(1, Math.round(w * (956 / 1440)));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    glStateRef.current = {
      gl,
      program,
      uTimeLoc,
      trailTex,
      trailCanvas,
      trailCtx,
      energy: 0,
      hasPrev: false,
      prevX: 0,
      prevY: 0,
      rafId: 0,
      lastTs: 0,
      startTs: performance.now(),
    };

    setGlActive(true);
    return true;
  }, []);

  // Main mount effect: layout, image/font loading, intro timeline, failsafe
  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    updateLayout();
    window.addEventListener('resize', updateLayout);

    const onReducedChange = () => {
      reducedMotionRef.current = mq.matches;
      if (mq.matches) {
        html.classList.add('done', 'band-in', 'model-in', 'chev-l-in', 'chev-r-in');
        setSlicesRemoved(true);
        setLoaderRemoved(true);
        setGlActive(false);
      }
    };
    mq.addEventListener('change', onReducedChange);

    if (mq.matches) {
      html.classList.add('done', 'band-in', 'model-in', 'chev-l-in', 'chev-r-in');
      setSlicesRemoved(true);
      setLoaderRemoved(true);
      return () => {
        window.removeEventListener('resize', updateLayout);
        mq.removeEventListener('change', onReducedChange);
      };
    }

    // Start loader progress bar (0 -> 0.8 in 420ms)
    requestAnimationFrame(() => {
      loaderRef.current?.classList.add('bar-80');
    });

    const loadImg = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.referrerPolicy = 'no-referrer';
        im.onload = () => resolve(im);
        im.onerror = () => resolve(null);
        im.src = src;
      });

    const minWait = new Promise<void>((r) => setTimeout(r, 420));
    const fontsWait =
      typeof document !== 'undefined' && document.fonts
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    let cancelled = false;
    const timers: number[] = [];
    let settled = false;

    const finishImmediately = () => {
      if (settled || cancelled) return;
      settled = true;
      html.classList.add('done', 'band-in', 'model-in', 'chev-l-in', 'chev-r-in');
      setSlicesRemoved(true);
      setLoaderRemoved(true);
    };

    const failsafeId = window.setTimeout(finishImmediately, 5000);
    timers.push(failsafeId);

    Promise.all([loadImg(IMG_A), loadImg(IMG_B), fontsWait, minWait]).then(
      ([imgA, imgB]) => {
        if (cancelled || settled) return;
        window.clearTimeout(failsafeId);

        if (imgA && imgB) {
          initWebGL(imgA, imgB);
        }

        loaderRef.current?.classList.add('bar-100');

        const tReady = window.setTimeout(() => {
          if (cancelled) return;
          settled = true;
          loaderRef.current?.classList.add('wipe');

          timers.push(
            window.setTimeout(() => {
              if (!cancelled) html.classList.add('slices-in');
            }, 60),
            window.setTimeout(() => {
              if (!cancelled) html.classList.add('model-in');
            }, 120),
            window.setTimeout(() => {
              if (!cancelled) html.classList.add('chev-l-in');
            }, 180),
            window.setTimeout(() => {
              if (!cancelled) html.classList.add('chev-r-in');
            }, 240),
            window.setTimeout(() => {
              if (!cancelled) html.classList.add('done');
            }, 360),
            window.setTimeout(() => {
              if (!cancelled) html.classList.add('band-in');
            }, 440),
            window.setTimeout(() => {
              if (!cancelled) setSlicesRemoved(true);
            }, 520),
            window.setTimeout(() => {
              if (!cancelled) setLoaderRemoved(true);
            }, 700)
          );
        }, 90);
        timers.push(tReady);
      }
    );

    const canvasEl = canvasRef.current;
    const parallaxState = parallaxRef.current;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setGlActive(false);
    };
    canvasEl?.addEventListener('webglcontextlost', onContextLost);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('resize', updateLayout);
      mq.removeEventListener('change', onReducedChange);
      canvasEl?.removeEventListener('webglcontextlost', onContextLost);
      if (glStateRef.current?.rafId) cancelAnimationFrame(glStateRef.current.rafId);
      if (parallaxState.rafId) cancelAnimationFrame(parallaxState.rafId);
    };
  }, [initWebGL, updateLayout]);

  // Escape key closes spec card
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveSpec(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Position hover tip near pointer
  const positionTip = useCallback((clientX: number, clientY: number) => {
    const tip = tipRef.current;
    if (!tip) return;
    const { vw, vh } = metricsRef.current;
    const w = tip.offsetWidth || 140;
    const h = tip.offsetHeight || 52;
    const left = clientX + 18 + w > vw - 12 ? clientX - w - 14 : clientX + 18;
    const top = clientY + 16 + h > vh - 12 ? clientY - h - 12 : clientY + 16;
    tip.style.transform = `translate3d(${Math.max(8, left)}px, ${Math.max(8, top)}px, 0)`;
  }, []);

  const openSpecAt = useCallback((data: SpecData, clientX: number, clientY: number) => {
    const { vw, vh } = metricsRef.current;
    const mobileSheet = vw < 640;
    if (mobileSheet) {
      setActiveSpec({ data, x: 0, y: 0, mobileSheet: true });
      return;
    }
    const cardW = 260;
    const cardH = 166;
    let x = clientX + 20;
    if (x + cardW > vw - 16) {
      x = Math.max(16, clientX - cardW - 20);
    }
    const y = Math.max(16, Math.min(vh - cardH - 16, clientY - cardH / 2));
    setActiveSpec({ data, x, y, mobileSheet: false });
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { vw, vh, s, fx, fy } = metricsRef.current;
      const nx = (e.clientX / Math.max(1, vw)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, vh)) * 2 - 1;
      setParallaxTarget(nx, ny);

      const frameX = (e.clientX - fx) / s;
      const frameY = (e.clientY - fy) / s;

      const isMouse = e.pointerType === 'mouse';
      if (isMouse || e.buttons > 0) {
        stampTrail(frameX, frameY, false);
      }

      if (isMouse) {
        const target = e.target as HTMLElement;
        if (target.closest('.tag')) {
          positionTip(e.clientX, e.clientY);
          return;
        }
        const onHud = Boolean(target.closest('.logo, .nav, #spec'));
        const piece = onHud ? null : hitTestPiece(frameX, frameY);
        setHoveredPiece((prev) => (prev?.id === piece?.id ? prev : piece));
        if (piece) {
          positionTip(e.clientX, e.clientY);
        }
      }
    },
    [positionTip, setParallaxTarget, stampTrail]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('.logo, .nav, #spec, .tag')) return;

      const { vw, vh, s, fx, fy } = metricsRef.current;
      const frameX = (e.clientX - fx) / s;
      const frameY = (e.clientY - fy) / s;

      if (e.pointerType !== 'mouse') {
        const nx = (e.clientX / Math.max(1, vw)) * 2 - 1;
        const ny = (e.clientY / Math.max(1, vh)) * 2 - 1;
        setParallaxTarget(nx, ny);
        stampTrail(frameX, frameY, true);
      }

      const piece = hitTestPiece(frameX, frameY);
      if (piece) {
        openSpecAt(piece, e.clientX, e.clientY);
      } else {
        setActiveSpec(null);
      }
    },
    [openSpecAt, setParallaxTarget, stampTrail]
  );

  const handlePointerLeave = useCallback(() => {
    setParallaxTarget(0, 0);
    setHoveredPiece(null);
    if (glStateRef.current) {
      glStateRef.current.hasPrev = false;
    }
  }, [setParallaxTarget]);

  const handlePointerUpOrCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'mouse') {
        setParallaxTarget(0, 0);
        if (glStateRef.current) {
          glStateRef.current.hasPrev = false;
        }
      }
    },
    [setParallaxTarget]
  );

  const handleTagEnter = useCallback(
    (piece: SpecData, e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === 'mouse') {
        setHoveredPiece(piece);
        positionTip(e.clientX, e.clientY);
      }
    },
    [positionTip]
  );

  const handleTagClick = useCallback(
    (piece: SpecData, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = e.clientX || rect.right;
      const cy = e.clientY || rect.top + rect.height / 2;
      openSpecAt(piece, cx, cy);
    },
    [openSpecAt]
  );

  const handleNavClick = useCallback(
    (key: 'shop' | 'tech' | 'journal', e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const data = NAV_PANELS[key];
      if (activeSpec?.data.id === data.id) {
        setActiveSpec(null);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      openSpecAt(data, rect.left + rect.width / 2, rect.bottom + 84);
    },
    [activeSpec, openSpecAt]
  );

  return (
    <main
      id="stage"
      ref={stageRef}
      data-tier="L"
      className={hoveredPiece ? 'is-hover' : undefined}
      aria-label="MONS rain shell hero"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
    >
      {/* 5.1 Contour texture */}
      <div
        ref={texRef}
        className="tex"
        aria-hidden="true"
        style={{ backgroundImage: `url("${contourUrl}")` }}
      />

      {/* 4. 1440x900 design frame */}
      <div id="frame" ref={frameRef}>
        {/* 5.2 Chevrons */}
        <div className="chev-wrap chev-wrap-r" aria-hidden="true">
          <div ref={chevRWrapRef} className="chev-px">
            <svg id="chevTR" viewBox="0 0 1440 900">
              <polygon points="560,-400 723,-400 1515,195 1352,195" />
            </svg>
          </div>
        </div>

        <div className="chev-wrap chev-wrap-l" aria-hidden="true">
          <div ref={chevLWrapRef} className="chev-px">
            <svg id="chevL" viewBox="0 0 1440 900">
              <polygon points="-54,462 101,462 281,642 281,660 -60,926 -60,792 134,636" />
            </svg>
          </div>
        </div>

        {/* 5.3 Wordmark + frosted glass panels */}
        <div id="wm" ref={wmRef} aria-hidden="true">
          <span className="band">MONS</span>
          {!slicesRemoved &&
            SLICE_OFFSETS.map((sx, j) => (
              <span
                key={j}
                className="slice"
                style={
                  {
                    clipPath: `inset(${(j / 6) * 100}% 0 ${((5 - j) / 6) * 100}% 0)`,
                    '--sx': `${sx}px`,
                    '--sd': `${SLICE_DELAYS[j]}ms`,
                  } as React.CSSProperties
                }
              >
                MONS
              </span>
            ))}

          <div
            ref={g1Ref}
            className="glass g1 rv"
            style={{ '--rvd': '165ms' } as React.CSSProperties}
          />
          <div
            ref={g2Ref}
            className="glass g2 rv"
            style={{ '--rvd': '220ms' } as React.CSSProperties}
          >
            <svg
              className="g2-border"
              viewBox="0 0 859 490"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                points="110,0 859,0 859,490 0,490 0,110"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="g2-hatch" />
          </div>
        </div>

        {/* 5.4 Model */}
        <div id="model" ref={modelRef} className={glActive ? 'gl' : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={fallbackImgRef}
            src={IMG_A}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            alt="Model in a hooded rain shell, smoked visor and face mask, with a black sling bag"
          />
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>

        {/* 5.5 Decorative SVG */}
        <svg
          id="deco"
          ref={decoRef}
          viewBox="0 0 1440 900"
          className="rv"
          style={{ '--rvd': '110ms' } as React.CSSProperties}
          aria-hidden="true"
        >
          <g
            className="tag-shift tag-leader"
            stroke="#4D4A4E"
            strokeWidth="1"
            strokeOpacity="0.75"
            fill="none"
          >
            <path d="M403 411 H447 L527 448" vectorEffect="non-scaling-stroke" />
            <path d="M430 465 H462 L498 486" vectorEffect="non-scaling-stroke" />
          </g>
          <line
            x1="282"
            y1="626"
            x2="462"
            y2="497"
            stroke="#4D4A4E"
            strokeWidth="1"
            strokeOpacity="0.55"
            vectorEffect="non-scaling-stroke"
          />
          {[
            [265, 83],
            [980, 433],
            [1188, 578],
          ].map(([cx, cy], idx) => (
            <g
              key={idx}
              stroke="#4D4A4E"
              strokeWidth="1.2"
              strokeOpacity="0.8"
              fill="none"
            >
              <circle cx={cx} cy={cy} r="7" vectorEffect="non-scaling-stroke" />
              <line
                x1={cx - 13}
                y1={cy}
                x2={cx + 13}
                y2={cy}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={cx}
                y1={cy - 13}
                x2={cx}
                y2={cy + 13}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        {/* 5.6 Kit tags */}
        <div id="tags" ref={tagsRef}>
          <div className="tag-shift">
            <span
              className="brk brk-tl rv"
              style={{ left: 281, top: 393, '--rvd': '385ms' } as React.CSSProperties}
              aria-hidden="true"
            />
            <button
              type="button"
              className="tag rv"
              style={{ left: 288, top: 401, '--rvd': '275ms' } as React.CSSProperties}
              onPointerEnter={(e) => handleTagEnter(KIT_PIECES[2], e)}
              onPointerLeave={() => setHoveredPiece(null)}
              onClick={(e) => handleTagClick(KIT_PIECES[2], e)}
            >
              TRK 01 / HOOD
            </button>
            <span
              className="brk brk-br rv"
              style={{ left: 386, top: 419, '--rvd': '385ms' } as React.CSSProperties}
              aria-hidden="true"
            />

            <span
              className="brk brk-tl rv"
              style={{ left: 255, top: 447, '--rvd': '385ms' } as React.CSSProperties}
              aria-hidden="true"
            />
            <button
              type="button"
              className="tag rv"
              style={{ left: 262, top: 455, '--rvd': '330ms' } as React.CSSProperties}
              onPointerEnter={(e) => handleTagEnter(KIT_PIECES[4], e)}
              onPointerLeave={() => setHoveredPiece(null)}
              onClick={(e) => handleTagClick(KIT_PIECES[4], e)}
            >
              TRK 02 / SHELL + SLING
            </button>
            <span
              className="brk brk-br rv"
              style={{ left: 413, top: 473, '--rvd': '385ms' } as React.CSSProperties}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* 5.7 Header HUD */}
      <a
        href="./"
        className="logo rv"
        style={{ '--rvd': '0ms' } as React.CSSProperties}
        aria-label="MONS home"
        onClick={(e) => {
          e.preventDefault();
          setActiveSpec(null);
        }}
      >
        <span className="logo-bar" />
        <span className="logo-bar" />
        <span className="logo-bar" />
      </a>

      <nav
        className="nav rv rv-fade"
        style={{ '--rvd': '55ms' } as React.CSSProperties}
        aria-label="Primary navigation"
      >
        <button
          type="button"
          className="nav-link"
          data-active={activeSpec?.data.id === 'nav-shop'}
          onClick={(e) => handleNavClick('shop', e)}
        >
          Shop
        </button>
        <button
          type="button"
          className="nav-link"
          data-active={activeSpec?.data.id === 'nav-tech'}
          onClick={(e) => handleNavClick('tech', e)}
        >
          Tech
        </button>
        <button
          type="button"
          className="nav-link"
          data-active={activeSpec?.data.id === 'nav-journal'}
          onClick={(e) => handleNavClick('journal', e)}
        >
          Journal
        </button>
      </nav>

      {/* 5.8 Copy card */}
      <section
        ref={cardRef}
        className="card rv rv-card"
        style={{ '--rvd': '440ms' } as React.CSSProperties}
        aria-label="Product summary"
      >
        <svg
          ref={cardBorderRef}
          className="card-border"
          viewBox="0 0 435 181"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="14,0 435,0 435,167 421,181 0,181 0,14"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <Crosshair className="card-cross" strokeWidth={1.25} aria-hidden="true" />
        <p className="card-eye">Monsoon Commuter</p>
        <h1 className="card-head">
          Built for the downpour.
          <br />
          Worn every day.
        </h1>
      </section>

      {/* 5.9 Hint panel */}
      <aside
        ref={hintRef}
        className="hint rv rv-card"
        style={{ '--rvd': '495ms' } as React.CSSProperties}
        aria-label="Interaction hint"
      >
        <span className="hint-hatch" aria-hidden="true" />
        <div className="hint-lines">
          <div>Hover to unmask / click a piece to view</div>
          <div>Scroll ↓</div>
        </div>
      </aside>

      {/* 5.10 Hover tip */}
      <div
        id="tip"
        ref={tipRef}
        className={hoveredPiece ? 'show' : undefined}
        role="status"
        aria-hidden={!hoveredPiece}
      >
        <div className="tip-name">{hoveredPiece?.name ?? ''}</div>
        <div className="tip-cta">
          CLICK TO VIEW <span>[SPECS]</span>
        </div>
      </div>

      {/* 5.10 Spec card */}
      <div
        id="spec"
        role="dialog"
        aria-modal="false"
        aria-label={activeSpec ? `${activeSpec.data.name} specifications` : 'Specifications'}
        className={[
          activeSpec ? 'open' : '',
          activeSpec?.mobileSheet ? 'mobile-sheet' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          activeSpec && !activeSpec.mobileSheet
            ? { left: activeSpec.x, top: activeSpec.y }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spec-head">
          <div className="spec-title-wrap">
            <span className="spec-sq" aria-hidden="true" />
            <span className="spec-title">{activeSpec?.data.name ?? ''}</span>
          </div>
          <button
            type="button"
            className="spec-close"
            aria-label="Close specifications"
            onClick={() => setActiveSpec(null)}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <ul className="spec-list">
          {(activeSpec?.data.specs ?? []).map((line, i) => (
            <li key={i} className="spec-item">
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Opening sequence loader */}
      {!loaderRemoved && (
        <div id="ld" ref={loaderRef} aria-hidden="true">
          <div className="ld-strips">
            {STRIP_DELAYS.map((delay, idx) => (
              <div
                key={idx}
                className="ld-strip"
                style={{ transitionDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <div className="ld-word">
            {['M', 'O', 'N', 'S'].map((ch, i) => (
              <span
                key={i}
                className={i === 0 ? 'ld-ch ld-ch-first' : 'ld-ch'}
                style={{ '--chd': `${40 + i * 70}ms` } as React.CSSProperties}
              >
                {i === 0 && <span className="ld-ghost">{ch}</span>}
                {ch}
              </span>
            ))}
          </div>
          <div className="ld-bar" />
        </div>
      )}
    </main>
  );
}

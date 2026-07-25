"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type RGB = [number, number, number];

interface FireSphereProps {
  /** Cor das pontas da chama (0–255). Padrão: laranja-avermelhado. */
  color0?: RGB;
  /** Cor da base quente (0–255). Padrão: amarelo. */
  color1?: RGB;
  /** Intensidade do brilho (bloom aproximado em shader). */
  bloomStrength?: number;
  /** Suaviza as extremidades — quanto maior, mais concentrado o núcleo. */
  bloomThreshold?: number;
  /** Liga a animação contínua. Ignorado sob prefers-reduced-motion. */
  animate?: boolean;
  className?: string;
}

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform float uStrength;
  uniform float uThreshold;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    // Chamas sobem: rola o ruído para cima ao longo do tempo.
    float t = uTime * 0.32;
    vec2 q = vec2(uv.x * 3.2, uv.y * 2.6 - t);
    float warp = fbm(q * 0.6 + vec2(0.0, t * 0.5));
    float n = fbm(q + warp);

    // Base forte embaixo (uv.y = 0), esvai para cima.
    float grad = pow(clamp(1.0 - uv.y, 0.0, 1.0), 1.5);
    // Concentra nas laterais e no centro-topo, some no miolo inferior.
    float sides = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x);
    float flame = n * grad * mix(0.55, 1.0, sides);

    flame = smoothstep(uThreshold, 1.0, flame);
    vec3 col = mix(uColor0, uColor1, clamp(flame * 1.35, 0.0, 1.0));
    float a = clamp(flame * uStrength, 0.0, 1.0);
    // Alpha premultiplicado: onde não há chama o pixel fica transparente
    // (sem pintar fundo preto sobre o card). O glow soma via mix-blend-screen.
    gl_FragColor = vec4(col * a, a);
  }
`;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Camada decorativa de chamas em WebGL (Three.js). Desenhada para ficar ATRÁS
 * de conteúdo, com blending aditivo (não pinta fundo preto sobre o card).
 * Uma única instância por página — renderize apenas no card em destaque.
 */
export default function FireSphere({
  color0 = [255, 60, 0],
  color1 = [255, 190, 0],
  bloomStrength = 1.4,
  bloomThreshold = 0.15,
  animate = true,
  className,
}: FireSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // WebGL indisponível → fica o fallback CSS do container pai.
    }

    const uniforms = {
      uTime: { value: 0 },
      uColor0: { value: new THREE.Color(color0[0] / 255, color0[1] / 255, color0[2] / 255) },
      uColor1: { value: new THREE.Color(color1[0] / 255, color1[1] / 255, color1[2] / 255) },
      uStrength: { value: bloomStrength },
      uThreshold: { value: bloomThreshold },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const scene = new THREE.Scene();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    const camera = new THREE.Camera();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    mount.appendChild(canvas);

    const resize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const shouldAnimate = animate && !reduce;

    const renderFrame = (now: number) => {
      uniforms.uTime.value = (now - start) / 1000;
      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      renderFrame(now);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (raf) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Pausa quando fora da viewport (economia de FPS/bateria).
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!shouldAnimate) {
          renderFrame(performance.now()); // frame estático
          return;
        }
        if (visible) play();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(mount);

    if (shouldAnimate) {
      play();
    } else {
      renderFrame(performance.now()); // um frame congelado
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (shouldAnimate && visible) play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [color0, color1, bloomStrength, bloomThreshold, animate]);

  return <div ref={mountRef} aria-hidden="true" className={className} />;
}

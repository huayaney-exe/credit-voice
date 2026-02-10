"use client";

import { useEffect, useRef } from "react";
import { VoiceSessionState } from "@/types";

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  sessionState: VoiceSessionState;
}

// Sphere config
const NUM_PARTICLES = 600;
const BASE_RADIUS = 90;
const MAX_DISPLACEMENT = 35;
const PERSPECTIVE = 400;
const BASE_DOT_SIZE = 1.5;
const MAX_DOT_SIZE = 4;

// Pre-compute sphere points using fibonacci spiral (even distribution)
function generateSpherePoints(n: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < n; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / n);
    const phi = (2 * Math.PI * i) / goldenRatio;

    points.push([
      Math.sin(theta) * Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
    ]);
  }
  return points;
}

const SPHERE_POINTS = generateSpherePoints(NUM_PARTICLES);

export default function AudioVisualizer({
  analyserNode,
  sessionState,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const dataArray = analyserNode
      ? new Uint8Array(analyserNode.frequencyBinCount)
      : null;

    const draw = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      if (analyserNode && dataArray) {
        analyserNode.getByteFrequencyData(dataArray);
      }

      // Activity level from session state
      let stateMultiplier = 0.15;
      if (sessionState === "listening") stateMultiplier = 0.5;
      if (sessionState === "processing") stateMultiplier = 0.7;
      if (sessionState === "speaking") stateMultiplier = 0.85;

      // Rotation angles (slow continuous rotation)
      const rotY = t * 0.6;
      const rotX = t * 0.3 + Math.sin(t * 0.4) * 0.2;

      // Precompute rotation matrix components
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Build projected particles with depth for z-sorting
      const projected: {
        x: number;
        y: number;
        z: number;
        size: number;
        amplitude: number;
      }[] = [];

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const [bx, by, bz] = SPHERE_POINTS[i];

        // Get frequency amplitude for this particle
        let amplitude = 0;
        if (dataArray && dataArray.length > 0) {
          const binIndex = Math.floor(
            (i / NUM_PARTICLES) * dataArray.length
          );
          amplitude = dataArray[binIndex] / 255;
        }

        // Radial displacement from audio + organic breathing
        const breathe =
          Math.sin(t * 2 + bx * 3 + by * 2) * 0.03 +
          Math.sin(t * 1.3 + bz * 4) * 0.02;
        const displacement =
          1 + amplitude * (MAX_DISPLACEMENT / BASE_RADIUS) * stateMultiplier + breathe;

        const px = bx * BASE_RADIUS * displacement;
        const py = by * BASE_RADIUS * displacement;
        const pz = bz * BASE_RADIUS * displacement;

        // Rotate around Y axis
        const rx = px * cosY - pz * sinY;
        const ry = py;
        const rz = px * sinY + pz * cosY;

        // Rotate around X axis
        const fx = rx;
        const fy = ry * cosX - rz * sinX;
        const fz = ry * sinX + rz * cosX;

        // Perspective projection
        const scale = PERSPECTIVE / (PERSPECTIVE + fz);
        const screenX = cx + fx * scale;
        const screenY = cy + fy * scale;

        // Dot size: depth-based + amplitude-based
        const dotSize =
          (BASE_DOT_SIZE + amplitude * MAX_DOT_SIZE * stateMultiplier) * scale;

        projected.push({
          x: screenX,
          y: screenY,
          z: fz,
          size: dotSize,
          amplitude,
        });
      }

      // Z-sort: draw back-to-front
      projected.sort((a, b) => b.z - a.z);

      // Draw particles
      for (const p of projected) {
        // Depth factor: 0 (far) to 1 (near)
        const depthNorm = (p.z + BASE_RADIUS * 1.5) / (BASE_RADIUS * 3);
        const depthFactor = Math.max(0.1, Math.min(1, depthNorm));

        // Color: green with brightness based on depth + amplitude
        const lightness = 35 + depthFactor * 25 + p.amplitude * 20;
        const saturation = 70 + p.amplitude * 20;
        const alpha = 0.15 + depthFactor * 0.6 + p.amplitude * 0.25;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(150, ${saturation}%, ${lightness}%, ${Math.min(1, alpha)})`;
        ctx.fill();
      }

      // Subtle center glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, BASE_RADIUS * 0.7);
      gradient.addColorStop(0, "rgba(0, 147, 48, 0.04)");
      gradient.addColorStop(1, "rgba(0, 147, 48, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, BASE_RADIUS * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, sessionState]);

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto"
      style={{ width: 320, height: 320 }}
    />
  );
}

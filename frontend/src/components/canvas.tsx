'use client'

import { useEffect, useRef } from "react";



export default function Canvas({ tick }: { tick?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = canvas.parentElement?.clientWidth || window.innerWidth;
    const canvasHeight = canvas.parentElement?.clientHeight || window.innerHeight;
    const barWidth = document.querySelector('#nav-item-Home')?.clientWidth || 0;

    // Resize to parent dimensions with device dpi
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Initial drawing
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawGradientBox(0, 0, barWidth, barWidth);
    ctx.fill()

    function drawGradientBox(x: number, y: number, width: number, height: number) {
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, '#F1EFEC');
      gradient.addColorStop(1, '#F1EFEC00');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);
    }

  }, [])
  return (
    <canvas ref={canvasRef} width="100%" height="100%" />
  )
}


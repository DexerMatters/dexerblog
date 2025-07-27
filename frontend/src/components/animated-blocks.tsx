'use client';;
import { interpolate, sin } from "@/utils/math";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

export default function AnimatedBlocks({
  straight,
  className = "",
}: {
  straight?: boolean;
  className?: string;
}) {
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);
  const [weight, setWeight] = useState(0);
  const [leftMargin, setLeftMargin] = useState(0);
  const animationRef = useRef<number>(-1);

  const waveFrequency = 0.4;
  const blockSize = 64;

  const blockData = useMemo(() => {
    const blocks: Array<{
      rowIndex: number;
      colIndex: number;
      interpolatedValue: number;
      isVisible: boolean;
    }> = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const interpolatedValue = interpolate(
          straight ? [0, 0, 0, 0.1, 1, 0.1, 0, 0, 0] : [0, 0, 0.05, 1, 0.05, 0, 0],
          straight ? colIndex / columns + 0.25 + 0.04 * Math.random() : (colIndex + columns * 0) / columns * (1 / 0.6) - rowIndex / columns
        );
        const isVisible = straight
          ? colIndex < columns * 0.2
          : rowIndex * (-1) + colIndex * 2 - columns * 0.6 < 0;

        blocks.push({
          rowIndex,
          colIndex,
          interpolatedValue,
          isVisible,
        });
      }
    }
    return blocks;
  }, [rows, columns, straight]);

  const animateGradient = useCallback(() => {
    setWeight((prev) => {
      const newWeight = prev + 0.003;
      return newWeight >= 1 ? 0 : newWeight;
    });
    animationRef.current = requestAnimationFrame(animateGradient);
  }, []);

  const calculateDimensions = useCallback(() => {
    const container = document.querySelector('#home-container');

    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    setColumns(Math.ceil(containerWidth / blockSize));
    setRows(Math.ceil(containerHeight / blockSize));

    const rightOverflow = containerWidth - (Math.ceil(containerWidth / blockSize) * blockSize);
    setLeftMargin(rightOverflow / 2);
  }, []);

  useEffect(() => {

    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animateGradient);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [animateGradient, calculateDimensions]);

  return (
    <div
      className={`grid absolute ${className}`}
      style={{
        pointerEvents: 'none',
        gridTemplateColumns: `repeat(${columns}, ${blockSize}px)`,
        transform: `translateX(${leftMargin}px)`,
        width: `${columns * blockSize}px`
      }}
    >
      {blockData.map(({ rowIndex, colIndex, isVisible, interpolatedValue }) => {
        if (!isVisible) {
          return (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              style={{
                width: `${blockSize}px`,
                height: `${blockSize}px`,
              }}
            />
          );
        }

        const w = (sin(-weight * 2 * Math.PI + rowIndex * waveFrequency, 0.2) + 1) / 2 * interpolatedValue;
        const scale = Math.max(1 - w * 1.5, 0);
        const opacity = Math.max(1 - Math.sqrt(w) * Math.sqrt(w), 0);

        return (
          <div
            key={`cell-${rowIndex}-${colIndex}`}
            className="bg-secondary"
            style={{
              width: `${blockSize}px`,
              height: `${blockSize}px`,
              transform: `scale(${scale})`,
              willChange: 'transform',
              opacity: opacity,
            }}
          />
        );
      })}
    </div>
  );
}

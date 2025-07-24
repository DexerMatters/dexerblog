'use client';;
import { useEffect, useState, useCallback, useMemo, useRef } from "react";


export default function Home() {
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
      distance: number;
      interpolatedValue: number;
      isVisible: boolean;
    }> = [];

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const distance = rowIndex + colIndex * 2;
        const isVisible = distance <= columns * 1.1;
        const interpolatedValue = interpolate([0, 0.1, 1, 0, 0], colIndex / columns);

        blocks.push({
          rowIndex,
          colIndex,
          distance,
          interpolatedValue,
          isVisible
        });
      }
    }
    return blocks;
  }, [rows, columns]);

  const animateGradient = useCallback(() => {
    setWeight((prev) => {
      const newWeight = prev + 0.003;
      return newWeight >= 1 ? 0 : newWeight;
    });
    animationRef.current = requestAnimationFrame(animateGradient);
  }, []);

  const calculateDimensions = useCallback(() => {

    // Calculate the number of columns and rows based on the container size
    const container = document.querySelector('#home-container');

    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    setColumns(Math.ceil(containerWidth / blockSize));
    setRows(Math.ceil(containerHeight / blockSize));

    // Center the blocks
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
    <main
      id="home-container"
      className="relative bg-gradient-to-b from-primary to-accent h-full w-full overflow-hidden wrap-normal">
      <div className="absolute float-right h-full w-full opacity-30" style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
      }} />
      <div
        className="grid absolute"
        style={{
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
          const scale = Math.max(1 - w * 0.3, 0);

          return (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="bg-secondary"
              style={{
                width: `${blockSize}px`,
                height: `${blockSize}px`,
                transform: `scale(${scale})`,
                willChange: 'transform', // Optimize for animations
              }}
            />
          );
        })}
      </div>
      <div className="absolute h-full w-full flex flex-col justify-center lg:pl-32 pl-4 text-white">
        <text className="text-2xl mb-4 text-primary">Welcome to</text>
        <header className="bg-accent overflow-hidden text-8xl w-fit">Dexer</header>
        <header className="text-primary overflow-hidden text-8xl mt-[-30px] w-fit">Matters</header>
        <header className="bg-primary overflow-hidden text-7xl mt-1 mb-8 pb-4 pr-2 w-fit italic">Blog</header>
      </div>
    </main>
  );
}


function interpolate(controlPoints: number[], weight: number): number {
  if (controlPoints.length < 2) {
    throw new Error("At least two control points are required for interpolation.");
  }

  // Clamp weight to [0, 1]
  weight = Math.max(0, Math.min(1, weight));

  // Calculate the position in the control points array
  const scaledWeight = weight * (controlPoints.length - 1);
  const index = Math.floor(scaledWeight);
  const fraction = scaledWeight - index;

  // Handle edge case where weight is exactly 1
  if (index >= controlPoints.length - 1) {
    return controlPoints[controlPoints.length - 1];
  }

  // Linear interpolation between two adjacent control points
  return controlPoints[index] + (controlPoints[index + 1] - controlPoints[index]) * fraction;
}

function sin(x: number, positiveRatio: number = 0.5): number {
  // Clamp positiveRatio to valid range [0, 1]
  positiveRatio = Math.max(0, Math.min(1, positiveRatio));

  // Normalize x to [0, 2π] range
  let normalizedX = x % (2 * Math.PI);
  if (normalizedX < 0) {
    normalizedX += 2 * Math.PI;
  }

  const positiveThreshold = 2 * Math.PI * positiveRatio;

  if (normalizedX <= positiveThreshold) {
    // Positive part: map [0, positiveThreshold] to [0, π] for sin
    if (positiveRatio === 0) return -1; // Edge case: no positive part
    const mappedX = (normalizedX / positiveThreshold) * Math.PI;
    return Math.sin(mappedX);
  } else {
    // Negative part: map [positiveThreshold, 2π] to [π, 2π] for sin
    if (positiveRatio === 1) return 1; // Edge case: no negative part
    const negativeRange = 2 * Math.PI - positiveThreshold;
    const mappedX = Math.PI + ((normalizedX - positiveThreshold) / negativeRange) * Math.PI;
    return Math.sin(mappedX);
  }
}
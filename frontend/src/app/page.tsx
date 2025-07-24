'use client';
import { useEffect, useState, useCallback, ReactElement } from "react";
import Image from "next/image";


export default function Home() {
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);
  const [weight, setWeight] = useState(0);
  const [leftMargin, setLeftMargin] = useState(0);

  // Lower values create longer waves, higher values create shorter waves
  const waveFrequency = 0.4;
  const blockSize = 64;

  const animateGradient = useCallback(() => {
    setWeight((prev) => {
      const newWeight = prev + 0.01; // Slower increment for smoother animation
      return newWeight >= 1 ? 0 : newWeight;
    });
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

    // Add resize event listener
    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener('resize', handleResize);


    // Animate the gradient box with reduced frequency
    const interval = setInterval(animateGradient, 40); // ~30fps instead of 60fps

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [animateGradient, calculateDimensions]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log("Dragging at:", e.clientX, e.clientY);
  }

  return (
    <main draggable
      id="home-container"
      onPointerMove={onPointerMove}
      className="bg-primary relative h-full w-full overflow-hidden wrap-normal">
      {
        Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`relative row-${rowIndex}`}
            style={{ width: `${columns * blockSize}px`, transform: `translateX(${leftMargin}px)` }}
          >
            {
              Array.from({ length: columns }).map((_, colIndex) => {
                const w =
                  (sin(- weight * 2 * Math.PI + rowIndex * waveFrequency, 0.2) + 1) / 2
                  * interpolate([0, 1, 0], colIndex / columns);
                const text = "DEXER\nMATTERS\n`@&*#!~";
                const lines = text.split('\n');
                const totalLines = lines.length;
                const startRow = Math.floor(rows / 2 - totalLines / 2);

                let children: ReactElement | null = null;

                // Check if current row corresponds to any text line
                const lineIndex = rowIndex - startRow;
                if (lineIndex >= 0 && lineIndex < totalLines) {
                  const currentLine = lines[lineIndex];
                  const start = Math.floor(columns / 2 - currentLine.length / 2);

                  if (start >= 0 && colIndex >= start && colIndex < start + currentLine.length) {
                    const currentChar = currentLine.at(colIndex - start) || '';
                    switch (currentChar) {
                      case '`':
                        children = <Image className="bg-white p-3" src="/media_logos/github.svg" alt="Github Logo" width={blockSize} height={blockSize} />;
                        break;
                      case '@':
                        children = <Image className="bg-black p-4" src="/media_logos/twitter.svg" alt="Twitter Logo" width={blockSize} height={blockSize} />;
                        break;
                      case '&':
                        children = <Image className="bg-indigo-600 p-3" src="/media_logos/discord.svg" alt="Discord Logo" width={blockSize} height={blockSize} />;
                        break;
                      case '*':
                        children = <Image className="bg-blue-400 p-3" src="/media_logos/telegram.svg" alt="Telegram Logo" width={blockSize} height={blockSize} />;
                        break;
                      case '#':
                        children = <Image className="bg-sky-200 p-3" src="/media_logos/qq.svg" alt="QQ Logo" width={blockSize} height={blockSize} />;
                        break;
                      case '!':
                        children = <Image className="bg-green-500 p-3" src="/media_logos/wechat.svg" alt="Wechat Logo" width={blockSize} height={blockSize} />;
                        break;
                      case '~':
                        children = <Image className="bg-[#FEE50F] p-1" src="/media_logos/xian-yu.svg" alt="Xianyu Logo" width={blockSize} height={blockSize} />;
                        break;
                      default:
                        children = <span>{currentLine.at(colIndex - start) || ''}</span>;
                    }
                  }
                }

                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`text-primary flex float-left font-bold text-5xl items-center justify-center overflow-hidden`}
                    style={{
                      userSelect: 'none',
                      width: `${blockSize}px`,
                      height: `${blockSize}px`,
                      backgroundColor: `var(--color-secondary)`,
                      boxShadow: `0 0 ${ //
                        w * 5
                        }px var(--color-primary)`,
                      //transform: `scale(${Math.max(1 + w * 0.2, 1)})`,
                      //transform: `translateY(${w * 12}px)`,
                    }}
                  >
                    {
                      children
                    }
                  </div>
                )
              })}
          </div>
        ))
      }
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
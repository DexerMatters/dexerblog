export function interpolate(controlPoints: number[], weight: number): number {
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

export function sin(x: number, positiveRatio: number = 0.5): number {
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
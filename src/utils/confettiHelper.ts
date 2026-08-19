import confetti from 'canvas-confetti';

/**
 * Fires a celebratory pixel confetti burst across the canvas.
 */
export function triggerCelebrationConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.8 },
      colors: ['#ffd285', '#f59e0b', '#fb7185', '#38bdf8', '#34d399', '#fde047'],
      shapes: ['square', 'circle'],
      ticks: 200,
    });

    // Right burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.8 },
      colors: ['#ffd285', '#f59e0b', '#fb7185', '#38bdf8', '#34d399', '#fde047'],
      shapes: ['square', 'circle'],
      ticks: 200,
    });

    // Center sparkles
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ffd285', '#ffffff', '#f43f5e', '#a78bfa', '#10b981'],
        shapes: ['circle', 'square'],
        scalar: 1.2,
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti trigger skipped:', err);
  }
}

// Backward compatibility alias
export const triggerBirthdayConfetti = triggerCelebrationConfetti;

/**
 * Quick mini sparkle at a specific viewport percentage (e.g., button click).
 */
export function triggerMiniSparkle(x = 0.5, y = 0.5) {
  try {
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x, y },
      colors: ['#ffd285', '#fbbf24', '#f43f5e', '#38bdf8'],
      scalar: 0.9,
      ticks: 120,
    });
  } catch {
    // ignore
  }
}

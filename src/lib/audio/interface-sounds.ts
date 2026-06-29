/**
 * Synthesizes premium UI sound effects using Web Audio API.
 * This guarantees 100% reliability, no external network requests, and zero asset size.
 */

// Safe helper to play a sine wave tone with linear attack and exponential decay
function playTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);

  // Smooth volume envelope to prevent clicking
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(volume, start + 0.04);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration);
}

/**
 * Plays a pleasant, ascending chime indicating connection start (similar to Slack/Teams join).
 */
export function playCallStartSound() {
  if (typeof window === 'undefined') return;
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Ascending major chord (C5 -> E5 -> G5 -> C6)
    playTone(ctx, 523.25, now, 0.25, 0.12); // C5
    playTone(ctx, 659.25, now + 0.07, 0.25, 0.12); // E5
    playTone(ctx, 783.99, now + 0.14, 0.3, 0.12); // G5
    playTone(ctx, 1046.5, now + 0.21, 0.4, 0.15); // C6
  } catch (e) {
    console.error('Failed to play call start sound:', e);
  }
}

/**
 * Plays a soft, descending chime indicating connection end (similar to call disconnect).
 */
export function playCallEndSound() {
  if (typeof window === 'undefined') return;
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Descending chord (G5 -> E5 -> C5 -> G4)
    playTone(ctx, 783.99, now, 0.22, 0.12); // G5
    playTone(ctx, 659.25, now + 0.06, 0.22, 0.12); // E5
    playTone(ctx, 523.25, now + 0.12, 0.25, 0.12); // C5
    playTone(ctx, 392.0, now + 0.18, 0.35, 0.15); // G4
  } catch (e) {
    console.error('Failed to play call end sound:', e);
  }
}

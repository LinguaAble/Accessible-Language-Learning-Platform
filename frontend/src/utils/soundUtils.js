
// Sound Effects Utility using Web Audio API
// Designed with softer tones for ADHD-friendly auditing experience

let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

const isSoundEnabled = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.preferences?.soundEffects === true;
    } catch (e) {
        return false;
    }
}

export const playCorrectSound = () => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Soft "ding" - high but smooth
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5 quick slide up

    // Louder envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
};

export const playIncorrectSound = () => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Soft "bonk" - triangle wave
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);

    // Louder envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
};

export const playClickSound = () => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Very short "pop" / "tick" - Sine wave for softness
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    // Fast envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
};

export const playNavigationSound = () => {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Airy "Swoosh" / Slide - using Triangle for a bit of body but low pitch
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);

    // Soft Attack/Release
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1); // Quiet
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
};

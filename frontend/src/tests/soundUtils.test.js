import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// define mocks before imports
const mocks = vi.hoisted(() => {
    const mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            value: 0
        },
        type: 'sine'
    };

    const mockGainNode = {
        connect: vi.fn(),
        gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
            value: 0
        }
    };

    const mockAudioContext = {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGainNode),
        destination: {},
        currentTime: 0,
        state: 'running',
        resume: vi.fn()
    };

    const MockAudioContextConstructor = vi.fn(function () {
        return mockAudioContext;
    });

    return {
        mockOscillator,
        mockGainNode,
        mockAudioContext,
        MockAudioContextConstructor
    };
});

describe('Sound Utils Tests', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();

        // Stub globals
        vi.stubGlobal('AudioContext', mocks.MockAudioContextConstructor);
        vi.stubGlobal('webkitAudioContext', mocks.MockAudioContextConstructor);

        // Also set on window explicitly for safety
        window.AudioContext = mocks.MockAudioContextConstructor;
        window.webkitAudioContext = mocks.MockAudioContextConstructor;

        // Mock localStorage default
        Storage.prototype.getItem = vi.fn((key) => {
            if (key === 'user') {
                return JSON.stringify({
                    preferences: {
                        soundEffects: true
                    }
                });
            }
            return null;
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // ========== CORRECT SOUND TESTS ==========
    describe('playCorrectSound', () => {
        it('should create oscillator and gain nodes', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockAudioContext.createOscillator).toHaveBeenCalled();
            expect(mocks.mockAudioContext.createGain).toHaveBeenCalled();
        });

        it('should connect oscillator to gain node', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockOscillator.connect).toHaveBeenCalledWith(mocks.mockGainNode);
        });

        it('should connect gain node to destination', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockGainNode.connect).toHaveBeenCalledWith(mocks.mockAudioContext.destination);
        });

        it('should use sine wave type', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockOscillator.type).toBe('sine');
        });

        it('should set correct frequency (C5 to G5)', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(523.25, 0);
            expect(mocks.mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(783.99, 0.1);
        });

        it('should set gain envelope', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
            expect(mocks.mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.3, 0.05);
            expect(mocks.mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 0.5);
        });

        it('should start and stop oscillator', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();

            expect(mocks.mockOscillator.start).toHaveBeenCalled();
            expect(mocks.mockOscillator.stop).toHaveBeenCalledWith(0.5);
        });

        it('should resume AudioContext if suspended', async () => {
            const { playCorrectSound } = await import('../utils/soundUtils');
            mocks.mockAudioContext.state = 'suspended';

            playCorrectSound();

            expect(mocks.mockAudioContext.resume).toHaveBeenCalled();
            mocks.mockAudioContext.state = 'running'; // Reset state
        });

        it('should not play when sound effects disabled', async () => {
            Storage.prototype.getItem = vi.fn((key) => {
                if (key === 'user') {
                    return JSON.stringify({
                        preferences: {
                            soundEffects: false
                        }
                    });
                }
                return null;
            });
            const { playCorrectSound } = await import('../utils/soundUtils');

            playCorrectSound();

            expect(mocks.mockAudioContext.createOscillator).not.toHaveBeenCalled();
        });
    });

    // ========== INCORRECT SOUND TESTS ==========
    describe('playIncorrectSound', () => {
        it('should use triangle wave type', async () => {
            const { playIncorrectSound } = await import('../utils/soundUtils');
            playIncorrectSound();

            expect(mocks.mockOscillator.type).toBe('triangle');
        });

        it('should set correct frequency (150Hz to 100Hz)', async () => {
            const { playIncorrectSound } = await import('../utils/soundUtils');
            playIncorrectSound();

            expect(mocks.mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(150, 0);
            expect(mocks.mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(100, 0.2);
        });
    });

    // ========== CLICK SOUND TESTS ==========
    describe('playClickSound', () => {
        it('should use sine wave type', async () => {
            const { playClickSound } = await import('../utils/soundUtils');
            playClickSound();

            expect(mocks.mockOscillator.type).toBe('sine');
        });

        it('should set correct frequency (800Hz to 400Hz)', async () => {
            const { playClickSound } = await import('../utils/soundUtils');
            playClickSound();

            expect(mocks.mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0);
            expect(mocks.mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(400, 0.05);
        });
    });

    // ========== NAVIGATION SOUND TESTS ==========
    describe('playNavigationSound', () => {
        it('should use triangle wave type', async () => {
            const { playNavigationSound } = await import('../utils/soundUtils');
            playNavigationSound();

            expect(mocks.mockOscillator.type).toBe('triangle');
        });

        it('should set correct frequency (200Hz to 300Hz)', async () => {
            const { playNavigationSound } = await import('../utils/soundUtils');
            playNavigationSound();

            expect(mocks.mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(200, 0);
            expect(mocks.mockOscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(300, 0.15);
        });
    });

    // ========== AUDIOCONTEXT REUSE TEST ==========
    describe('AudioContext Singleton', () => {
        it('should reuse same AudioContext instance', async () => {
            const { playCorrectSound, playIncorrectSound } = await import('../utils/soundUtils');
            playCorrectSound();
            playIncorrectSound();

            // Should be called once for the module import execution
            expect(mocks.MockAudioContextConstructor).toHaveBeenCalledTimes(1);
        });
    });
});

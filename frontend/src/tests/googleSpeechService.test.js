import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { transcribeAudio } from '../utils/googleSpeechService';

// Mock axios
vi.mock('axios');

describe('Google Speech Service Tests', () => {
    let mockBlob;
    let mockFileReader;

    beforeEach(() => {
        // Create a mock blob
        mockBlob = new Blob(['mock audio data'], { type: 'audio/webm' });

        // Mock FileReader instance
        mockFileReader = {
            readAsDataURL: vi.fn(),
            result: 'data:audio/webm;base64,bW9jayBhdWRpbyBkYXRh', // "mock audio data" in base64
            onloadend: null,
            onerror: null
        };

        // Mock FileReader constructor
        const MockFileReader = vi.fn(function () {
            return mockFileReader;
        });
        vi.stubGlobal('FileReader', MockFileReader);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    // ========== SUCCESSFUL TRANSCRIPTION TESTS ==========
    describe('Successful Transcription', () => {
        it('should transcribe audio with single result', async () => {
            // Setup FileReader mock
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            // Mock successful API response
            axios.post.mockResolvedValue({
                data: {
                    results: [
                        {
                            alternatives: [
                                { transcript: 'नमस्ते' }
                            ]
                        }
                    ]
                }
            });

            const result = await transcribeAudio(mockBlob);

            expect(result).toBe('नमस्ते');
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        it('should combine multiple transcription results', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: {
                    results: [
                        { alternatives: [{ transcript: 'नमस्ते' }] },
                        { alternatives: [{ transcript: 'मेरा नाम' }] },
                        { alternatives: [{ transcript: 'राज है' }] }
                    ]
                }
            });

            const result = await transcribeAudio(mockBlob);

            expect(result).toBe('नमस्ते मेरा नाम राज है');
        });

        it('should return empty string when no speech detected', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: {
                    results: []
                }
            });

            const result = await transcribeAudio(mockBlob);

            expect(result).toBe('');
        });

        it('should return empty string when results is undefined', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: {}
            });

            const result = await transcribeAudio(mockBlob);

            expect(result).toBe('');
        });
    });

    // ========== SPEECH CONTEXT TESTS ==========
    describe('Speech Context (Phrase Boosting)', () => {
        it('should include speech context when phrases provided', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: {
                    results: [
                        { alternatives: [{ transcript: 'नमस्ते' }] }
                    ]
                }
            });

            const phrases = ['नमस्ते', 'धन्यवाद', 'अलविदा'];
            await transcribeAudio(mockBlob, phrases);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.speechContexts).toEqual([
                {
                    phrases: phrases,
                    boost: 20.0
                }
            ]);
        });

        it('should not include speech context when no phrases provided', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: {
                    results: [
                        { alternatives: [{ transcript: 'नमस्ते' }] }
                    ]
                }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.speechContexts).toEqual([]);
        });

        it('should not include speech context when empty array provided', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: {
                    results: [
                        { alternatives: [{ transcript: 'नमस्ते' }] }
                    ]
                }
            });

            await transcribeAudio(mockBlob, []);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.speechContexts).toEqual([]);
        });
    });

    // ========== REQUEST BODY VALIDATION TESTS ==========
    describe('Request Body Structure', () => {
        it('should send correct audio encoding format', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.encoding).toBe('WEBM_OPUS');
        });

        it('should send correct language code', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.languageCode).toBe('hi-IN');
        });

        it('should enable automatic punctuation', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.enableAutomaticPunctuation).toBe(true);
        });

        it('should use default model', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.config.model).toBe('default');
        });

        it('should include base64 audio content', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.audio.content).toBe('bW9jayBhdWRpbyBkYXRh');
        });
    });

    // ========== ERROR HANDLING TESTS ==========
    describe('Error Handling', () => {
        it('should throw error when API call fails', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            const apiError = new Error('API Error');
            axios.post.mockRejectedValue(apiError);

            await expect(transcribeAudio(mockBlob)).rejects.toThrow('API Error');
        });

        it('should throw error when network fails', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockRejectedValue(new Error('Network Error'));

            await expect(transcribeAudio(mockBlob)).rejects.toThrow('Network Error');
        });

        it('should handle FileReader error', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onerror(new Error('FileReader Error'));
                }, 0);
            });

            await expect(transcribeAudio(mockBlob)).rejects.toThrow('FileReader Error');
        });

        it('should handle API rate limiting error', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            const rateLimitError = new Error('Rate limit exceeded');
            rateLimitError.response = { status: 429 };
            axios.post.mockRejectedValue(rateLimitError);

            await expect(transcribeAudio(mockBlob)).rejects.toThrow('Rate limit exceeded');
        });

        it('should handle unauthorized error', async () => {
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            const authError = new Error('Unauthorized');
            authError.response = { status: 401 };
            axios.post.mockRejectedValue(authError);

            await expect(transcribeAudio(mockBlob)).rejects.toThrow('Unauthorized');
        });
    });

    // ========== BASE64 ENCODING TESTS ==========
    describe('Base64 Encoding', () => {
        it('should correctly extract base64 from data URL', async () => {
            mockFileReader.result = 'data:audio/webm;base64,SGVsbG8gV29ybGQ=';
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.audio.content).toBe('SGVsbG8gV29ybGQ=');
        });

        it('should handle different audio formats in data URL', async () => {
            mockFileReader.result = 'data:audio/ogg;base64,VGVzdERhdGE=';
            mockFileReader.readAsDataURL = vi.fn(function () {
                setTimeout(() => {
                    this.onloadend();
                }, 0);
            });

            axios.post.mockResolvedValue({
                data: { results: [] }
            });

            await transcribeAudio(mockBlob);

            const callArgs = axios.post.mock.calls[0][1];
            expect(callArgs.audio.content).toBe('VGVzdERhdGE=');
        });
    });
});

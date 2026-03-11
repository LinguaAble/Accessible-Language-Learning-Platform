import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import LearningScreen from '../pages/LearningScreen';
import { useUser } from '../context/UserContext';
import * as soundUtils from '../utils/soundUtils';
import * as speechService from '../utils/googleSpeechService';
import * as nlpService from '../utils/nlpEvalService';

// Mock CSS to avoid JSDOM parsing errors with var() in borders
vi.mock('../Learning.css', () => ({}));

// Mock Modules
vi.mock('axios');
vi.mock('../context/UserContext');
vi.mock('../utils/soundUtils');
vi.mock('../utils/googleSpeechService');
vi.mock('../utils/nlpEvalService');

// Mock Navigation and Location
const mockNavigate = vi.fn();
let mockLocationState = { lessonId: 1 };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: mockLocationState }),
    };
});

// Mock SpeechSynthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
Object.defineProperty(window, 'speechSynthesis', {
    value: {
        speak: mockSpeak,
        cancel: mockCancel,
        paused: false,
        pending: false,
        speaking: false,
    },
    writable: true,
});
global.SpeechSynthesisUtterance = vi.fn();

// Mock MediaRecorder
let mediaRecorderInstance;
const mockStart = vi.fn();
const mockStop = vi.fn();

global.MediaRecorder = vi.fn(function () {
    mediaRecorderInstance = {
        start: mockStart,
        stop: mockStop,
        state: 'inactive',
        ondataavailable: null,
        onstop: null,
    };
    return mediaRecorderInstance;
});

if (!global.navigator.mediaDevices) {
    global.navigator.mediaDevices = {};
}
global.navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }]
});


describe('LearningScreen Component Tests', () => {
    const mockUser = {
        email: 'test@example.com',
        preferences: {
            soundEffects: true,
            theme: 'light'
        },
        completedLessons: []
    };

    const mockLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocationState = { lessonId: 1 }; // Default to lesson 1
        useUser.mockReturnValue({
            user: mockUser,
            login: mockLogin,
            todayProgress: 0
        });
        axios.put.mockResolvedValue({ data: { success: true, completedLessons: [1], dailyLessonCounts: {}, todayProgress: 10 } });

        // Reset sound mocks
        soundUtils.playCorrectSound.mockImplementation(() => { });
        soundUtils.playIncorrectSound.mockImplementation(() => { });

        // Reset speech mocks
        speechService.transcribeAudio.mockResolvedValue("test transcript");
        nlpService.evaluatePronunciation.mockResolvedValue({ isCorrect: true, confidence: 0.9, feedback: 'Perfect' });

        // Reset MediaRecorder mocks
        mockStart.mockClear();
        mockStop.mockClear();

        // Mock implementations to update state
        mockStart.mockImplementation(() => {
            if (mediaRecorderInstance) mediaRecorderInstance.state = 'recording';
        });
        mockStop.mockImplementation(() => {
            if (mediaRecorderInstance) mediaRecorderInstance.state = 'inactive';
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    test('Should render initial quiz slide correctly', () => {
        render(
            <MemoryRouter>
                <LearningScreen />
            </MemoryRouter>
        );

        // Lesson 1, Slide 1 is an Intro Quiz for "अ" -> "a"
        // Updated expectation: "New Character" is the badge text visible
        expect(screen.getByText(/New Character/i)).toBeInTheDocument();
        expect(screen.getByText(/What sound does this letter make\?/i)).toBeInTheDocument();
        expect(screen.getByText('अ')).toBeInTheDocument(); // Main char

        // Options should be visible
        expect(screen.getByText('a')).toBeInTheDocument();
        expect(screen.getByText('aa')).toBeInTheDocument();
    });

    test('Should handle correct answer selection', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <LearningScreen />
            </MemoryRouter>
        );

        // Correct answer for 'अ' is 'a'
        const correctOption = screen.getByText('a', { selector: 'button' });

        await user.click(correctOption);

        // Should play correct sound
        expect(soundUtils.playCorrectSound).toHaveBeenCalled();

        // Verify Next button becomes "Next" or has correct state
        expect(screen.getByText(/Next/i)).toBeInTheDocument();
    });

    test('Should handle incorrect answer selection', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <LearningScreen />
            </MemoryRouter>
        );

        // Incorrect answer
        const incorrectOption = screen.getByText('aa', { selector: 'button' });

        await user.click(incorrectOption);

        // Should play incorrect sound
        expect(soundUtils.playIncorrectSound).toHaveBeenCalled();

        // Should show "Incorrect" feedback
        expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();
        expect(screen.getByText(/Correct answer: a/i)).toBeInTheDocument();

        // Next button should say "Got it"
        expect(screen.getByText(/Got it/i)).toBeInTheDocument();
    });

    test('Should handle pronunciation slide interaction', async () => {
        mockLocationState = { lessonId: 13 }; // Lesson 13 has pronunciation slides
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <LearningScreen />
            </MemoryRouter>
        );

        // Navigate through teaching slides to the first pronunciation slide
        // Slide 1: Teach (Continue)
        const getNextBtn = () => document.querySelector('.next-btn');
        await waitFor(() => expect(getNextBtn()).toBeInTheDocument());
        await user.click(getNextBtn());

        // Slide 2: Teach (Continue)
        await waitFor(() => expect(document.querySelector('.hindi-large').textContent).toContain('अ इ उ'));
        await user.click(getNextBtn());

        // Slide 3: Teach (Continue)
        await waitFor(() => expect(document.querySelector('.hindi-large').textContent).toContain('आ ई ऊ'));
        await user.click(getNextBtn());

        // Slide 4: Pronounce "Speak this sound" - "अ"
        expect(await screen.findByText(/Speak this sound/i)).toBeInTheDocument();
        expect(screen.getByText('अ')).toBeInTheDocument();

        // Find Mic Button using class name as it likely doesn't have text
        const micBtn = document.querySelector('.mic-btn');
        expect(micBtn).toBeInTheDocument();

        // Start Recording
        await user.click(micBtn);
        await waitFor(() => {
            expect(mockStart).toHaveBeenCalled();
        });
        expect(screen.getByText(/Listening.../i)).toBeInTheDocument();

        // Stop Recording
        await user.click(micBtn);
        expect(mockStop).toHaveBeenCalled();

        // Trigger onstop manual simulation
        // The component logic inside onstop is async, so we wrap in act
        await act(async () => {
            if (mediaRecorderInstance && mediaRecorderInstance.onstop) {
                // Determine if onstop is a function or event handler
                // Usually it's assigned: mediaRecorder.onstop = ...
                await mediaRecorderInstance.onstop();
            }
        });

        // Verify analysis was called
        expect(speechService.transcribeAudio).toHaveBeenCalled();
    });

    test('Should complete lesson and sync progress', async () => {
        // Use Lesson 19 (Numbers Recap) - 7 slides
        mockLocationState = { lessonId: 19 };
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <LearningScreen />
            </MemoryRouter>
        );

        const getNextBtn = () => document.querySelector('.next-btn');

        // Helper to click option and next
        const answerParam = async (text) => {
            await user.click(await screen.findByText(text, { selector: 'button.option-btn' }));
            await waitFor(() => expect(getNextBtn()).not.toBeDisabled());
            await user.click(getNextBtn());
        };

        // Slide 1: Select 'One' -> 'एक'
        await answerParam('एक');

        // Slide 2: Select 'Five' -> 'पाँच'
        await answerParam('पाँच');

        // Slide 3: Select 'Ten' -> 'दस'
        await answerParam('दस');

        // Slide 4: Select 'Seven' -> 'सात'
        await answerParam('सात');

        // Slide 5: Select 'Eight' -> 'आठ'
        await answerParam('आठ');

        // Slides 6 & 7: Pronounce
        for (let i = 0; i < 2; i++) {
            const micBtn = document.querySelector('.mic-btn');
            await user.click(micBtn); // Start
            await user.click(micBtn); // Stop
            await act(async () => {
                if (mediaRecorderInstance && mediaRecorderInstance.onstop) {
                    await mediaRecorderInstance.onstop();
                }
            });
            await waitFor(() => expect(getNextBtn()).not.toBeDisabled());
            await user.click(getNextBtn());
        }

        // Wait for success screen
        await waitFor(() => {
            expect(screen.getByText(/Lesson Completed/i)).toBeInTheDocument();
        });

        // Verify API call
        expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('update-progress'),
            expect.objectContaining({
                completedLessons: expect.arrayContaining([19])
            })
        );
    });

    test.skip('Should display break notification after interval', async () => {
        vi.useFakeTimers();

        // Stabalize start time
        const startTime = new Date('2025-01-01T12:00:00Z');
        vi.setSystemTime(startTime);

        render(
            <MemoryRouter>
                <LearningScreen />
            </MemoryRouter>
        );

        // Fast forward 21 minutes
        await act(async () => {
            vi.advanceTimersByTime(21 * 60 * 1000);
        });

        // Check immediately
        expect(screen.getByText(/Time for a Break!/i)).toBeInTheDocument();

        // Dismiss
        const continueBtn = screen.getByText(/Continue Learning/i);
        fireEvent.click(continueBtn);

        // Should be gone
        await waitFor(() => {
            expect(screen.queryByText(/Time for a Break!/i)).not.toBeInTheDocument();
        });
    }, 20000); // 20s timeout
});

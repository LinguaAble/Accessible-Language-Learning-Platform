import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Lessons from '../pages/Lessons';

// Mock navigation
const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock axios
vi.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
    };
})();

global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

describe('Lessons Page Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        localStorageMock.clear();

        // Default axios mock response
        axios.get.mockResolvedValue({
            data: {
                completedLessons: []
            }
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render lessons page header and greeting', () => {
            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            // Use heading role to avoid ambiguous match with "15 Lessons"
            expect(screen.getByRole('heading', { level: 2, name: /Lessons/i })).toBeInTheDocument();
            expect(screen.getByText(/Master the Hindi alphabet and basic conversation/i)).toBeInTheDocument();
        });

        test('Should render all chapters', () => {
            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            expect(screen.getByText(/Chapter 1: Mastering the Script/i)).toBeInTheDocument();
            expect(screen.getByText(/Chapter 2: My World/i)).toBeInTheDocument();
            expect(screen.getByText(/Chapter 3: First Sentences/i)).toBeInTheDocument();
        });

        test('Should render lessons for a chapter', () => {
            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            expect(screen.getByText(/Vowels \(Swar\) - Part 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Vowels \(Swar\) - Part 2/i)).toBeInTheDocument();
        });

        test('Should display day streak correctly', async () => {
            // Setup token to ensure API is called
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'token') return 'valid-token';
                return null;
            });

            // Mock completed lessons to show streak
            axios.get.mockResolvedValue({
                data: {
                    completedLessons: [1]
                }
            });

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            // Use a flexible match function because the text might be split across elements
            // The DOM structure is tricky with SVG and text nodes
            await waitFor(() => {
                // Find all text content in the streak pill
                const streakPill = screen.getByText((content, element) => {
                    return element.classList.contains('streak') &&
                        element.textContent.includes('1') &&
                        element.textContent.includes('Day Streak');
                });
                expect(streakPill).toBeInTheDocument();
            });
        });
    });

    // ==================== DATA FETCHING TESTS ====================
    describe('Data Fetching Tests', () => {

        test('Should fetch progress from API on mount when token exists', async () => {
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'token') return 'mock-token';
                return null;
            });

            const completedLessons = [1, 2, 3];
            axios.get.mockResolvedValue({
                data: { completedLessons }
            });

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: 'Bearer mock-token' }
                });
            });
        });

        test('Should fallback to localStorage if API fails', async () => {
            // Setup token to trigger API call attempt
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'token') return 'mock-token';
                if (key === 'completedLessons') return JSON.stringify([1]); // Just use [1] for simplicity
                return null;
            });

            // Make API fail
            axios.get.mockRejectedValue(new Error('API Error'));

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            // Should still mark lesson 1 as completed based on localStorage fallback
            await waitFor(() => {
                // We use closest to find the card because the class is on the container
                const lesson1Title = screen.getByText(/Vowels \(Swar\) - Part 1/i);
                const lesson1Card = lesson1Title.closest('.lesson-card');
                expect(lesson1Card).toHaveClass('completed');
            });
        });

        test('Should use localStorage if no token exists', async () => {
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'token') return null;
                if (key === 'completedLessons') return JSON.stringify([1]);
                return null;
            });

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            expect(axios.get).not.toHaveBeenCalled();

            await waitFor(() => {
                const lesson1Title = screen.getByText(/Vowels \(Swar\) - Part 1/i);
                const lesson1Card = lesson1Title.closest('.lesson-card');
                expect(lesson1Card).toHaveClass('completed');
            });
        });
    });

    // ==================== INTERACTION TESTS ====================
    describe('Interaction Tests', () => {

        test('Should navigate to lesson when unlocked lesson is clicked', async () => {
            const user = userEvent.setup();
            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            const lesson1Title = screen.getByText(/Vowels \(Swar\) - Part 1/i);
            const lesson1Card = lesson1Title.closest('.lesson-card');

            await user.click(lesson1Card);

            expect(mockNavigate).toHaveBeenCalledWith('/learn', { state: { lessonId: 1 } });
        });

        test('Should navigate to lesson when completed lesson is clicked', async () => {
            const user = userEvent.setup();

            // Setup completed lessons in localStorage
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'completedLessons') return JSON.stringify([1]);
                return null;
            });

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            const lesson1Title = screen.getByText(/Vowels \(Swar\) - Part 1/i);
            const lesson1Card = lesson1Title.closest('.lesson-card');

            await user.click(lesson1Card);

            expect(mockNavigate).toHaveBeenCalledWith('/learn', { state: { lessonId: 1 } });
        });

        test('Should NOT navigate when locked lesson is clicked', async () => {
            const user = userEvent.setup();

            // Ensure strictly no completed lessons in localStorage
            // The key is to ensure localStorageMock returns null for everything
            localStorageMock.getItem.mockImplementation(() => null);

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            const lesson2Title = screen.getByText(/Vowels \(Swar\) - Part 2/i);
            const lesson2Card = lesson2Title.closest('.lesson-card');

            // Verify it has locked class
            expect(lesson2Card).toHaveClass('locked');

            // Try to click
            await user.click(lesson2Card);

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    // ==================== VISUAL STATE TESTS ====================
    describe('Visual State Tests', () => {

        test('Should show lock icon for locked lessons', () => {
            // Ensure strictly no completed lessons
            localStorageMock.getItem.mockImplementation(() => null);

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            // Lesson 2 should be locked initially
            const lesson2Title = screen.getByText(/Vowels \(Swar\) - Part 2/i);
            const lesson2Card = lesson2Title.closest('.lesson-card');
            expect(lesson2Card).toHaveClass('locked');
        });

        test('Should show check icon/style for completed lessons', async () => {
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'completedLessons') return JSON.stringify([1]);
                return null;
            });

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            await waitFor(() => {
                const lesson1Title = screen.getByText(/Vowels \(Swar\) - Part 1/i);
                const lesson1Card = lesson1Title.closest('.lesson-card');
                expect(lesson1Card).toHaveClass('completed');
            });
        });

        test('Should unlock next lesson when previous is completed', async () => {
            // Complete Lesson 1
            localStorageMock.getItem.mockImplementation((key) => {
                if (key === 'completedLessons') return JSON.stringify([1]);
                return null;
            });

            render(
                <MemoryRouter>
                    <Lessons />
                </MemoryRouter>
            );

            await waitFor(() => {
                // Lesson 2 should now be unlocked
                const lesson2Title = screen.getByText(/Vowels \(Swar\) - Part 2/i);
                const lesson2Card = lesson2Title.closest('.lesson-card');
                expect(lesson2Card).not.toHaveClass('locked');

                // Lesson 3 should still be locked
                const lesson3Title = screen.getByText(/Review: All Vowels/i);
                const lesson3Card = lesson3Title.closest('.lesson-card');
                expect(lesson3Card).toHaveClass('locked');
            });
        });
    });
});

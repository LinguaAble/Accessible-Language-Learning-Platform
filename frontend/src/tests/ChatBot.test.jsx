import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import ChatBot from '../components/ChatBot';

// ── Mock CSS ──────────────────────────────────────────────────────────────────
vi.mock('./ChatBot.css', () => ({}));

// ── Mock axios ────────────────────────────────────────────────────────────────
vi.mock('axios');

// ── Mock UserContext ──────────────────────────────────────────────────────────
let mockUser = {};
let mockPreferences = { dailyGoalMinutes: 5 };

vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        user: mockUser,
        preferences: mockPreferences,
    }),
}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderChatBot = () =>
    render(
        <BrowserRouter>
            <ChatBot />
        </BrowserRouter>
    );

// Opens the chat window so all elements inside are interactable (no pointer-events: none)
const openChat = async (user) => {
    await user.click(document.getElementById('chatbot-open-btn'));
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ChatBot Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = {
            completedLessons: [],
            lessonScores: [],
            streak: 0,
            fullName: 'Test User',
            username: 'testuser',
            age: '',
            gender: '',
            bio: '',
        };
        mockPreferences = { dailyGoalMinutes: 5 };
        localStorage.clear();
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render the floating FAB button', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-open-btn')).toBeInTheDocument();
        });

        test('Should render Ask LinguaBot label on FAB', () => {
            renderChatBot();
            expect(screen.getByText(/Ask LinguaBot/i)).toBeInTheDocument();
        });

        test('FAB should have correct aria-label', () => {
            renderChatBot();
            expect(screen.getByRole('button', { name: /Open chat assistant/i })).toBeInTheDocument();
        });

        test('Chat window should be present in DOM but closed initially', () => {
            renderChatBot();
            const chatWindow = document.querySelector('.chatbot-window');
            expect(chatWindow).toBeInTheDocument();
            expect(chatWindow).not.toHaveClass('chatbot-open');
        });

        test('FAB should NOT have chatbot-fab-hidden class when closed', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-open-btn')).not.toHaveClass('chatbot-fab-hidden');
        });
    });

    // ==================== OPEN / CLOSE TESTS ====================
    describe('Open / Close Tests', () => {

        test('Should open chat window when FAB is clicked', async () => {
            const user = userEvent.setup();
            renderChatBot();

            await openChat(user);

            expect(document.querySelector('.chatbot-window')).toHaveClass('chatbot-open');
        });

        test('FAB should get chatbot-fab-hidden class when chat is open', async () => {
            const user = userEvent.setup();
            renderChatBot();

            await openChat(user);

            expect(document.getElementById('chatbot-open-btn')).toHaveClass('chatbot-fab-hidden');
        });

        test('Should close chat window when close button is clicked', async () => {
            const user = userEvent.setup();
            renderChatBot();

            await openChat(user);
            await user.click(document.getElementById('chatbot-close-btn'));

            expect(document.querySelector('.chatbot-window')).not.toHaveClass('chatbot-open');
        });

        test('FAB should reappear after chat is closed', async () => {
            const user = userEvent.setup();
            renderChatBot();

            await openChat(user);
            await user.click(document.getElementById('chatbot-close-btn'));

            expect(document.getElementById('chatbot-open-btn')).not.toHaveClass('chatbot-fab-hidden');
        });

        test('Close button should have correct aria-label', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-close-btn')).toHaveAttribute('aria-label', 'Close chat');
        });
    });

    // ==================== HEADER TESTS ====================
    describe('Header Tests', () => {

        test('Should render LinguaBot name in header', () => {
            renderChatBot();
            expect(screen.getByText('LinguaBot')).toBeInTheDocument();
        });

        test('Should render Hindi Learning Assistant status text in header', () => {
            renderChatBot();
            // Target the specific .chatbot-status span to avoid matching the greeting message text
            const statusEl = document.querySelector('.chatbot-status');
            expect(statusEl).toBeInTheDocument();
            expect(statusEl.textContent).toMatch(/Hindi Learning Assistant/i);
        });

        test('Should render chatbot-header container', () => {
            renderChatBot();
            expect(document.querySelector('.chatbot-header')).toBeInTheDocument();
        });

        test('Should render chatbot-avatar container', () => {
            renderChatBot();
            expect(document.querySelector('.chatbot-avatar')).toBeInTheDocument();
        });
    });

    // ==================== INITIAL MESSAGE TESTS ====================
    describe('Initial Greeting Message Tests', () => {

        test('Should show greeting message on load', () => {
            renderChatBot();
            expect(screen.getByText(/Namaste/i)).toBeInTheDocument();
        });

        test('Should show full greeting content', () => {
            renderChatBot();
            expect(screen.getByText(/I'm LinguaBot, your Hindi learning assistant/i)).toBeInTheDocument();
        });

        test('Greeting should be rendered as a bot message', () => {
            renderChatBot();
            expect(document.querySelectorAll('.chatbot-msg-bot').length).toBeGreaterThanOrEqual(1);
        });

        test('Should render message bubble for greeting', () => {
            renderChatBot();
            expect(document.querySelectorAll('.chatbot-msg-bubble').length).toBeGreaterThanOrEqual(1);
        });
    });

    // ==================== INPUT TESTS ====================
    describe('Input Field Tests', () => {

        test('Should render the input field', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-input')).toBeInTheDocument();
        });

        test('Should have correct placeholder', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-input')).toHaveAttribute('placeholder', 'Ask about Hindi...');
        });

        test('Should allow typing in the input field', async () => {
            const user = userEvent.setup();
            renderChatBot();
            await openChat(user); // must open chat first — window is closed by default

            const input = document.getElementById('chatbot-input');
            await user.type(input, 'What is नमस्ते?');

            expect(input).toHaveValue('What is नमस्ते?');
        });

        test('Send button should be disabled when input is empty', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-send-btn')).toBeDisabled();
        });

        test('Send button should be enabled when input has text', async () => {
            const user = userEvent.setup();
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');

            expect(document.getElementById('chatbot-send-btn')).toBeEnabled();
        });

        test('Send button should have correct aria-label', () => {
            renderChatBot();
            expect(screen.getByRole('button', { name: /Send message/i })).toBeInTheDocument();
        });

        test('Input should be disabled while loading', async () => {
            axios.post.mockImplementation(() => new Promise(() => {}));
            const user = userEvent.setup();
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.getElementById('chatbot-input')).toBeDisabled();
            });
        });
    });

    // ==================== SEND MESSAGE TESTS ====================
    describe('Send Message Tests', () => {

        test('Should add user message to chat when send is clicked', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'Bot reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'What is नमस्ते?');
            await user.click(document.getElementById('chatbot-send-btn'));

            expect(screen.getByText('What is नमस्ते?')).toBeInTheDocument();
        });

        test('Should clear input after sending message', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'Bot reply' } });
            renderChatBot();
            await openChat(user);

            const input = document.getElementById('chatbot-input');
            await user.type(input, 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            expect(input).toHaveValue('');
        });

        test('Should call correct API endpoint when message is sent', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'Test reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    'http://localhost:5000/api/ai/chat',
                    expect.objectContaining({ message: 'Hello' })
                );
            });
        });

        test('Should include userProgress in API call', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, completedLessons: [1, 2], streak: 5 };
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hi');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        userProgress: expect.objectContaining({
                            completedLessons: [1, 2],
                            streak: 5,
                        }),
                    })
                );
            });
        });

        test('Should include userInfo in API call', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, username: 'arjun', fullName: 'Arjun Dev' };
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hi');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        userInfo: expect.objectContaining({
                            username: 'arjun',
                            fullName: 'Arjun Dev',
                        }),
                    })
                );
            });
        });

        test('Should display bot reply after successful API response', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'नमस्ते means Hello!' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'What is नमस्ते?');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(screen.getByText('नमस्ते means Hello!')).toBeInTheDocument();
            });
        });

        test('User message should have chatbot-msg-user class', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.querySelectorAll('.chatbot-msg-user').length).toBeGreaterThanOrEqual(1);
            });
        });

        test('Should NOT send message when input is only whitespace', async () => {
            const user = userEvent.setup();
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), '   ');
            await user.click(document.getElementById('chatbot-send-btn'));

            expect(axios.post).not.toHaveBeenCalled();
        });

        test('Should not add duplicate messages when send is double-clicked', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValue({ data: { success: true, reply: 'reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));
            // Input clears after first send — second click does nothing
            await user.click(document.getElementById('chatbot-send-btn'));

            expect(axios.post).toHaveBeenCalledTimes(1);
        });
    });

    // ==================== ENTER KEY TESTS ====================
    describe('Enter Key Tests', () => {

        test('Should send message when Enter key is pressed', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'reply' } });
            renderChatBot();
            await openChat(user);

            const input = document.getElementById('chatbot-input');
            await user.type(input, 'Hello{Enter}');

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledTimes(1);
            });
        });

        test('Should NOT send message when Shift+Enter is pressed', async () => {
            const user = userEvent.setup();
            renderChatBot();
            await openChat(user);

            const input = document.getElementById('chatbot-input');
            await user.type(input, 'Hello');
            fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

            expect(axios.post).not.toHaveBeenCalled();
        });
    });

    // ==================== LOADING / TYPING INDICATOR TESTS ====================
    describe('Loading & Typing Indicator Tests', () => {

        test('Should show typing indicator while waiting for API response', async () => {
            const user = userEvent.setup();
            axios.post.mockImplementation(() => new Promise(() => {}));
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.querySelector('.chatbot-typing')).toBeInTheDocument();
            });
        });

        test('Should render 3 typing dots in indicator', async () => {
            const user = userEvent.setup();
            axios.post.mockImplementation(() => new Promise(() => {}));
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.querySelectorAll('.typing-dot')).toHaveLength(3);
            });
        });

        test('Should hide typing indicator after API response', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'Done!' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.querySelector('.chatbot-typing')).not.toBeInTheDocument();
            });
        });

        test('Send button should be disabled while loading', async () => {
            const user = userEvent.setup();
            axios.post.mockImplementation(() => new Promise(() => {}));
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.getElementById('chatbot-send-btn')).toBeDisabled();
            });
        });
    });

    // ==================== ERROR HANDLING TESTS ====================
    describe('Error Handling Tests', () => {

        test('Should show error message when API call fails', async () => {
            const user = userEvent.setup();
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
            });
        });

        test('Should re-enable input after API returns success: false', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: false } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.getElementById('chatbot-input')).not.toBeDisabled();
            });
        });

        test('Should re-enable input after API error', async () => {
            const user = userEvent.setup();
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                expect(document.getElementById('chatbot-input')).not.toBeDisabled();
            });
        });

        test('Error message should be shown as a bot message', async () => {
            const user = userEvent.setup();
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                // greeting + error message = at least 2 bot messages
                expect(document.querySelectorAll('.chatbot-msg-bot').length).toBeGreaterThanOrEqual(2);
            });
        });
    });

    // ==================== CONVERSATION HISTORY TESTS ====================
    describe('Conversation History Tests', () => {

        test('Should pass conversation history in subsequent messages', async () => {
            const user = userEvent.setup();
            axios.post
                .mockResolvedValueOnce({ data: { success: true, reply: 'First reply' } })
                .mockResolvedValueOnce({ data: { success: true, reply: 'Second reply' } });

            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'First question');
            await user.click(document.getElementById('chatbot-send-btn'));
            await waitFor(() => screen.getByText('First reply'));

            await user.type(document.getElementById('chatbot-input'), 'Second question');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                const secondCall = axios.post.mock.calls[1][1];
                expect(secondCall.history.length).toBeGreaterThan(0);
            });
        });

        test('Should skip greeting from history passed to API', async () => {
            const user = userEvent.setup();
            axios.post.mockResolvedValueOnce({ data: { success: true, reply: 'Reply' } });
            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Hello');
            await user.click(document.getElementById('chatbot-send-btn'));

            await waitFor(() => {
                const callArgs = axios.post.mock.calls[0][1];
                const hasGreeting = callArgs.history.some(m => m.content.includes('Namaste'));
                expect(hasGreeting).toBe(false);
            });
        });

        test('Should accumulate multiple messages in the chat', async () => {
            const user = userEvent.setup();
            axios.post
                .mockResolvedValueOnce({ data: { success: true, reply: 'Reply 1' } })
                .mockResolvedValueOnce({ data: { success: true, reply: 'Reply 2' } });

            renderChatBot();
            await openChat(user);

            await user.type(document.getElementById('chatbot-input'), 'Question 1');
            await user.click(document.getElementById('chatbot-send-btn'));
            await waitFor(() => screen.getByText('Reply 1'));

            await user.type(document.getElementById('chatbot-input'), 'Question 2');
            await user.click(document.getElementById('chatbot-send-btn'));
            await waitFor(() => screen.getByText('Reply 2'));

            expect(screen.getByText('Question 1')).toBeInTheDocument();
            expect(screen.getByText('Question 2')).toBeInTheDocument();
            expect(screen.getByText('Reply 1')).toBeInTheDocument();
            expect(screen.getByText('Reply 2')).toBeInTheDocument();
        });
    });

    // ==================== CSS STRUCTURE TESTS ====================
    describe('CSS Structure Tests', () => {

        test('Should render chatbot-window div', () => {
            renderChatBot();
            expect(document.querySelector('.chatbot-window')).toBeInTheDocument();
        });

        test('Should render chatbot-messages container', () => {
            renderChatBot();
            expect(document.querySelector('.chatbot-messages')).toBeInTheDocument();
        });

        test('Should render chatbot-input-area container', () => {
            renderChatBot();
            expect(document.querySelector('.chatbot-input-area')).toBeInTheDocument();
        });

        test('Should render chatbot-send-btn', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-send-btn')).toBeInTheDocument();
        });

        test('FAB should have chatbot-fab class', () => {
            renderChatBot();
            expect(document.getElementById('chatbot-open-btn')).toHaveClass('chatbot-fab');
        });
    });
});
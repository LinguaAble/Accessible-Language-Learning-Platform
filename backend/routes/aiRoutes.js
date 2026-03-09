const express = require('express');
const axios = require('axios');
const router = express.Router();

// Lesson metadata map — title + estimated minutes per lesson
const lessonMeta = {
  1: { title: 'Vowels Part 1', minutes: 5, chapter: 1 },
  2: { title: 'Vowels Part 2', minutes: 5, chapter: 1 },
  3: { title: 'Recap: Vowels', minutes: 4, chapter: 1 },
  4: { title: 'Consonants 1', minutes: 5, chapter: 1 },
  5: { title: 'Consonants 2', minutes: 5, chapter: 1 },
  6: { title: 'Consonants 3', minutes: 5, chapter: 1 },
  7: { title: 'Consonants 4', minutes: 5, chapter: 1 },
  8: { title: 'Consonants 5', minutes: 5, chapter: 1 },
  9: { title: 'Consonants 6', minutes: 5, chapter: 1 },
  10: { title: 'Grand Review', minutes: 6, chapter: 1 },
  11: { title: 'Recap: Mixed Bag', minutes: 4, chapter: 1 },
  12: { title: 'Recap: Rapid Fire', minutes: 4, chapter: 1 },
  13: { title: 'Pronunciation: Vowels', minutes: 5, chapter: 1 },
  14: { title: 'Pronunciation: Tricky Consonants', minutes: 5, chapter: 1 },
  15: { title: 'Pronunciation: Script Review', minutes: 4, chapter: 1 },
  16: { title: 'Common Words', minutes: 4, chapter: 2 },
  17: { title: 'Numbers 1-5', minutes: 4, chapter: 2 },
  18: { title: 'Numbers 6-10', minutes: 4, chapter: 2 },
  19: { title: 'Recap: Numbers', minutes: 3, chapter: 2 },
  20: { title: 'Family: Parents', minutes: 4, chapter: 2 },
  21: { title: 'Family: Siblings', minutes: 4, chapter: 2 },
  22: { title: 'Colors: Part 1', minutes: 4, chapter: 2 },
  23: { title: 'Colors: Part 2', minutes: 4, chapter: 2 },
  24: { title: 'Food & Drink: Part 1', minutes: 4, chapter: 2 },
  25: { title: 'Food & Drink: Part 2', minutes: 4, chapter: 2 },
  26: { title: 'Fruits', minutes: 4, chapter: 2 },
  27: { title: 'Recap: Vocabulary', minutes: 3, chapter: 2 },
  28: { title: 'Pronunciation: Common Words', minutes: 5, chapter: 2 },
  29: { title: 'Pronunciation: Numbers & Family', minutes: 5, chapter: 2 },
  30: { title: 'Pronunciation: Colors & Food', minutes: 5, chapter: 2 },
  31: { title: 'Pronouns: I & You', minutes: 4, chapter: 3 },
  32: { title: 'Pronouns: He, She & We', minutes: 4, chapter: 3 },
  33: { title: 'Verbs: Eat & Drink', minutes: 4, chapter: 3 },
  34: { title: 'Verbs: Go & Come', minutes: 4, chapter: 3 },
  35: { title: 'Verbs: Sleep & Wake', minutes: 4, chapter: 3 },
  36: { title: 'I am / You are', minutes: 4, chapter: 3 },
  37: { title: 'He/She is & We are', minutes: 4, chapter: 3 },
  38: { title: 'Simple Sentences', minutes: 5, chapter: 3 },
  39: { title: 'Questions: What & Where', minutes: 4, chapter: 3 },
  40: { title: 'Recap: Grammar Mix', minutes: 4, chapter: 3 },
  41: { title: 'Adjectives: Size', minutes: 4, chapter: 3 },
  42: { title: 'Adjectives: Feelings', minutes: 4, chapter: 3 },
  43: { title: 'Pronunciation: Pronouns & Verbs', minutes: 5, chapter: 3 },
  44: { title: 'Pronunciation: Sentences', minutes: 5, chapter: 3 },
  45: { title: 'Pronunciation: Questions & Adjectives', minutes: 5, chapter: 3 },
};

const TOTAL_LESSONS = Object.keys(lessonMeta).length;

// POST /api/ai/daily-plan
router.post('/daily-plan', async (req, res) => {
  try {
    const {
      completedLessons = [],
      streak = 0,
      dailyGoalMinutes = 5,
      lessonScores = [],
      todayProgress = 0
    } = req.body;

    const completedSet = new Set(completedLessons.map(Number));
    const completedCount = completedLessons.length;
    const goalMet = todayProgress >= dailyGoalMinutes;
    const remainingMinutes = Math.max(0, dailyGoalMinutes - todayProgress);

    // Find weak lessons (score < 70%), sorted lowest first
    const weakLessons = lessonScores
      .filter(ls => ls.score < 70 && lessonMeta[ls.lessonId])
      .sort((a, b) => a.score - b.score)
      .map(ls => ({
        id: ls.lessonId,
        title: lessonMeta[ls.lessonId].title,
        score: ls.score,
        minutes: lessonMeta[ls.lessonId].minutes
      }));

    // Find next uncompleted lesson
    const nextNew = Object.entries(lessonMeta)
      .filter(([id]) => !completedSet.has(Number(id)))
      .map(([id, meta]) => ({ id: Number(id), ...meta }))[0] || null;

    // ── Build a very structured prompt for the AI ─────────
    let situation, instruction;

    if (goalMet) {
      situation = `The student has COMPLETED their daily goal of ${dailyGoalMinutes} minutes. They studied ${todayProgress} minutes. Streak: ${streak} days. Lessons done: ${completedCount}/${TOTAL_LESSONS}.`;
      instruction = `Congratulate them warmly in 1-2 sentences. Tell them to come back tomorrow to keep their streak. Do NOT suggest any more lessons.`;

    } else if (weakLessons.length > 0) {
      const weakest = weakLessons[0];
      situation = `The student scored ${weakest.score}% on Lesson ${weakest.id}: "${weakest.title}". That's below 70%, so they need to review it. They have ${remainingMinutes} minutes left in their daily goal. Streak: ${streak} days.`;
      instruction = `Tell them to review Lesson ${weakest.id}: "${weakest.title}" (~${weakest.minutes} min) because they scored ${weakest.score}%. Be specific — mention the lesson name and score. Encourage them that reviewing will help them improve. Keep it to 1-2 sentences.`;

    } else if (nextNew) {
      situation = `All completed lessons have good scores (70%+). The next uncompleted lesson is Lesson ${nextNew.id}: "${nextNew.title}" (~${nextNew.minutes} min). They have ${remainingMinutes} minutes left in their daily goal. Streak: ${streak} days. Lessons done: ${completedCount}/${TOTAL_LESSONS}.`;
      instruction = `Recommend Lesson ${nextNew.id}: "${nextNew.title}" as their next step. Be specific — mention the lesson number and name. Keep it to 1-2 sentences.`;

    } else {
      situation = `The student has completed ALL ${TOTAL_LESSONS} lessons with good scores. Streak: ${streak} days.`;
      instruction = `Congratulate them on finishing all lessons. Suggest revisiting pronunciation lessons or Grand Review to stay sharp. Keep it to 1-2 sentences.`;
    }

    const prompt = `You are a friendly Hindi learning coach for LinguaAble.

SITUATION: ${situation}

YOUR TASK: ${instruction}

Respond with ONLY the recommendation message. No greetings, no "Here's your plan:", just the message itself. Use one emoji. Be warm and specific.`;

    // Call GROQ API
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0.5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    const plan = groqResponse.data.choices?.[0]?.message?.content?.trim()
      || 'Keep up the great work! Try completing one new lesson today.';

    res.json({ success: true, plan });

  } catch (err) {
    console.error('AI daily plan error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Server Error', detail: err.response?.data?.error?.message || err.message });
  }
});

// ── POST /api/ai/chat ────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], userProgress = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    // Build student progress context from real data
    const completed = (userProgress.completedLessons || []).map(Number);
    const completedCount = completed.length;
    const scores = userProgress.lessonScores || [];
    const streak = userProgress.streak || 0;
    const todayProg = userProgress.todayProgress || 0;
    const dailyGoal = userProgress.dailyGoalMinutes || 5;

    // Weak lessons (< 70%)
    const weakList = scores
      .filter(s => s.score < 70 && lessonMeta[s.lessonId])
      .map(s => `Lesson ${s.lessonId}: "${lessonMeta[s.lessonId].title}" (scored ${s.score}%)`)
      .join(', ') || 'None — all good!';

    // Next uncompleted lesson
    const completedSet = new Set(completed);
    const nextLesson = Object.entries(lessonMeta)
      .find(([id]) => !completedSet.has(Number(id)));
    const nextLessonText = nextLesson
      ? `Lesson ${nextLesson[0]}: "${nextLesson[1].title}"`
      : 'All 45 lessons completed!';

    const progressContext = `
STUDENT'S CURRENT PROGRESS (you already know this — NEVER ask the student about their progress):
- Lessons completed: ${completedCount} out of ${TOTAL_LESSONS}
- Current streak: ${streak} day(s)
- Today's study time: ${todayProg} min / ${dailyGoal} min goal
- Weak lessons needing review: ${weakList}
- Next lesson to do: ${nextLessonText}
- Completed lesson IDs: [${completed.join(', ')}]`;

    const systemPrompt = `You are LinguaBot, a friendly and empathetic Hindi language learning assistant for LinguaAble — an accessible language learning app designed specifically for people with learning disabilities like dyslexia, ADHD, and autism.

${progressContext}

RULES YOU MUST FOLLOW STRICTLY:
1. You answer questions related to:
   - Hindi language learning (alphabet, grammar, vocabulary, pronunciation, sentences)
   - Greetings like "hi", "hello", "hey", "bye", "thanks", "thank you"
   - The LinguaAble app, lessons, study tips, and learning strategies
   - The student's progress, recommendations, and what to study next
   - Hindi culture related to language learning
   - Learning disabilities (dyslexia, ADHD, autism) and how to learn better with them
   - Accessibility features in the app (bionic reading, color overlays, text-to-speech, Pomodoro timer)
   - Emotional wellbeing and motivation — if a student says they feel sad, frustrated, overwhelmed, anxious, or depressed, respond with EMPATHY and gentle encouragement. Remind them that learning at their own pace is okay and suggest taking a break or trying a short fun lesson

2. For messages that are COMPLETELY unrelated (e.g., coding, politics, sports, weather), respond with:
   "I'm LinguaBot, your Hindi learning assistant! 🙏 I can help with Hindi learning, study tips, and accessibility support. What would you like to know?"

3. Keep responses SHORT (2-4 sentences max)
4. Use Hindi examples when helpful (with transliteration in brackets)
5. Be warm, patient, encouraging, and supportive — remember your users may have learning disabilities
6. Use emojis sparingly (1-2 per message)
7. NEVER ask the student about their progress — you already have their data above
8. When they ask "what should I learn next" or similar, use the progress data to give a specific recommendation
9. If a student expresses frustration about learning, validate their feelings and remind them that every small step counts`;

    // Build conversation messages for GROQ
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent history (last 6 messages for context)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 200,
        temperature: 0.6
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    const reply = groqResponse.data.choices?.[0]?.message?.content?.trim()
      || "I'm having trouble thinking right now. Please try again! 🙏";

    res.json({ success: true, reply });

  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Server Error', detail: err.response?.data?.error?.message || err.message });
  }
});

module.exports = router;

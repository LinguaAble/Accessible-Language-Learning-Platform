const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const StudySession = require('../models/StudySession');
const User = require('../models/User');
const freeLanguage = require('../services/FreeLanguageService'); // FREE!
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

// Get user profile with gamification
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const progress = await Progress.find({ userId: req.user.id });
        
        const totalXP = progress.reduce((sum, p) => sum + (p.score || 0), 0);
        const level = Math.floor(totalXP / 100) + 1;
        const xpForNextLevel = (level * 100) - totalXP;
        
        const sessions = await StudySession.find({ userId: req.user.id }).sort({ date: -1 });
        let streak = 0;
        if (sessions.length > 0) {
            const sessionDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
            let currentDate = new Date();
            
            for (let dateStr of sessionDates) {
                const sessionDate = new Date(dateStr);
                const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 1) {
                    streak++;
                    currentDate = sessionDate;
                } else {
                    break;
                }
            }
        }
        
        res.json({
            user: {
                email: user.email,
                xp: totalXP,
                level,
                xpForNextLevel,
                streak,
                lives: 5,
                gems: progress.length * 10,
                completedLessons: progress.filter(p => p.status === 'Completed').length,
                totalLessons: await Lesson.countDocuments()
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get daily challenge
router.get('/daily-challenge', auth, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = await Progress.findOne({
            userId: req.user.id,
            completedAt: {
                $gte: new Date(today),
                $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
            }
        });
        
        res.json({
            completed: !!completedToday,
            reward: 50,
            description: "Complete any lesson today to earn your daily reward!"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get word of the day (FREE - no API needed!)
router.get('/word-of-day', auth, async (req, res) => {
    try {
        const word = freeLanguage.getWordOfDay();
        res.json(word);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all lessons with gamification
router.get('/lessons', auth, async (req, res) => {
    try {
        const lessons = await Lesson.find().sort({ difficulty: 1, duration: 1 });
        const progress = await Progress.find({ userId: req.user.id });
        const completedIds = progress.filter(p => p.status === 'Completed').map(p => p.lessonId.toString());
        
        const lessonsWithProgress = lessons.map((lesson, index) => {
            const isCompleted = completedIds.includes(lesson._id.toString());
            const isLocked = index > 0 && !completedIds.includes(lessons[index - 1]._id.toString());
            
            return {
                ...lesson._doc,
                completed: isCompleted,
                locked: isLocked,
                xpReward: 50 + (lesson.difficulty === 'Intermediate' ? 25 : lesson.difficulty === 'Advanced' ? 50 : 0),
                gemsReward: 10
            };
        });
        
        res.json(lessonsWithProgress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get lesson with exercises
router.get('/lesson/:id', auth, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        
        const exercises = await generateExercises(lesson);
        
        res.json({
            ...lesson._doc,
            exercises
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate exercises for a lesson (using FREE service)
async function generateExercises(lesson) {
    const exercises = [];
    
    if (lesson.title.includes('Greetings') || lesson.title.includes('Basic')) {
        // Exercise 1: Translation
        exercises.push({
            type: 'translate',
            question: 'How do you say "Hello" in Hindi?',
            correctAnswer: 'नमस्ते',
            options: ['नमस्ते', 'अलविदा', 'धन्यवाद', 'कृपया'],
            englishWord: 'Hello',
            hindiWord: 'नमस्ते',
            romanization: 'Namaste',
            audio: true,
            explanation: 'नमस्ते (Namaste) is the universal greeting in Hindi'
        });
        
        exercises.push({
            type: 'translate',
            question: 'How do you say "Thank you" in Hindi?',
            correctAnswer: 'धन्यवाद',
            options: ['नमस्ते', 'अलविदा', 'धन्यवाद', 'हाँ'],
            englishWord: 'Thank you',
            hindiWord: 'धन्यवाद',
            romanization: 'Dhanyavaad',
            audio: true,
            explanation: 'धन्यवाद shows gratitude and respect'
        });
        
        // Exercise 2: Listen
        exercises.push({
            type: 'listen',
            question: 'Listen and select the correct word',
            audioText: 'नमस्ते',
            correctAnswer: 'नमस्ते',
            options: ['नमस्ते', 'अलविदा', 'धन्यवाद', 'कृपया'],
            audio: true,
            explanation: 'This is how Namaste sounds in Hindi'
        });
        
        // Exercise 3: Speak
        exercises.push({
            type: 'speak',
            question: 'Say "नमस्ते" (Namaste) in Hindi',
            wordToSpeak: 'नमस्ते',
            romanization: 'Namaste',
            correctAnswer: 'namaste',
            audio: true,
            explanation: 'Practice makes perfect!'
        });
        
        // Exercise 4: Match
        exercises.push({
            type: 'match',
            question: 'Match the English with Hindi',
            pairs: [
                { english: 'Hello', hindi: 'नमस्ते' },
                { english: 'Goodbye', hindi: 'अलविदा' },
                { english: 'Thank you', hindi: 'धन्यवाद' }
            ],
            explanation: 'Connect the words that mean the same'
        });
    } else if (lesson.title.includes('Numbers') || lesson.title.includes('Number')) {
        exercises.push({
            type: 'translate',
            question: 'What is the number "One" in Hindi?',
            correctAnswer: 'एक',
            options: ['एक', 'दो', 'तीन', 'चार'],
            englishWord: 'One',
            hindiWord: 'एक',
            romanization: 'Ek',
            audio: true,
            explanation: 'एक (Ek) means one'
        });
        
        exercises.push({
            type: 'translate',
            question: 'What is "Three" in Hindi?',
            correctAnswer: 'तीन',
            options: ['एक', 'दो', 'तीन', 'चार'],
            englishWord: 'Three',
            hindiWord: 'तीन',
            romanization: 'Teen',
            audio: true,
            explanation: 'तीन (Teen) means three'
        });
        
        exercises.push({
            type: 'listen',
            question: 'Listen and select the number',
            audioText: 'तीन',
            correctAnswer: 'तीन',
            options: ['एक', 'दो', 'तीन', 'चार'],
            audio: true,
            explanation: 'Count in Hindi!'
        });
        
        exercises.push({
            type: 'speak',
            question: 'Say "तीन" (Teen)',
            wordToSpeak: 'तीन',
            romanization: 'Teen',
            correctAnswer: 'teen',
            audio: true,
            explanation: 'Rhymes with "seen"'
        });
        
        exercises.push({
            type: 'match',
            question: 'Match numbers with Hindi',
            pairs: [
                { english: 'One', hindi: 'एक' },
                { english: 'Two', hindi: 'दो' },
                { english: 'Three', hindi: 'तीन' }
            ],
            explanation: 'Practice counting in Hindi'
        });
    } else if (lesson.title.includes('Colors') || lesson.title.includes('Color')) {
        exercises.push({
            type: 'translate',
            question: 'What is "Red" in Hindi?',
            correctAnswer: 'लाल',
            options: ['लाल', 'नीला', 'हरा', 'पीला'],
            englishWord: 'Red',
            hindiWord: 'लाल',
            romanization: 'Laal',
            audio: true,
            explanation: 'लाल (Laal) means red'
        });
        
        exercises.push({
            type: 'translate',
            question: 'What is "Blue" in Hindi?',
            correctAnswer: 'नीला',
            options: ['लाल', 'नीला', 'हरा', 'पीला'],
            englishWord: 'Blue',
            hindiWord: 'नीला',
            romanization: 'Neela',
            audio: true,
            explanation: 'नीला (Neela) means blue'
        });
        
        exercises.push({
            type: 'speak',
            question: 'Say "नीला" (Neela)',
            wordToSpeak: 'नीला',
            romanization: 'Neela',
            correctAnswer: 'neela',
            audio: true,
            explanation: 'Practice your pronunciation'
        });
        
        exercises.push({
            type: 'match',
            question: 'Match colors',
            pairs: [
                { english: 'Red', hindi: 'लाल' },
                { english: 'Blue', hindi: 'नीला' },
                { english: 'Green', hindi: 'हरा' }
            ],
            explanation: 'Learn colors in Hindi'
        });
    } else {
        // Generic exercises for other lessons
        exercises.push({
            type: 'translate',
            question: `What did you learn about ${lesson.title}?`,
            correctAnswer: 'I understand',
            options: ['I understand', 'Need more practice', 'Very clear', 'Confused'],
            audio: false,
            explanation: 'Great! Continue learning!'
        });
    }
    
    // Add fill blank exercise
    exercises.push({
        type: 'fillblank',
        question: 'Complete: "When greeting someone in Hindi, you say ___"',
        sentence: 'When greeting someone in Hindi, you say ___',
        correctAnswer: 'नमस्ते',
        options: ['नमस्ते', 'अलविदा', 'धन्यवाद', 'कृपया'],
        audio: true,
        explanation: 'नमस्ते is the proper greeting'
    });
    
    return exercises;
}

// Submit lesson progress with gamification
router.post('/progress', auth, async (req, res) => {
    try {
        const { lessonId, score, mistakes, exercises } = req.body;
        
        let progress = await Progress.findOne({ userId: req.user.id, lessonId });
        
        const xpEarned = Math.round(score / 2);
        
        if (progress) {
            progress.score = Math.max(progress.score, score);
            progress.mistakes = mistakes;
            progress.status = score >= 80 ? 'Completed' : 'In Progress';
            progress.lastAccessed = Date.now();
            if (score >= 80 && !progress.completedAt) {
                progress.completedAt = Date.now();
            }
        } else {
            progress = new Progress({
                userId: req.user.id,
                lessonId,
                score,
                mistakes,
                status: score >= 80 ? 'Completed' : 'In Progress',
                completedAt: score >= 80 ? Date.now() : null
            });
        }
        
        await progress.save();
        
        const today = new Date().toISOString().split('T')[0];
        const session = await StudySession.findOne({ userId: req.user.id, date: today });
        
        if (session) {
            session.duration += 5;
            await session.save();
        } else {
            await StudySession.create({
                userId: req.user.id,
                date: today,
                duration: 5
            });
        }
        
        res.json({
            progress,
            xpEarned,
            gemsEarned: score >= 80 ? 10 : 5,
            message: score >= 80 ? '🎉 Lesson Complete!' : '💪 Keep practicing!'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Translate text (FREE - using MyMemory API or local dictionary)
router.post('/translate', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const translation = await freeLanguage.translateToHindi(text);
        res.json(translation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get audio info (Client-side generation using browser API)
router.post('/audio', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const audioInfo = freeLanguage.getAudioInfo(text);
        res.json(audioInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Evaluate pronunciation (FREE - using Levenshtein algorithm)
router.post('/evaluate-pronunciation', auth, async (req, res) => {
    try {
        const { transcript, expectedText } = req.body;
        const result = freeLanguage.evaluatePronunciation(transcript, expectedText);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const users = await User.find().select('email');
        const leaderboard = [];
        
        for (let user of users) {
            const progress = await Progress.find({ userId: user._id });
            const xp = progress.reduce((sum, p) => sum + (p.score || 0), 0);
            leaderboard.push({
                email: user.email.split('@')[0],
                xp,
                level: Math.floor(xp / 100) + 1
            });
        }
        
        leaderboard.sort((a, b) => b.xp - a.xp);
        res.json(leaderboard.slice(0, 10));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await StudySession.find({ userId }).sort({ date: -1 });
        
        let streak = 0;
        if (sessions.length > 0) {
            const sessionDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
            let currentDate = new Date();
            
            for (let dateStr of sessionDates) {
                const sessionDate = new Date(dateStr);
                const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 1) {
                    streak++;
                    currentDate = sessionDate;
                } else {
                    break;
                }
            }
        }

        const today = new Date();
        const weeklyData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const daySessions = await StudySession.find({ userId, date: dateStr });
            const totalMinutes = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            
            weeklyData.push({
                day: days[date.getDay()],
                minutes: totalMinutes
            });
        }

        const progresses = await Progress.find({ userId, status: 'Completed' }).populate('lessonId');
        const skillScores = {
            Reading: [],
            Speaking: [],
            Listening: [],
            Grammar: []
        };

        progresses.forEach(p => {
            if (p.lessonId && p.lessonId.type) {
                const type = p.lessonId.type;
                if (skillScores[type]) {
                    skillScores[type].push(p.score || 0);
                }
            }
        });

        const skills = {};
        Object.keys(skillScores).forEach(skill => {
            if (skillScores[skill].length > 0) {
                const avg = skillScores[skill].reduce((a, b) => a + b, 0) / skillScores[skill].length;
                skills[skill] = Math.round(avg);
            } else {
                skills[skill] = 0;
            }
        });

        const completedCount = await Progress.countDocuments({ userId, status: 'Completed' });
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCompleted = await Progress.countDocuments({ 
            userId, 
            status: 'Completed',
            completedAt: { 
                $gte: new Date(todayStr),
                $lt: new Date(new Date(todayStr).getTime() + 24 * 60 * 60 * 1000)
            }
        });
        
        const todayProgress = todayCompleted >= 1 ? 100 : (todayCompleted * 100);
        const mistakesProgresses = await Progress.find({ userId, status: 'Completed', score: { $lt: 70 } });
        const mistakeCount = mistakesProgresses.length;

        res.json({
            streak,
            weeklyData,
            skills,
            completedLessons: completedCount,
            todayProgress,
            mistakeCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/next-lesson', auth, async (req, res) => {
    try {
        const completed = await Progress.find({ userId: req.user.id, status: 'Completed' });
        const completedIds = completed.map(p => p.lessonId);
        const nextLesson = await Lesson.findOne({ _id: { $nin: completedIds } }).sort({ difficulty: 1, duration: 1 });

        if (nextLesson) {
            res.json(nextLesson);
        } else {
            res.json({ message: 'All lessons completed!', completed: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/revision', auth, async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.user.id, score: { $lt: 80 }, status: 'Completed' }).populate('lessonId');
        res.json(progress.map(p => p.lessonId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
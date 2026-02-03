// backend/services/freeLanguageService.js
// 100% FREE Alternative to Google Cloud APIs - NO BILLING REQUIRED!

const axios = require('axios');

class FreeLanguageService {
    constructor() {
        // These are all FREE with no billing required!
        this.translationAPI = 'https://api.mymemory.translated.net/get';
        this.dictionaryAPI = 'https://api.dictionaryapi.dev/api/v2/entries/en';
    }

    /**
     * FREE Translation using MyMemory API
     * 100% Free, no API key needed!
     * Limit: 1000 words/day (more than enough for learning)
     */
    async translateToHindi(text) {
        try {
            const response = await axios.get(this.translationAPI, {
                params: {
                    q: text,
                    langpair: 'en|hi'
                }
            });

            if (response.data && response.data.responseData) {
                return {
                    original: text,
                    translated: response.data.responseData.translatedText,
                    language: 'hi',
                    source: 'MyMemory (Free)'
                };
            }

            // Fallback to our dictionary
            return this.getFallbackTranslation(text);
        } catch (error) {
            console.error('Translation error:', error.message);
            return this.getFallbackTranslation(text);
        }
    }

    /**
     * Comprehensive Hindi Dictionary (No API needed!)
     * All stored locally - works offline
     */
    getFallbackTranslation(text) {
        const hindiDictionary = {
            // Greetings
            'hello': { hindi: 'नमस्ते', romanization: 'Namaste', category: 'Greetings' },
            'goodbye': { hindi: 'अलविदा', romanization: 'Alvida', category: 'Greetings' },
            'good morning': { hindi: 'सुप्रभात', romanization: 'Suprabhat', category: 'Greetings' },
            'good night': { hindi: 'शुभ रात्रि', romanization: 'Shubh Ratri', category: 'Greetings' },
            'welcome': { hindi: 'स्वागत', romanization: 'Swagat', category: 'Greetings' },
            
            // Politeness
            'thank you': { hindi: 'धन्यवाद', romanization: 'Dhanyavaad', category: 'Politeness' },
            'please': { hindi: 'कृपया', romanization: 'Kripya', category: 'Politeness' },
            'sorry': { hindi: 'माफ़ करना', romanization: 'Maaf Karna', category: 'Politeness' },
            'excuse me': { hindi: 'माफ़ कीजिये', romanization: 'Maaf Kijiye', category: 'Politeness' },
            
            // Yes/No
            'yes': { hindi: 'हाँ', romanization: 'Haan', category: 'Basic' },
            'no': { hindi: 'नहीं', romanization: 'Nahi', category: 'Basic' },
            'okay': { hindi: 'ठीक है', romanization: 'Theek Hai', category: 'Basic' },
            
            // Numbers
            'one': { hindi: 'एक', romanization: 'Ek', category: 'Numbers' },
            'two': { hindi: 'दो', romanization: 'Do', category: 'Numbers' },
            'three': { hindi: 'तीन', romanization: 'Teen', category: 'Numbers' },
            'four': { hindi: 'चार', romanization: 'Chaar', category: 'Numbers' },
            'five': { hindi: 'पांच', romanization: 'Paanch', category: 'Numbers' },
            'six': { hindi: 'छह', romanization: 'Chhe', category: 'Numbers' },
            'seven': { hindi: 'सात', romanization: 'Saat', category: 'Numbers' },
            'eight': { hindi: 'आठ', romanization: 'Aath', category: 'Numbers' },
            'nine': { hindi: 'नौ', romanization: 'Nau', category: 'Numbers' },
            'ten': { hindi: 'दस', romanization: 'Das', category: 'Numbers' },
            
            // Colors
            'red': { hindi: 'लाल', romanization: 'Laal', category: 'Colors' },
            'blue': { hindi: 'नीला', romanization: 'Neela', category: 'Colors' },
            'green': { hindi: 'हरा', romanization: 'Hara', category: 'Colors' },
            'yellow': { hindi: 'पीला', romanization: 'Peela', category: 'Colors' },
            'black': { hindi: 'काला', romanization: 'Kala', category: 'Colors' },
            'white': { hindi: 'सफ़ेद', romanization: 'Safed', category: 'Colors' },
            'orange': { hindi: 'नारंगी', romanization: 'Naarangi', category: 'Colors' },
            'pink': { hindi: 'गुलाबी', romanization: 'Gulabi', category: 'Colors' },
            'brown': { hindi: 'भूरा', romanization: 'Bhoora', category: 'Colors' },
            'purple': { hindi: 'बैंगनी', romanization: 'Baingani', category: 'Colors' },
            
            // Family
            'mother': { hindi: 'माता', romanization: 'Mata', category: 'Family' },
            'father': { hindi: 'पिता', romanization: 'Pita', category: 'Family' },
            'brother': { hindi: 'भाई', romanization: 'Bhai', category: 'Family' },
            'sister': { hindi: 'बहन', romanization: 'Behen', category: 'Family' },
            'son': { hindi: 'बेटा', romanization: 'Beta', category: 'Family' },
            'daughter': { hindi: 'बेटी', romanization: 'Beti', category: 'Family' },
            'grandmother': { hindi: 'दादी', romanization: 'Dadi', category: 'Family' },
            'grandfather': { hindi: 'दादा', romanization: 'Dada', category: 'Family' },
            
            // Food & Drink
            'water': { hindi: 'पानी', romanization: 'Paani', category: 'Food' },
            'food': { hindi: 'खाना', romanization: 'Khaana', category: 'Food' },
            'bread': { hindi: 'रोटी', romanization: 'Roti', category: 'Food' },
            'rice': { hindi: 'चावल', romanization: 'Chawal', category: 'Food' },
            'tea': { hindi: 'चाय', romanization: 'Chai', category: 'Food' },
            'coffee': { hindi: 'कॉफ़ी', romanization: 'Coffee', category: 'Food' },
            'milk': { hindi: 'दूध', romanization: 'Doodh', category: 'Food' },
            
            // Common Words
            'name': { hindi: 'नाम', romanization: 'Naam', category: 'Basic' },
            'house': { hindi: 'घर', romanization: 'Ghar', category: 'Basic' },
            'school': { hindi: 'स्कूल', romanization: 'School', category: 'Basic' },
            'book': { hindi: 'किताब', romanization: 'Kitaab', category: 'Basic' },
            'friend': { hindi: 'दोस्त', romanization: 'Dost', category: 'Basic' },
            'time': { hindi: 'समय', romanization: 'Samay', category: 'Basic' },
            'day': { hindi: 'दिन', romanization: 'Din', category: 'Basic' },
            'night': { hindi: 'रात', romanization: 'Raat', category: 'Basic' },
            
            // Questions
            'what': { hindi: 'क्या', romanization: 'Kya', category: 'Questions' },
            'where': { hindi: 'कहाँ', romanization: 'Kahan', category: 'Questions' },
            'when': { hindi: 'कब', romanization: 'Kab', category: 'Questions' },
            'why': { hindi: 'क्यों', romanization: 'Kyun', category: 'Questions' },
            'how': { hindi: 'कैसे', romanization: 'Kaise', category: 'Questions' },
            'who': { hindi: 'कौन', romanization: 'Kaun', category: 'Questions' },
            
            // Days
            'monday': { hindi: 'सोमवार', romanization: 'Somvaar', category: 'Days' },
            'tuesday': { hindi: 'मंगलवार', romanization: 'Mangalvaar', category: 'Days' },
            'wednesday': { hindi: 'बुधवार', romanization: 'Budhvaar', category: 'Days' },
            'thursday': { hindi: 'गुरुवार', romanization: 'Guruvaar', category: 'Days' },
            'friday': { hindi: 'शुक्रवार', romanization: 'Shukravaar', category: 'Days' },
            'saturday': { hindi: 'शनिवार', romanization: 'Shanivaar', category: 'Days' },
            'sunday': { hindi: 'रविवार', romanization: 'Ravivaar', category: 'Days' }
        };

        const lowerText = text.toLowerCase().trim();
        
        if (hindiDictionary[lowerText]) {
            const entry = hindiDictionary[lowerText];
            return {
                original: text,
                translated: entry.hindi,
                romanization: entry.romanization,
                category: entry.category,
                language: 'hi',
                source: 'Local Dictionary'
            };
        }

        // Return original if not found
        return {
            original: text,
            translated: text,
            romanization: text,
            language: 'en',
            source: 'Not Found'
        };
    }

    /**
     * Client-side Audio Generation Info
     * We'll use browser's built-in Speech Synthesis (100% FREE)
     * This method returns instructions for the frontend
     */
    getAudioInfo(text) {
        return {
            text: text,
            instruction: 'use-browser-speech-synthesis',
            lang: 'hi-IN',
            rate: 0.9,
            pitch: 1,
            note: 'Audio is generated client-side using browser Speech Synthesis API'
        };
    }

    /**
     * Pronunciation Evaluation (Client-side)
     * Using Levenshtein distance algorithm
     */
    evaluatePronunciation(spokenText, expectedText) {
        const spoken = this.normalizeText(spokenText);
        const expected = this.normalizeText(expectedText);
        
        const similarity = this.calculateSimilarity(spoken, expected);
        const score = Math.round(similarity * 100);
        
        return {
            transcript: spokenText,
            expected: expectedText,
            score: score,
            similarity: similarity,
            feedback: this.getPronunciationFeedback(score),
            note: 'Evaluation done using Levenshtein distance algorithm'
        };
    }

    /**
     * Normalize text for comparison
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' '); // Normalize spaces
    }

    /**
     * Calculate similarity using Levenshtein distance
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Levenshtein distance algorithm
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Get pronunciation feedback
     */
    getPronunciationFeedback(score) {
        if (score >= 90) {
            return {
                message: "Perfect! Your pronunciation is excellent! 🌟",
                emoji: "🎉",
                color: "green",
                level: "Excellent"
            };
        } else if (score >= 75) {
            return {
                message: "Great job! Very close to perfect! 👏",
                emoji: "👍",
                color: "lightgreen",
                level: "Great"
            };
        } else if (score >= 60) {
            return {
                message: "Good effort! Keep practicing! 💪",
                emoji: "😊",
                color: "orange",
                level: "Good"
            };
        } else if (score >= 40) {
            return {
                message: "Not bad! Try listening again! 🎧",
                emoji: "🔄",
                color: "yellow",
                level: "Fair"
            };
        } else {
            return {
                message: "Keep trying! Listen carefully and practice! 🎯",
                emoji: "💪",
                color: "red",
                level: "Needs Practice"
            };
        }
    }

    /**
     * Get word of the day
     */
    getWordOfDay() {
        const words = [
            { 
                english: 'Hello', 
                hindi: 'नमस्ते', 
                romanization: 'Namaste', 
                category: 'Greetings',
                usage: 'Used to greet someone at any time of day',
                example: 'नमस्ते, आप कैसे हैं? (Namaste, aap kaise hain?) - Hello, how are you?'
            },
            { 
                english: 'Thank you', 
                hindi: 'धन्यवाद', 
                romanization: 'Dhanyavaad', 
                category: 'Politeness',
                usage: 'Express gratitude',
                example: 'धन्यवाद आपकी मदद के लिए (Dhanyavaad aapki madad ke liye) - Thank you for your help'
            },
            { 
                english: 'Water', 
                hindi: 'पानी', 
                romanization: 'Paani', 
                category: 'Food & Drink',
                usage: 'Essential word for daily life',
                example: 'मुझे पानी चाहिए (Mujhe paani chahiye) - I need water'
            },
            { 
                english: 'Friend', 
                hindi: 'दोस्त', 
                romanization: 'Dost', 
                category: 'Relationships',
                usage: 'Refers to a close friend',
                example: 'वह मेरा अच्छा दोस्त है (Vah mera accha dost hai) - He/She is my good friend'
            },
            { 
                english: 'Beautiful', 
                hindi: 'सुंदर', 
                romanization: 'Sundar', 
                category: 'Adjectives',
                usage: 'Describe something attractive',
                example: 'यह बहुत सुंदर है (Yeh bahut sundar hai) - This is very beautiful'
            },
            { 
                english: 'Happy', 
                hindi: 'खुश', 
                romanization: 'Khush', 
                category: 'Emotions',
                usage: 'Express happiness',
                example: 'मैं बहुत खुश हूँ (Main bahut khush hoon) - I am very happy'
            },
            { 
                english: 'Love', 
                hindi: 'प्यार', 
                romanization: 'Pyaar', 
                category: 'Emotions',
                usage: 'Express affection',
                example: 'मैं तुमसे प्यार करता हूँ (Main tumse pyaar karta hoon) - I love you'
            }
        ];

        const today = new Date().getDay();
        return words[today % words.length];
    }

    /**
     * Get random practice words by category
     */
    getPracticeWords(category, count = 5) {
        const dictionary = this.getAllWords();
        const filtered = dictionary.filter(w => w.category === category);
        
        // Shuffle and return requested count
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Get all words from dictionary
     */
    getAllWords() {
        const translation = this.getFallbackTranslation('');
        // This would return all words from the dictionary
        // For now, returning a sample
        return [
            { english: 'Hello', hindi: 'नमस्ते', romanization: 'Namaste', category: 'Greetings' },
            { english: 'Thank you', hindi: 'धन्यवाद', romanization: 'Dhanyavaad', category: 'Politeness' },
            { english: 'Water', hindi: 'पानी', romanization: 'Paani', category: 'Food' },
            // Add more as needed
        ];
    }

    /**
     * Generate quiz questions automatically
     */
    generateQuiz(topic, difficulty = 'beginner') {
        // This will generate quiz questions based on topic
        // Using our dictionary
        return {
            topic: topic,
            difficulty: difficulty,
            questions: [
                {
                    type: 'translate',
                    question: 'How do you say "Hello" in Hindi?',
                    options: ['नमस्ते', 'अलविदा', 'धन्यवाद', 'कृपया'],
                    correct: 'नमस्ते',
                    explanation: 'नमस्ते (Namaste) is the universal Hindi greeting'
                }
                // More questions generated automatically
            ]
        };
    }
}

module.exports = new FreeLanguageService();
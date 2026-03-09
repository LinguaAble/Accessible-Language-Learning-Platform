import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import { X, ChevronRight, Volume2, Award, Zap, CheckCircle, AlertCircle, RefreshCw, Mic, Trophy, Star, Target, Clock, Eye, EyeOff } from 'lucide-react';
import { playCorrectSound, playIncorrectSound } from '../utils/soundUtils';
import { transcribeAudio } from '../utils/googleSpeechService';
import { evaluatePronunciation, getConfidenceBadge } from '../utils/nlpEvalService';

import logo from '../assets/logo.png';
import '../Learning.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- HELPER: GENERATE SLIDES ---
// Creates 2 slides: 1. Intro/Quiz (Hindi -> English), 2. Reverse Quiz (English -> Hindi)
const createCharPair = (hindiChar, englishSound, hintText, optionsEnglish, optionsHindi) => {
  return [
    {
      type: 'quiz',
      subtype: 'intro',
      badge: "New Character",
      title: "New Letter",
      question: "What sound does this letter make?",
      mainChar: hindiChar,
      audioText: hindiChar,
      hint: hintText,
      options: optionsEnglish,
      answer: englishSound
    },
    {
      type: 'quiz',
      subtype: 'char_select',
      question: `Select the correct character for '${englishSound}'`,
      audioText: hindiChar,
      options: optionsHindi,
      answer: hindiChar
    }
  ];
};

// Helper for vocabulary words (Chapter 2+)
const createVocabPair = (hindiWord, englishMeaning, hintText, optionsEnglish, optionsHindi) => {
  return [
    {
      type: 'quiz',
      subtype: 'intro',
      badge: "New Word",
      title: "New Vocabulary",
      question: "What does this word mean?",
      mainChar: hindiWord,
      audioText: hindiWord,
      hint: hintText,
      options: optionsEnglish,
      answer: englishMeaning
    },
    {
      type: 'quiz',
      subtype: 'char_select',
      question: `Select the Hindi word for '${englishMeaning}'`,
      audioText: null,
      options: optionsHindi,
      answer: hindiWord
    }
  ];
};

// --- DATA: VOWELS ---
const vowelsPart1 = [
  ...createCharPair("अ", "a", "Like 'a' in 'America'", ["a", "aa", "i", "ee"], ["अ", "आ", "इ", "ई"]),
  ...createCharPair("आ", "aa", "Like 'a' in 'Father'", ["a", "aa", "u", "oo"], ["अ", "आ", "उ", "ऊ"]),
  ...createCharPair("इ", "i", "Like 'i' in 'Sit'", ["aa", "i", "ee", "u"], ["इ", "ई", "अ", "आ"]),
  ...createCharPair("ई", "ee", "Like 'ee' in 'Feet'", ["i", "ee", "u", "oo"], ["इ", "ई", "उ", "ऊ"]),
  ...createCharPair("उ", "u", "Like 'u' in 'Put'", ["u", "oo", "a", "aa"], ["उ", "ऊ", "अ", "आ"]),
  ...createCharPair("ऊ", "oo", "Like 'oo' in 'Boot'", ["u", "oo", "i", "ee"], ["उ", "ऊ", "इ", "ई"]),
];

const vowelsPart2 = [
  ...createCharPair("ऋ", "ri", "Like 'ri' in 'Krishna'", ["ri", "e", "ai", "o"], ["ऋ", "ए", "ऐ", "ओ"]),
  ...createCharPair("ए", "e", "Like 'a' in 'Kate'", ["ri", "e", "ai", "o"], ["ए", "ऐ", "ओ", "औ"]),
  ...createCharPair("ऐ", "ai", "Like 'ai' in 'Hair'", ["e", "ai", "o", "au"], ["ए", "ऐ", "ओ", "औ"]),
  ...createCharPair("ओ", "o", "Like 'o' in 'Go'", ["ai", "o", "au", "ang"], ["ओ", "औ", "अं", "अः"]),
  ...createCharPair("औ", "au", "Like 'au' in 'August'", ["o", "au", "ang", "aha"], ["ओ", "औ", "अं", "अः"]),
  ...createCharPair("अं", "ang", "Nasal 'n' sound", ["au", "ang", "aha", "ri"], ["अं", "अः", "ऋ", "ए"]),
  ...createCharPair("अः", "aha", "Breathy 'h' sound", ["ang", "aha", "a", "aa"], ["अं", "अः", "अ", "आ"]),
];

// --- DATA: CONSONANTS (Split into 6 Lessons) ---
const consonantsL4 = [ // k, kh, g, gh, ng, ch
  ...createCharPair("क", "ka", "Like 'k' in 'Skate'", ["ka", "kha", "ga", "cha"], ["क", "ख", "ग", "घ"]),
  ...createCharPair("ख", "kha", "Like 'kh' in 'Khan'", ["ka", "kha", "ga", "gha"], ["क", "ख", "ग", "घ"]),
  ...createCharPair("ग", "ga", "Like 'g' in 'Go'", ["ga", "gha", "ka", "ng"], ["ग", "घ", "क", "ङ"]),
  ...createCharPair("घ", "gha", "Like 'gh' in 'Ghost'", ["ga", "gha", "ka", "cha"], ["ग", "घ", "क", "च"]),
  ...createCharPair("ङ", "nga", "Nasal 'ng'", ["nga", "ka", "cha", "ja"], ["ङ", "क", "च", "छ"]),
  ...createCharPair("च", "cha", "Like 'ch' in 'Chat'", ["cha", "chha", "ja", "ka"], ["च", "छ", "ज", "क"]),
];

const consonantsL5 = [ // chh, j, jh, nya, T, Th
  ...createCharPair("छ", "chha", "Strong 'chh'", ["cha", "chha", "ja", "jha"], ["च", "छ", "ज", "झ"]),
  ...createCharPair("ज", "ja", "Like 'j' in 'Jar'", ["ja", "jha", "cha", "nya"], ["ज", "झ", "च", "ञ"]),
  ...createCharPair("झ", "jha", "Aspirated 'jh'", ["ja", "jha", "ka", "ga"], ["ज", "झ", "क", "ग"]),
  ...createCharPair("ञ", "nya", "Nasal 'nya'", ["nya", "ja", "na", "ma"], ["ञ", "ज", "न", "म"]),
  ...createCharPair("ट", "Ta", "Retroflex 'T'", ["Ta", "Tha", "Da", "ta"], ["ट", "ठ", "ड", "त"]),
  ...createCharPair("ठ", "Tha", "Retroflex 'Th'", ["Ta", "Tha", "Da", "Dha"], ["ट", "ठ", "ड", "ढ"]),
];

const consonantsL6 = [ // D, Dh, N, t, th, d
  ...createCharPair("ड", "Da", "Retroflex 'D'", ["Da", "Dha", "da", "dha"], ["ड", "ढ", "द", "ध"]),
  ...createCharPair("ढ", "Dha", "Retroflex 'Dh'", ["Da", "Dha", "Na", "na"], ["ड", "ढ", "ण", "न"]),
  ...createCharPair("ण", "Na", "Retroflex 'N'", ["Na", "ma", "na", "nga"], ["ण", "म", "न", "ङ"]),
  ...createCharPair("त", "ta", "Soft 't' (pasta)", ["ta", "tha", "da", "Ta"], ["त", "थ", "द", "ट"]),
  ...createCharPair("थ", "tha", "Soft 'th' (thanks)", ["ta", "tha", "da", "dha"], ["त", "थ", "द", "ध"]),
  ...createCharPair("द", "da", "Soft 'd' (the)", ["da", "dha", "ta", "Da"], ["द", "ध", "त", "ड"]),
];

const consonantsL7 = [ // dh, n, p, ph, b, bh
  ...createCharPair("ध", "dha", "Soft 'dh'", ["da", "dha", "na", "Dha"], ["द", "ध", "न", "ढ"]),
  ...createCharPair("न", "na", "Like 'n' in 'No'", ["na", "ma", "pa", "la"], ["न", "m", "प", "ल"]),
  ...createCharPair("प", "pa", "Like 'p' in 'Spin'", ["pa", "pha", "ba", "ma"], ["प", "फ", "ब", "म"]),
  ...createCharPair("फ", "pha", "Like 'ph' in 'Phone'", ["pa", "pha", "ba", "bha"], ["प", "फ", "ब", "भ"]),
  ...createCharPair("ब", "ba", "Like 'b' in 'Bat'", ["ba", "bha", "pa", "va"], ["ब", "भ", "प", "व"]),
  ...createCharPair("भ", "bha", "Aspirated 'bh'", ["ba", "bha", "ma", "pa"], ["ब", "भ", "म", "प"]),
];

const consonantsL8 = [ // m, y, r, l, v, sh
  ...createCharPair("म", "ma", "Like 'm' in 'Man'", ["ma", "na", "ba", "pa"], ["म", "न", "ब", "प"]),
  ...createCharPair("य", "ya", "Like 'y' in 'Yes'", ["ya", "ra", "la", "va"], ["य", "र", "ल", "व"]),
  ...createCharPair("र", "ra", "Like 'r' in 'Run'", ["ra", "la", "ya", "va"], ["र", "ल", "य", "व"]),
  ...createCharPair("ल", "la", "Like 'l' in 'Love'", ["la", "ra", "ya", "va"], ["ल", "र", "य", "व"]),
  ...createCharPair("व", "va", "Like 'v' in 'Very'", ["va", "ba", "la", "ya"], ["व", "ब", "ल", "य"]),
  ...createCharPair("श", "sha", "Soft 'sh' (Ship)", ["sha", "shha", "sa", "ha"], ["श", "ष", "स", "ह"]),
];

const consonantsL9 = [ // shh, s, h, ksh, tra, gya
  ...createCharPair("ष", "shha", "Retroflex 'sh'", ["shha", "sha", "sa", "ha"], ["ष", "श", "स", "ह"]),
  ...createCharPair("स", "sa", "Like 's' in 'Sun'", ["sa", "sha", "shha", "ha"], ["स", "श", "ष", "ह"]),
  ...createCharPair("ह", "ha", "Like 'h' in 'Home'", ["ha", "sa", "sha", "ka"], ["ह", "स", "श", "क"]),
  ...createCharPair("क्ष", "ksha", "Conjunct k+sh", ["ksha", "tra", "gya", "ka"], ["क्ष", "त्र", "ज्ञ", "क"]),
  ...createCharPair("त्र", "tra", "Conjunct t+r", ["tra", "ksha", "gya", "ta"], ["त्र", "क्ष", "ज्ञ", "त"]),
  ...createCharPair("ज्ञ", "gya", "Conjunct g+y", ["gya", "tra", "ksha", "ga"], ["ज्ञ", "त्र", "क्ष", "ग"]),
];

// --- LESSON DATABASE MAP ---
const lessonDatabase = {
  1: { title: "Vowels Part 1", slides: vowelsPart1 },
  2: { title: "Vowels Part 2", slides: vowelsPart2 },
  3: { title: "Recap: Vowels", slides: [...vowelsPart1, ...vowelsPart2].sort(() => 0.5 - Math.random()).slice(0, 15) }, // Random mix
  4: { title: "Consonants 1", slides: consonantsL4 },
  5: { title: "Consonants 2", slides: consonantsL5 },
  6: { title: "Consonants 3", slides: consonantsL6 },
  7: { title: "Consonants 4", slides: consonantsL7 },
  8: { title: "Consonants 5", slides: consonantsL8 },
  9: { title: "Consonants 6", slides: consonantsL9 },
  10: {
    title: "Grand Review",
    slides: [
      ...vowelsPart1, ...vowelsPart2,
      ...consonantsL4, ...consonantsL5, ...consonantsL6,
      ...consonantsL7, ...consonantsL8, ...consonantsL9
    ].sort(() => 0.5 - Math.random()).slice(0, 20)
  },
  // --- NEW LESSONS ---
  11: {
    title: "Recap: Mixed Bag",
    slides: [
      ...vowelsPart1, ...consonantsL4, ...consonantsL5
    ].sort(() => 0.5 - Math.random()).slice(0, 15)
  },
  12: {
    title: "Recap: Rapid Fire",
    slides: [
      ...consonantsL6, ...consonantsL7, ...consonantsL8, ...consonantsL9
    ].sort(() => 0.5 - Math.random()).slice(0, 15)
  },
  13: {
    title: "Pronunciation: Vowels",
    slides: [
      // Teaching slides first
      { type: 'teach', title: "Learn: Vowel Sounds", mainChar: "अ आ इ ई उ ऊ", audioText: "अ आ इ ई उ ऊ", hint: "Listen carefully to each vowel sound. Click the speaker to hear them.", instruction: "These are the basic Hindi vowels. Practice listening before we test your pronunciation." },
      { type: 'teach', title: "Short Vowels", mainChar: "अ इ उ", audioText: "अ इ उ", hint: "Short vowels: a (America), i (Sit), u (Put)", instruction: "These vowels are pronounced briefly and crisply." },
      { type: 'teach', title: "Long Vowels", mainChar: "आ ई ऊ", audioText: "आ ई ऊ", hint: "Long vowels: aa (Father), ee (Feet), oo (Boot)", instruction: "Hold these sounds longer than the short vowels." },
      // Now practice
      { type: 'pronounce', question: "Speak this sound", mainChar: "अ", answer: "a", hint: "Like 'a' in America" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "आ", answer: "aa", hint: "Like 'a' in Father" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "इ", answer: "e", hint: "Like 'i' in Sit" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "ई", answer: "ee", hint: "Like 'ee' in Feet" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "उ", answer: "u", hint: "Like 'u' in Put" },
    ]
  },
  14: {
    title: "Pronunciation: Tricky Consonants",
    slides: [
      // Teaching slides
      { type: 'teach', title: "Learn: Consonant Sounds", mainChar: "क ख ग घ च", audioText: "क ख ग घ च", hint: "Listen to these consonant sounds carefully.", instruction: "Hindi has aspirated (breathy) and non-aspirated consonants. Listen to the difference." },
      { type: 'teach', title: "Aspirated vs Non-Aspirated", mainChar: "क vs ख", audioText: "क ख", hint: "क = 'k' (no breath), ख = 'kh' (with breath)", instruction: "Hold your hand in front of your mouth. You should feel air with ख but not with क." },
      // Practice
      { type: 'pronounce', question: "Speak this sound", mainChar: "क", answer: "ka", hint: "Like 'k' in Skate (no breath)" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "ख", answer: "kha", hint: "Aspirated 'kh' (with breath)" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "ग", answer: "ga", hint: "Like 'g' in Go" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "घ", answer: "gha", hint: "Voiced aspirated 'gh'" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "च", answer: "cha", hint: "Like 'ch' in Chat" },
    ]
  },
  15: {
    title: "Pronunciation: Script Review",
    slides: [
      // Teaching slide
      { type: 'teach', title: "Mixed Practice", mainChar: "अ क च त म", audioText: "अ क च त म", hint: "Review: Mix of vowels and consonants", instruction: "Let's practice a mix of the sounds you've learned. Listen and repeat." },
      // Practice mixed characters (NOT words yet - that's for Chapter 2)
      { type: 'pronounce', question: "Speak this sound", mainChar: "म", answer: "ma", hint: "Like 'm' in Man" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "न", answer: "na", hint: "Like 'n' in No" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "त", answer: "ta", hint: "Soft 't' like in pasta" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "र", answer: "ra", hint: "Like 'r' in Run" },
      { type: 'pronounce', question: "Speak this sound", mainChar: "स", answer: "sa", hint: "Like 's' in Sun" },
    ]
  },
  // --- CHAPTER 2: MY WORLD (Quiz-based + Pronunciation) ---
  16: {
    title: "Common Words",
    slides: [
      ...createVocabPair("नमस्ते", "Hello", "Common greeting", ["Hello", "Goodbye", "Thanks", "Sorry"], ["नमस्ते", "अलविदा", "धन्यवाद", "माफ़ करें"]),
      ...createVocabPair("हाँ", "Yes", "Affirmative", ["Yes", "No", "Maybe", "Okay"], ["हाँ", "नहीं", "शायद", "ठीक है"]),
      ...createVocabPair("नहीं", "No", "Negative", ["No", "Yes", "Never", "Always"], ["नहीं", "हाँ", "कभी नहीं", "हमेशा"]),
    ]
  },
  17: {
    title: "Numbers 1-5",
    slides: [
      ...createVocabPair("एक", "One", "Number 1", ["One", "Two", "Three", "Four"], ["एक", "दो", "तीन", "चार"]),
      ...createVocabPair("दो", "Two", "Number 2", ["Two", "One", "Three", "Five"], ["दो", "एक", "तीन", "पाँच"]),
      ...createVocabPair("तीन", "Three", "Number 3", ["Three", "Two", "Four", "Five"], ["तीन", "दो", "चार", "पाँच"]),
      ...createVocabPair("चार", "Four", "Number 4", ["Four", "Three", "Five", "Six"], ["चार", "तीन", "पाँच", "छह"]),
      ...createVocabPair("पाँच", "Five", "Number 5", ["Five", "Four", "Six", "Seven"], ["पाँच", "चार", "छह", "सात"]),
    ]
  },
  18: {
    title: "Numbers 6-10",
    slides: [
      ...createVocabPair("छह", "Six", "Number 6", ["Six", "Seven", "Eight", "Five"], ["छह", "सात", "आठ", "पाँच"]),
      ...createVocabPair("सात", "Seven", "Number 7", ["Seven", "Six", "Eight", "Nine"], ["सात", "छह", "आठ", "नौ"]),
      ...createVocabPair("आठ", "Eight", "Number 8", ["Eight", "Seven", "Nine", "Ten"], ["आठ", "सात", "नौ", "दस"]),
      ...createVocabPair("नौ", "Nine", "Number 9", ["Nine", "Eight", "Ten", "Seven"], ["नौ", "आठ", "दस", "सात"]),
      ...createVocabPair("दस", "Ten", "Number 10", ["Ten", "Nine", "Eight", "Seven"], ["दस", "नौ", "आठ", "सात"]),
    ]
  },
  19: {
    title: "Recap: Numbers",
    slides: [
      { type: 'quiz', subtype: 'char_select', question: "Select 'One'", audioText: null, options: ["एक", "दो", "तीन", "चार"], answer: "एक" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Five'", audioText: null, options: ["तीन", "चार", "पाँच", "छह"], answer: "पाँच" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Ten'", audioText: null, options: ["सात", "आठ", "नौ", "दस"], answer: "दस" },
    ]
  },
  20: {
    title: "Family: Parents",
    slides: [
      ...createVocabPair("माँ", "Mother", "Mom", ["Mother", "Father", "Sister", "Brother"], ["माँ", "पिता", "बहन", "भाई"]),
      ...createVocabPair("पिता", "Father", "Dad", ["Father", "Mother", "Uncle", "Aunt"], ["पिता", "माँ", "चाचा", "चाची"]),
    ]
  },
  21: {
    title: "Family: Siblings",
    slides: [
      ...createVocabPair("भाई", "Brother", "Male sibling", ["Brother", "Sister", "Father", "Mother"], ["भाई", "बहन", "पिता", "माँ"]),
      ...createVocabPair("बहन", "Sister", "Female sibling", ["Sister", "Brother", "Mother", "Aunt"], ["बहन", "भाई", "माँ", "चाची"]),
    ]
  },
  22: {
    title: "Colors: Part 1",
    slides: [
      ...createVocabPair("लाल", "Red", "Color red", ["Red", "Blue", "Green", "Yellow"], ["लाल", "नीला", "हरा", "पीला"]),
      ...createVocabPair("नीला", "Blue", "Color blue", ["Blue", "Red", "Green", "Black"], ["नीला", "लाल", "हरा", "काला"]),
      ...createVocabPair("हरा", "Green", "Color green", ["Green", "Yellow", "Blue", "Red"], ["हरा", "पीला", "नीला", "लाल"]),
    ]
  },
  23: {
    title: "Colors: Part 2",
    slides: [
      ...createVocabPair("पीला", "Yellow", "Color yellow", ["Yellow", "Green", "Orange", "Pink"], ["पीला", "हरा", "नारंगी", "गुलाबी"]),
      ...createVocabPair("काला", "Black", "Color black", ["Black", "White", "Red", "Blue"], ["काला", "सफ़ेद", "लाल", "नीला"]),
      ...createVocabPair("सफ़ेद", "White", "Color white", ["White", "Black", "Grey", "Brown"], ["सफ़ेद", "काला", "भूरा", "स्लेटी"]),
    ]
  },
  24: {
    title: "Food & Drink: Part 1",
    slides: [
      ...createVocabPair("पानी", "Water", "Drink water", ["Water", "Milk", "Tea", "Juice"], ["पानी", "दूध", "चाय", "जूस"]),
      ...createVocabPair("दूध", "Milk", "Dairy drink", ["Milk", "Water", "Tea", "Coffee"], ["दूध", "पानी", "चाय", "कॉफ़ी"]),
    ]
  },
  25: {
    title: "Food & Drink: Part 2",
    slides: [
      ...createVocabPair("रोटी", "Bread", "Indian bread", ["Bread", "Rice", "Milk", "Water"], ["रोटी", "चावल", "दूध", "पानी"]),
      ...createVocabPair("चाय", "Tea", "Hot beverage", ["Tea", "Coffee", "Milk", "Water"], ["चाय", "कॉफ़ी", "दूध", "पानी"]),
    ]
  },
  26: {
    title: "Fruits",
    slides: [
      ...createVocabPair("सेब", "Apple", "Red fruit", ["Apple", "Banana", "Mango", "Orange"], ["सेब", "केला", "आम", "संतरा"]),
      ...createVocabPair("केला", "Banana", "Yellow fruit", ["Banana", "Apple", "Mango", "Grapes"], ["केला", "सेब", "आम", "अंगूर"]),
      ...createVocabPair("आम", "Mango", "King of fruits", ["Mango", "Apple", "Banana", "Grapes"], ["आम", "सेब", "केला", "अंगूर"]),
    ]
  },
  27: {
    title: "Recap: Vocabulary (5-11)",
    slides: [
      { type: 'quiz', subtype: 'char_select', question: "Select 'Mother'", audioText: null, options: ["माँ", "पिता", "भाई", "बहन"], answer: "माँ" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Brother'", audioText: null, options: ["बहन", "भाई", "माँ", "पिता"], answer: "भाई" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Red'", audioText: null, options: ["नीला", "हरा", "लाल", "काला"], answer: "लाल" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Water'", audioText: null, options: ["पानी", "दूध", "चाय", "रोटी"], answer: "पानी" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Mango'", audioText: null, options: ["सेब", "केला", "आम", "संतरा"], answer: "आम" },
    ]
  },
  28: {
    title: "Pronunciation: Common Words",
    slides: [
      { type: 'pronounce', question: "Say 'Hello'", mainChar: "नमस्ते", answer: "namaste", hint: "Namaste" },
      { type: 'pronounce', question: "Say 'Yes'", mainChar: "हाँ", answer: "haan", hint: "Haan" },
      { type: 'pronounce', question: "Say 'Water'", mainChar: "पानी", answer: "pani", hint: "Pani" },
      { type: 'pronounce', question: "Say 'Thank you'", mainChar: "धन्यवाद", answer: "dhanyavaad", hint: "Dhanyavaad" },
    ]
  },
  29: {
    title: "Pronunciation: Numbers & Family",
    slides: [
      { type: 'pronounce', question: "Say 'One'", mainChar: "एक", answer: "ek", hint: "Ek" },
      { type: 'pronounce', question: "Say 'Five'", mainChar: "पाँच", answer: "paanch", hint: "Paanch" },
      { type: 'pronounce', question: "Say 'Mother'", mainChar: "माँ", answer: "maa", hint: "Maa" },
      { type: 'pronounce', question: "Say 'Brother'", mainChar: "भाई", answer: "bhai", hint: "Bhai" },
    ]
  },
  30: {
    title: "Pronunciation: Colors & Food",
    slides: [
      { type: 'pronounce', question: "Say 'Red'", mainChar: "लाल", answer: "laal", hint: "Laal" },
      { type: 'pronounce', question: "Say 'Blue'", mainChar: "नीला", answer: "neela", hint: "Neela" },
      { type: 'pronounce', question: "Say 'Bread'", mainChar: "रोटी", answer: "roti", hint: "Roti" },
      { type: 'pronounce', question: "Say 'Mango'", mainChar: "आम", answer: "aam", hint: "Aam" },
    ]
  },
  // --- CHAPTER 3: FIRST SENTENCES ---
  31: {
    title: "Pronouns: I & You",
    slides: [
      ...createVocabPair("मैं", "I", "First person", ["I", "You (informal)", "He", "She"], ["मैं", "तुम", "वह", "वह"]),
      ...createVocabPair("तुम", "You (informal)", "Second person informal", ["You (informal)", "I", "We", "They"], ["तुम", "मैं", "हम", "वे"]),
      ...createVocabPair("आप", "You (formal)", "Second person formal", ["You (formal)", "You (informal)", "I", "We"], ["आप", "तुम", "मैं", "हम"]),
    ]
  },
  32: {
    title: "Pronouns: He, She & We",
    slides: [
      ...createVocabPair("वह", "He/She", "Third person", ["He/She", "I", "You", "We"], ["वह", "मैं", "तुम", "हम"]),
      ...createVocabPair("हम", "We", "First person plural", ["We", "They", "You", "I"], ["हम", "वे", "तुम", "मैं"]),
      ...createVocabPair("वे", "They", "Third person plural", ["They", "We", "You", "He/She"], ["वे", "हम", "तुम", "वह"]),
    ]
  },
  33: {
    title: "Verbs: Eat & Drink",
    slides: [
      ...createVocabPair("खाना", "To eat", "Eating action", ["To eat", "To drink", "To sleep", "To go"], ["खाना", "पीना", "सोना", "जाना"]),
      ...createVocabPair("पीना", "To drink", "Drinking action", ["To drink", "To eat", "To come", "To sit"], ["पीना", "खाना", "आना", "बैठना"]),
    ]
  },
  34: {
    title: "Verbs: Go & Come",
    slides: [
      ...createVocabPair("जाना", "To go", "Going action", ["To go", "To come", "To eat", "To sleep"], ["जाना", "आना", "खाना", "सोना"]),
      ...createVocabPair("आना", "To come", "Coming action", ["To come", "To go", "To sit", "To stand"], ["आना", "जाना", "बैठना", "खड़ा होना"]),
    ]
  },
  35: {
    title: "Verbs: Sleep & Wake",
    slides: [
      ...createVocabPair("सोना", "To sleep", "Sleeping action", ["To sleep", "To wake", "To eat", "To drink"], ["सोना", "जागना", "खाना", "पीना"]),
      ...createVocabPair("जागना", "To wake", "Waking action", ["To wake", "To sleep", "To sit", "To stand"], ["जागना", "सोना", "बैठना", "खड़ा होना"]),
    ]
  },
  36: {
    title: "I am / You are",
    slides: [
      ...createVocabPair("मैं हूँ", "I am", "I am statement", ["I am", "You are", "He is", "We are"], ["मैं हूँ", "तुम हो", "वह है", "हम हैं"]),
      ...createVocabPair("तुम हो", "You are", "You are statement", ["You are", "I am", "He is", "They are"], ["तुम हो", "मैं हूँ", "वह है", "वे हैं"]),
    ]
  },
  37: {
    title: "He/She is & We are",
    slides: [
      ...createVocabPair("वह है", "He/She is", "Third person is", ["He/She is", "I am", "You are", "We are"], ["वह है", "मैं हूँ", "तुम हो", "हम हैं"]),
      ...createVocabPair("हम हैं", "We are", "We are statement", ["We are", "They are", "I am", "You are"], ["हम हैं", "वे हैं", "मैं हूँ", "तुम हो"]),
    ]
  },
  38: {
    title: "Simple Sentences",
    slides: [
      ...createVocabPair("मैं खाता हूँ", "I eat", "I eat sentence", ["I eat", "You eat", "He eats", "We eat"], ["मैं खाता हूँ", "तुम खाते हो", "वह खाता है", "हम खाते हैं"]),
      ...createVocabPair("मैं जाता हूँ", "I go", "I go sentence", ["I go", "You go", "I come", "I eat"], ["मैं जाता हूँ", "तुम जाते हो", "मैं आता हूँ", "मैं खाता हूँ"]),
    ]
  },
  39: {
    title: "Questions: What & Where",
    slides: [
      ...createVocabPair("क्या", "What", "Question word", ["What", "Where", "When", "Who"], ["क्या", "कहाँ", "कब", "कौन"]),
      ...createVocabPair("कहाँ", "Where", "Location question", ["Where", "What", "When", "Why"], ["कहाँ", "क्या", "कब", "क्यों"]),
      ...createVocabPair("कब", "When", "Time question", ["When", "Where", "What", "Who"], ["कब", "कहाँ", "क्या", "कौन"]),
    ]
  },
  40: {
    title: "Recap: Grammar Mix",
    slides: [
      { type: 'quiz', subtype: 'intro', badge: "Review", title: "Grammar Review", question: "What does this mean?", mainChar: "मैं", audioText: "मैं", hint: "Pronoun", options: ["I", "You", "He", "We"], answer: "I" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'I'", audioText: null, options: ["मैं", "तुम", "वह", "हम"], answer: "मैं" },
      { type: 'quiz', subtype: 'intro', badge: "Review", title: "Grammar Review", question: "What does this mean?", mainChar: "खाना", audioText: "खाना", hint: "Verb", options: ["To eat", "To drink", "To sleep", "To go"], answer: "To eat" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'To eat'", audioText: null, options: ["खाना", "पीना", "सोना", "जाना"], answer: "खाना" },
      { type: 'quiz', subtype: 'intro', badge: "Review", title: "Grammar Review", question: "What does this mean?", mainChar: "क्या", audioText: "क्या", hint: "Question", options: ["What", "Where", "When", "Who"], answer: "What" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'What'", audioText: null, options: ["क्या", "कहाँ", "कब", "कौन"], answer: "क्या" },
    ]
  },
  41: {
    title: "Adjectives: Size",
    slides: [
      ...createVocabPair("बड़ा", "Big", "Large size", ["Big", "Small", "Long", "Short"], ["बड़ा", "छोटा", "लंबा", "छोटा"]),
      ...createVocabPair("छोटा", "Small", "Small size", ["Small", "Big", "Tall", "Short"], ["छोटा", "बड़ा", "लंबा", "नाटा"]),
    ]
  },
  42: {
    title: "Adjectives: Feelings",
    slides: [
      ...createVocabPair("खुश", "Happy", "Happy feeling", ["Happy", "Sad", "Angry", "Tired"], ["खुश", "उदास", "गुस्सा", "थका"]),
      ...createVocabPair("उदास", "Sad", "Sad feeling", ["Sad", "Happy", "Angry", "Scared"], ["उदास", "खुश", "गुस्सा", "डरा"]),
    ]
  },
  43: {
    title: "Pronunciation: Pronouns & Verbs",
    slides: [
      { type: 'pronounce', question: "Say 'I'", mainChar: "मैं", answer: "main", hint: "Main" },
      { type: 'pronounce', question: "Say 'You'", mainChar: "तुम", answer: "tum", hint: "Tum" },
      { type: 'pronounce', question: "Say 'To eat'", mainChar: "खाना", answer: "khaana", hint: "Khaana" },
      { type: 'pronounce', question: "Say 'To go'", mainChar: "जाना", answer: "jaana", hint: "Jaana" },
    ]
  },
  44: {
    title: "Pronunciation: Sentences",
    slides: [
      { type: 'pronounce', question: "Say 'I am'", mainChar: "मैं हूँ", answer: "main hoon", hint: "Main hoon" },
      { type: 'pronounce', question: "Say 'You are'", mainChar: "तुम हो", answer: "tum ho", hint: "Tum ho" },
      { type: 'pronounce', question: "Say 'I eat'", mainChar: "मैं खाता हूँ", answer: "main khaata hoon", hint: "Main khaata hoon" },
    ]
  },
  45: {
    title: "Pronunciation: Questions & Adjectives",
    slides: [
      { type: 'pronounce', question: "Say 'What'", mainChar: "क्या", answer: "kya", hint: "Kya" },
      { type: 'pronounce', question: "Say 'Where'", mainChar: "कहाँ", answer: "kahaan", hint: "Kahaan" },
      { type: 'pronounce', question: "Say 'Big'", mainChar: "बड़ा", answer: "bada", hint: "Bada" },
      { type: 'pronounce', question: "Say 'Happy'", mainChar: "खुश", answer: "khush", hint: "Khush" },
    ]
  },
};

const LearningScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, todayProgress } = useUser();
  const { startStudySession, endStudySession, triggerMilestone, triggerEncouragement } = useNotifications();

  const lessonId = location.state?.lessonId || 1;
  const initialLessonData = lessonDatabase[lessonId] || lessonDatabase[1];

  const [activeSlides, setActiveSlides] = useState(initialLessonData.slides);
  const [originalCount] = useState(initialLessonData.slides.length);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mistakeQueue, setMistakeQueue] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // US4 – Start study session when lesson screen mounts; stop on unmount
  useEffect(() => {
    startStudySession();
    return () => endStudySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    // --- BREAK NOTIFICATION SYSTEM ---
  const [lessonStartTime] = useState(Date.now()); // Track when lesson started
  const [showBreakNotification, setShowBreakNotification] = useState(false);
  const [breakDismissed, setBreakDismissed] = useState(false);
  const BREAK_INTERVAL = 20 * 60 * 1000; // 20 minutes in milliseconds
  // For testing: const BREAK_INTERVAL = 10 * 1000; // 10 seconds

  // --- NEW: Score Tracking ---
  const [scoreData, setScoreData] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    firstAttemptCorrect: 0,
    reviewedAndCorrected: 0,
  });

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState("");

  // Focus Mode
  const [focusMode, setFocusMode] = useState(false);

  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nlpFeedback, setNlpFeedback] = useState(null); // NLP: { feedback, confidence, matchType }

  // Toggle Recording
  const handleMicClick = async () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone access is not supported in this browser.");
      return;
    }

    try {
      // FIX: Request 48000Hz sample rate explicitly so it matches what we tell Google
      // { audio: true } lets browser pick any rate — often 44100Hz — causing mismatch
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,      // Mono is all Google needs, reduces noise
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // FIX: Use 'audio/webm;codecs=opus' explicitly — plain 'audio/webm' can
      // use vp8 video codec on some browsers which Google STT cannot decode
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setIsProcessing(true);
        setNlpFeedback(null);
        setListeningText("Analyzing...");

        try {
          const currentSlide = activeSlides[currentSlideIndex];
          const hints = currentSlide ? [currentSlide.mainChar, currentSlide.answer] : [];

          const transcript = await transcribeAudio(audioBlob, hints);

          if (!transcript || transcript.trim() === '') {
            setListeningText("No speech detected. Please try again.");
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          setListeningText(`Heard: "${transcript}" — evaluating...`);
          await checkPronunciation(transcript);
        } catch (error) {
          console.error("Speech analysis failed", error);
          setListeningText("Error analyzing speech. Try again.");
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setListeningText("Listening... (Click to stop)");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const checkPronunciation = async (transcript) => {
    const currentSlide = activeSlides[currentSlideIndex];

    // NLP EVALUATION — replaces simple string match
    // Pipeline: exact Hindi → exact Roman → transliteration →
    // phonetic normalization → Levenshtein fuzzy → Dice similarity → partial word
    // Falls back to local evaluation if server is unreachable.
    const result = await evaluatePronunciation(
      transcript,
      currentSlide.answer,   // e.g. "ka", "main hoon"
      currentSlide.mainChar  // e.g. "क", "मैं हूँ"
    );

    // Store rich feedback for UI display
    setNlpFeedback({
      feedback: result.feedback,
      confidence: result.confidence,
      matchType: result.matchType,
    });
    setListeningText(result.feedback);

    if (result.isCorrect) {
      setIsCorrect(true);
      playSoundEffect('correct');

      // Track score
      if (!currentSlide.isReview) {
        setScoreData(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          firstAttemptCorrect: prev.firstAttemptCorrect + 1
        }));
      } else {
        setScoreData(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          reviewedAndCorrected: prev.reviewedAndCorrected + 1
        }));
      }
    } else {
      setIsCorrect(false);
      playSoundEffect('incorrect');
      setScoreData(prev => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1
      }));
      setMistakeQueue((prev) => [...prev, { ...currentSlide, isReview: true }]);
    }
  };

  // Load lesson content and count questions
  useEffect(() => {
    const lesson = lessonDatabase[lessonId];
    if (lesson) {
      setActiveSlides(lesson.slides);
      setScoreData(prev => ({
        ...prev,
        totalQuestions: lesson.slides.filter(s => s.type === 'quiz' || s.type === 'pronounce').length
      }));
    }
  }, [lessonId]);

  // Break Notification Timer
  useEffect(() => {
    const checkBreakTime = setInterval(() => {
      const currentTime = Date.now();
      const studyDuration = currentTime - lessonStartTime;

      // Show notification after 20 minutes if not dismissed
      if (studyDuration >= BREAK_INTERVAL && !breakDismissed && !showBreakNotification) {
        setShowBreakNotification(true);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkBreakTime);
  }, [lessonStartTime, breakDismissed, showBreakNotification, BREAK_INTERVAL]);

  useEffect(() => {
    if (currentSlideIndex >= originalCount) {
      setProgress(95);
    } else {
      setProgress(((currentSlideIndex) / originalCount) * 100);
    }
  }, [currentSlideIndex, originalCount]);

  const playAudio = (text) => {
    // FIX: Removed soundEffects gate — "Click to listen" must ALWAYS work
    // soundEffects setting only controls game sounds (correct/incorrect beeps)
    // not the pronunciation audio which is core to learning
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const slide = activeSlides[currentSlideIndex];
    if (slide && slide.audioText) {
      setTimeout(() => playAudio(slide.audioText), 600);
    }
  }, [currentSlideIndex, activeSlides]);

  const playSoundEffect = (type) => {
    if (user.preferences?.soundEffects) {
      if (type === 'correct') playCorrectSound();
      if (type === 'incorrect') playIncorrectSound();
    }
  };

  const handleQuizAnswer = (option) => {
    if (isCorrect !== null) return;

    const currentSlide = activeSlides[currentSlideIndex];

    // Feature: Play audio when clicking Hindi options (Char Select mode)
    if (currentSlide.subtype === 'char_select') {
      playAudio(option);
    }

    setSelectedOption(option);

    if (option === currentSlide.answer) {
      setIsCorrect(true);
      playSoundEffect('correct');

      // Track score
      if (!currentSlide.isReview) {
        setScoreData(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          firstAttemptCorrect: prev.firstAttemptCorrect + 1
        }));
      } else {
        setScoreData(prev => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          reviewedAndCorrected: prev.reviewedAndCorrected + 1
        }));
      }
    } else {
      setIsCorrect(false);
      playSoundEffect('incorrect');
      setScoreData(prev => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1
      }));
      setMistakeQueue((prev) => [...prev, { ...currentSlide, isReview: true }]);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setListeningText(""); // Reset listening text
    setNlpFeedback(null); // Reset NLP feedback

    if (currentSlideIndex < activeSlides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      if (mistakeQueue.length > 0) {
        setIsReviewMode(true);
        setActiveSlides(prev => [...prev, ...mistakeQueue]);
        setMistakeQueue([]);
        setCurrentSlideIndex(prev => prev + 1);
      } else {
        const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        const isNewLesson = !completedLessons.includes(lessonId);

        // Calculate actual time spent — minimum 1 minute so progress always moves
        const lessonEndTime = Date.now();
        const timeSpentMs = lessonEndTime - lessonStartTime;
        const timeSpentMinutes = Math.max(1, Math.ceil(timeSpentMs / 60000));
        const newTodayProgress = (todayProgress || 0) + timeSpentMinutes;

        // Always persist progress to localStorage immediately (Dashboard reads this on focus)
        localStorage.setItem('todayProgress', newTodayProgress.toString());

        if (isNewLesson) {
          completedLessons.push(lessonId);
          localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
        }

        // Compute lesson score (0–100, based on first-attempt accuracy)
        const { percentage: lessonScore } = calculateScore();

        // Sync with backend (for new lessons: full sync; for replayed: just time + score)
        if (user.email) {
          const today = new Date();
          const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          axios.put(`${API}/api/auth/update-progress`, {
            email: user.email,
            completedLessons: isNewLesson ? completedLessons : undefined,
            todayProgress: newTodayProgress,
            incrementLessonCount: isNewLesson ? 1 : undefined,
            lessonScore,
            lessonId,
            date: formattedDate
          })
            .then(res => {
              if (res.data.success) {
                // Update local context with fresh data from backend (including streak)
                login({
                  ...user,
                  completedLessons: res.data.completedLessons,
                  dailyLessonCounts: res.data.dailyLessonCounts,
                  dailyScores: res.data.dailyScores,
                  todayProgress: res.data.todayProgress,
                  progressDate: res.data.progressDate,
                  streak: res.data.streak,
                  lastStreakDate: res.data.lastStreakDate,
                  lessonScores: res.data.lessonScores
                });
              }
            })
            .catch(err => console.error("Failed to sync progress", err));
        }

        setProgress(100);
        setShowSuccess(true);

        // US5 – Celebrate lesson completion with a notification
        const { percentage: score } = calculateScore();
        const completedNow = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        if (isNewLesson) {
          if (completedNow.length > 0 && completedNow.length % 5 === 0) {
            triggerMilestone(
              `Amazing! You've completed ${completedNow.length} lessons. Keep that fire going! 🔥`,
              'View Progress',
              '/dashboard'
            );
          } else {
            triggerEncouragement(
              score >= 90
                ? `Brilliant! ${score}% accuracy — you nailed it! 🎯`
                : score >= 70
                ? `Good work! You scored ${score}% on that lesson. 💪`
                : `Lesson done! A bit of review and you'll master it. 📖`
            );
          }
        }

      }
    }
  };

  // Break Notification Handlers
  const handleTakeBreak = () => {
    setShowBreakNotification(false);
    setBreakDismissed(true);
    navigate('/dashboard');
  };

  const handleContinueLearning = () => {
    setShowBreakNotification(false);
    setBreakDismissed(true);
    // Note: We don't reset lessonStartTime as we want to track total lesson duration
  };

  const handleDismissBreak = () => {
    setShowBreakNotification(false);
    setBreakDismissed(true);
    // Note: We don't reset lessonStartTime as we want to track total lesson duration
  };

  // Calculate performance metrics
  const calculateScore = () => {
    const { totalQuestions, firstAttemptCorrect } = scoreData;
    if (totalQuestions === 0) return { percentage: 100, grade: 'A+', message: 'Perfect!' };

    // Calculate percentage based on first attempts
    const percentage = Math.round((firstAttemptCorrect / totalQuestions) * 100);

    let grade = 'A+';
    let message = 'Outstanding!';

    if (percentage >= 90) {
      grade = 'A+';
      message = 'Outstanding! You\'re a natural!';
    } else if (percentage >= 80) {
      grade = 'A';
      message = 'Excellent work! Keep it up!';
    } else if (percentage >= 70) {
      grade = 'B+';
      message = 'Great job! You\'re making progress!';
    } else if (percentage >= 60) {
      grade = 'B';
      message = 'Good effort! Practice makes perfect!';
    } else {
      grade = 'B-';
      message = 'You\'re learning! Keep going!';
    }

    return { percentage, grade, message };
  };

  // Break Notification Overlay
  if (showBreakNotification) {
    return (
      <div className="learning-container">
        <div className="break-notification-overlay">
          <div className="break-notification-card">
            <div className="break-icon-container">
              <Clock size={60} color="var(--accent-color)" />
            </div>

            <h2 className="break-title">Time for a Break! 🌟</h2>

            <p className="break-message">
              You've been learning for 20 minutes. Taking regular breaks helps your brain absorb information better and prevents fatigue.
            </p>

            <div className="break-benefits">
              <h3>Break Benefits:</h3>
              <ul>
                <li>✨ Improves memory retention</li>
                <li>🧠 Reduces mental fatigue</li>
                <li>💪 Boosts focus when you return</li>
                <li>😊 Prevents learning burnout</li>
              </ul>
            </div>

            <div className="break-suggestions">
              <p><strong>Suggested break activities:</strong></p>
              <p>Stretch, walk around, drink water, or rest your eyes</p>
            </div>

            <div className="break-buttons">
              <button className="break-btn primary" onClick={handleTakeBreak}>
                Take a 5 Min Break
              </button>
              <button className="break-btn secondary" onClick={handleContinueLearning}>
                Continue Learning
              </button>
            </div>

            <button className="dismiss-break-btn" onClick={handleDismissBreak}>
              Remind me in 20 minutes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    const { percentage, grade, message } = calculateScore();
    const { totalQuestions, firstAttemptCorrect, reviewedAndCorrected } = scoreData;
    const xpEarned = Math.max(10, firstAttemptCorrect * 2);

    return (
      <div className="sc-root">
        {/* Scattered confetti dots */}
        <div className="sc-confetti" aria-hidden="true">
          {[...Array(22)].map((_, i) => (
            <span key={i} className={`sc-dot sc-dot-${i % 6}`} style={{ '--i': i }} />
          ))}
        </div>

        <div className="sc-card">
          {/* Brand row */}
          <div className="sc-brand">
            <img src={logo} alt="LinguaAble" className="sc-brand-img" />
            <span className="sc-brand-text">Lingua<span className="sc-brand-accent">Able</span></span>
          </div>

          {/* Title */}
          <h1 className="sc-title">
            Lesson Completed <span className="sc-check">✓</span>
          </h1>

          {/* Grade bar */}
          <div className="sc-grade-bar-wrap">
            <span className="sc-grade-label">Grade: <strong>{grade}</strong></span>
            <div className="sc-grade-track">
              <div className="sc-grade-fill" style={{ width: `${percentage}%` }} />
            </div>
            <span className="sc-grade-pct">{percentage}%</span>
          </div>

          {/* Stat cards */}
          <div className="sc-stat-cards">
            <div className="sc-stat-card">
              <div className="sc-stat-card-top">
                <span className="sc-stat-card-icon sc-icon-orange"><CheckCircle size={20} /></span>
                <span className="sc-stat-card-val">{firstAttemptCorrect}/{totalQuestions}</span>
              </div>
              <div className="sc-stat-card-lbl">First Try</div>
            </div>
            <div className="sc-stat-card">
              <div className="sc-stat-card-top">
                <span className="sc-stat-card-icon sc-icon-orange"><Zap size={20} /></span>
                <span className="sc-stat-card-val">+{xpEarned} <span className="sc-stat-card-unit">XP</span></span>
              </div>
              <div className="sc-stat-card-lbl">XP Earned</div>
            </div>
            <div className="sc-stat-card">
              <div className="sc-stat-card-top">
                <span className="sc-stat-card-icon sc-icon-green"><Target size={20} /></span>
                <span className="sc-stat-card-val">{percentage}%</span>
              </div>
              <div className="sc-stat-card-lbl">Accuracy</div>
            </div>
          </div>

          {/* CTA section */}
          <div className="sc-cta-section">
            <h2 className="sc-cta-heading">Continue Learning</h2>
            <p className="sc-cta-sub">{message}</p>
            <button className="sc-cta-btn" onClick={() => navigate('/lessons')}>
              Continue Learning
            </button>
            <button className="sc-cta-dash" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }



  const slide = activeSlides[currentSlideIndex];
  if (!slide) return <div>Loading...</div>;

  return (
    <div className={`learning-container${focusMode ? ' focus-mode' : ''}`}>
      <div className="learning-header">
        <button className="close-btn" onClick={() => navigate('/lessons')}><X size={24} /></button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: isReviewMode ? '#f59e0b' : '#58cc02' }}></div>
        </div>
        {isReviewMode && <div className="review-badge fade-in"><RefreshCw size={16} /> Reviewing</div>}
        <button
          className="focus-mode-btn"
          onClick={() => setFocusMode(f => !f)}
          title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode — hide distractions'}
          aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
        >
          {focusMode ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>{focusMode ? 'Exit Focus' : 'Focus'}</span>
        </button>
      </div>

      <div className="slide-content">
        {slide.isReview ? (
          <div className="badge-container fade-in text-center mb-10">
            <span className="badge-new" style={{ background: '#f59e0b' }}>Previous Mistake</span>
          </div>
        ) : slide.badge && (
          <div className="badge-container fade-in text-center mb-10">
            <span className="badge-new"><Zap size={14} fill="currentColor" /> {slide.badge}</span>
          </div>
        )}

        <h2 className="quiz-question">{slide.question}</h2>

        {(slide.subtype === 'intro' || slide.subtype === 'audio_match') && (
          <div className="card-container text-center fade-in">
            <div className="card-display" onClick={() => playAudio(slide.audioText)} style={{ cursor: 'pointer' }}>
              <h1 className="hindi-large">{slide.mainChar}</h1>
              <div className="pronunciation">
                <button className="audio-btn-circle" onClick={(e) => { e.stopPropagation(); playAudio(slide.audioText); }}>
                  <Volume2 size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TEACHING SLIDE (New Type) --- */}
        {slide.type === 'teach' && (
          <div className="card-container text-center fade-in">
            <div className="card-display" onClick={() => playAudio(slide.audioText)} style={{ cursor: 'pointer' }}>
              <h1 className="hindi-large">{slide.mainChar}</h1>
              <p className="hint-text" style={{ marginTop: '20px', fontSize: '16px', fontWeight: '600' }}>{slide.hint}</p>
              {slide.instruction && (
                <p className="instruction-text" style={{ marginTop: '15px', fontSize: '14px', opacity: 0.8, maxWidth: '400px', margin: '15px auto 0' }}>
                  {slide.instruction}
                </p>
              )}
              <div className="pronunciation" style={{ marginTop: '30px' }}>
                <button className="audio-btn-circle" onClick={(e) => { e.stopPropagation(); playAudio(slide.audioText); }}>
                  <Volume2 size={24} />
                </button>
                <p style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>Click to listen</p>
              </div>
            </div>
          </div>
        )}

        {/* --- PRONUNCIATION SLIDE --- */}
        {slide.type === 'pronounce' && (
          <div className="card-container text-center fade-in">
            <div className="card-display">
              <h1 className="hindi-large">{slide.mainChar}</h1>
              <p className="hint-text">{slide.hint}</p>

              <div className="mic-container" style={{ marginTop: '40px' }}>
                <button
                  className={`mic-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                  onClick={handleMicClick}
                  disabled={isCorrect !== null || isProcessing}
                >
                  <Mic size={40} />
                </button>

                {/* NLP Feedback Display */}
                <div style={{ marginTop: '14px', minHeight: '70px' }}>
                  {isProcessing && (
                    <p className="listening-status" style={{ color: '#f39c12', fontWeight: '600' }}>
                      🔍 Analyzing...
                    </p>
                  )}
                  {!isProcessing && nlpFeedback && (
                    <div style={{
                      background: isCorrect === true ? 'rgba(46,204,113,0.1)' : isCorrect === false ? 'rgba(231,76,60,0.08)' : 'transparent',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      border: isCorrect === true ? '1px solid rgba(46,204,113,0.3)' : isCorrect === false ? '1px solid rgba(231,76,60,0.25)' : 'none',
                    }}>
                      {(() => {
                        const badge = getConfidenceBadge(nlpFeedback.confidence);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ background: badge.color, color: 'white', borderRadius: '20px', padding: '3px 12px', fontSize: '0.75rem', fontWeight: '700' }}>
                              {badge.emoji} {badge.label} · {Math.round(nlpFeedback.confidence * 100)}%
                            </span>
                          </div>
                        );
                      })()}
                      <p className="listening-status" style={{ margin: 0, fontWeight: '500' }}>
                        {nlpFeedback.feedback}
                      </p>
                    </div>
                  )}
                  {!isProcessing && !nlpFeedback && (
                    <p className="listening-status" style={{ marginTop: '10px', minHeight: '24px' }}>
                      {listeningText || (isListening ? 'Listening... (click to stop)' : 'Tap the mic and say the sound')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- QUIZ SLIDES --- */}
        {(slide.type === 'quiz') && (
          <div className={`options-grid fade-in ${slide.subtype === 'char_select' ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ marginTop: '30px' }}>
            {slide.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-btn 
                ${slide.subtype === 'char_select' ? 'hindi-option' : ''}
                ${selectedOption === opt ? 'selected' : ''} 
                ${isCorrect === true && selectedOption === opt ? 'correct' : ''}
                ${isCorrect === false && selectedOption === opt ? 'wrong' : ''}
                `}
                onClick={() => handleQuizAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`learning-footer ${isCorrect === true ? 'footer-success' : ''} ${isCorrect === false ? 'footer-error' : ''}`}>
        <div className="footer-feedback-content">
          {isCorrect === true && (
            <div className="feedback-row">
              <div className="icon-circle success"><CheckCircle size={20} color="#2ecc71" /></div>
              <span className="feedback-text success">Excellent!</span>
            </div>
          )}
          {isCorrect === false && (
            <div className="feedback-row">
              <div className="icon-circle error"><AlertCircle size={20} color="#ef4444" /></div>
              <div className="feedback-text-group">
                <span className="feedback-text error">Incorrect</span>
                <span className="feedback-subtext">Correct answer: {slide.answer}</span>
              </div>
            </div>
          )}
        </div>
        <button
          className={`next-btn ${isCorrect === false ? 'btn-error' : ''}`}
          onClick={handleNext}
          disabled={slide.type !== 'teach' && isCorrect === null}
        >
          {currentSlideIndex === activeSlides.length - 1 && mistakeQueue.length === 0 ? 'Finish' : (isCorrect === false ? 'Got it' : (slide.type === 'teach' ? 'Continue' : 'Next'))}
          <ChevronRight size={20} />
        </button>
      </div>
    </div >
  );
};

export default LearningScreen;
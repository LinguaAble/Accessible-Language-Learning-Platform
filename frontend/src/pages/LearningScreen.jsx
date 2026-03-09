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
      ...createVocabPair("शुक्रिया", "Thank you (Urdu origin)", "Common thanks", ["Thank you", "Sorry", "Yes", "No"], ["शुक्रिया", "माफ़ करें", "हाँ", "नहीं"]),
      { type: 'pronounce', question: "Say 'Hello'", mainChar: "नमस्ते", answer: "namaste", hint: "Namaste" },
      { type: 'pronounce', question: "Say 'Yes'", mainChar: "हाँ", answer: "haan", hint: "Haan" }
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
      { type: 'quiz', subtype: 'char_select', question: "Select 'Seven'", audioText: null, options: ["छह", "सात", "आठ", "पाँच"], answer: "सात" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Eight'", audioText: null, options: ["सात", "आठ", "नौ", "दस"], answer: "आठ" },
      { type: 'pronounce', question: "Say 'Zero'", mainChar: "शून्य", answer: "shunya", hint: "Shunya" },
      { type: 'pronounce', question: "Say 'One'", mainChar: "एक", answer: "ek", hint: "Ek" }
    ]
  },
  20: {
    title: "Family: Parents",
    slides: [
      ...createVocabPair("माँ", "Mother", "Mom", ["Mother", "Father", "Sister", "Brother"], ["माँ", "पिता", "बहन", "भाई"]),
      ...createVocabPair("पिता", "Father", "Dad", ["Father", "Mother", "Uncle", "Aunt"], ["पिता", "माँ", "चाचा", "चाची"]),
      ...createVocabPair("माता-पिता", "Parents", "Mother & Father", ["Parents", "Siblings", "Grandparents", "Friends"], ["माता-पिता", "भाई-बहन", "दादा-दादी", "दोस्त"]),
      { type: 'pronounce', question: "Say 'Mother'", mainChar: "माँ", answer: "maa", hint: "Maa" },
      { type: 'pronounce', question: "Say 'Father'", mainChar: "पिता", answer: "pita", hint: "Pita" }
    ]
  },
  21: {
    title: "Family: Siblings",
    slides: [
      ...createVocabPair("भाई", "Brother", "Male sibling", ["Brother", "Sister", "Father", "Mother"], ["भाई", "बहन", "पिता", "माँ"]),
      ...createVocabPair("बहन", "Sister", "Female sibling", ["Sister", "Brother", "Mother", "Aunt"], ["बहन", "भाई", "माँ", "चाची"]),
      ...createVocabPair("भाई-बहन", "Siblings", "Brothers & Sisters", ["Siblings", "Parents", "Friends", "Teachers"], ["भाई-बहन", "माता-पिता", "दोस्त", "शिक्षक"]),
      { type: 'pronounce', question: "Say 'Brother'", mainChar: "भाई", answer: "bhai", hint: "Bhai" },
      { type: 'pronounce', question: "Say 'Sister'", mainChar: "बहन", answer: "bahan", hint: "Bahan" }
    ]
  },
  22: {
    title: "Colors: Part 1",
    slides: [
      ...createVocabPair("लाल", "Red", "Color red", ["Red", "Blue", "Green", "Yellow"], ["लाल", "नीला", "हरा", "पीला"]),
      ...createVocabPair("नीला", "Blue", "Color blue", ["Blue", "Red", "Green", "Black"], ["नीला", "लाल", "हरा", "काला"]),
      ...createVocabPair("हरा", "Green", "Color green", ["Green", "Yellow", "Blue", "Red"], ["हरा", "पीला", "नीला", "लाल"]),
      { type: 'pronounce', question: "Say 'Red'", mainChar: "लाल", answer: "laal", hint: "Laal" },
      { type: 'pronounce', question: "Say 'Green'", mainChar: "हरा", answer: "hara", hint: "Hara" }
    ]
  },
  23: {
    title: "Colors: Part 2",
    slides: [
      ...createVocabPair("पीला", "Yellow", "Color yellow", ["Yellow", "Green", "Orange", "Pink"], ["पीला", "हरा", "नारंगी", "गुलाबी"]),
      ...createVocabPair("काला", "Black", "Color black", ["Black", "White", "Red", "Blue"], ["काला", "सफ़ेद", "लाल", "नीला"]),
      ...createVocabPair("सफ़ेद", "White", "Color white", ["White", "Black", "Grey", "Brown"], ["सफ़ेद", "काला", "भूरा", "स्लेटी"]),
      { type: 'pronounce', question: "Say 'Black'", mainChar: "काला", answer: "kaala", hint: "Kaala" },
      { type: 'pronounce', question: "Say 'White'", mainChar: "सफ़ेद", answer: "safed", hint: "Safed" }
    ]
  },
  24: {
    title: "Food & Drink: Part 1",
    slides: [
      ...createVocabPair("पानी", "Water", "Drink water", ["Water", "Milk", "Tea", "Juice"], ["पानी", "दूध", "चाय", "जूस"]),
      ...createVocabPair("दूध", "Milk", "Dairy drink", ["Milk", "Water", "Tea", "Coffee"], ["दूध", "पानी", "चाय", "कॉफ़ी"]),
      ...createVocabPair("जूस", "Juice", "Fruit drink", ["Juice", "Water", "Milk", "Soda"], ["जूस", "पानी", "दूध", "सोडा"]),
      { type: 'pronounce', question: "Say 'Water'", mainChar: "पानी", answer: "paani", hint: "Paani" },
      { type: 'pronounce', question: "Say 'Milk'", mainChar: "दूध", answer: "doodh", hint: "Doodh" }
    ]
  },
  25: {
    title: "Food & Drink: Part 2",
    slides: [
      ...createVocabPair("रोटी", "Bread", "Indian bread", ["Bread", "Rice", "Milk", "Water"], ["रोटी", "चावल", "दूध", "पानी"]),
      ...createVocabPair("चाय", "Tea", "Hot beverage", ["Tea", "Coffee", "Milk", "Water"], ["चाय", "कॉफ़ी", "दूध", "पानी"]),
      ...createVocabPair("चीनी", "Sugar", "Sweetener", ["Sugar", "Salt", "Spice", "Tea"], ["चीनी", "नमक", "मसाला", "चाय"]),
      { type: 'pronounce', question: "Say 'Bread'", mainChar: "रोटी", answer: "roti", hint: "Roti" },
      { type: 'pronounce', question: "Say 'Tea'", mainChar: "चाय", answer: "chai", hint: "Chai" }
    ]
  },
  26: {
    title: "Fruits",
    slides: [
      ...createVocabPair("सेब", "Apple", "Red fruit", ["Apple", "Banana", "Mango", "Orange"], ["सेब", "केला", "आम", "संतरा"]),
      ...createVocabPair("केला", "Banana", "Yellow fruit", ["Banana", "Apple", "Mango", "Grapes"], ["केला", "सेब", "आम", "अंगूर"]),
      ...createVocabPair("आम", "Mango", "King of fruits", ["Mango", "Apple", "Banana", "Grapes"], ["आम", "सेब", "केला", "अंगूर"]),
      ...createVocabPair("अंगूर", "Grapes", "Small round fruit", ["Grapes", "Mango", "Apple", "Pear"], ["अंगूर", "आम", "सेब", "नाराशपाती"]),
      { type: 'pronounce', question: "Say 'Mango'", mainChar: "आम", answer: "aam", hint: "Aam" }
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
      { type: 'quiz', subtype: 'char_select', question: "Select 'Milk'", audioText: null, options: ["दूध", "पानी", "चाय", "जूस"], answer: "दूध" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Sister'", audioText: null, options: ["बहन", "भाई", "माँ", "पिता"], answer: "बहन" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Black'", audioText: null, options: ["काला", "सफ़ेद", "नीला", "हरा"], answer: "काला" },
    ]
  },
  28: {
    title: "Pronunciation: Common Words",
    slides: [
      { type: 'pronounce', question: "Say 'Hello'", mainChar: "नमस्ते", answer: "namaste", hint: "Namaste" },
      { type: 'pronounce', question: "Say 'Yes'", mainChar: "हाँ", answer: "haan", hint: "Haan" },
      { type: 'pronounce', question: "Say 'No'", mainChar: "नहीं", answer: "nahi", hint: "Nahi" },
      { type: 'pronounce', question: "Say 'Water'", mainChar: "पानी", answer: "pani", hint: "Pani" },
      { type: 'pronounce', question: "Say 'Milk'", mainChar: "दूध", answer: "doodh", hint: "Doodh" },
      { type: 'pronounce', question: "Say 'Thank you'", mainChar: "धन्यवाद", answer: "dhanyavaad", hint: "Dhanyavaad" },
      { type: 'pronounce', question: "Say 'Excuse me'", mainChar: "माफ़ कीजिये", answer: "maaf kijiye", hint: "Maaf kijiye" },
      { type: 'pronounce', question: "Say 'See you'", mainChar: "फिर मिलेंगे", answer: "phir milenge", hint: "Phir milenge" }
    ]
  },
  29: {
    title: "Pronunciation: Numbers & Family",
    slides: [
      { type: 'pronounce', question: "Say 'One'", mainChar: "एक", answer: "ek", hint: "Ek" },
      { type: 'pronounce', question: "Say 'Two'", mainChar: "दो", answer: "do", hint: "Do" },
      { type: 'pronounce', question: "Say 'Five'", mainChar: "पाँच", answer: "paanch", hint: "Paanch" },
      { type: 'pronounce', question: "Say 'Ten'", mainChar: "दस", answer: "das", hint: "Das" },
      { type: 'pronounce', question: "Say 'Mother'", mainChar: "माँ", answer: "maa", hint: "Maa" },
      { type: 'pronounce', question: "Say 'Father'", mainChar: "पिता", answer: "pita", hint: "Pita" },
      { type: 'pronounce', question: "Say 'Brother'", mainChar: "भाई", answer: "bhai", hint: "Bhai" },
      { type: 'pronounce', question: "Say 'Sister'", mainChar: "बहन", answer: "bahan", hint: "Bahan" }
    ]
  },
  30: {
    title: "Pronunciation: Colors & Food",
    slides: [
      { type: 'pronounce', question: "Say 'Red'", mainChar: "लाल", answer: "laal", hint: "Laal" },
      { type: 'pronounce', question: "Say 'Blue'", mainChar: "नीला", answer: "neela", hint: "Neela" },
      { type: 'pronounce', question: "Say 'Yellow'", mainChar: "पीला", answer: "peela", hint: "Peela" },
      { type: 'pronounce', question: "Say 'Bread'", mainChar: "रोटी", answer: "roti", hint: "Roti" },
      { type: 'pronounce', question: "Say 'Tea'", mainChar: "चाय", answer: "chai", hint: "Chai" },
      { type: 'pronounce', question: "Say 'Mango'", mainChar: "आम", answer: "aam", hint: "Aam" },
      { type: 'pronounce', question: "Say 'Sugar'", mainChar: "चीनी", answer: "cheeni", hint: "Cheeni" },
      { type: 'pronounce', question: "Say 'Fruits'", mainChar: "फल", answer: "phal", hint: "Phal" }
    ]
  },
  // --- CHAPTER 3: FIRST SENTENCES ---
  31: {
    title: "Pronouns: I & You",
    slides: [
      ...createVocabPair("मैं", "I", "First person", ["I", "You (informal)", "He", "She"], ["मैं", "तुम", "वह", "वह"]),
      ...createVocabPair("तुम", "You (informal)", "Second person informal", ["You (informal)", "I", "We", "They"], ["तुम", "मैं", "हम", "वे"]),
      ...createVocabPair("आप", "You (formal)", "Second person formal", ["You (formal)", "You (informal)", "I", "We"], ["आप", "तुम", "मैं", "हम"]),
      { type: 'pronounce', question: "Say 'I'", mainChar: "मैं", answer: "main", hint: "Main" },
      { type: 'pronounce', question: "Say 'You'", mainChar: "तुम", answer: "tum", hint: "Tum" },
      { type: 'pronounce', question: "Say 'You (formal)'", mainChar: "आप", answer: "aap", hint: "Aap" }
    ]
  },
  32: {
    title: "Pronouns: He, She & We",
    slides: [
      ...createVocabPair("वह", "He/She", "Third person", ["He/She", "I", "You", "We"], ["वह", "मैं", "तुम", "हम"]),
      ...createVocabPair("हम", "We", "First person plural", ["We", "They", "You", "I"], ["हम", "वे", "तुम", "मैं"]),
      ...createVocabPair("वे", "They", "Third person plural", ["They", "We", "You", "He/She"], ["वे", "हम", "तुम", "वह"]),
      { type: 'pronounce', question: "Say 'He/She'", mainChar: "वह", answer: "vah", hint: "Vah" },
      { type: 'pronounce', question: "Say 'We'", mainChar: "हम", answer: "hum", hint: "Hum" },
      { type: 'pronounce', question: "Say 'They'", mainChar: "वे", answer: "ve", hint: "Ve" }
    ]
  },
  33: {
    title: "Verbs: Eat & Drink",
    slides: [
      ...createVocabPair("खाना", "To eat", "Eating action", ["To eat", "To drink", "To sleep", "To go"], ["खाना", "पीना", "सोना", "जाना"]),
      ...createVocabPair("पीना", "To drink", "Drinking action", ["To drink", "To eat", "To come", "To sit"], ["पीना", "खाना", "आना", "बैठना"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'To eat'", audioText: null, options: ["खाना", "पीना", "आना", "जाना"], answer: "खाना" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'To drink'", audioText: null, options: ["पीना", "खाना", "सोना", "बैठना"], answer: "पीना" },
      { type: 'pronounce', question: "Say 'To eat'", mainChar: "खाना", answer: "khaana", hint: "Khaana" },
      { type: 'pronounce', question: "Say 'To drink'", mainChar: "पीना", answer: "peena", hint: "Peena" }
    ]
  },
  34: {
    title: "Verbs: Go & Come",
    slides: [
      ...createVocabPair("जाना", "To go", "Going action", ["To go", "To come", "To eat", "To sleep"], ["जाना", "आना", "खाना", "सोना"]),
      ...createVocabPair("आना", "To come", "Coming action", ["To come", "To go", "To sit", "To stand"], ["आना", "जाना", "बैठना", "खड़ा होना"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'To go'", audioText: null, options: ["जाना", "आना", "खाना", "पीना"], answer: "जाना" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'To come'", audioText: null, options: ["आना", "जाना", "सोना", "बैठना"], answer: "आना" },
      { type: 'pronounce', question: "Say 'To go'", mainChar: "जाना", answer: "jaana", hint: "Jaana" },
      { type: 'pronounce', question: "Say 'To come'", mainChar: "आना", answer: "aana", hint: "Aana" }
    ]
  },
  35: {
    title: "Verbs: Sleep & Wake",
    slides: [
      ...createVocabPair("सोना", "To sleep", "Sleeping action", ["To sleep", "To wake", "To eat", "To drink"], ["सोना", "जागना", "खाना", "पीना"]),
      ...createVocabPair("जागना", "To wake", "Waking action", ["To wake", "To sleep", "To sit", "To stand"], ["जागना", "सोना", "बैठना", "खड़ा होना"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'To sleep'", audioText: null, options: ["सोना", "जागना", "खाना", "पीना"], answer: "सोना" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'To wake'", audioText: null, options: ["जागना", "सोना", "बैठना", "खड़ा होना"], answer: "जागना" },
      { type: 'pronounce', question: "Say 'To sleep'", mainChar: "सोना", answer: "sona", hint: "Sona" },
      { type: 'pronounce', question: "Say 'To wake'", mainChar: "जागना", answer: "jaagna", hint: "Jaagna" }
    ]
  },
  36: {
    title: "I am / You are",
    slides: [
      ...createVocabPair("मैं हूँ", "I am", "I am statement", ["I am", "You are", "He is", "We are"], ["मैं हूँ", "तुम हो", "वह है", "हम हैं"]),
      ...createVocabPair("तुम हो", "You are", "You are statement", ["You are", "I am", "He is", "They are"], ["तुम हो", "मैं हूँ", "वह है", "वे हैं"]),
      ...createVocabPair("आप हैं", "You are (formal)", "You are statement", ["You are (formal)", "You are (informal)", "I am", "We are"], ["आप हैं", "तुम हो", "मैं हूँ", "हम हैं"]),
      { type: 'pronounce', question: "Say 'I am'", mainChar: "मैं हूँ", answer: "main hoon", hint: "Main hoon" },
      { type: 'pronounce', question: "Say 'You are'", mainChar: "तुम हो", answer: "tum ho", hint: "Tum ho" }
    ]
  },
  37: {
    title: "He/She is & We are",
    slides: [
      ...createVocabPair("वह है", "He/She is", "Third person is", ["He/She is", "I am", "You are", "We are"], ["वह है", "मैं हूँ", "तुम हो", "हम हैं"]),
      ...createVocabPair("हम हैं", "We are", "We are statement", ["We are", "They are", "I am", "You are"], ["हम हैं", "वे हैं", "मैं हूँ", "तुम हो"]),
      ...createVocabPair("वे हैं", "They are", "They are statement", ["They are", "We are", "You are", "He/She is"], ["वे हैं", "हम हैं", "तुम हो", "वह है"]),
      { type: 'pronounce', question: "Say 'He/She is'", mainChar: "वह है", answer: "vah hai", hint: "Vah hai" },
      { type: 'pronounce', question: "Say 'We are'", mainChar: "हम हैं", answer: "hum hain", hint: "Hum hain" }
    ]
  },
  38: {
    title: "Simple Sentences",
    slides: [
      ...createVocabPair("मैं खाता हूँ", "I eat", "I eat sentence", ["I eat", "You eat", "He eats", "We eat"], ["मैं खाता हूँ", "तुम खाते हो", "वह खाता है", "हम खाते हैं"]),
      ...createVocabPair("मैं जाता हूँ", "I go", "I go sentence", ["I go", "You go", "I come", "I eat"], ["मैं जाता हूँ", "तुम जाते हो", "मैं आता हूँ", "मैं खाता हूँ"]),
      { type: 'pronounce', question: "Say 'I eat'", mainChar: "मैं खाता हूँ", answer: "main khaata hoon", hint: "Main khaata hoon" },
      { type: 'pronounce', question: "Say 'I go'", mainChar: "मैं जाता हूँ", answer: "main jaata hoon", hint: "Main jaata hoon" },
      { type: 'pronounce', question: "Say 'I sleep'", mainChar: "मैं सोता हूँ", answer: "main sota hoon", hint: "Main sota hoon" }
    ]
  },
  39: {
    title: "Questions: What & Where",
    slides: [
      ...createVocabPair("क्या", "What", "Question word", ["What", "Where", "When", "Who"], ["क्या", "कहाँ", "कब", "कौन"]),
      ...createVocabPair("कहाँ", "Where", "Location question", ["Where", "What", "When", "Why"], ["कहाँ", "क्या", "कब", "क्यों"]),
      ...createVocabPair("कब", "When", "Time question", ["When", "Where", "What", "Who"], ["कब", "कहाँ", "क्या", "कौन"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'What'", audioText: null, options: ["क्या", "कहाँ", "कब", "कौन"], answer: "क्या" },
      { type: 'pronounce', question: "Say 'What'", mainChar: "क्या", answer: "kya", hint: "Kya" },
      { type: 'pronounce', question: "Say 'Where'", mainChar: "कहाँ", answer: "kahaan", hint: "Kahaan" }
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
      { type: 'pronounce', question: "Say 'I am here'", mainChar: "मैं यहाँ हूँ", answer: "main yahaan hoon", hint: "Main yahaan hoon" },
      { type: 'pronounce', question: "Say 'What is that?'", mainChar: "वह क्या है?", answer: "vah kya hai", hint: "Vah kya hai" }
    ]
  },
  41: {
    title: "Adjectives: Size",
    slides: [
      ...createVocabPair("बड़ा", "Big", "Large size", ["Big", "Small", "Long", "Short"], ["बड़ा", "छोटा", "लंबा", "छोटा"]),
      ...createVocabPair("छोटा", "Small", "Small size", ["Small", "Big", "Tall", "Short"], ["छोटा", "बड़ा", "लंबा", "नाटा"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'Big'", audioText: null, options: ["बड़ा", "छोटा", "लंबा", "नाटा"], answer: "बड़ा" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Small'", audioText: null, options: ["छोटा", "बड़ा", "लंबा", "नाटा"], answer: "छोटा" },
      { type: 'pronounce', question: "Say 'Big'", mainChar: "बड़ा", answer: "bada", hint: "Bada" },
      { type: 'pronounce', question: "Say 'Small'", mainChar: "छोटा", answer: "chhota", hint: "Chhota" }
    ]
  },
  42: {
    title: "Adjectives: Feelings",
    slides: [
      ...createVocabPair("खुश", "Happy", "Happy feeling", ["Happy", "Sad", "Angry", "Tired"], ["खुश", "उदास", "गुस्सा", "थका"]),
      ...createVocabPair("उदास", "Sad", "Sad feeling", ["Sad", "Happy", "Angry", "Scared"], ["उदास", "खुश", "गुस्सा", "डरा"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'Happy'", audioText: null, options: ["खुश", "उदास", "गुस्सा", "थका"], answer: "खुश" },
      { type: 'quiz', subtype: 'char_select', question: "Select 'Sad'", audioText: null, options: ["उदास", "खुश", "गुस्सा", "थका"], answer: "उदास" },
      { type: 'pronounce', question: "Say 'Happy'", mainChar: "खुश", answer: "khush", hint: "Khush" },
      { type: 'pronounce', question: "Say 'Sad'", mainChar: "उदास", answer: "udaas", hint: "Udaas" }
    ]
  },
  43: {
    title: "Pronunciation: Pronouns & Verbs",
    slides: [
      { type: 'pronounce', question: "Say 'I'", mainChar: "मैं", answer: "main", hint: "Main" },
      { type: 'pronounce', question: "Say 'You'", mainChar: "तुम", answer: "tum", hint: "Tum" },
      { type: 'pronounce', question: "Say 'He/She'", mainChar: "वह", answer: "vah", hint: "Vah" },
      { type: 'pronounce', question: "Say 'We'", mainChar: "हम", answer: "hum", hint: "Hum" },
      { type: 'pronounce', question: "Say 'To eat'", mainChar: "खाना", answer: "khaana", hint: "Khaana" },
      { type: 'pronounce', question: "Say 'To drink'", mainChar: "पीना", answer: "peena", hint: "Peena" },
      { type: 'pronounce', question: "Say 'To go'", mainChar: "जाना", answer: "jaana", hint: "Jaana" },
      { type: 'pronounce', question: "Say 'To come'", mainChar: "आना", answer: "aana", hint: "Aana" }
    ]
  },
  44: {
    title: "Pronunciation: Sentences",
    slides: [
      { type: 'pronounce', question: "Say 'I am'", mainChar: "मैं हूँ", answer: "main hoon", hint: "Main hoon" },
      { type: 'pronounce', question: "Say 'You are'", mainChar: "तुम हो", answer: "tum ho", hint: "Tum ho" },
      { type: 'pronounce', question: "Say 'He/She is'", mainChar: "वह है", answer: "vah hai", hint: "Vah hai" },
      { type: 'pronounce', question: "Say 'We are'", mainChar: "हम हैं", answer: "hum hain", hint: "Hum hain" },
      { type: 'pronounce', question: "Say 'I eat'", mainChar: "मैं खाता हूँ", answer: "main khaata hoon", hint: "Main khaata hoon" },
      { type: 'pronounce', question: "Say 'They go'", mainChar: "वे जाते हैं", answer: "ve jaate hain", hint: "Ve jaate hain" }
    ]
  },
  45: {
    title: "Pronunciation: Questions & Adjectives",
    slides: [
      { type: 'pronounce', question: "Say 'What'", mainChar: "क्या", answer: "kya", hint: "Kya" },
      { type: 'pronounce', question: "Say 'Where'", mainChar: "कहाँ", answer: "kahaan", hint: "Kahaan" },
      { type: 'pronounce', question: "Say 'When'", mainChar: "कब", answer: "kab", hint: "Kab" },
      { type: 'pronounce', question: "Say 'Who'", mainChar: "कौन", answer: "kaun", hint: "Kaun" },
      { type: 'pronounce', question: "Say 'Big'", mainChar: "बड़ा", answer: "bada", hint: "Bada" },
      { type: 'pronounce', question: "Say 'Small'", mainChar: "छोटा", answer: "chhota", hint: "Chhota" },
      { type: 'pronounce', question: "Say 'Happy'", mainChar: "खुश", answer: "khush", hint: "Khush" },
      { type: 'pronounce', question: "Say 'Sad'", mainChar: "उदास", answer: "udaas", hint: "Udaas" }
    ]
  },
  // --- CHAPTER 4: EVERYDAY CONVERSATIONS ---
  46: {
    title: "Greetings: Hello & Goodbye",
    slides: [
      ...createVocabPair("नमस्ते", "Hello", "Greeting", ["Hello", "Goodbye", "Thanks", "Sorry"], ["नमस्ते", "अलविदा", "धन्यवाद", "क्षमा करें"]),
      ...createVocabPair("अलविदा", "Goodbye", "Parting", ["Goodbye", "Welcome", "Hello", "No"], ["अलविदा", "स्वागत है", "नमस्ते", "नहीं"]),
      ...createVocabPair("सुप्रभात", "Good morning", "Morning", ["Good morning", "Good night", "Hello", "Bye"], ["सुप्रभात", "शुभ रात्रि", "नमस्ते", "नमस्ते"]),
      { type: 'pronounce', question: "Say 'Hello'", mainChar: "नमस्ते", answer: "namaste", hint: "Namaste" },
      { type: 'pronounce', question: "Say 'Goodbye'", mainChar: "अलविदा", answer: "alvida", hint: "Alvida" }
    ]
  },
  47: {
    title: "Introducing Yourself",
    slides: [
      ...createVocabPair("मेरा नाम", "My name", "Introduction", ["My name", "Your name", "His name", "Her name"], ["मेरा नाम", "तुम्हारा नाम", "उसका नाम", "मेरा पता"]),
      ...createVocabPair("मैं हूँ", "I am", "Existence", ["I am", "You are", "He is", "We are"], ["मैं हूँ", "तुम हो", "वह है", "हम हैं"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'My name'", audioText: null, options: ["मेरा नाम", "आपका नाम", "कलम", "घर"], answer: "मेरा नाम" },
      { type: 'pronounce', question: "Say 'My name'", mainChar: "मेरा नाम", answer: "mera naam", hint: "Mera naam" },
      { type: 'pronounce', question: "Say 'I am'", mainChar: "मैं हूँ", answer: "main hoon", hint: "Main hoon" }
    ]
  },
  48: {
    title: "Asking Someone’s Name",
    slides: [
      ...createVocabPair("आपका नाम क्या है?", "What is your name?", "Formal Question", ["What is your name?", "How are you?", "Where are you?", "Who are you?"], ["आपका नाम क्या है?", "आप कैसे हैं?", "आप कहाँ हैं?", "आप कौन हैं?"]),
      ...createVocabPair("क्या", "What", "Question", ["What", "Where", "When", "Who"], ["क्या", "कहाँ", "कब", "कौन"]),
      { type: 'quiz', subtype: 'intro', badge: "Review", question: "How do you ask 'What is your name?'", mainChar: "आपका नाम क्या है?", audioText: "आपका नाम क्या है?", options: ["What is your name?", "Where are you?", "Who are you?", "How are you?"], answer: "What is your name?" },
      { type: 'pronounce', question: "Ask 'What is your name?'", mainChar: "आपका नाम क्या है?", answer: "aapka naam kya hai", hint: "Aapka naam kya hai" }
    ]
  },
  49: {
    title: "Saying Thank You & Sorry",
    slides: [
      ...createVocabPair("धन्यवाद", "Thank you", "Gratitude", ["Thank you", "Sorry", "Please", "Welcome"], ["धन्यवाद", "क्षमा करें", "कृपया", "स्वागत है"]),
      ...createVocabPair("क्षमा करें", "Sorry", "Apology", ["Sorry", "Thank you", "No", "Yes"], ["क्षमा करें", "धन्यवाद", "नहीं", "हाँ"]),
      ...createVocabPair("स्वागत है", "Welcome", "Politeness", ["Welcome", "Hello", "Thanks", "Sorry"], ["स्वागत है", "नमस्ते", "धन्यवाद", "क्षमा करें"]),
      { type: 'pronounce', question: "Say 'Thank you'", mainChar: "धन्यवाद", answer: "dhanyavaad", hint: "Dhanyavaad" },
      { type: 'pronounce', question: "Say 'Sorry'", mainChar: "क्षमा करें", answer: "kshama karein", hint: "Kshama karein" }
    ]
  },
  50: {
    title: "Yes / No Responses",
    slides: [
      ...createVocabPair("हाँ", "Yes", "Affirmative", ["Yes", "No", "Maybe", "Never"], ["हाँ", "नहीं", "शायद", "कभी नहीं"]),
      ...createVocabPair("नहीं", "No", "Negative", ["No", "Yes", "Always", "Soon"], ["नहीं", "हाँ", "हमेशा", "जल्दी"]),
      ...createVocabPair("ठीक है", "Okay", "Agreement", ["Okay", "Bad", "Good", "Normal"], ["ठीक है", "बुरा", "अच्छा", "सामान्य"]),
      { type: 'pronounce', question: "Say 'Yes'", mainChar: "हाँ", answer: "haan", hint: "Haan" },
      { type: 'pronounce', question: "Say 'No'", mainChar: "नहीं", answer: "nahi", hint: "Nahi" }
    ]
  },
  51: {
    title: "Polite Expressions",
    slides: [
      ...createVocabPair("कृपया", "Please", "Politeness", ["Please", "Thanks", "Sorry", "No"], ["कृपया", "धन्यवाद", "क्षमा करें", "नहीं"]),
      ...createVocabPair("जी हाँ", "Yes (Polite)", "Honorific", ["Yes (Polite)", "No", "Thanks", "Bye"], ["जी हाँ", "नहीं", "शुक्रिया", "नमस्ते"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'Please'", audioText: null, options: ["कृपया", "क्षमा करें", "धन्यवाद", "नमस्ते"], answer: "कृपया" },
      { type: 'pronounce', question: "Say 'Please'", mainChar: "कृपया", answer: "kripya", hint: "Kripya" }
    ]
  },
  52: {
    title: "Asking “How are you?”",
    slides: [
      ...createVocabPair("आप कैसे हैं?", "How are you?", "Greeting Question", ["How are you?", "Who are you?", "Where are you?", "What is this?"], ["आप कैसे हैं?", "आप कौन हैं?", "आप कहाँ हैं?", "यह क्या है?"]),
      ...createVocabPair("मैं ठीक हूँ", "I am fine", "Response", ["I am fine", "I am happy", "I am sad", "I am tired"], ["मैं ठीक हूँ", "मैं खुश हूँ", "मैं उदास हूँ", "मैं थका हूँ"]),
      { type: 'pronounce', question: "Ask 'How are you?'", mainChar: "आप कैसे हैं?", answer: "aap kaise hain", hint: "Aap kaise hain" },
      { type: 'pronounce', question: "Say 'I am fine'", mainChar: "मैं ठीक हूँ", answer: "main theek hoon", hint: "Main theek hoon" }
    ]
  },
  53: {
    title: "Talking About Yourself",
    slides: [
      ...createVocabPair("मैं छात्र हूँ", "I am a student", "Statement", ["I am a student", "I am a teacher", "I am a doctor", "I am happy"], ["मैं छात्र हूँ", "मैं शिक्षक हूँ", "मैं डॉक्टर हूँ", "मैं खुश हूँ"]),
      ...createVocabPair("शिक्षक", "Teacher", "Profession", ["Teacher", "Student", "Doctor", "Engineer"], ["शिक्षक", "छात्र", "डॉक्टर", "इंजीनियर"]),
      { type: 'quiz', subtype: 'intro', question: "What does 'छात्र' mean?", mainChar: "छात्र", audioText: "छात्र", options: ["Student", "Teacher", "Friend", "Enemy"], answer: "Student" },
      { type: 'pronounce', question: "Say 'Teacher'", mainChar: "शिक्षक", answer: "shikshak", hint: "Shikshak" }
    ]
  },
  54: {
    title: "Talking About Friends",
    slides: [
      ...createVocabPair("मेरा दोस्त", "My friend", "Relationship", ["My friend", "My enemy", "My father", "My sister"], ["मेरा दोस्त", "मेरा दुश्मन", "मेरा पिता", "मेरी बहन"]),
      ...createVocabPair("सहेली", "Friend (Female)", "Gendered term", ["Friend (Female)", "Friend (Male)", "Sister", "Mother"], ["सहेली", "दोस्त", "बहन", "माँ"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'Friend'", audioText: null, options: ["दोस्त", "दुश्मन", "भाई", "घर"], answer: "दोस्त" },
      { type: 'pronounce', question: "Say 'My friend'", mainChar: "मेरा दोस्त", answer: "mera dost", hint: "Mera dost" }
    ]
  },
  55: {
    title: "Asking Simple Questions",
    slides: [
      ...createVocabPair("यह क्या है?", "What is this?", "Question", ["What is this?", "What is that?", "Who is this?", "Where is this?"], ["यह क्या है?", "वह क्या है?", "यह कौन है?", "यह कहाँ है?"]),
      ...createVocabPair("कहाँ", "Where", "Question", ["Where", "What", "When", "Who"], ["कहाँ", "क्या", "कब", "कौन"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'What'", audioText: null, options: ["क्या", "कहाँ", "कौन", "कब"], answer: "क्या" },
      { type: 'pronounce', question: "Ask 'What is this?'", mainChar: "यह क्या है?", answer: "yeh kya hai", hint: "Yeh kya hai" }
    ]
  },
  56: {
    title: "Everyday Phrases",
    slides: [
      ...createVocabPair("शायद", "Maybe", "Uncertainty", ["Maybe", "Yes", "No", "Definitely"], ["शायद", "हाँ", "नहीं", "बिल्कुल"]),
      ...createVocabPair("बिल्कुल", "Definitely", "Certainty", ["Definitely", "Maybe", "Never", "Often"], ["बिल्कुल", "शायद", "कभी नहीं", "अक्सर"]),
      { type: 'quiz', subtype: 'intro', question: "What does 'शायद' mean?", mainChar: "शायद", audioText: "शायद", options: ["Maybe", "Yes", "No", "Always"], answer: "Maybe" },
      { type: 'pronounce', question: "Say 'Definitely'", mainChar: "बिल्कुल", answer: "bilkul", hint: "Bilkul" }
    ]
  },
  57: {
    title: "Small Conversation Practice",
    slides: [
      ...createVocabPair("सुप्रभात", "Good morning", "Greeting", ["Good morning", "Good night", "Good evening", "Hi"], ["सुप्रभात", "शुभ रात्रि", "शुभ संध्या", "नमस्ते"]),
      ...createVocabPair("शुभ संध्या", "Good evening", "Greeting", ["Good evening", "Good morning", "Good night", "Hello"], ["शुभ संध्या", "सुप्रभात", "शुभ रात्रि", "नमस्ते"]),
      { type: 'pronounce', question: "Say 'Good morning'", mainChar: "सुप्रभात", answer: "suprabhat", hint: "Suprabhat" },
      { type: 'pronounce', question: "Say 'Good evening'", mainChar: "शुभ संध्या", answer: "shubh sandhya", hint: "Shubh sandhya" }
    ]
  },
  58: {
    title: "Listening Practice: Greetings",
    slides: [
      { type: 'quiz', subtype: 'intro', badge: "Review", title: "Greeting Review", question: "What does this mean?", mainChar: "नमस्ते", audioText: "नमस्ते", hint: "Common greeting", options: ["Hello", "Goodbye", "Thanks", "Sorry"], answer: "Hello" },
      { type: 'pronounce', question: "Listen and Repeat: Hello", mainChar: "नमस्ते", answer: "namaste", hint: "Namaste" },
      { type: 'pronounce', question: "Listen and Repeat: Good morning", mainChar: "सुप्रभात", answer: "suprabhat", hint: "Suprabhat" },
      { type: 'pronounce', question: "Listen and Repeat: Good night", mainChar: "शुभ रात्रि", answer: "shubh raatri", hint: "Shubh raatri" },
      { type: 'pronounce', question: "Listen and Repeat: Welcome", mainChar: "स्वागत है", answer: "swagat hai", hint: "Swagat hai" }
    ]
  },
  59: {
    title: "Speaking Practice: Introductions",
    slides: [
      { type: 'pronounce', question: "Say 'My name is...'", mainChar: "मेरा नाम", answer: "mera naam", hint: "Mera naam" },
      { type: 'pronounce', question: "Say 'I am a student'", mainChar: "मैं छात्र हूँ", answer: "main chhatra hoon", hint: "Main chhatra hoon" },
      { type: 'pronounce', question: "Say 'This is my friend'", mainChar: "यह मेरा दोस्त है", answer: "yeh mera dost hai", hint: "Yeh mera dost hai" },
      { type: 'pronounce', question: "Say 'I am fine'", mainChar: "मैं ठीक हूँ", answer: "main theek hoon", hint: "Main theek hoon" },
      { type: 'pronounce', question: "Say 'What is your name?'", mainChar: "आपका नाम क्या है?", answer: "aapka naam kya hai", hint: "Aapka naam kya hai" }
    ]
  },
  60: {
    title: "Conversation Review",
    slides: [
      { type: 'quiz', subtype: 'char_select', question: "Select 'Thank you'", audioText: null, options: ["धन्यवाद", "क्षमा करें", "नमस्ते", "अलविदा"], answer: "धन्यवाद" },
      { type: 'pronounce', question: "Final Test: Say 'Thank you very much'", mainChar: "बहुत बहुत धन्यवाद", answer: "bahut bahut dhanyavaad", hint: "Bahut bahut dhanyavaad" },
      { type: 'pronounce', question: "Final Test: Say 'Excuse me'", mainChar: "माफ़ कीजिए", answer: "maaf kijiye", hint: "Maaf kijiye" },
      { type: 'pronounce', question: "Final Test: Say 'See you again'", mainChar: "फिर मिलेंगे", answer: "phir milenge", hint: "Phir milenge" },
      { type: 'pronounce', question: "Final Test: Say 'Take care'", mainChar: "अपना ख्याल रखना", answer: "apna khyal rakhna", hint: "Apna khyal rakhna" }
    ]
  },

  // --- CHAPTER 5: DAILY LIFE ---
  61: {
    title: "Daily Routine",
    slides: [
      ...createVocabPair("दिनचर्या", "Daily Routine", "Concept", ["Daily Routine", "Job", "Study", "Sleep"], ["दिनचर्या", "काम", "पढ़ाई", "नींद"]),
      ...createVocabPair("रोज़", "Daily/Every day", "Frequency", ["Daily", "Weekly", "Monthly", "Yearly"], ["रोज़", "साप्ताहिक", "मासिक", "वार्षिक"]),
      { type: 'pronounce', question: "Say 'Daily Routine'", mainChar: "दिनचर्या", answer: "din-charya", hint: "Din-charya" },
      { type: 'pronounce', question: "Say 'Every day'", mainChar: "रोज़", answer: "roz", hint: "Roz" }
    ]
  },
  62: {
    title: "Morning Activities",
    slides: [
      ...createVocabPair("नहाना", "To bathe", "Action", ["To bathe", "To eat", "To run", "To walk"], ["नहाना", "खाना", "दौड़ना", "चलना"]),
      ...createVocabPair("उठना", "To wake up", "Action", ["To wake up", "To sleep", "To sit", "To stand"], ["उठना", "सोना", "बैठना", "खड़ा होना"]),
      ...createVocabPair("तैयार होना", "To get ready", "Action", ["To get ready", "To go", "To come", "To work"], ["तैयार होना", "जाना", "आना", "काम करना"]),
      { type: 'pronounce', question: "Say 'To bathe'", mainChar: "नहाना", answer: "nahana", hint: "Nahana" },
      { type: 'pronounce', question: "Say 'Wake up'", mainChar: "उठना", answer: "uthna", hint: "Uthna" }
    ]
  },
  63: {
    title: "Work / Study",
    slides: [
      ...createVocabPair("पढ़ना", "To read", "Action", ["To read", "To write", "To play", "To sing"], ["पढ़ना", "लिखना", "खेलना", "गाना"]),
      ...createVocabPair("लिखना", "To write", "Action", ["To write", "To read", "To draw", "To paint"], ["लिखना", "पढ़ना", "चित्र बनाना", "रंगना"]),
      ...createVocabPair("काम", "Work", "Concept", ["Work", "Study", "Play", "Rest"], ["काम", "पढ़ाई", "खेल", "आराम"]),
      { type: 'pronounce', question: "Say 'To read'", mainChar: "पढ़ना", answer: "padhna", hint: "Padhna" },
      { type: 'pronounce', question: "Say 'To write'", mainChar: "लिखना", answer: "likhna", hint: "Likhna" }
    ]
  },
  64: {
    title: "Food & Meals",
    slides: [
      ...createVocabPair("नाश्ता", "Breakfast", "Meal", ["Breakfast", "Lunch", "Dinner", "Snack"], ["नाश्ता", "दोपहर का भोजन", "रात का खाना", "अल्पाहार"]),
      ...createVocabPair("दोपहर का भोजन", "Lunch", "Meal", ["Lunch", "Breakfast", "Dinner", "Tea"], ["दोपहर का भोजन", "नाश्ता", "रात का खाना", "चाय"]),
      ...createVocabPair("रात का खाना", "Dinner", "Meal", ["Dinner", "Lunch", "Breakfast", "Water"], ["रात का खाना", "दोपहर का भोजन", "नाश्ता", "पानी"]),
      { type: 'pronounce', question: "Say 'Breakfast'", mainChar: "नाश्ता", answer: "nashta", hint: "Nashta" },
      { type: 'pronounce', question: "Say 'Dinner'", mainChar: "रात का खाना", answer: "raat ka khana", hint: "Raat ka khana" }
    ]
  },
  65: {
    title: "Talking About Time",
    slides: [
      ...createVocabPair("समय", "Time", "Concept", ["Time", "Clock", "Day", "Night"], ["समय", "घड़ी", "दिन", "रात"]),
      ...createVocabPair("घड़ी", "Clock", "Object", ["Clock", "Time", "Watch", "Hand"], ["घड़ी", "समय", "घड़ी", "हाथ"]),
      ...createVocabPair("बजे", "O'clock", "Time-telling", ["O'clock", "Hour", "Minute", "Second"], ["बजे", "घंटा", "मिनट", "सेकंड"]),
      { type: 'pronounce', question: "Say 'What time is it?'", mainChar: "कितने बजे हैं?", answer: "kitne baje hain", hint: "Kitne baje hain" },
      { type: 'pronounce', question: "Say 'It is five o'clock'", mainChar: "पाँच बजे हैं", answer: "paanch baje hain", hint: "Paanch baje hain" }
    ]
  },
  66: {
    title: "Talking About Places",
    slides: [
      ...createVocabPair("बाज़ार", "Market", "Place", ["Market", "School", "Hospital", "Park"], ["बाज़ार", "स्कूल", "अस्पताल", "पार्क"]),
      ...createVocabPair("स्कूल", "School", "Place", ["School", "Market", "Home", "Office"], ["स्कूल", "बाज़ार", "घर", "दफ़्तर"]),
      ...createVocabPair("अस्पताल", "Hospital", "Place", ["Hospital", "School", "Store", "Bakery"], ["अस्पताल", "स्कूल", "दुकान", "बेकरी"]),
      { type: 'pronounce', question: "Say 'Market'", mainChar: "बाज़ार", answer: "bazaar", hint: "Bazaar" },
      { type: 'pronounce', question: "Say 'School'", mainChar: "स्कूल", answer: "school", hint: "School" }
    ]
  },
  67: {
    title: "Talking About Hobbies",
    slides: [
      ...createVocabPair("खेलना", "To play", "Action", ["To play", "To sing", "To dance", "To read"], ["खेलना", "गाना", "नाचना", "पढ़ना"]),
      ...createVocabPair("गाना", "To sing", "Action", ["To sing", "To play", "To talk", "To hear"], ["गाना", "खेलना", "बोलना", "सुनना"]),
      ...createVocabPair("नाचना", "To dance", "Action", ["To dance", "To sing", "To jump", "To run"], ["नाचना", "गाना", "कूदना", "दौड़ना"]),
      { type: 'pronounce', question: "Say 'I like to play'", mainChar: "मुझे खेलना पसंद है", answer: "mujhe khelna pasand hai", hint: "Mujhe khelna pasand hai" },
      { type: 'pronounce', question: "Say 'I like to sing'", mainChar: "मुझे गाना पसंद है", answer: "mujhe gaana pasand hai", hint: "Mujhe gaana pasand hai" }
    ]
  },
  68: {
    title: "Talking About Weather",
    slides: [
      ...createVocabPair("मौसम", "Weather", "Concept", ["Weather", "Rain", "Sun", "Cloud"], ["मौसम", "बारिश", "धूप", "बादल"]),
      ...createVocabPair("बारिश", "Rain", "Concept", ["Rain", "Sun", "Cold", "Heat"], ["बारिश", "धूप", "सर्दी", "गर्मी"]),
      ...createVocabPair("धूप", "Sunlight", "Concept", ["Sunlight", "Rain", "Wind", "Storm"], ["धूप", "बारिश", "हवा", "तूफ़ान"]),
      { type: 'pronounce', question: "Say 'Hot'", mainChar: "गर्मी", answer: "garmi", hint: "Garmi" },
      { type: 'pronounce', question: "Say 'Cold'", mainChar: "सर्दी", answer: "sardi", hint: "Sardi" }
    ]
  },
  69: {
    title: "Family Activities",
    slides: [
      ...createVocabPair("साथ में", "Together", "Adverb", ["Together", "Alone", "Fast", "Slow"], ["साथ में", "अकेले", "तेज़", "धीरे"]),
      ...createVocabPair("बात करना", "To talk", "Action", ["To talk", "To listen", "To work", "To see"], ["बात करना", "सुनना", "काम करना", "देखना"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'Together'", audioText: null, options: ["साथ में", "अलग", "दूर", "पास"], answer: "साथ में" },
      { type: 'pronounce', question: "Say 'We talk together'", mainChar: "हम साथ में बात करते हैं", answer: "hum saath mein baat karte hain", hint: "Hum saath mein baat karte hain" }
    ]
  },
  70: {
    title: "Asking About Plans",
    slides: [
      ...createVocabPair("क्या योजना है?", "What is the plan?", "Question", ["What is the plan?", "Where are you going?", "What are you doing?", "When is it?"], ["क्या योजना है?", "आप कहाँ जा रहे हैं?", "आप क्या कर रहे हैं?", "यह कब है?"]),
      ...createVocabPair("योजना", "Plan", "Concept", ["Plan", "Work", "Idea", "Time"], ["योजना", "काम", "विचार", "समय"]),
      { type: 'pronounce', question: "Ask 'What is your plan?'", mainChar: "आपकी क्या योजना है?", answer: "aapki kya yojna hai", hint: "Aapki kya yojna hai" },
      { type: 'pronounce', question: "Say 'No plan'", mainChar: "कोई योजना नहीं", answer: "koi yojna nahi", hint: "Koi yojna nahi" }
    ]
  },
  71: {
    title: "Describing Your Day",
    slides: [
      ...createVocabPair("मेरा दिन अच्छा था", "My day was good", "Statement", ["My day was good", "My day was bad", "My day was busy", "My day was long"], ["मेरा दिन अच्छा था", "मेरा दिन बुरा था", "मेरा दिन व्यस्त था", "मेरा दिन लंबा था"]),
      ...createVocabPair("व्यस्त", "Busy", "Adjective", ["Busy", "Free", "Happy", "Sad"], ["व्यस्त", "खाली", "खुश", "उदास"]),
      { type: 'pronounce', question: "Say 'I am busy'", mainChar: "मैं व्यस्त हूँ", answer: "main vyast hoon", hint: "Main vyast hoon" },
      { type: 'pronounce', question: "Say 'Good day'", mainChar: "अच्छा दिन", answer: "achha din", hint: "Achha din" }
    ]
  },
  72: {
    title: "Listening Practice: Daily Life",
    slides: [
      { type: 'quiz', subtype: 'intro', badge: "Review", title: "Routine Review", question: "What does this mean?", mainChar: "पढ़ना", audioText: "पढ़ना", hint: "Study", options: ["To read", "To play", "To sing", "To dance"], answer: "To read" },
      { type: 'pronounce', question: "Listen and Repeat: Routine", mainChar: "दिनचर्या", answer: "dincharya", hint: "Dincharya" },
      { type: 'pronounce', question: "Listen and Repeat: Morning", mainChar: "सुबह", answer: "subah", hint: "Subah" },
      { type: 'pronounce', question: "Listen and Repeat: Evening", mainChar: "शाम", answer: "shaam", hint: "Shaam" }
    ]
  },
  73: {
    title: "Speaking Practice: Daily Routine",
    slides: [
      { type: 'pronounce', question: "Say 'I wake up at six'", mainChar: "मैं छह बजे उठता हूँ", answer: "main chheh baje uthta hoon", hint: "Main chheh baje uthta hoon" },
      { type: 'pronounce', question: "Say 'I eat breakfast'", mainChar: "मैं नाश्ता करता हूँ", answer: "main nashta karta hoon", hint: "Main nashta karta hoon" },
      { type: 'pronounce', question: "Say 'I go to work'", mainChar: "मैं काम पर जाता हूँ", answer: "main kaam par jata hoon", hint: "Main kaam par jata hoon" },
      { type: 'pronounce', question: "Say 'I read a book'", mainChar: "मैं किताब पढ़ता हूँ", answer: "main kitaab padhta hoon", hint: "Main kitaab padhta hoon" },
      { type: 'pronounce', question: "Say 'I sleep at ten'", mainChar: "मैं दस बजे सोता हूँ", answer: "main das baje sota hoon", hint: "Main das baje sota hoon" }
    ]
  },
  74: {
    title: "Conversation Practice: Activities",
    slides: [
      { type: 'pronounce', question: "Say 'I play football'", mainChar: "मैं फुटबॉल खेलता हूँ", answer: "main football khelta hoon", hint: "Main football khelta hoon" },
      { type: 'pronounce', question: "Say 'She sings well'", mainChar: "वह अच्छा गाती है", answer: "vah achha gaati hai", hint: "Vah achha gaati hai" },
      { type: 'pronounce', question: "Say 'We dance together'", mainChar: "हम साथ में नाचते हैं", answer: "hum saath mein naachte hain", hint: "Hum saath mein naachte hain" },
      { type: 'pronounce', question: "Say 'They are playing'", mainChar: "वे खेल रहे हैं", answer: "ve khel rahe hain", hint: "Ve khel rahe hain" },
      { type: 'pronounce', question: "Say 'Let's go to the park'", mainChar: "चलो पार्क चलते हैं", answer: "chalo park chalte hain", hint: "Chalo park chalte hain" }
    ]
  },
  75: {
    title: "Daily Life Review",
    slides: [
      { type: 'quiz', subtype: 'char_select', question: "Select 'Market'", audioText: null, options: ["बाज़ार", "स्कूल", "पार्क", "घर"], answer: "बाज़ार" },
      { type: 'pronounce', question: "Final Test: Say 'Today is a good day'", mainChar: "आज अच्छा दिन है", answer: "aaj achha din hai", hint: "Aaj achha din hai" },
      { type: 'pronounce', question: "Final Test: Say 'What time do you eat?'", mainChar: "आप कितने बजे खाते हैं?", answer: "aap kitne baje khaate hain", hint: "Aap kitne baje khaate hain" },
      { type: 'pronounce', question: "Final Test: Say 'The weather is good'", mainChar: "मौसम अच्छा है", answer: "mausam achha hai", hint: "Mausam achha hai" },
      { type: 'pronounce', question: "Final Test: Say 'I am ready'", mainChar: "मैं तैयार हूँ", answer: "main taiyaar hoon", hint: "Main taiyaar hoon" }
    ]
  },

  76: {
    title: "Asking for Directions",
    slides: [
      ...createVocabPair("रास्ता", "Direction/Path", "Concept", ["Path", "House", "City", "Country"], ["रास्ता", "घर", "शहर", "देश"]),
      ...createVocabPair("कहाँ है?", "Where is?", "Question", ["Where is?", "What is?", "Who is?", "How is?"], ["कहाँ है?", "क्या है?", "कौन है?", "कैसे है?"]),
      { type: 'pronounce', question: "Ask 'Where is the station?'", mainChar: "स्टेशन कहाँ है?", answer: "station kahaan hai", hint: "Station kahaan hai" },
      { type: 'pronounce', question: "Say 'Straight'", mainChar: "सीधे", answer: "seedhe", hint: "Seedhe" },
      { type: 'pronounce', question: "Say 'Right'", mainChar: "दाएँ", answer: "daayein", hint: "Daayein" },
      { type: 'pronounce', question: "Say 'Left'", mainChar: "बाएँ", answer: "baayein", hint: "Baayein" }
    ]
  },
  77: {
    title: "Shopping Conversation",
    slides: [
      ...createVocabPair("कितना है?", "How much?", "Price Question", ["How much?", "Where is it?", "Who is it?", "What is it?"], ["कितना है?", "यह कहाँ है?", "यह कौन है?", "यह क्या है?"]),
      ...createVocabPair("ये", "This/These", "Object focus", ["This/These", "That/Those", "Here", "There"], ["ये", "वे", "यहाँ", "वहाँ"]),
      ...createVocabPair("सस्ता", "Cheap", "Adjective", ["Cheap", "Expensive", "Good", "Bad"], ["सस्ता", "महँगा", "अच्छा", "बुरा"]),
      { type: 'pronounce', question: "Ask 'What is the price?'", mainChar: "इसकी कीमत क्या है?", answer: "iski keemat kya hai", hint: "Iski keemat kya hai" },
      { type: 'pronounce', question: "Say 'Too expensive'", mainChar: "बहुत महँगा है", answer: "bahut mehanga hai", hint: "Bahut mehanga hai" }
    ]
  },
  78: {
    title: "Ordering Food",
    slides: [
      ...createVocabPair("मुझे चाहिए", "I want", "Request", ["I want", "I don't want", "Give me", "Take this"], ["मुझे चाहिए", "मुझे नहीं चाहिए", "मुझे दो", "यह लो"]),
      ...createVocabPair("मेनू", "Menu", "Object", ["Menu", "Bill", "Food", "Water"], ["मेनू", "बिल", "खाना", "पानी"]),
      { type: 'quiz', subtype: 'char_select', question: "Select 'I want'", audioText: null, options: ["मुझे चाहिए", "मुझे नहीं चाहिए", "यहाँ आओ", "वहाँ जाओ"], answer: "मुझे चाहिए" },
      { type: 'pronounce', question: "Say 'I want water'", mainChar: "मुझे पानी चाहिए", answer: "mujhe paani chahiye", hint: "Mujhe paani chahiye" },
      { type: 'pronounce', question: "Say 'I want tea'", mainChar: "मुझे चाय चाहिए", answer: "mujhe chai chahiye", hint: "Mujhe chai chahiye" }
    ]
  },
  79: {
    title: "Asking for Help",
    slides: [
      ...createVocabPair("मदद", "Help", "Concept", ["Help", "Work", "Play", "Sleep"], ["मदद", "काम", "खेल", "नींद"]),
      ...createVocabPair("पुलिस", "Police", "Object", ["Police", "Doctor", "Teacher", "Friend"], ["पुलिस", "डॉक्टर", "शिक्षक", "दोस्त"]),
      { type: 'pronounce', question: "Say 'Help me!'", mainChar: "मेरी मदद करो!", answer: "meri madad karo", hint: "Meri madad karo" },
      { type: 'pronounce', question: "Say 'I am lost'", mainChar: "मैं खो गया हूँ", answer: "main kho gaya hoon", hint: "Main kho gaya hoon" }
    ]
  },
  80: {
    title: "Talking at the Market",
    slides: [
      ...createVocabPair("ताज़ा", "Fresh", "Adjective", ["Fresh", "Stale", "Good", "Bad"], ["ताज़ा", "बासी", "अच्छा", "बुरा"]),
      ...createVocabPair("फल", "Fruits", "Object", ["Fruits", "Vegetables", "Milk", "Bread"], ["फल", "सब्ज़ियाँ", "दूध", "रोटी"]),
      ...createVocabPair("सब्ज़ियाँ", "Vegetables", "Object", ["Vegetables", "Fruits", "Meat", "Eggs"], ["सब्ज़ियाँ", "फल", "मांस", "अंडे"]),
      { type: 'pronounce', question: "Say 'Give me fresh fruits'", mainChar: "मुझे ताज़ा फल दें", answer: "mujhe taaza phal dein", hint: "Mujhe taaza phal dein" }
    ]
  },
  81: {
    title: "Talking at a Restaurant",
    slides: [
      ...createVocabPair("बिल", "Bill", "Object", ["Bill", "Menu", "Food", "Water"], ["बिल", "मेनू", "खाना", "पानी"]),
      ...createVocabPair("खाना बहुत स्वादिष्ट है", "The food is very delicious", "Compliment", ["Food is delicious", "Food is bad", "Food is cold", "Food is hot"], ["खाना स्वादिष्ट है", "खाना बुरा है", "खाना ठंडा है", "खाना गर्म है"]),
      { type: 'pronounce', question: "Say 'Check please'", mainChar: "बिल मंगाएँ", answer: "bill mangayein", hint: "Bill mangayein" },
      { type: 'pronounce', question: "Say 'Delicious'", mainChar: "स्वादिष्ट", answer: "swadisht", hint: "Swadisht" }
    ]
  },
  82: {
    title: "Bus / Train Station",
    slides: [
      ...createVocabPair("टिकट", "Ticket", "Object", ["Ticket", "Money", "Bag", "Seat"], ["टिकट", "पैसा", "बैग", "सीट"]),
      ...createVocabPair("गाड़ी", "Train/Vehicle", "Vehicle", ["Train", "Bus", "Car", "Plane"], ["गाड़ी", "बस", "कार", "हवाई जहाज़"]),
      { type: 'pronounce', question: "Ask 'Where is the bus?'", mainChar: "बस कहाँ है?", answer: "bus kahaan hai", hint: "Bus kahaan hai" },
      { type: 'pronounce', question: "Say 'One ticket'", mainChar: "एक टिकट", answer: "ek ticket", hint: "Ek ticket" }
    ]
  },
  83: {
    title: "Talking on the Phone",
    slides: [
      ...createVocabPair("हैलो", "Hello (Phone)", "Greeting", ["Hello", "Bye", "Who?", "What?"], ["हैलो", "बाय", "कौन?", "क्या?"]),
      ...createVocabPair("कौन बोल रहा है?", "Who is speaking?", "Phone Question", ["Who is speaking?", "What are you doing?", "Where are you?", "Why?"], ["कौन बोल रहा है?", "आप क्या कर रहे हैं?", "आप कहाँ हैं?", "क्यों?"]),
      { type: 'pronounce', question: "Say 'Hold on'", mainChar: "थोड़ी देर रुकिए", answer: "thodi der rukiye", hint: "Thodi der rukiye" },
      { type: 'pronounce', question: "Say 'Who is this?'", mainChar: "आप कौन हैं?", answer: "aap kaun hain", hint: "Aap kaun hain" }
    ]
  },
  84: {
    title: "Preferences",
    slides: [
      ...createVocabPair("पसंद", "Like", "Expression", ["Like", "Dislike", "Love", "Hate"], ["पसंद", "नापसंद", "प्यार", "नफरत"]),
      ...createVocabPair("बेहतर", "Better", "Comparison", ["Better", "Worse", "Same", "Different"], ["बेहतर", "बुरा", "समान", "अलग"]),
      { type: 'pronounce', question: "Say 'I like this'", mainChar: "मुझे यह पसंद है", answer: "mujhe yeh pasand hai", hint: "Mujhe yeh pasand hai" },
      { type: 'pronounce', question: "Say 'This is better'", mainChar: "यह बेहतर है", answer: "yeh behtar hai", hint: "Yeh behtar hai" }
    ]
  },
  85: {
    title: "Simple Requests",
    slides: [
      ...createVocabPair("कृपया यहाँ आएँ", "Please come here", "Request", ["Please come here", "Please go there", "Please sit", "Please stand"], ["कृपया यहाँ आएँ", "कृपया वहाँ जाएँ", "कृपया बैठें", "कृपया खड़े हों"]),
      ...createVocabPair("एक मिनट", "One minute", "Request", ["One minute", "One hour", "One day", "Wait"], ["एक मिनट", "एक घंटा", "एक दिन", "रुकिए"]),
      { type: 'pronounce', question: "Say 'Please sit down'", mainChar: "कृपया बैठिए", answer: "kripya baithiye", hint: "Kripya baithiye" },
      { type: 'pronounce', question: "Say 'Please wait'", mainChar: "कृपया इंतज़ार कीजिये", answer: "kripya intezaar kijiye", hint: "Kripya intezaar kijiye" }
    ]
  },
  86: {
    title: "Opinions",
    slides: [
      ...createVocabPair("मेरा विचार है", "My opinion is", "Statement", ["My opinion is", "I don't know", "I think", "I am sure"], ["मेरा विचार है", "मुझे नहीं पता", "मुझे लगता है", "मुझे यकीन है"]),
      ...createVocabPair("सही", "Right/Correct", "Opinion", ["Correct", "Wrong", "True", "False"], ["सही", "गलत", "सच", "झूठ"]),
      { type: 'pronounce', question: "Say 'I think so'", mainChar: "मुझे ऐसा लगता है", answer: "mujhe aisa lagta hai", hint: "Mujhe aisa lagta hai" },
      { type: 'pronounce', question: "Say 'You are right'", mainChar: "आप सही हैं", answer: "aap sahi hain", hint: "Aap sahi hain" }
    ]
  },
  87: {
    title: "Listening Practice: Real Situations",
    slides: [
      { type: 'quiz', subtype: 'intro', badge: "Review", title: "World Review", question: "What does this mean?", mainChar: "मदद", audioText: "मदद", hint: "Support", options: ["Help", "Work", "Play", "Sleep"], answer: "Help" },
      { type: 'pronounce', question: "Listen and Repeat: Path", mainChar: "रास्ता", answer: "raasta", hint: "Raasta" },
      { type: 'pronounce', question: "Listen and Repeat: Price", mainChar: "कीमत", answer: "keemat", hint: "Keemat" },
      { type: 'pronounce', question: "Listen and Repeat: Fresh", mainChar: "ताज़ा", answer: "taaza", hint: "Taaza" }
    ]
  },
  88: {
    title: "Speaking Practice: Role Play",
    slides: [
      { type: 'pronounce', question: "Say 'Please help me'", mainChar: "कृपया मेरी मदद करें", answer: "kripya meri madad karein", hint: "Kripya meri madad karein" },
      { type: 'pronounce', question: "Say 'Where is the hospital?'", mainChar: "अस्पताल कहाँ है?", answer: "aspataal kahaan hai", hint: "Aspataal kahaan hai" },
      { type: 'pronounce', question: "Say 'I want a ticket'", mainChar: "मुझे एक टिकट चाहिए", answer: "mujhe ek ticket chahiye", hint: "Mujhe ek ticket chahiye" },
      { type: 'pronounce', question: "Say 'How much is it?'", mainChar: "यह कितने का है?", answer: "yeh kitne ka hai", hint: "Yeh kitne ka hai" },
      { type: 'pronounce', question: "Say 'Thank you very much'", mainChar: "आपका बहुत धन्यवाद", answer: "aapka bahut dhanyavaad", hint: "Aapka bahut dhanyavaad" }
    ]
  },
  89: {
    title: "Real-Life Conversation",
    slides: [
      { type: 'pronounce', question: "Say 'Call the police'", mainChar: "पुलिस को बुलाओ", answer: "police ko bulao", hint: "Police ko bulao" },
      { type: 'pronounce', question: "Say 'I don't understand'", mainChar: "मुझे समझ नहीं आया", answer: "mujhe samajh nahi aaya", hint: "Mujhe samajh nahi aaya" },
      { type: 'pronounce', question: "Say 'Speak slowly please'", mainChar: "कृपया धीरे बोलें", answer: "kripya dheere bolein", hint: "Kripya dheere bolein" },
      { type: 'pronounce', question: "Say 'Is it fresh?'", mainChar: "क्या यह ताज़ा है?", answer: "kya yeh taaza hai", hint: "Kya yeh taaza hai" },
      { type: 'pronounce', question: "Say 'I am waiting'", mainChar: "मैं इंतज़ार कर रहा हूँ", answer: "main intezaar kar raha hoon", hint: "Main intezaar kar raha hoon" }
    ]
  },
  90: {
    title: "Final Communication Review",
    slides: [
      { type: 'quiz', subtype: 'char_select', question: "Select 'I want'", audioText: null, options: ["मुझे चाहिए", "मुझे दो", "यह लो", "वहाँ जाओ"], answer: "मुझे चाहिए" },
      { type: 'pronounce', question: "Final Mastery: Say 'I can speak Hindi'", mainChar: "मैं हिंदी बोल सकता हूँ", answer: "main hindi bol sakta hoon", hint: "Main hindi bol sakta hoon" },
      { type: 'pronounce', question: "Final Mastery: Say 'I love learning'", mainChar: "मुझे सीखना पसंद है", answer: "mujhe seekhna pasand hai", hint: "Mujhe seekhna pasand hai" },
      { type: 'pronounce', question: "Final Mastery: Say 'See you tomorrow'", mainChar: "कल मिलेंगे", answer: "kal milenge", hint: "Kal milenge" },
      { type: 'pronounce', question: "Final Mastery: Say 'Have a nice day'", mainChar: "आपका दिन शुभ हो", answer: "aapka din shubh ho", hint: "Aapka din shubh ho" }
    ]
  },
};

const LearningScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, todayProgress } = useUser();
  const { startStudySession, endStudySession, triggerMilestone, triggerEncouragement } = useNotifications();

  const searchParams = new URLSearchParams(location.search);
  const lessonIdFromUrl = parseInt(searchParams.get('id'), 10);
  const lessonId = lessonIdFromUrl || location.state?.lessonId || 1;
  const initialLessonData = lessonDatabase[lessonId] || lessonDatabase[1];

  // Track whether the component has finished initializing
  // Start as true so the very first render is visible (no blank flash on mount)
  const [isReady, setIsReady] = useState(true);
  const [activeSlides, setActiveSlides] = useState(initialLessonData.slides);
  const [originalCount, setOriginalCount] = useState(initialLessonData.slides.length);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const prevLessonIdRef = React.useRef(lessonId);
  const [isCorrect, setIsCorrect] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mistakeQueue, setMistakeQueue] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Single unified reset when lessonId changes — also counts quiz questions
  useEffect(() => {
    const newData = lessonDatabase[lessonId] || lessonDatabase[1];

    // Only hide-and-reveal when the lesson actually *changes* (not on first mount).
    // This prevents the blank flash when the component first mounts.
    const isLessonChange = prevLessonIdRef.current !== lessonId;
    prevLessonIdRef.current = lessonId;

    if (isLessonChange) {
      setIsReady(false);
    }

    setActiveSlides(newData.slides);
    setOriginalCount(newData.slides.length);
    setCurrentSlideIndex(0);
    setProgress(0);
    setShowSuccess(false);
    setIsReviewMode(false);
    setMistakeQueue([]);
    setIsCorrect(null);
    setSelectedOption(null);
    setNlpFeedback(null);
    setScoreData({
      totalQuestions: newData.slides.filter(s => s.type === 'quiz' || s.type === 'pronounce').length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      firstAttemptCorrect: 0,
      reviewedAndCorrected: 0,
    });

    if (isLessonChange) {
      // Double-schedule: RAF ensures browser painted, setTimeout(0) ensures
      // React committed the state. This eliminates the blank-screen flash.
      const rafId = requestAnimationFrame(() => {
        const timerId = setTimeout(() => setIsReady(true), 0);
        // Store timerId for cleanup
        timerRef.current = timerId;
      });
      return () => {
        cancelAnimationFrame(rafId);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [lessonId]);

  const timerRef = React.useRef(null);

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

  // NOTE: Removed duplicate "Load lesson content" useEffect.
  // Lesson content + question count is now set in the single unified
  // reset effect above to prevent competing state updates that caused
  // blank-screen flashes.

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
  if (!slide || !isReady) return (
    <div className="learning-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '16px' }}>
      <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.15)', borderTopColor: '#58cc02', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '1.1rem', opacity: 0.8 }}>Loading Lesson...</span>
    </div>
  );

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
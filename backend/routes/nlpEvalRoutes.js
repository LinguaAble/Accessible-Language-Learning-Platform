/**
 * LinguaAble — NLP Evaluation Routes (Backend)
 * Save this file to: backend/routes/nlpEvalRoutes.js
 *
 * Then in backend/index.js add these 2 lines:
 *   const nlpEvalRoutes = require('./routes/nlpEvalRoutes');   // after line 6
 *   app.use('/api/eval', nlpEvalRoutes);                       // after line 16
 *
 * Then run in your backend folder:
 *   npm install natural string-similarity
 *
 * No other files are affected.
 */

const express = require('express');
const router = express.Router();
const natural = require('natural');
const stringSimilarity = require('string-similarity');

// ─── Hindi → Roman transliteration lookup ────────────────────────────────────
const HINDI_TO_ROMAN = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee',
  'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'अं': 'ang', 'अः': 'aha',
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
  'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
  'श': 'sha', 'ष': 'shha', 'स': 'sa', 'ह': 'ha',
  'क्ष': 'ksha', 'त्र': 'tra', 'ज्ञ': 'gya',
  'नमस्ते': 'namaste', 'मैं': 'main', 'तुम': 'tum',
  'वह': 'vah', 'हम': 'hum', 'क्या': 'kya',
  'कहाँ': 'kahaan', 'कब': 'kab',
  'बिल्कुल': 'bilkul', 'शायद': 'shayad',
  'सुप्रभात': 'suprabhat', 'शुभ संध्या': 'shubh sandhya',
};

// ─── Character-level Devanagari to Roman transliteration map ──────────────────
const DEVA_CHAR_MAP = {
  'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au','अं':'am','अः':'ah',
  'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
  'च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
  'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
  'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
  'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m',
  'य':'y','र':'r','ल':'l','व':'v',
  'श':'sh','ष':'sh','स':'s','ह':'h',
  'क्ष':'ksh','त्र':'tr','ज्ञ':'gy',
  '़':'', 'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ं':'n','ँ':'n','ः':'h','्':''
};

function devanagariToRoman(str) {
  let res = '';
  for (const ch of str || '') {
    if (DEVA_CHAR_MAP[ch] !== undefined) res += DEVA_CHAR_MAP[ch];
    else if (/[a-zA-Z0-9]/.test(ch)) res += ch.toLowerCase();
  }
  return res;
}

// Strips virama/halant, nukta, chandrabindu, anusvara, punctuation, and whitespace
function normalizeHindi(str) {
  return (str || '').replace(/[\u094D\u093C\u0901\u0902\s\u0964\u0965.,!?]/g, '');
}

// ─── Phonetic normalizer ──────────────────────────────────────────────────────
function phoneticallyNormalize(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, '')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/shh/g, 'sh')
    .replace(/ph/g, 'f')
    .replace(/v/g, 'b'); // v and b are interchangeable in Hindi phonetics
}

// ─── Core NLP evaluator ───────────────────────────────────────────────────────
function evaluatePronunciation(transcript, expectedAnswer, expectedHindi) {
  if (!transcript || transcript.trim() === '') {
    return { isCorrect: false, confidence: 0, feedback: 'No speech detected. Please try again.', matchType: 'none' };
  }

  const t = transcript.trim();
  const tLow = t.toLowerCase();
  const expected = (expectedAnswer || '').trim().toLowerCase();
  const expectedH = (expectedHindi || '').trim();

  // 1. Direct or normalized Hindi match (handles बिल्कुल == बिलकुल, विल्कुल == विलकुल)
  const normHindiT = normalizeHindi(t);
  const normHindiE = normalizeHindi(expectedH);
  if (normHindiE.length > 0 && (normHindiT.includes(normHindiE) || normHindiE.includes(normHindiT))) {
    return { isCorrect: true, confidence: 1.0, feedback: '🎉 Perfect pronunciation!', matchType: 'exact_hindi' };
  }

  // 2. Exact Roman match
  if (tLow === expected || tLow.includes(expected)) {
    return { isCorrect: true, confidence: 0.98, feedback: '✅ Excellent!', matchType: 'exact_roman' };
  }

  // 3. Devanagari converted to Roman
  const devaRoman = devanagariToRoman(t);
  if (devaRoman && (devaRoman === expected || devaRoman.includes(expected) || expected.includes(devaRoman))) {
    return { isCorrect: true, confidence: 0.95, feedback: '🎉 Perfect pronunciation!', matchType: 'transliteration' };
  }

  // 4. Word-level transliteration dictionary
  const romanFromTranscript = HINDI_TO_ROMAN[t.trim()] || '';
  if (romanFromTranscript && (romanFromTranscript === expected || romanFromTranscript.includes(expected))) {
    return { isCorrect: true, confidence: 0.95, feedback: '✅ Great pronunciation!', matchType: 'transliteration' };
  }

  // 5. Phonetic normalization (collapses vowels, consonants, and spaces)
  const normT = phoneticallyNormalize(tLow);
  const normE = phoneticallyNormalize(expected);
  const normTNoSpace = normT.replace(/\s+/g, '');
  const normENoSpace = normE.replace(/\s+/g, '');
  if (normTNoSpace === normENoSpace || normTNoSpace.includes(normENoSpace)) {
    return { isCorrect: true, confidence: 0.92, feedback: '✅ Good pronunciation!', matchType: 'phonetic_norm' };
  }

  // 6. Devanagari converted + phonetic normalization (handles "विल्कुल" -> "vilkul" -> "bilkul")
  if (devaRoman) {
    const normDeva = phoneticallyNormalize(devaRoman);
    if (normDeva === normENoSpace || normDeva.includes(normENoSpace)) {
      return { isCorrect: true, confidence: 0.90, feedback: '✅ Good pronunciation!', matchType: 'deva_phonetic' };
    }
  }

  // 7. Double Metaphone (handles "bill cool" == "bilkul")
  const metaphone = natural.DoubleMetaphone;
  const tCodes = metaphone.process(normTNoSpace);
  const eCodes = metaphone.process(normENoSpace);
  const metaphoneMatch = tCodes[0] === eCodes[0] || tCodes[1] === eCodes[1] || tCodes[0] === eCodes[1];
  const levenCheck = natural.LevenshteinDistance(normTNoSpace, normENoSpace);
  const levenSimCheck = 1 - levenCheck / (Math.max(normTNoSpace.length, normENoSpace.length) || 1);
  if (metaphoneMatch && levenSimCheck >= 0.50) {
    return { isCorrect: true, confidence: 0.85, feedback: '✅ Close enough — well done!', matchType: 'metaphone' };
  }

  // 8. Levenshtein distance (fuzzy match >=70%)
  const leven = natural.LevenshteinDistance(normTNoSpace, normENoSpace);
  const maxLen = Math.max(normTNoSpace.length, normENoSpace.length) || 1;
  const levenSim = 1 - leven / maxLen;
  if (levenSim >= 0.70) {
    return { isCorrect: true, confidence: levenSim, feedback: '✅ Very close! Minor difference.', matchType: 'fuzzy_levenshtein' };
  }

  // 9. Dice/Bigram string similarity (>=65%)
  const dice = stringSimilarity.compareTwoStrings(normTNoSpace, normENoSpace);
  if (dice >= 0.65) {
    return { isCorrect: true, confidence: dice, feedback: '✅ Almost there!', matchType: 'dice_similarity' };
  }

  // 10. Partial word match (handles STT returning extra surrounding words)
  const words = normT.split(/\s+/);
  for (const word of words) {
    const wordSim = stringSimilarity.compareTwoStrings(word, normENoSpace);
    if (wordSim >= 0.75) {
      return { isCorrect: true, confidence: wordSim, feedback: '✅ Good — I heard it!', matchType: 'partial_word' };
    }
  }

  // Incorrect - show transparent feedback with what was heard
  const bestSim = Math.max(levenSim, dice);
  const feedback = `❌ Not quite. I heard "${transcript}". The correct sound is "${expectedAnswer}".`;

  return { isCorrect: false, confidence: bestSim, feedback, matchType: 'no_match' };
}

// ─── Route ────────────────────────────────────────────────────────────────────
// POST /api/eval/pronunciation
// Body: { transcript, expectedAnswer, expectedHindi }
router.post('/pronunciation', (req, res) => {
  const { transcript, expectedAnswer, expectedHindi } = req.body;
  if (!transcript || !expectedAnswer) {
    return res.status(400).json({ message: 'transcript and expectedAnswer are required.' });
  }
  const result = evaluatePronunciation(transcript, expectedAnswer, expectedHindi || '');
  return res.json(result);
});

module.exports = router;
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
};

// ─── Phonetic normalizer ──────────────────────────────────────────────────────
function phoneticallyNormalize(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, '')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/shh/g, 'sh');
}

// ─── Core NLP evaluator ───────────────────────────────────────────────────────
function evaluatePronunciation(transcript, expectedAnswer, expectedHindi) {
  if (!transcript || transcript.trim() === '') {
    return { isCorrect: false, confidence: 0, feedback: 'No speech detected. Please try again.', matchType: 'none' };
  }

  const t = transcript.trim();
  const tLow = t.toLowerCase();
  const expected = (expectedAnswer || '').trim().toLowerCase();
  const expectedH = (expectedHindi || '').trim().replace(/ँ/g, 'ं');

  // 1. Exact Hindi match
  if (expectedH.length > 0 && t.replace(/ँ/g, 'ं').includes(expectedH)) {
    return { isCorrect: true, confidence: 1.0, feedback: '🎉 Perfect pronunciation!', matchType: 'exact_hindi' };
  }

  // 2. Exact Roman match
  if (tLow === expected || tLow.includes(expected)) {
    return { isCorrect: true, confidence: 0.98, feedback: '✅ Excellent!', matchType: 'exact_roman' };
  }

  // 3. Transliteration match
  const romanFromTranscript = HINDI_TO_ROMAN[t.trim()] || '';
  if (romanFromTranscript && (romanFromTranscript === expected || romanFromTranscript.includes(expected))) {
    return { isCorrect: true, confidence: 0.95, feedback: '✅ Great pronunciation!', matchType: 'transliteration' };
  }

  // 4. Phonetic normalization
  const normT = phoneticallyNormalize(tLow);
  const normE = phoneticallyNormalize(expected);
  if (normT === normE || normT.includes(normE)) {
    return { isCorrect: true, confidence: 0.90, feedback: '✅ Good pronunciation!', matchType: 'phonetic_norm' };
  }

  // 5. Double Metaphone (English phonetic algorithm — great for romanized Hindi)
  // 5. Double Metaphone — only accept if Levenshtein is also close
  const metaphone = new natural.DoubleMetaphone();
  const tCodes = metaphone.process(normT.replace(/\s+/g, ''));
  const eCodes = metaphone.process(normE.replace(/\s+/g, ''));
  const metaphoneMatch = tCodes[0] === eCodes[0] || tCodes[1] === eCodes[1] || tCodes[0] === eCodes[1];
  const levenCheck = natural.LevenshteinDistance(normT, normE);
  const levenSimCheck = 1 - levenCheck / (Math.max(normT.length, normE.length) || 1);
  if (metaphoneMatch && levenSimCheck >= 0.60) {
    return { isCorrect: true, confidence: 0.85, feedback: '✅ Close enough — well done!', matchType: 'metaphone' };
  }

  // 6. Levenshtein distance (fuzzy match >=75%)
  const leven = natural.LevenshteinDistance(normT, normE);
  const maxLen = Math.max(normT.length, normE.length) || 1;
  const levenSim = 1 - leven / maxLen;
  if (levenSim >= 0.75) {
    return { isCorrect: true, confidence: levenSim, feedback: '✅ Very close! Minor difference.', matchType: 'fuzzy_levenshtein' };
  }

  // 7. Dice/Bigram string similarity (>=70%)
  const dice = stringSimilarity.compareTwoStrings(normT, normE);
  if (dice >= 0.70) {
    return { isCorrect: true, confidence: dice, feedback: '✅ Almost there!', matchType: 'dice_similarity' };
  }

  // 8. Partial word match (handles STT returning extra surrounding words)
  const words = normT.split(/\s+/);
  for (const word of words) {
    const wordSim = stringSimilarity.compareTwoStrings(word, normE);
    if (wordSim >= 0.80) {
      return { isCorrect: true, confidence: wordSim, feedback: '✅ Good — I heard it!', matchType: 'partial_word' };
    }
  }

  // Incorrect
  const bestSim = Math.max(levenSim, dice);
  const feedback = bestSim > 0.5
    ? `❌ Almost! You said "${transcript}" — try again for "${expectedAnswer}".`
    : `❌ Not quite. The correct sound is "${expectedAnswer}".`;

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
/**
 * LinguaAble — NLP Evaluation Service (Frontend)
 * Save this file to: src/utils/nlpEvalService.js
 *
 * Provides evaluatePronunciation() used in LearningScreen.jsx.
 * Tries the backend API first (which uses Double Metaphone).
 * Falls back to local 7-layer evaluation if server is unreachable.
 * No other files are affected.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Hindi → Roman transliteration lookup ───────────────────────────────────
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
  'नमस्ते': 'namaste', 'धन्यवाद': 'dhanyavaad',
  'माँ': 'maa', 'पापा': 'papa', 'भाई': 'bhai', 'बहन': 'behen',
  'एक': 'ek', 'दो': 'do', 'तीन': 'teen', 'चार': 'chaar', 'पाँच': 'paanch',
  'छह': 'chhah', 'सात': 'saat', 'आठ': 'aath', 'नौ': 'nau', 'दस': 'das',
  'लाल': 'laal', 'नीला': 'neela', 'हरा': 'hara', 'पीला': 'peela',
  'मैं': 'main', 'तुम': 'tum', 'वह': 'vah', 'हम': 'hum',
  'खाना': 'khana', 'पानी': 'paani', 'दूध': 'doodh',
  'जाना': 'jaana', 'आना': 'aana', 'सोना': 'sona',
  'मैं हूँ': 'main hoon', 'तुम हो': 'tum ho',
  'वह है': 'vah hai', 'हम हैं': 'hum hain',
  'मैं खाता हूँ': 'main khaata hoon',
  'मैं जाता हूँ': 'main jaata hoon',
  'क्या': 'kya', 'कहाँ': 'kahaan', 'कब': 'kab',
  'बड़ा': 'bada', 'छोटा': 'chhota',
  'खुश': 'khush', 'उदास': 'udaas',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const normalizeHindi = (s = '') => s.trim().replace(/ँ/g, 'ं');

const phoneticallyNormalize = (s = '') =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, '')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/shh/g, 'sh');

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function diceSimilarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = (s) => {
    const map = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s[i] + s[i + 1];
      map.set(bg, (map.get(bg) || 0) + 1);
    }
    return map;
  };
  const aBig = bigrams(a), bBig = bigrams(b);
  let intersection = 0;
  for (const [bg, count] of aBig)
    intersection += Math.min(count, bBig.get(bg) || 0);
  return (2 * intersection) / (a.length - 1 + b.length - 1);
}

// ─── Local 7-layer evaluator (no server needed) ───────────────────────────────
export function localEvaluatePronunciation(transcript, expectedAnswer, expectedHindi = '') {
  if (!transcript?.trim()) {
    return { isCorrect: false, confidence: 0, feedback: 'No speech detected. Please try again.', matchType: 'none' };
  }

  const t = transcript.trim();
  const tLow = t.toLowerCase();
  const expected = (expectedAnswer || '').trim().toLowerCase();
  const expectedH = normalizeHindi(expectedHindi);

  // 1. Exact Hindi match
  if (expectedH.length > 0 && normalizeHindi(t).includes(expectedH)) {
    return { isCorrect: true, confidence: 1.0, feedback: '🎉 Perfect pronunciation!', matchType: 'exact_hindi' };
  }

  // 2. Exact Roman match
  if (tLow === expected || tLow.includes(expected)) {
    return { isCorrect: true, confidence: 0.98, feedback: '✅ Excellent!', matchType: 'exact_roman' };
  }

  // 3. Transliteration: Hindi spoken → convert to Roman → compare
  const romanOfHindi = HINDI_TO_ROMAN[t.trim()] || '';
  if (romanOfHindi && (romanOfHindi === expected || romanOfHindi.includes(expected))) {
    return { isCorrect: true, confidence: 0.95, feedback: '✅ Great pronunciation!', matchType: 'transliteration' };
  }

  // 4. Phonetic normalization (handles "kaa" = "ka", "shh" = "sh", etc.)
  const normT = phoneticallyNormalize(tLow);
  const normE = phoneticallyNormalize(expected);
  if (normT === normE || normT.includes(normE)) {
    return { isCorrect: true, confidence: 0.90, feedback: '✅ Good pronunciation!', matchType: 'phonetic_norm' };
  }

  // 5. Levenshtein fuzzy match (>=75% similar)
  const leven = levenshtein(normT, normE);
  const maxLen = Math.max(normT.length, normE.length) || 1;
  const levenSim = 1 - leven / maxLen;
  if (levenSim >= 0.75) {
    return { isCorrect: true, confidence: levenSim, feedback: '✅ Very close! Minor difference.', matchType: 'fuzzy_levenshtein' };
  }

  // 6. Dice/Bigram similarity (>=70% similar)
  const dice = diceSimilarity(normT, normE);
  if (dice >= 0.70) {
    return { isCorrect: true, confidence: dice, feedback: '✅ Almost there!', matchType: 'dice_similarity' };
  }

  // 7. Partial word match (handles STT returning extra words around the target)
  for (const word of normT.split(/\s+/)) {
    const wordDice = diceSimilarity(word, normE);
    if (wordDice >= 0.80) {
      return { isCorrect: true, confidence: wordDice, feedback: '✅ Good — I heard it!', matchType: 'partial_word' };
    }
  }

  // Incorrect
  const bestSim = Math.max(levenSim, dice);
  const feedback = bestSim > 0.5
    ? `❌ Almost! You said "${transcript}" — try again for "${expectedAnswer}".`
    : `❌ Not quite. The correct sound is "${expectedAnswer}".`;

  return { isCorrect: false, confidence: bestSim, feedback, matchType: 'no_match' };
}

// ─── Server-side evaluator (adds Double Metaphone on top) ────────────────────
// Falls back to localEvaluatePronunciation if server is unreachable.
export async function evaluatePronunciation(transcript, expectedAnswer, expectedHindi = '') {
  try {
    const res = await fetch(`${API_BASE}/api/eval/pronunciation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, expectedAnswer, expectedHindi }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NLP Eval] Server unavailable, using local evaluator:', err.message);
    return localEvaluatePronunciation(transcript, expectedAnswer, expectedHindi);
  }
}

// ─── Confidence badge helper (used in pronounce slide UI) ────────────────────
export function getConfidenceBadge(confidence) {
  if (confidence >= 0.95) return { label: 'Excellent', color: '#2ecc71', emoji: '🌟' };
  if (confidence >= 0.85) return { label: 'Great',     color: '#27ae60', emoji: '✅' };
  if (confidence >= 0.75) return { label: 'Good',      color: '#f39c12', emoji: '👍' };
  if (confidence >= 0.60) return { label: 'Close',     color: '#e67e22', emoji: '🔄' };
  return                         { label: 'Try Again', color: '#e74c3c', emoji: '❌' };
}
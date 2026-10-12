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
const normalizeHindi = (s = '') => s.trim().replace(/[\u094D\u093C\u0901\u0902\s\u0964\u0965.,!?]/g, '');

const phoneticallyNormalize = (s = '') =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, '')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/shh/g, 'sh')
    .replace(/ph/g, 'f')
    .replace(/v/g, 'b'); // v and b are interchangeable in Hindi phonetics

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

  // 4. Word-level transliteration lookup
  const romanOfHindi = HINDI_TO_ROMAN[t.trim()] || '';
  if (romanOfHindi && (romanOfHindi === expected || romanOfHindi.includes(expected))) {
    return { isCorrect: true, confidence: 0.95, feedback: '✅ Great pronunciation!', matchType: 'transliteration' };
  }

  // 5. Phonetic normalization (collapses vowels, consonants, and spaces)
  const normT = phoneticallyNormalize(tLow);
  const normE = phoneticallyNormalize(expected);
  const normTNoSpace = normT.replace(/\s+/g, '');
  const normENoSpace = normE.replace(/\s+/g, '');
  if (normTNoSpace === normENoSpace || normTNoSpace.includes(normENoSpace)) {
    return { isCorrect: true, confidence: 0.90, feedback: '✅ Good pronunciation!', matchType: 'phonetic_norm' };
  }

  // 6. Devanagari converted + phonetic normalization
  if (devaRoman) {
    const normDeva = phoneticallyNormalize(devaRoman);
    if (normDeva === normENoSpace || normDeva.includes(normENoSpace)) {
      return { isCorrect: true, confidence: 0.90, feedback: '✅ Good pronunciation!', matchType: 'deva_phonetic' };
    }
  }

  // 7. Levenshtein fuzzy match (>=70% similar)
  const leven = levenshtein(normTNoSpace, normENoSpace);
  const maxLen = Math.max(normTNoSpace.length, normENoSpace.length) || 1;
  const levenSim = 1 - leven / maxLen;
  if (levenSim >= 0.70) {
    return { isCorrect: true, confidence: levenSim, feedback: '✅ Very close! Minor difference.', matchType: 'fuzzy_levenshtein' };
  }

  // 8. Dice/Bigram similarity (>=65% similar)
  const dice = diceSimilarity(normTNoSpace, normENoSpace);
  if (dice >= 0.65) {
    return { isCorrect: true, confidence: dice, feedback: '✅ Almost there!', matchType: 'dice_similarity' };
  }

  // 9. Partial word match (handles STT returning extra words around the target)
  for (const word of normT.split(/\s+/)) {
    const wordDice = diceSimilarity(word, normENoSpace);
    if (wordDice >= 0.75) {
      return { isCorrect: true, confidence: wordDice, feedback: '✅ Good — I heard it!', matchType: 'partial_word' };
    }
  }

  // Incorrect - show transparent feedback with what was heard
  const bestSim = Math.max(levenSim, dice);
  const feedback = `❌ Not quite. I heard "${transcript}". The correct sound is "${expectedAnswer}".`;

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
// Lesson data ported from the frontend LearningScreen.jsx
// Contains all lessons with their slides: quiz, teach, and pronounce types.

class LessonSlide {
  final String type; // 'quiz', 'teach', 'pronounce'
  final String? subtype; // 'intro', 'char_select'
  final String? badge;
  final String? title;
  final String? question;
  final String? mainChar;
  final String? audioText;
  final String? hint;
  final String? instruction;
  final List<String>? options;
  final String? answer;
  final bool isReview;

  const LessonSlide({
    required this.type,
    this.subtype,
    this.badge,
    this.title,
    this.question,
    this.mainChar,
    this.audioText,
    this.hint,
    this.instruction,
    this.options,
    this.answer,
    this.isReview = false,
  });

  LessonSlide copyWithReview() => LessonSlide(
        type: type,
        subtype: subtype,
        badge: badge,
        title: title,
        question: question,
        mainChar: mainChar,
        audioText: audioText,
        hint: hint,
        instruction: instruction,
        options: options,
        answer: answer,
        isReview: true,
      );
}

class Lesson {
  final String title;
  final List<LessonSlide> slides;

  const Lesson({required this.title, required this.slides});
}

// --- Helpers ---
List<LessonSlide> _charPair(
  String hindiChar,
  String englishSound,
  String hintText,
  List<String> optionsEnglish,
  List<String> optionsHindi,
) {
  return [
    LessonSlide(
      type: 'quiz',
      subtype: 'intro',
      badge: 'New Character',
      title: 'New Letter',
      question: 'What sound does this letter make?',
      mainChar: hindiChar,
      audioText: hindiChar,
      hint: hintText,
      options: optionsEnglish,
      answer: englishSound,
    ),
    LessonSlide(
      type: 'quiz',
      subtype: 'char_select',
      question: "Select the correct character for '$englishSound'",
      audioText: hindiChar,
      options: optionsHindi,
      answer: hindiChar,
    ),
  ];
}

List<LessonSlide> _vocabPair(
  String hindiWord,
  String englishMeaning,
  String hintText,
  List<String> optionsEnglish,
  List<String> optionsHindi,
) {
  return [
    LessonSlide(
      type: 'quiz',
      subtype: 'intro',
      badge: 'New Word',
      title: 'New Vocabulary',
      question: 'What does this word mean?',
      mainChar: hindiWord,
      audioText: hindiWord,
      hint: hintText,
      options: optionsEnglish,
      answer: englishMeaning,
    ),
    LessonSlide(
      type: 'quiz',
      subtype: 'char_select',
      question: "Select the Hindi word for '$englishMeaning'",
      options: optionsHindi,
      answer: hindiWord,
    ),
  ];
}

// --- DATA ---
final _vowelsPart1 = [
  ..._charPair('अ', 'a', "Like 'a' in 'America'", ['a', 'aa', 'i', 'ee'], ['अ', 'आ', 'इ', 'ई']),
  ..._charPair('आ', 'aa', "Like 'a' in 'Father'", ['a', 'aa', 'u', 'oo'], ['अ', 'आ', 'उ', 'ऊ']),
  ..._charPair('इ', 'i', "Like 'i' in 'Sit'", ['aa', 'i', 'ee', 'u'], ['इ', 'ई', 'अ', 'आ']),
  ..._charPair('ई', 'ee', "Like 'ee' in 'Feet'", ['i', 'ee', 'u', 'oo'], ['इ', 'ई', 'उ', 'ऊ']),
  ..._charPair('उ', 'u', "Like 'u' in 'Put'", ['u', 'oo', 'a', 'aa'], ['उ', 'ऊ', 'अ', 'आ']),
  ..._charPair('ऊ', 'oo', "Like 'oo' in 'Boot'", ['u', 'oo', 'i', 'ee'], ['उ', 'ऊ', 'इ', 'ई']),
];

final _vowelsPart2 = [
  ..._charPair('ऋ', 'ri', "Like 'ri' in 'Krishna'", ['ri', 'e', 'ai', 'o'], ['ऋ', 'ए', 'ऐ', 'ओ']),
  ..._charPair('ए', 'e', "Like 'a' in 'Kate'", ['ri', 'e', 'ai', 'o'], ['ए', 'ऐ', 'ओ', 'औ']),
  ..._charPair('ऐ', 'ai', "Like 'ai' in 'Hair'", ['e', 'ai', 'o', 'au'], ['ए', 'ऐ', 'ओ', 'औ']),
  ..._charPair('ओ', 'o', "Like 'o' in 'Go'", ['ai', 'o', 'au', 'ang'], ['ओ', 'औ', 'अं', 'अः']),
  ..._charPair('औ', 'au', "Like 'au' in 'August'", ['o', 'au', 'ang', 'aha'], ['ओ', 'औ', 'अं', 'अः']),
  ..._charPair('अं', 'ang', "Nasal 'n' sound", ['au', 'ang', 'aha', 'ri'], ['अं', 'अः', 'ऋ', 'ए']),
  ..._charPair('अः', 'aha', "Breathy 'h' sound", ['ang', 'aha', 'a', 'aa'], ['अं', 'अः', 'अ', 'आ']),
];

final _consonantsL4 = [
  ..._charPair('क', 'ka', "Like 'k' in 'Skate'", ['ka', 'kha', 'ga', 'cha'], ['क', 'ख', 'ग', 'घ']),
  ..._charPair('ख', 'kha', "Like 'kh' in 'Khan'", ['ka', 'kha', 'ga', 'gha'], ['क', 'ख', 'ग', 'घ']),
  ..._charPair('ग', 'ga', "Like 'g' in 'Go'", ['ga', 'gha', 'ka', 'ng'], ['ग', 'घ', 'क', 'ङ']),
  ..._charPair('घ', 'gha', "Like 'gh' in 'Ghost'", ['ga', 'gha', 'ka', 'cha'], ['ग', 'घ', 'क', 'च']),
  ..._charPair('ङ', 'nga', "Nasal 'ng'", ['nga', 'ka', 'cha', 'ja'], ['ङ', 'क', 'च', 'छ']),
  ..._charPair('च', 'cha', "Like 'ch' in 'Chat'", ['cha', 'chha', 'ja', 'ka'], ['च', 'छ', 'ज', 'क']),
];

final _consonantsL5 = [
  ..._charPair('छ', 'chha', "Strong 'chh'", ['cha', 'chha', 'ja', 'jha'], ['च', 'छ', 'ज', 'झ']),
  ..._charPair('ज', 'ja', "Like 'j' in 'Jar'", ['ja', 'jha', 'cha', 'nya'], ['ज', 'झ', 'च', 'ञ']),
  ..._charPair('झ', 'jha', "Aspirated 'jh'", ['ja', 'jha', 'ka', 'ga'], ['ज', 'झ', 'क', 'ग']),
  ..._charPair('ञ', 'nya', "Nasal 'nya'", ['nya', 'ja', 'na', 'ma'], ['ञ', 'ज', 'न', 'म']),
  ..._charPair('ट', 'Ta', "Retroflex 'T'", ['Ta', 'Tha', 'Da', 'ta'], ['ट', 'ठ', 'ड', 'त']),
  ..._charPair('ठ', 'Tha', "Retroflex 'Th'", ['Ta', 'Tha', 'Da', 'Dha'], ['ट', 'ठ', 'ड', 'ढ']),
];

final _consonantsL6 = [
  ..._charPair('ड', 'Da', "Retroflex 'D'", ['Da', 'Dha', 'da', 'dha'], ['ड', 'ढ', 'द', 'ध']),
  ..._charPair('ढ', 'Dha', "Retroflex 'Dh'", ['Da', 'Dha', 'Na', 'na'], ['ड', 'ढ', 'ण', 'न']),
  ..._charPair('ण', 'Na', "Retroflex 'N'", ['Na', 'ma', 'na', 'nga'], ['ण', 'म', 'न', 'ङ']),
  ..._charPair('त', 'ta', "Soft 't' (pasta)", ['ta', 'tha', 'da', 'Ta'], ['त', 'थ', 'द', 'ट']),
  ..._charPair('थ', 'tha', "Soft 'th' (thanks)", ['ta', 'tha', 'da', 'dha'], ['त', 'थ', 'द', 'ध']),
  ..._charPair('द', 'da', "Soft 'd' (the)", ['da', 'dha', 'ta', 'Da'], ['द', 'ध', 'त', 'ड']),
];

final _consonantsL7 = [
  ..._charPair('ध', 'dha', "Soft 'dh'", ['da', 'dha', 'na', 'Dha'], ['द', 'ध', 'न', 'ढ']),
  ..._charPair('न', 'na', "Like 'n' in 'No'", ['na', 'ma', 'pa', 'la'], ['न', 'म', 'प', 'ल']),
  ..._charPair('प', 'pa', "Like 'p' in 'Spin'", ['pa', 'pha', 'ba', 'ma'], ['प', 'फ', 'ब', 'म']),
  ..._charPair('फ', 'pha', "Like 'ph' in 'Phone'", ['pa', 'pha', 'ba', 'bha'], ['प', 'फ', 'ब', 'भ']),
  ..._charPair('ब', 'ba', "Like 'b' in 'Bat'", ['ba', 'bha', 'pa', 'va'], ['ब', 'भ', 'प', 'व']),
  ..._charPair('भ', 'bha', "Aspirated 'bh'", ['ba', 'bha', 'ma', 'pa'], ['ब', 'भ', 'म', 'प']),
];

final _consonantsL8 = [
  ..._charPair('म', 'ma', "Like 'm' in 'Man'", ['ma', 'na', 'ba', 'pa'], ['म', 'न', 'ब', 'प']),
  ..._charPair('य', 'ya', "Like 'y' in 'Yes'", ['ya', 'ra', 'la', 'va'], ['य', 'र', 'ल', 'व']),
  ..._charPair('र', 'ra', "Like 'r' in 'Run'", ['ra', 'la', 'ya', 'va'], ['र', 'ल', 'य', 'व']),
  ..._charPair('ल', 'la', "Like 'l' in 'Love'", ['la', 'ra', 'ya', 'va'], ['ल', 'र', 'य', 'व']),
  ..._charPair('व', 'va', "Like 'v' in 'Very'", ['va', 'ba', 'la', 'ya'], ['व', 'ब', 'ल', 'य']),
  ..._charPair('श', 'sha', "Soft 'sh' (Ship)", ['sha', 'shha', 'sa', 'ha'], ['श', 'ष', 'स', 'ह']),
];

final _consonantsL9 = [
  ..._charPair('ष', 'shha', "Retroflex 'sh'", ['shha', 'sha', 'sa', 'ha'], ['ष', 'श', 'स', 'ह']),
  ..._charPair('स', 'sa', "Like 's' in 'Sun'", ['sa', 'sha', 'shha', 'ha'], ['स', 'श', 'ष', 'ह']),
  ..._charPair('ह', 'ha', "Like 'h' in 'Home'", ['ha', 'sa', 'sha', 'ka'], ['ह', 'स', 'श', 'क']),
  ..._charPair('क्ष', 'ksha', "Conjunct k+sh", ['ksha', 'tra', 'gya', 'ka'], ['क्ष', 'त्र', 'ज्ञ', 'क']),
  ..._charPair('त्र', 'tra', "Conjunct t+r", ['tra', 'ksha', 'gya', 'ta'], ['त्र', 'क्ष', 'ज्ञ', 'त']),
  ..._charPair('ज्ञ', 'gya', "Conjunct g+y", ['gya', 'tra', 'ksha', 'ga'], ['ज्ञ', 'त्र', 'क्ष', 'ग']),
];

// Randomize and pick N slides
List<LessonSlide> _randomMix(List<LessonSlide> source, int count) {
  final copy = List<LessonSlide>.from(source)..shuffle();
  return copy.take(count).toList();
}

final Map<int, Lesson> lessonDatabase = {
  1: Lesson(title: 'Vowels Part 1', slides: _vowelsPart1),
  2: Lesson(title: 'Vowels Part 2', slides: _vowelsPart2),
  3: Lesson(title: 'Recap: Vowels', slides: _randomMix([..._vowelsPart1, ..._vowelsPart2], 15)),
  4: Lesson(title: 'Consonants 1', slides: _consonantsL4),
  5: Lesson(title: 'Consonants 2', slides: _consonantsL5),
  6: Lesson(title: 'Consonants 3', slides: _consonantsL6),
  7: Lesson(title: 'Consonants 4', slides: _consonantsL7),
  8: Lesson(title: 'Consonants 5', slides: _consonantsL8),
  9: Lesson(title: 'Consonants 6', slides: _consonantsL9),
  10: Lesson(title: 'Grand Review', slides: _randomMix([
    ..._vowelsPart1, ..._vowelsPart2,
    ..._consonantsL4, ..._consonantsL5, ..._consonantsL6,
    ..._consonantsL7, ..._consonantsL8, ..._consonantsL9,
  ], 20)),
  11: Lesson(title: 'Recap: Mixed Bag', slides: _randomMix([..._vowelsPart1, ..._consonantsL4, ..._consonantsL5], 15)),
  12: Lesson(title: 'Recap: Rapid Fire', slides: _randomMix([..._consonantsL6, ..._consonantsL7, ..._consonantsL8, ..._consonantsL9], 15)),
  13: Lesson(title: 'Pronunciation: Vowels', slides: [
    const LessonSlide(type: 'teach', title: 'Learn: Vowel Sounds', mainChar: 'अ आ इ ई उ ऊ', audioText: 'अ आ इ ई उ ऊ', hint: 'Listen carefully to each vowel sound.', instruction: 'These are the basic Hindi vowels. Practice listening before we test your pronunciation.'),
    const LessonSlide(type: 'teach', title: 'Short Vowels', mainChar: 'अ इ उ', audioText: 'अ इ उ', hint: 'Short vowels: a (America), i (Sit), u (Put)', instruction: 'These vowels are pronounced briefly and crisply.'),
    const LessonSlide(type: 'teach', title: 'Long Vowels', mainChar: 'आ ई ऊ', audioText: 'आ ई ऊ', hint: "Long vowels: aa (Father), ee (Feet), oo (Boot)", instruction: 'Hold these sounds longer than the short vowels.'),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'अ', answer: 'a', hint: "Like 'a' in America"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'आ', answer: 'aa', hint: "Like 'a' in Father"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'इ', answer: 'e', hint: "Like 'i' in Sit"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'ई', answer: 'ee', hint: "Like 'ee' in Feet"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'उ', answer: 'u', hint: "Like 'u' in Put"),
  ]),
  14: Lesson(title: 'Pronunciation: Tricky Consonants', slides: [
    const LessonSlide(type: 'teach', title: 'Learn: Consonant Sounds', mainChar: 'क ख ग घ च', audioText: 'क ख ग घ च', hint: 'Listen to these consonant sounds carefully.', instruction: 'Hindi has aspirated and non-aspirated consonants. Listen to the difference.'),
    const LessonSlide(type: 'teach', title: 'Aspirated vs Non-Aspirated', mainChar: 'क vs ख', audioText: 'क ख', hint: "क = 'k' (no breath), ख = 'kh' (with breath)", instruction: "Hold your hand in front of your mouth. You should feel air with ख but not with क."),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'क', answer: 'ka', hint: "Like 'k' in Skate (no breath)"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'ख', answer: 'kha', hint: "Aspirated 'kh' (with breath)"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'ग', answer: 'ga', hint: "Like 'g' in Go"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'घ', answer: 'gha', hint: "Voiced aspirated 'gh'"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'च', answer: 'cha', hint: "Like 'ch' in Chat"),
  ]),
  15: Lesson(title: 'Pronunciation: Script Review', slides: [
    const LessonSlide(type: 'teach', title: 'Mixed Practice', mainChar: 'अ क च त म', audioText: 'अ क च त म', hint: 'Review: Mix of vowels and consonants', instruction: "Let's practice a mix of the sounds you've learned."),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'म', answer: 'ma', hint: "Like 'm' in Man"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'न', answer: 'na', hint: "Like 'n' in No"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'त', answer: 'ta', hint: "Soft 't' like in pasta"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'र', answer: 'ra', hint: "Like 'r' in Run"),
    const LessonSlide(type: 'pronounce', question: 'Speak this sound', mainChar: 'स', answer: 'sa', hint: "Like 's' in Sun"),
  ]),
  // --- CHAPTER 2 ---
  16: Lesson(title: 'Common Words', slides: [
    ..._vocabPair('नमस्ते', 'Hello', 'Common greeting', ['Hello', 'Goodbye', 'Thanks', 'Sorry'], ['नमस्ते', 'अलविदा', 'धन्यवाद', 'माफ़ करें']),
    ..._vocabPair('हाँ', 'Yes', 'Affirmative', ['Yes', 'No', 'Maybe', 'Okay'], ['हाँ', 'नहीं', 'शायद', 'ठीक है']),
    ..._vocabPair('नहीं', 'No', 'Negative', ['No', 'Yes', 'Never', 'Always'], ['नहीं', 'हाँ', 'कभी नहीं', 'हमेशा']),
  ]),
  17: Lesson(title: 'Numbers 1-5', slides: [
    ..._vocabPair('एक', 'One', 'Number 1', ['One', 'Two', 'Three', 'Four'], ['एक', 'दो', 'तीन', 'चार']),
    ..._vocabPair('दो', 'Two', 'Number 2', ['Two', 'One', 'Three', 'Five'], ['दो', 'एक', 'तीन', 'पाँच']),
    ..._vocabPair('तीन', 'Three', 'Number 3', ['Three', 'Two', 'Four', 'Five'], ['तीन', 'दो', 'चार', 'पाँच']),
    ..._vocabPair('चार', 'Four', 'Number 4', ['Four', 'Three', 'Five', 'Six'], ['चार', 'तीन', 'पाँच', 'छह']),
    ..._vocabPair('पाँच', 'Five', 'Number 5', ['Five', 'Four', 'Six', 'Seven'], ['पाँच', 'चार', 'छह', 'सात']),
  ]),
  18: Lesson(title: 'Numbers 6-10', slides: [
    ..._vocabPair('छह', 'Six', 'Number 6', ['Six', 'Seven', 'Eight', 'Five'], ['छह', 'सात', 'आठ', 'पाँच']),
    ..._vocabPair('सात', 'Seven', 'Number 7', ['Seven', 'Six', 'Eight', 'Nine'], ['सात', 'छह', 'आठ', 'नौ']),
    ..._vocabPair('आठ', 'Eight', 'Number 8', ['Eight', 'Seven', 'Nine', 'Ten'], ['आठ', 'सात', 'नौ', 'दस']),
    ..._vocabPair('नौ', 'Nine', 'Number 9', ['Nine', 'Eight', 'Ten', 'Seven'], ['नौ', 'आठ', 'दस', 'सात']),
    ..._vocabPair('दस', 'Ten', 'Number 10', ['Ten', 'Nine', 'Eight', 'Seven'], ['दस', 'नौ', 'आठ', 'सात']),
  ]),
  19: Lesson(title: 'Recap: Numbers', slides: [
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'One'", options: ['एक', 'दो', 'तीन', 'चार'], answer: 'एक'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Five'", options: ['तीन', 'चार', 'पाँच', 'छह'], answer: 'पाँच'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Ten'", options: ['सात', 'आठ', 'नौ', 'दस'], answer: 'दस'),
  ]),
  20: Lesson(title: 'Family: Parents', slides: [
    ..._vocabPair('माँ', 'Mother', 'Mom', ['Mother', 'Father', 'Sister', 'Brother'], ['माँ', 'पिता', 'बहन', 'भाई']),
    ..._vocabPair('पिता', 'Father', 'Dad', ['Father', 'Mother', 'Uncle', 'Aunt'], ['पिता', 'माँ', 'चाचा', 'चाची']),
  ]),
  21: Lesson(title: 'Family: Siblings', slides: [
    ..._vocabPair('भाई', 'Brother', 'Male sibling', ['Brother', 'Sister', 'Father', 'Mother'], ['भाई', 'बहन', 'पिता', 'माँ']),
    ..._vocabPair('बहन', 'Sister', 'Female sibling', ['Sister', 'Brother', 'Mother', 'Aunt'], ['बहन', 'भाई', 'माँ', 'चाची']),
  ]),
  22: Lesson(title: 'Colors: Part 1', slides: [
    ..._vocabPair('लाल', 'Red', 'Color red', ['Red', 'Blue', 'Green', 'Yellow'], ['लाल', 'नीला', 'हरा', 'पीला']),
    ..._vocabPair('नीला', 'Blue', 'Color blue', ['Blue', 'Red', 'Green', 'Black'], ['नीला', 'लाल', 'हरा', 'काला']),
    ..._vocabPair('हरा', 'Green', 'Color green', ['Green', 'Yellow', 'Blue', 'Red'], ['हरा', 'पीला', 'नीला', 'लाल']),
  ]),
  23: Lesson(title: 'Colors: Part 2', slides: [
    ..._vocabPair('पीला', 'Yellow', 'Color yellow', ['Yellow', 'Green', 'Orange', 'Pink'], ['पीला', 'हरा', 'नारंगी', 'गुलाबी']),
    ..._vocabPair('काला', 'Black', 'Color black', ['Black', 'White', 'Red', 'Blue'], ['काला', 'सफ़ेद', 'लाल', 'नीला']),
    ..._vocabPair('सफ़ेद', 'White', 'Color white', ['White', 'Black', 'Grey', 'Brown'], ['सफ़ेद', 'काला', 'भूरा', 'स्लेटी']),
  ]),
  24: Lesson(title: 'Food & Drink: Part 1', slides: [
    ..._vocabPair('पानी', 'Water', 'Drink water', ['Water', 'Milk', 'Tea', 'Juice'], ['पानी', 'दूध', 'चाय', 'जूस']),
    ..._vocabPair('दूध', 'Milk', 'Dairy drink', ['Milk', 'Water', 'Tea', 'Coffee'], ['दूध', 'पानी', 'चाय', 'कॉफ़ी']),
  ]),
  25: Lesson(title: 'Food & Drink: Part 2', slides: [
    ..._vocabPair('रोटी', 'Bread', 'Indian bread', ['Bread', 'Rice', 'Milk', 'Water'], ['रोटी', 'चावल', 'दूध', 'पानी']),
    ..._vocabPair('चाय', 'Tea', 'Hot beverage', ['Tea', 'Coffee', 'Milk', 'Water'], ['चाय', 'कॉफ़ी', 'दूध', 'पानी']),
  ]),
  26: Lesson(title: 'Fruits', slides: [
    ..._vocabPair('सेब', 'Apple', 'Red fruit', ['Apple', 'Banana', 'Mango', 'Orange'], ['सेब', 'केला', 'आम', 'संतरा']),
    ..._vocabPair('केला', 'Banana', 'Yellow fruit', ['Banana', 'Apple', 'Mango', 'Grapes'], ['केला', 'सेब', 'आम', 'अंगूर']),
    ..._vocabPair('आम', 'Mango', 'King of fruits', ['Mango', 'Apple', 'Banana', 'Grapes'], ['आम', 'सेब', 'केला', 'अंगूर']),
  ]),
  27: Lesson(title: 'Recap: Vocabulary', slides: [
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Mother'", options: ['माँ', 'पिता', 'भाई', 'बहन'], answer: 'माँ'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Brother'", options: ['बहन', 'भाई', 'माँ', 'पिता'], answer: 'भाई'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Red'", options: ['नीला', 'हरा', 'लाल', 'काला'], answer: 'लाल'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Water'", options: ['पानी', 'दूध', 'चाय', 'रोटी'], answer: 'पानी'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'Mango'", options: ['सेब', 'केला', 'आम', 'संतरा'], answer: 'आम'),
  ]),
  28: Lesson(title: 'Pronunciation: Common Words', slides: [
    const LessonSlide(type: 'pronounce', question: "Say 'Hello'", mainChar: 'नमस्ते', answer: 'namaste', hint: 'Namaste'),
    const LessonSlide(type: 'pronounce', question: "Say 'Yes'", mainChar: 'हाँ', answer: 'haan', hint: 'Haan'),
    const LessonSlide(type: 'pronounce', question: "Say 'Water'", mainChar: 'पानी', answer: 'pani', hint: 'Pani'),
    const LessonSlide(type: 'pronounce', question: "Say 'Thank you'", mainChar: 'धन्यवाद', answer: 'dhanyavaad', hint: 'Dhanyavaad'),
  ]),
  29: Lesson(title: 'Pronunciation: Numbers & Family', slides: [
    const LessonSlide(type: 'pronounce', question: "Say 'One'", mainChar: 'एक', answer: 'ek', hint: 'Ek'),
    const LessonSlide(type: 'pronounce', question: "Say 'Five'", mainChar: 'पाँच', answer: 'paanch', hint: 'Paanch'),
    const LessonSlide(type: 'pronounce', question: "Say 'Mother'", mainChar: 'माँ', answer: 'maa', hint: 'Maa'),
    const LessonSlide(type: 'pronounce', question: "Say 'Brother'", mainChar: 'भाई', answer: 'bhai', hint: 'Bhai'),
  ]),
  30: Lesson(title: 'Pronunciation: Colors & Food', slides: [
    const LessonSlide(type: 'pronounce', question: "Say 'Red'", mainChar: 'लाल', answer: 'laal', hint: 'Laal'),
    const LessonSlide(type: 'pronounce', question: "Say 'Blue'", mainChar: 'नीला', answer: 'neela', hint: 'Neela'),
    const LessonSlide(type: 'pronounce', question: "Say 'Bread'", mainChar: 'रोटी', answer: 'roti', hint: 'Roti'),
    const LessonSlide(type: 'pronounce', question: "Say 'Mango'", mainChar: 'आम', answer: 'aam', hint: 'Aam'),
  ]),
  // --- CHAPTER 3 ---
  31: Lesson(title: 'Pronouns: I & You', slides: [
    ..._vocabPair('मैं', 'I', 'First person', ['I', 'You (informal)', 'He', 'She'], ['मैं', 'तुम', 'वह', 'वह']),
    ..._vocabPair('तुम', 'You (informal)', 'Second person informal', ['You (informal)', 'I', 'We', 'They'], ['तुम', 'मैं', 'हम', 'वे']),
    ..._vocabPair('आप', 'You (formal)', 'Second person formal', ['You (formal)', 'You (informal)', 'I', 'We'], ['आप', 'तुम', 'मैं', 'हम']),
  ]),
  32: Lesson(title: 'Pronouns: He, She & We', slides: [
    ..._vocabPair('वह', 'He/She', 'Third person', ['He/She', 'I', 'You', 'We'], ['वह', 'मैं', 'तुम', 'हम']),
    ..._vocabPair('हम', 'We', 'First person plural', ['We', 'They', 'You', 'I'], ['हम', 'वे', 'तुम', 'मैं']),
    ..._vocabPair('वे', 'They', 'Third person plural', ['They', 'We', 'You', 'He/She'], ['वे', 'हम', 'तुम', 'वह']),
  ]),
  33: Lesson(title: 'Verbs: Eat & Drink', slides: [
    ..._vocabPair('खाना', 'To eat', 'Eating action', ['To eat', 'To drink', 'To sleep', 'To go'], ['खाना', 'पीना', 'सोना', 'जाना']),
    ..._vocabPair('पीना', 'To drink', 'Drinking action', ['To drink', 'To eat', 'To come', 'To sit'], ['पीना', 'खाना', 'आना', 'बैठना']),
  ]),
  34: Lesson(title: 'Verbs: Go & Come', slides: [
    ..._vocabPair('जाना', 'To go', 'Going action', ['To go', 'To come', 'To eat', 'To sleep'], ['जाना', 'आना', 'खाना', 'सोना']),
    ..._vocabPair('आना', 'To come', 'Coming action', ['To come', 'To go', 'To sit', 'To stand'], ['आना', 'जाना', 'बैठना', 'खड़ा होना']),
  ]),
  35: Lesson(title: 'Verbs: Sleep & Wake', slides: [
    ..._vocabPair('सोना', 'To sleep', 'Sleeping action', ['To sleep', 'To wake', 'To eat', 'To drink'], ['सोना', 'जागना', 'खाना', 'पीना']),
    ..._vocabPair('जागना', 'To wake', 'Waking action', ['To wake', 'To sleep', 'To sit', 'To stand'], ['जागना', 'सोना', 'बैठना', 'खड़ा होना']),
  ]),
  36: Lesson(title: 'I am / You are', slides: [
    ..._vocabPair('मैं हूँ', 'I am', 'I am statement', ['I am', 'You are', 'He is', 'We are'], ['मैं हूँ', 'तुम हो', 'वह है', 'हम हैं']),
    ..._vocabPair('तुम हो', 'You are', 'You are statement', ['You are', 'I am', 'He is', 'They are'], ['तुम हो', 'मैं हूँ', 'वह है', 'वे हैं']),
  ]),
  37: Lesson(title: 'He/She is & We are', slides: [
    ..._vocabPair('वह है', 'He/She is', 'Third person is', ['He/She is', 'I am', 'You are', 'We are'], ['वह है', 'मैं हूँ', 'तुम हो', 'हम हैं']),
    ..._vocabPair('हम हैं', 'We are', 'We are statement', ['We are', 'They are', 'I am', 'You are'], ['हम हैं', 'वे हैं', 'मैं हूँ', 'तुम हो']),
  ]),
  38: Lesson(title: 'Simple Sentences', slides: [
    ..._vocabPair('मैं खाता हूँ', 'I eat', 'I eat sentence', ['I eat', 'You eat', 'He eats', 'We eat'], ['मैं खाता हूँ', 'तुम खाते हो', 'वह खाता है', 'हम खाते हैं']),
    ..._vocabPair('मैं जाता हूँ', 'I go', 'I go sentence', ['I go', 'You go', 'I come', 'I eat'], ['मैं जाता हूँ', 'तुम जाते हो', 'मैं आता हूँ', 'मैं खाता हूँ']),
  ]),
  39: Lesson(title: 'Questions: What & Where', slides: [
    ..._vocabPair('क्या', 'What', 'Question word', ['What', 'Where', 'When', 'Who'], ['क्या', 'कहाँ', 'कब', 'कौन']),
    ..._vocabPair('कहाँ', 'Where', 'Location question', ['Where', 'What', 'When', 'Why'], ['कहाँ', 'क्या', 'कब', 'क्यों']),
    ..._vocabPair('कब', 'When', 'Time question', ['When', 'Where', 'What', 'Who'], ['कब', 'कहाँ', 'क्या', 'कौन']),
  ]),
  40: Lesson(title: 'Recap: Grammar Mix', slides: [
    const LessonSlide(type: 'quiz', subtype: 'intro', badge: 'Review', title: 'Grammar Review', question: 'What does this mean?', mainChar: 'मैं', audioText: 'मैं', hint: 'Pronoun', options: ['I', 'You', 'He', 'We'], answer: 'I'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'I'", options: ['मैं', 'तुम', 'वह', 'हम'], answer: 'मैं'),
    const LessonSlide(type: 'quiz', subtype: 'intro', badge: 'Review', title: 'Grammar Review', question: 'What does this mean?', mainChar: 'खाना', audioText: 'खाना', hint: 'Verb', options: ['To eat', 'To drink', 'To sleep', 'To go'], answer: 'To eat'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'To eat'", options: ['खाना', 'पीना', 'सोना', 'जाना'], answer: 'खाना'),
    const LessonSlide(type: 'quiz', subtype: 'intro', badge: 'Review', title: 'Grammar Review', question: 'What does this mean?', mainChar: 'क्या', audioText: 'क्या', hint: 'Question', options: ['What', 'Where', 'When', 'Who'], answer: 'What'),
    const LessonSlide(type: 'quiz', subtype: 'char_select', question: "Select 'What'", options: ['क्या', 'कहाँ', 'कब', 'कौन'], answer: 'क्या'),
  ]),
  41: Lesson(title: 'Adjectives: Size', slides: [
    ..._vocabPair('बड़ा', 'Big', 'Large size', ['Big', 'Small', 'Long', 'Short'], ['बड़ा', 'छोटा', 'लंबा', 'छोटा']),
    ..._vocabPair('छोटा', 'Small', 'Small size', ['Small', 'Big', 'Tall', 'Short'], ['छोटा', 'बड़ा', 'लंबा', 'नाटा']),
  ]),
  42: Lesson(title: 'Adjectives: Feelings', slides: [
    ..._vocabPair('खुश', 'Happy', 'Happy feeling', ['Happy', 'Sad', 'Angry', 'Tired'], ['खुश', 'उदास', 'गुस्सा', 'थका']),
    ..._vocabPair('उदास', 'Sad', 'Sad feeling', ['Sad', 'Happy', 'Angry', 'Scared'], ['उदास', 'खुश', 'गुस्सा', 'डरा']),
  ]),
  43: Lesson(title: 'Pronunciation: Pronouns & Verbs', slides: [
    const LessonSlide(type: 'pronounce', question: "Say 'I'", mainChar: 'मैं', answer: 'main', hint: 'Main'),
    const LessonSlide(type: 'pronounce', question: "Say 'You'", mainChar: 'तुम', answer: 'tum', hint: 'Tum'),
    const LessonSlide(type: 'pronounce', question: "Say 'To eat'", mainChar: 'खाना', answer: 'khaana', hint: 'Khaana'),
    const LessonSlide(type: 'pronounce', question: "Say 'To go'", mainChar: 'जाना', answer: 'jaana', hint: 'Jaana'),
  ]),
  44: Lesson(title: 'Pronunciation: Sentences', slides: [
    const LessonSlide(type: 'pronounce', question: "Say 'I am'", mainChar: 'मैं हूँ', answer: 'main hoon', hint: 'Main hoon'),
    const LessonSlide(type: 'pronounce', question: "Say 'You are'", mainChar: 'तुम हो', answer: 'tum ho', hint: 'Tum ho'),
    const LessonSlide(type: 'pronounce', question: "Say 'I eat'", mainChar: 'मैं खाता हूँ', answer: 'main khaata hoon', hint: 'Main khaata hoon'),
  ]),
  45: Lesson(title: 'Pronunciation: Questions & Adjectives', slides: [
    const LessonSlide(type: 'pronounce', question: "Say 'What'", mainChar: 'क्या', answer: 'kya', hint: 'Kya'),
    const LessonSlide(type: 'pronounce', question: "Say 'Where'", mainChar: 'कहाँ', answer: 'kahaan', hint: 'Kahaan'),
    const LessonSlide(type: 'pronounce', question: "Say 'Big'", mainChar: 'बड़ा', answer: 'bada', hint: 'Bada'),
    const LessonSlide(type: 'pronounce', question: "Say 'Happy'", mainChar: 'खुश', answer: 'khush', hint: 'Khush'),
  ]),
};

// Chapter structure for lesson list display
final List<Map<String, dynamic>> chapters = [
  {
    'title': 'Chapter 1: The Hindi Script',
    'subtitle': 'Master the Devanagari alphabet',
    'lessons': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  {
    'title': 'Chapter 2: My World',
    'subtitle': 'Essential vocabulary & phrases',
    'lessons': [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  },
  {
    'title': 'Chapter 3: First Sentences',
    'subtitle': 'Build basic Hindi sentences',
    'lessons': [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
  },
];

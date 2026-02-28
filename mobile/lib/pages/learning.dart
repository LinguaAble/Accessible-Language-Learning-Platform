import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../data/lesson_data.dart';
import '../providers/user_provider.dart';
import '../services/api_service.dart';


class LearningScreen extends StatefulWidget {
  final int lessonId;
  const LearningScreen({super.key, this.lessonId = 1});

  @override
  State<LearningScreen> createState() => _LearningScreenState();
}

class _LearningScreenState extends State<LearningScreen>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  bool? _isCorrect;
  String? _selectedOption;
  bool _showSuccess = false;
  bool _isReviewMode = false;

  late List<LessonSlide> _activeSlides;
  late int _originalCount;
  final List<LessonSlide> _mistakeQueue = [];
  late final DateTime _lessonStartTime;

  // Score tracking
  int _totalQuestions = 0;
  int _firstAttemptCorrect = 0;

  final FlutterTts _flutterTts = FlutterTts();

  // Speech-to-text
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _speechAvailable = false;
  bool _isListening = false;
  String _nlpFeedback = 'Tap to speak';

  @override
  void initState() {
    super.initState();
    _lessonStartTime = DateTime.now();
    final lesson = lessonDatabase[widget.lessonId] ?? lessonDatabase[1]!;
    _activeSlides = List.from(lesson.slides);
    _originalCount = _activeSlides.length;
    _totalQuestions =
        _activeSlides.where((s) => s.type == 'quiz' || s.type == 'pronounce').length;
    _initTts();
  }

  Future<void> _initTts() async {
    await _flutterTts.setLanguage('hi-IN');
    await _flutterTts.setSpeechRate(0.4);
    // speech_to_text only works on native (Android/iOS), not on web Flutter
    if (!kIsWeb) {
      _speechAvailable = await _speech.initialize();
    }
    _playAudio();
  }

  void _playAudio() async {
    if (_activeSlides.isEmpty) return;
    final slide = _activeSlides[_currentIndex];
    if (slide.audioText != null) {
      await _flutterTts.speak(slide.audioText!);
    }
  }

  double get _progress {
    if (_currentIndex >= _originalCount) return 0.95;
    return _currentIndex / _originalCount;
  }

  void _handleOptionSelect(String option) {
    if (_isCorrect != null) return;
    HapticFeedback.lightImpact();

    final slide = _activeSlides[_currentIndex];
    final correct = option == slide.answer;

    final provider = Provider.of<UserProvider>(context, listen: false);
    if (provider.soundEffects) {
        if (correct) {
            SystemSound.play(SystemSoundType.click);
        } else {
            SystemSound.play(SystemSoundType.alert);
        }
    }

    setState(() {
      _selectedOption = option;
      _isCorrect = correct;
    });

    if (correct) {
      if (!slide.isReview) _firstAttemptCorrect++;
    } else {
      _mistakeQueue.add(slide.copyWithReview());
    }
  }

  void _handlePronounceResult(bool correct) {
    final slide = _activeSlides[_currentIndex];
    setState(() => _isCorrect = correct);

    final provider = Provider.of<UserProvider>(context, listen: false);
    if (provider.soundEffects) {
        if (correct) {
            SystemSound.play(SystemSoundType.click);
        } else {
            SystemSound.play(SystemSoundType.alert);
        }
    }

    if (correct) {
      if (!slide.isReview) _firstAttemptCorrect++;
    } else {
      _mistakeQueue.add(slide.copyWithReview());
    }
  }

  void _handleNext() {
    if (_currentIndex < _activeSlides.length - 1) {
      setState(() {
        _currentIndex++;
        _isCorrect = null;
        _selectedOption = null;
      });
      _playAudio();
    } else if (_mistakeQueue.isNotEmpty) {
      setState(() {
        _isReviewMode = true;
        _activeSlides.addAll(_mistakeQueue);
        _mistakeQueue.clear();
        _currentIndex++;
        _isCorrect = null;
        _selectedOption = null;
      });
      _playAudio();
    } else {
      _finishLesson();
    }
  }

  void _finishLesson() async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    final timeSpent = DateTime.now().difference(_lessonStartTime);
    final minutesSpent = timeSpent.inMinutes.clamp(1, 999);
    final pct = _totalQuestions > 0
        ? (_firstAttemptCorrect / _totalQuestions * 100).round()
        : 100;

    if (provider.email.isNotEmpty) {
      final completed = List<int>.from(
        (provider.completedLessons).map((e) => e is int ? e : int.tryParse('$e') ?? 0),
      );
      final isNew = !completed.contains(widget.lessonId);
      if (isNew) completed.add(widget.lessonId);

      final now = DateTime.now();
      final dateStr =
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

      try {
        final result = await ApiService.updateProgress(
          email: provider.email,
          completedLessons: isNew ? completed : null,
          todayProgress: provider.todayProgress + minutesSpent,
          incrementLessonCount: isNew ? 1 : null,
          lessonScore: pct,
          date: dateStr,
        );

        if (result['success'] == true) {
          await provider.updateUser({
            'completedLessons': result['completedLessons'],
            'todayProgress': result['todayProgress'],
            'dailyLessonCounts': result['dailyLessonCounts'],
            'dailyScores': result['dailyScores'],
            'streak': result['streak'],
            'lastStreakDate': result['lastStreakDate'],
          });
        }
      } catch (_) {}
    }

    setState(() => _showSuccess = true);
  }

  int _calcPercentage() =>
      _totalQuestions > 0 ? (_firstAttemptCorrect / _totalQuestions * 100).round() : 100;

  String _calcGrade() {
    final p = _calcPercentage();
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    return 'B-';
  }

  String _calcMessage() {
    final p = _calcPercentage();
    if (p >= 90) return "Outstanding! You're a natural!";
    if (p >= 80) return 'Excellent work! Keep it up!';
    if (p >= 70) return "Great job! You're making progress!";
    if (p >= 60) return 'Good effort! Practice makes perfect!';
    return "You're learning! Keep going!";
  }

  @override
  Widget build(BuildContext context) {
    if (_showSuccess) return _buildSuccessScreen();

    final slide = _activeSlides[_currentIndex];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        title: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.close, color: Colors.grey),
              onPressed: () => context.pop(),
            ),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: _progress,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    _isReviewMode ? const Color(0xFFF59E0B) : const Color(0xFF58CC02),
                  ),
                  minHeight: 14,
                ),
              ),
            ),
            if (_isReviewMode)
              Container(
                margin: const EdgeInsets.only(left: 10),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.refresh, size: 14, color: Color(0xFFF59E0B)),
                    SizedBox(width: 4),
                    Text('Review',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFF59E0B))),
                  ],
                ),
              ),
            const SizedBox(width: 10),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Badge
                    if (slide.isReview)
                      _buildBadge('Previous Mistake', const Color(0xFFF59E0B))
                    else if (slide.badge != null)
                      _buildBadge('⚡ ${slide.badge!}', const Color(0xFFF79C42)),

                    const SizedBox(height: 16),

                    // Question
                    if (slide.question != null)
                      Text(
                        slide.question!,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1F2937),
                        ),
                        textAlign: TextAlign.center,
                      ),

                    const SizedBox(height: 30),

                    // Main character display
                    _buildCharDisplay(slide),

                    const SizedBox(height: 30),

                    // Options or mic
                    if (slide.type == 'quiz' && slide.options != null)
                      _buildOptions(slide),

                    if (slide.type == 'pronounce') _buildMicButton(slide),
                  ],
                ),
              ),
            ),

            // Bottom feedback bar
            _buildFooter(slide),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13),
      ),
    );
  }

  Widget _buildCharDisplay(LessonSlide slide) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          if (slide.mainChar != null)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  slide.mainChar!,
                  style: const TextStyle(fontSize: 64, fontWeight: FontWeight.w800),
                  textAlign: TextAlign.center,
                ),
                if (slide.audioText != null) ...[
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.volume_up, color: Colors.blue, size: 36),
                    onPressed: _playAudio,
                  ),
                ],
              ],
            ),
          if (slide.hint != null)
            Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Text(
                slide.hint!,
                style: const TextStyle(fontSize: 15, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ),
          if (slide.instruction != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                slide.instruction!,
                style: const TextStyle(fontSize: 13, color: Colors.blueGrey),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOptions(LessonSlide slide) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      alignment: WrapAlignment.center,
      children: slide.options!.map((opt) {
        final isSelected = _selectedOption == opt;
        final isAnswer = opt == slide.answer;

        Color bgColor = Colors.white;
        Color borderColor = Colors.grey.shade300;

        if (_isCorrect != null) {
          if (isSelected && _isCorrect == true) {
            bgColor = const Color(0xFFD1FAE5);
            borderColor = const Color(0xFF10B981);
          } else if (isSelected && _isCorrect == false) {
            bgColor = const Color(0xFFFEE2E2);
            borderColor = const Color(0xFFEF4444);
          } else if (isAnswer && _isCorrect == false) {
            bgColor = const Color(0xFFD1FAE5).withOpacity(0.5);
            borderColor = const Color(0xFF10B981).withOpacity(0.5);
          }
        }

        return InkWell(
          onTap: _isCorrect == null ? () => _handleOptionSelect(opt) : null,
          borderRadius: BorderRadius.circular(15),
          child: Container(
            width: MediaQuery.of(context).size.width * 0.4,
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              color: bgColor,
              border: Border.all(color: borderColor, width: 2),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Center(
              child: Text(
                opt,
                style: TextStyle(
                  fontSize: slide.subtype == 'char_select' ? 24 : 16,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Future<void> _startListening(LessonSlide slide) async {
    if (kIsWeb) {
      // On web Flutter, speech_to_text doesn't work — show text input dialog
      await _showWebSpeechDialog(slide);
      return;
    }
    if (!_speechAvailable || _isListening) return;
    setState(() {
      _isListening = true;
      _nlpFeedback = '🎤 Listening...';
    });
    HapticFeedback.mediumImpact();
    await _speech.listen(
      onResult: (result) async {
        if (result.finalResult) {
          await _speech.stop();
          setState(() => _isListening = false);
          await _evaluateWithNlp(result.recognizedWords, slide);
        }
      },
      localeId: 'hi_IN',
      listenFor: const Duration(seconds: 8),
      pauseFor: const Duration(seconds: 2),
    );
  }

  Future<void> _showWebSpeechDialog(LessonSlide slide) async {
    final ctrl = TextEditingController();
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Type what you hear',
            style: TextStyle(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Type the romanized pronunciation of "${slide.mainChar ?? ''}"',
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Text(
              'Hint: ${slide.hint ?? slide.answer ?? ''}',
              style: const TextStyle(
                  color: Color(0xFFF79C42),
                  fontStyle: FontStyle.italic,
                  fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              autofocus: true,
              textCapitalization: TextCapitalization.none,
              decoration: InputDecoration(
                hintText: 'e.g. ${slide.answer ?? ''}',
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10)),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide:
                      const BorderSide(color: Color(0xFFF79C42), width: 2),
                ),
              ),
              onSubmitted: (v) => Navigator.of(ctx).pop(v),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(null),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF79C42),
                foregroundColor: Colors.white),
            onPressed: () => Navigator.of(ctx).pop(ctrl.text),
            child: const Text('Check'),
          ),
        ],
      ),
    );
    if (result != null && result.trim().isNotEmpty) {
      await _evaluateWithNlp(result.trim(), slide);
    }
  }

  Future<void> _evaluateWithNlp(String transcript, LessonSlide slide) async {
    setState(() => _nlpFeedback = '⏳ Evaluating...');
    // Try server first, fallback to local 7-layer evaluation
    final result = await ApiService.evaluatePronunciation(
      transcript: transcript,
      expectedAnswer: slide.answer ?? '',
      expectedHindi: slide.mainChar ?? '',
    );
    final isCorrect = result['isCorrect'] as bool? ?? false;
    final feedback = result['feedback'] as String? ??
        (isCorrect ? '✅ Correct!' : '❌ Try again');
    setState(() => _nlpFeedback = feedback);
    _handlePronounceResult(isCorrect);
  }

  Widget _buildMicButton(LessonSlide slide) {
    Color btnColor;
    if (_isCorrect == true) {
      btnColor = const Color(0xFF10B981);
    } else if (_isCorrect == false) {
      btnColor = const Color(0xFFEF4444);
    } else if (_isListening) {
      btnColor = const Color(0xFFF59E0B);
    } else {
      btnColor = const Color(0xFF3B82F6);
    }

    return Column(
      children: [
        FloatingActionButton.large(
          onPressed:
              _isCorrect != null ? null : () => _startListening(slide),
          backgroundColor: btnColor,
          child: Icon(
            _isCorrect == true
                ? Icons.check
                : (kIsWeb
                    ? Icons.keyboard_alt_outlined
                    : (_isListening ? Icons.graphic_eq : Icons.mic)),
            color: Colors.white,
            size: 36,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          kIsWeb && _isCorrect == null
              ? '⌨️ Type your answer'
              : (_isCorrect != null
                  ? _nlpFeedback
                  : (_isListening ? '🎤 Listening...' : _nlpFeedback)),
          style: TextStyle(
            color: _isCorrect == true
                ? const Color(0xFF10B981)
                : (_isCorrect == false
                    ? const Color(0xFFEF4444)
                    : (_isListening
                        ? const Color(0xFFF59E0B)
                        : Colors.grey)),
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFooter(LessonSlide slide) {
    Color bgColor = Colors.white;
    if (_isCorrect == true) bgColor = const Color(0xFFD1FAE5);
    if (_isCorrect == false) bgColor = const Color(0xFFFEE2E2);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: bgColor,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            if (_isCorrect == true)
              const Row(
                children: [
                  Icon(Icons.check_circle, color: Color(0xFF10B981), size: 28),
                  SizedBox(width: 8),
                  Text(
                    'Excellent!',
                    style: TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              )
            else if (_isCorrect == false)
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Color(0xFFEF4444), size: 28),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text(
                            'Incorrect',
                            style: TextStyle(
                              color: Color(0xFFEF4444),
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            'Answer: ${slide.answer ?? ''}',
                            style: const TextStyle(
                              color: Color(0xFFEF4444),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else
              const SizedBox(),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _isCorrect == false
                    ? const Color(0xFFEF4444)
                    : (_isCorrect == true
                        ? const Color(0xFF10B981)
                        : const Color(0xFFE5E7EB)),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
              ),
              onPressed: slide.type == 'teach' || _isCorrect != null
                  ? _handleNext
                  : null,
              child: Text(
                _currentIndex == _activeSlides.length - 1 && _mistakeQueue.isEmpty
                    ? 'FINISH'
                    : (_isCorrect == false
                        ? 'GOT IT'
                        : (slide.type == 'teach' ? 'CONTINUE' : 'NEXT')),
                style: TextStyle(
                  color: _isCorrect != null || slide.type == 'teach'
                      ? Colors.white
                      : Colors.grey,
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessScreen() {
    final pct = _calcPercentage();
    final grade = _calcGrade();
    final message = _calcMessage();
    final xp = (_firstAttemptCorrect * 2).clamp(10, 999);
    final lessonTitle = lessonDatabase[widget.lessonId]?.title ?? 'Lesson';

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Brand
                RichText(
                  text: const TextSpan(
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    children: [
                      TextSpan(text: 'Lingua', style: TextStyle(color: Color(0xFF1E3A8A))),
                      TextSpan(text: 'Able', style: TextStyle(color: Color(0xFFF79C42))),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Checkmark
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 50),
                ),
                const SizedBox(height: 16),

                Text(
                  'Lesson Complete! ✓',
                  style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
                ),
                Text(
                  lessonTitle,
                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 24),

                // Grade bar
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Grade: $grade',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                          Text(
                            '$pct%',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 15,
                              color: Color(0xFFF79C42),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: pct / 100,
                          backgroundColor: Colors.grey.shade200,
                          valueColor: const AlwaysStoppedAnimation(Color(0xFFF79C42)),
                          minHeight: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Stat cards
                Row(
                  children: [
                    _buildStatCard(
                      Icons.check_circle_outline,
                      '$_firstAttemptCorrect/$_totalQuestions',
                      'First Try',
                      const Color(0xFFF79C42),
                    ),
                    const SizedBox(width: 12),
                    _buildStatCard(
                      Icons.bolt,
                      '+$xp XP',
                      'XP Earned',
                      const Color(0xFFF79C42),
                    ),
                    const SizedBox(width: 12),
                    _buildStatCard(
                      Icons.gps_fixed,
                      '$pct%',
                      'Accuracy',
                      const Color(0xFF10B981),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                Text(
                  message,
                  style: const TextStyle(fontSize: 15, color: Colors.grey, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.go('/dashboard'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF79C42),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text(
                      'Continue Learning',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => context.go('/dashboard'),
                  child: const Text(
                    'Go to Dashboard',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(IconData icon, String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 16,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}

import 'dart:convert';
import 'dart:io' show File;
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

// Conditional import: web uses JS interop, native uses stub
import 'js_recorder_stub.dart'
    if (dart.library.js_interop) 'js_recorder_web.dart';

/// Hybrid STT service:
/// - **Web**: Uses JS interop to call browser's MediaRecorder directly
///   (same approach as the web frontend's googleSpeechService.js),
///   then sends base64 audio to Google Cloud Speech-to-Text REST API.
/// - **Native (Android/iOS)**: Records WAV via `record` package and
///   sends to Google Cloud Speech-to-Text REST API.
class GoogleSttService {
  static const String _apiKey = 'AIzaSyDynztlgYVKEr67mfb_4LLsZCqIK6bShUA';
  static const String _url =
      'https://speech.googleapis.com/v1/speech:recognize?key=$_apiKey';

  // Native: audio recorder
  final AudioRecorder _recorder = AudioRecorder();
  bool _isRecording = false;
  DateTime? _recordingStartTime;

  bool get isRecording => _isRecording;

  /// Start recording from the microphone.
  Future<bool> startRecording() async {
    if (_isRecording) return false;

    if (kIsWeb) {
      // Web: use JS MediaRecorder (same as web frontend)
      try {
        final started = await jsStartRecording();
        _isRecording = started;
        if (_isRecording) _recordingStartTime = DateTime.now();
        debugPrint('GoogleStt [web]: recording started=$_isRecording');
        return _isRecording;
      } catch (e) {
        debugPrint('GoogleStt [web]: failed to start: $e');
        return false;
      }
    } else {
      // Native: use record package
      return _startNativeRecording();
    }
  }

  /// Stop recording, send audio to Google Speech-to-Text, return transcript.
  Future<String> stopAndTranscribe({List<String> hints = const []}) async {
    if (!_isRecording) throw Exception('Not recording');

    // Enforce minimum recording duration of 1.5 seconds
    if (_recordingStartTime != null) {
      final elapsed = DateTime.now().difference(_recordingStartTime!);
      if (elapsed.inMilliseconds < 1500) {
        final waitMs = 1500 - elapsed.inMilliseconds;
        debugPrint('GoogleStt: waiting ${waitMs}ms for minimum duration');
        await Future.delayed(Duration(milliseconds: waitMs));
      }
    }

    if (kIsWeb) {
      return _stopWebAndTranscribe(hints: hints);
    } else {
      return _stopNativeAndTranscribe(hints: hints);
    }
  }

  /// Cancel recording without transcribing.
  Future<void> cancel() async {
    if (kIsWeb) {
      if (_isRecording) {
        jsCancelRecording();
        _isRecording = false;
      }
    } else {
      if (_isRecording) {
        final path = await _recorder.stop();
        _isRecording = false;
        if (path != null) _cleanupFile(path);
      }
    }
  }

  void dispose() {
    _recorder.dispose();
    if (_isRecording && kIsWeb) jsCancelRecording();
  }

  // ─── Web: JS MediaRecorder → Google Cloud STT ────────────────────────────

  Future<String> _stopWebAndTranscribe({List<String> hints = const []}) async {
    _isRecording = false;

    try {
      // Stop JS MediaRecorder — returns base64 audio string directly
      final base64Audio = await jsStopRecording();
      debugPrint(
        'GoogleStt [web]: got base64 audio, length=${base64Audio.length}',
      );

      if (base64Audio.isEmpty) {
        throw Exception('Empty recording from browser');
      }

      // Send to Google STT API — same as web frontend (WEBM_OPUS)
      return _callGoogleApi(
        base64Audio: base64Audio,
        encoding: 'WEBM_OPUS',
        hints: hints,
      );
    } catch (e) {
      debugPrint('GoogleStt [web]: error: $e');
      rethrow;
    }
  }

  // ─── Native: Record package → Google Cloud STT ───────────────────────────

  Future<bool> _startNativeRecording() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      debugPrint('GoogleStt: microphone permission denied');
      return false;
    }

    String recordPath = '';
    try {
      final dir = await getTemporaryDirectory();
      recordPath =
          '${dir.path}/lingua_recording_${DateTime.now().millisecondsSinceEpoch}.wav';
    } catch (e) {
      debugPrint('GoogleStt: failed to create temp path: $e');
      return false;
    }

    try {
      await _recorder.start(
        RecordConfig(
          encoder: AudioEncoder.wav,
          numChannels: 1,
          sampleRate: 16000,
          bitRate: 256000,
        ),
        path: recordPath,
      );
      _isRecording = true;
      _recordingStartTime = DateTime.now();
      debugPrint('GoogleStt [native]: recording started');
      return true;
    } catch (e) {
      debugPrint('GoogleStt [native]: failed to start: $e');
      return false;
    }
  }

  Future<String> _stopNativeAndTranscribe({
    List<String> hints = const [],
  }) async {
    final path = await _recorder.stop();
    _isRecording = false;

    if (path == null || path.isEmpty) {
      throw Exception('Recorder returned no audio path');
    }

    final file = File(path);
    if (!await file.exists()) {
      throw Exception('Audio file not found');
    }

    final bytes = await file.readAsBytes();
    debugPrint('GoogleStt [native]: read ${bytes.length} bytes');

    if (bytes.isEmpty) {
      throw Exception('Empty audio file');
    }

    final base64Audio = base64Encode(bytes);

    try {
      return await _callGoogleApi(
        base64Audio: base64Audio,
        encoding: 'LINEAR16',
        sampleRate: 16000,
        hints: hints,
      );
    } finally {
      _cleanupFile(path);
    }
  }

  // ─── Shared: Google Cloud Speech-to-Text API call ────────────────────────

  Future<String> _callGoogleApi({
    required String base64Audio,
    required String encoding,
    int? sampleRate,
    List<String> hints = const [],
  }) async {
    final speechContexts = hints.isNotEmpty
        ? [
            {'phrases': hints, 'boost': 20.0},
          ]
        : [];

    final config = <String, dynamic>{
      'encoding': encoding,
      'languageCode': 'hi-IN',
      'enableAutomaticPunctuation': true,
      'model': 'default',
      'speechContexts': speechContexts,
    };
    if (sampleRate != null) {
      config['sampleRateHertz'] = sampleRate;
    }

    final body = jsonEncode({
      'config': config,
      'audio': {'content': base64Audio},
    });

    debugPrint('GoogleStt: sending to API as $encoding...');
    final response = await http
        .post(
          Uri.parse(_url),
          headers: {'Content-Type': 'application/json'},
          body: body,
        )
        .timeout(const Duration(seconds: 15));

    debugPrint('GoogleStt: API status=${response.statusCode}');

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final results = data['results'] as List<dynamic>?;
      if (results != null && results.isNotEmpty) {
        final transcript = results
            .map((r) => (r['alternatives'] as List<dynamic>)[0]['transcript'])
            .join(' ');
        debugPrint('GoogleStt: ✅ transcript="$transcript"');
        return transcript;
      }
      debugPrint('GoogleStt: API 200 but no speech. Body=${response.body}');
      return ''; // No speech detected — not an error, just silence
    } else {
      throw Exception(
        'Google STT API ${response.statusCode}: ${response.body.length > 200 ? response.body.substring(0, 200) : response.body}',
      );
    }
  }

  void _cleanupFile(String path) {
    if (kIsWeb) return;
    try {
      final file = File(path);
      if (file.existsSync()) file.deleteSync();
    } catch (_) {}
  }
}

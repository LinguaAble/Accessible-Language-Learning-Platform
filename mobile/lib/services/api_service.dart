import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart'; // import foundation for kIsWeb
import 'package:http/http.dart' as http;

class ApiService {
  // Use localhost for Web, and the PC's Wi-Fi IP for Mobile (physical device or emulator)
  static String get _host {
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    // Use the PC's Wi-Fi network IP so physical Android devices can connect easily
    return 'http://10.12.227.158:5000';
  }

  static String get _baseUrl => '$_host/api/auth';
  static String get _evalUrl => '$_host/api/eval';

  // ── Auth ──────────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, 'message': data['message']}
        : {'success': false, 'message': data['message'] ?? 'Failed to send OTP'};
  }

  static Future<Map<String, dynamic>> resetPassword(String otp, String newPassword) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/reset-password/$otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'password': newPassword}),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, 'message': data['message']}
        : {'success': false, 'message': data['message'] ?? 'Invalid OTP or Expired'};
  }

  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'device': 'Mobile App', // Sent so loginHistory shows correct device
      }),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {'success': false, 'message': data['message'] ?? 'Login failed'};
  }

  static Future<Map<String, dynamic>> register(
    String email,
    String password, {
    String? username,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'username': username ?? email.split('@')[0],
        'device': 'Mobile App', // Sent so loginHistory shows correct device
      }),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {
            'success': false,
            'message': data['message'] ?? 'Registration failed',
          };
  }

  static Future<Map<String, dynamic>> googleLogin({
    required String email,
    required String username,
    String? fullName,
    String? avatarUrl,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/google-login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'username': username,
        'fullName': fullName ?? '',
        'avatarUrl': avatarUrl ?? '',
        'device': 'Mobile App',
      }),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {
            'success': false,
            'message': data['message'] ?? 'Google Login failed on server',
          };
  }

  // ── Progress ──────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> updateProgress({
    required String email,
    List<int>? completedLessons,
    int? todayProgress,
    int? incrementLessonCount,
    int? lessonScore,
    String? date,
  }) async {
    final body = <String, dynamic>{'email': email};
    if (completedLessons != null) body['completedLessons'] = completedLessons;
    if (todayProgress != null) body['todayProgress'] = todayProgress;
    if (incrementLessonCount != null)
      body['incrementLessonCount'] = incrementLessonCount;
    if (lessonScore != null) body['lessonScore'] = lessonScore;
    if (date != null) body['date'] = date;

    final response = await http.put(
      Uri.parse('$_baseUrl/update-progress'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {'success': false, 'message': data['message'] ?? 'Update failed'};
  }

  static Future<Map<String, dynamic>> getUserData(String email) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/get-user-data'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    final data = jsonDecode(response.body);
    // Backend returns { user: {...} } on 200, NOT { success: true, user: {...} }
    // We inject 'success: true' ourselves when status is 200.
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {'success': false, 'message': data['message'] ?? 'Fetch failed'};
  }

  static Future<Map<String, dynamic>> getLeaderboard() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/leaderboard'),
      headers: {'Content-Type': 'application/json'},
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {'success': false, 'message': data['message'] ?? 'Fetch failed'};
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> updateProfile({
    required String email,
    String? username,
    String? fullName,
    String? bio,
    String? avatarUrl,
    String? age,
    String? gender,
  }) async {
    final body = <String, dynamic>{'email': email};
    if (username != null) body['username'] = username;
    if (fullName != null) body['fullName'] = fullName;
    if (bio != null) body['bio'] = bio;
    if (avatarUrl != null) body['avatarUrl'] = avatarUrl;
    if (age != null) body['age'] = age;
    if (gender != null) body['gender'] = gender;

    final response = await http.put(
      Uri.parse('$_baseUrl/update-profile'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {'success': false, 'message': data['message'] ?? 'Update failed'};
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> updateSettings({
    required String email,
    required Map<String, dynamic> preferences,
  }) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/update-settings'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'preferences': preferences}),
    );
    final data = jsonDecode(response.body);
    return response.statusCode == 200
        ? {'success': true, ...data}
        : {'success': false, 'message': data['message'] ?? 'Update failed'};
  }

  // ── NLP Pronunciation Evaluation ──────────────────────────────────────────
  /// Tries the backend first, falls back to local 7-layer evaluator.
  static Future<Map<String, dynamic>> evaluatePronunciation({
    required String transcript,
    required String expectedAnswer,
    String expectedHindi = '',
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_evalUrl/pronunciation'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'transcript': transcript,
              'expectedAnswer': expectedAnswer,
              'expectedHindi': expectedHindi,
            }),
          )
          .timeout(const Duration(seconds: 5));
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) return {'success': true, ...data};
    } catch (_) {
      // Server unreachable — use local evaluator
    }
    return _localEval(transcript, expectedAnswer, expectedHindi);
  }

  // ── Local 7-layer NLP (mirrors web nlpEvalService.js) ─────────────────────
  static Map<String, dynamic> _localEval(
    String transcript,
    String expectedAnswer,
    String expectedHindi,
  ) {
    if (transcript.trim().isEmpty) {
      return {
        'success': true,
        'isCorrect': false,
        'confidence': 0.0,
        'feedback': 'No speech detected. Please try again.',
        'matchType': 'none',
      };
    }
    final t = transcript.trim();
    final tLow = t.toLowerCase();
    final expected = expectedAnswer.trim().toLowerCase();

    // 1. Exact Hindi
    if (expectedHindi.trim().isNotEmpty && t.contains(expectedHindi.trim())) {
      return _ok(1.0, '🎉 Perfect pronunciation!', 'exact_hindi');
    }
    // 2. Exact Roman
    if (tLow == expected || tLow.contains(expected)) {
      return _ok(0.98, '✅ Excellent!', 'exact_roman');
    }
    // 3. Phonetic normalization
    final normT = _phonNorm(tLow), normE = _phonNorm(expected);
    if (normT == normE || normT.contains(normE)) {
      return _ok(0.90, '✅ Good pronunciation!', 'phonetic_norm');
    }
    // 4. Levenshtein >=75%
    final maxLen = [
      normT.length,
      normE.length,
      1,
    ].reduce((a, b) => a > b ? a : b);
    final lSim = 1.0 - _lev(normT, normE) / maxLen;
    if (lSim >= 0.75)
      return _ok(lSim, '✅ Very close! Minor difference.', 'fuzzy_levenshtein');
    // 5. Dice >=70%
    final dice = _dice(normT, normE);
    if (dice >= 0.70) return _ok(dice, '✅ Almost there!', 'dice_similarity');
    // 6. Partial word >=80%
    for (final w in normT.split(RegExp(r'\s+'))) {
      final wd = _dice(w, normE);
      if (wd >= 0.80) return _ok(wd, '✅ Good — I heard it!', 'partial_word');
    }
    // Fail
    final best = lSim > dice ? lSim : dice;
    return {
      'success': true,
      'isCorrect': false,
      'confidence': best,
      'feedback': best > 0.5
          ? '❌ Almost! You said "$transcript" — try "$expectedAnswer".'
          : '❌ Not quite. The correct sound is "$expectedAnswer".',
      'matchType': 'no_match',
    };
  }

  static Map<String, dynamic> _ok(double c, String f, String m) => {
    'success': true,
    'isCorrect': true,
    'confidence': c,
    'feedback': f,
    'matchType': m,
  };

  static String _phonNorm(String s) => s
      .replaceAll(RegExp(r'[^a-z0-9\s]'), '')
      .replaceAll(RegExp(r'([aeiou])\1+'), r'$1')
      .replaceAll('shh', 'sh')
      .trim();

  static int _lev(String a, String b) {
    final dp = List.generate(
      a.length + 1,
      (i) => List.generate(b.length + 1, (j) => j == 0 ? i : (i == 0 ? j : 0)),
    );
    for (var i = 1; i <= a.length; i++) {
      for (var j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] == b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 +
                  [
                    dp[i - 1][j],
                    dp[i][j - 1],
                    dp[i - 1][j - 1],
                  ].reduce((x, y) => x < y ? x : y);
      }
    }
    return dp[a.length][b.length];
  }

  static double _dice(String a, String b) {
    if (a == b) return 1.0;
    if (a.length < 2 || b.length < 2) return 0.0;
    Map<String, int> bg(String s) {
      final m = <String, int>{};
      for (var i = 0; i < s.length - 1; i++) {
        final k = s.substring(i, i + 2);
        m[k] = (m[k] ?? 0) + 1;
      }
      return m;
    }

    final aB = bg(a), bB = bg(b);
    var inter = 0;
    for (final e in aB.entries) {
      inter += [e.value, bB[e.key] ?? 0].reduce((x, y) => x < y ? x : y);
    }
    return (2.0 * inter) / ((a.length - 1) + (b.length - 1));
  }

  // ── Community ──────────────────────────────────────────────────────────────

  /// Search users by username or fullName
  static Future<List<Map<String, dynamic>>> searchUsers(String query) async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl/search?q=${Uri.encodeComponent(query)}'))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Get community data (friend requests + friends list)
  static Future<Map<String, dynamic>> getCommunityData(String email) async {
    try {
      final response = await http
          .get(
            Uri.parse(
              '$_baseUrl/community/data?email=${Uri.encodeComponent(email)}',
            ),
          )
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'friendRequests': [], 'friends': []};
    } catch (_) {
      return {'friendRequests': [], 'friends': []};
    }
  }

  /// Get user profile by username
  static Future<Map<String, dynamic>> getUserProfile(
    String username, {
    String? requesterEmail,
  }) async {
    try {
      String url = '$_baseUrl/profile/$username';
      if (requesterEmail != null) {
        url += '?requesterEmail=${Uri.encodeComponent(requesterEmail)}';
      }
      final response = await http
          .get(Uri.parse(url))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {};
    } catch (_) {
      return {};
    }
  }

  /// Send friend request
  static Future<bool> sendFriendRequest(
    String requesterEmail,
    String targetUsername,
  ) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/friend-request/send'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'requesterEmail': requesterEmail,
              'targetUsername': targetUsername,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Accept friend request
  static Future<bool> acceptFriendRequest(
    String currentEmail,
    String targetId,
  ) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/friend-request/accept'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'currentEmail': currentEmail,
              'targetId': targetId,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Reject friend request
  static Future<bool> rejectFriendRequest(
    String currentEmail,
    String targetId,
  ) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_baseUrl/friend-request/reject'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'currentEmail': currentEmail,
              'targetId': targetId,
            }),
          )
          .timeout(const Duration(seconds: 10));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ── AI Services ───────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getDailyPlan({
    required List<int> completedLessons,
    required int streak,
    required int dailyGoalMinutes,
    required List<dynamic> lessonScores,
    required int todayProgress,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_host/api/ai/daily-plan'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'completedLessons': completedLessons,
              'streak': streak,
              'dailyGoalMinutes': dailyGoalMinutes,
              'lessonScores': lessonScores,
              'todayProgress': todayProgress,
            }),
          )
          .timeout(const Duration(seconds: 15));
      final data = jsonDecode(response.body);
      return response.statusCode == 200
          ? {'success': true, ...data}
          : {
              'success': false,
              'message': data['error'] ?? 'Failed to fetch AI plan',
            };
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }

  static Future<Map<String, dynamic>> chatWithAI({
    required String message,
    required List<Map<String, String>> history,
    required Map<String, dynamic> userProgress,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$_host/api/ai/chat'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'message': message,
              'history': history,
              'userProgress': userProgress,
            }),
          )
          .timeout(const Duration(seconds: 20));
      final data = jsonDecode(response.body);
      return response.statusCode == 200
          ? {'success': true, ...data}
          : {
              'success': false,
              'message': data['message'] ?? 'Failed to chat with AI',
            };
    } catch (e) {
      return {'success': false, 'message': 'Network error'};
    }
  }
}

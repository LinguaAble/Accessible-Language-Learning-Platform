import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserProvider with ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  // ── Identity ──────────────────────────────────────────────────────────────
  String get email => _user?['email'] ?? '';
  String get username =>
      _user?['username'] ??
      (_user?['email'] != null
          ? (_user!['email'] as String).split('@')[0]
          : 'Learner');
  String get fullName => _user?['fullName'] ?? '';
  String get bio => _user?['bio'] ?? '';
  String get avatarUrl => _user?['avatarUrl'] ?? '';
  String get age => (_user?['age'] ?? '').toString();
  String get gender => _user?['gender'] ?? '';

  // ── Progress ──────────────────────────────────────────────────────────────
  List<dynamic> get completedLessons =>
      _user?['completedLessons'] as List<dynamic>? ?? [];
  int get todayProgress => _user?['todayProgress'] as int? ?? 0;
  List<dynamic> get dailyScores =>
      _user?['dailyScores'] as List<dynamic>? ?? [];
  List<dynamic> get dailyLessonCounts =>
      _user?['dailyLessonCounts'] as List<dynamic>? ?? [];

  // ── Streak ────────────────────────────────────────────────────────────────
  int get streak => _user?['streak'] as int? ?? 0;
  String get lastStreakDate => _user?['lastStreakDate'] ?? '';

  // ── Preferences ───────────────────────────────────────────────────────────
  Map<String, dynamic> get preferences {
    final raw = _user?['preferences'];
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return {
      'dailyGoalMinutes': 5,
      'soundEffects': false,
      'animationReduced': false,
      'fontSize': 'medium',
      'theme': 'dark',
      'dyslexiaFont': false,
      'colorOverlay': 'none',
    };
  }

  int get dailyGoalMinutes =>
      (preferences['dailyGoalMinutes'] as int?) ?? 5;
  bool get soundEffects =>
      preferences['soundEffects'] as bool? ?? false;
  bool get animationReduced =>
      preferences['animationReduced'] as bool? ?? false;
  String get fontSize =>
      preferences['fontSize'] as String? ?? 'medium';
  bool get dyslexiaFont =>
      preferences['dyslexiaFont'] as bool? ?? false;
  String get colorOverlay =>
      preferences['colorOverlay'] as String? ?? 'none';

  // ── Login history ─────────────────────────────────────────────────────────
  List<dynamic> get loginHistory =>
      _user?['loginHistory'] as List<dynamic>? ?? [];

  // ── Init ──────────────────────────────────────────────────────────────────
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final userStr = prefs.getString('user');
    if (userStr != null) _user = jsonDecode(userStr);
    notifyListeners();
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  Future<void> login(
    String token,
    Map<String, dynamic> userData,
    bool rememberMe,
  ) async {
    _token = token;
    _user = userData;

    if (rememberMe) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('user', jsonEncode(userData));
      if (userData['completedLessons'] != null) {
        await prefs.setString(
          'completedLessons',
          jsonEncode(userData['completedLessons']),
        );
      }
    }
    notifyListeners();
  }

  // ── Update fields ─────────────────────────────────────────────────────────
  Future<void> updateUser(Map<String, dynamic> updatedFields) async {
    if (_user == null) return;

    // Deep-merge preferences if present
    if (updatedFields.containsKey('preferences') &&
        _user!.containsKey('preferences')) {
      final merged = Map<String, dynamic>.from(preferences)
        ..addAll(
          Map<String, dynamic>.from(
              updatedFields['preferences'] as Map? ?? {}),
        );
      updatedFields = {...updatedFields, 'preferences': merged};
    }

    _user = {..._user!, ...updatedFields};
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(_user));
    notifyListeners();
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    await prefs.remove('completedLessons');
    notifyListeners();
  }
}

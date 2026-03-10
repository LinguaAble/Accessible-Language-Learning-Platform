import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LinguaNotification {
  final int id;
  final String type; // 'inactivity', 'break', 'goal', 'milestone', 'encouragement'
  final String title;
  final String message;
  final String? actionLabel;
  final String? actionPath;
  final int timestamp;
  bool read;

  LinguaNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.actionLabel,
    this.actionPath,
    required this.timestamp,
    this.read = false,
  });
}

class NotificationProvider extends ChangeNotifier {
  static const int minGapMs = 5 * 60 * 1000;

  Map<String, dynamic> notifPrefs = {
    'inactivityReminders': true,
    'breakReminders': true,
    'goalReminders': true,
    'milestoneAlerts': true,
    'inactivityMinutes': 30,
    'breakIntervalMinutes': 20,
    'quietHoursStart': 22,
    'quietHoursEnd': 8,
  };

  List<LinguaNotification> notifications = [];
  LinguaNotification? toast;

  int _lastNotifAt = 0;
  int _idCounter = 1;

  Timer? _inactivityTimer;
  Timer? _breakTimer;
  bool _isStudying = false;

  NotificationProvider() {
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString('linguaable_notif_prefs');
    if (stored != null) {
      final decoded = jsonDecode(stored) as Map<String, dynamic>;
      notifPrefs = {...notifPrefs, ...decoded};
      notifyListeners();
    }
    _resetInactivity();
  }

  Future<void> _savePrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('linguaable_notif_prefs', jsonEncode(notifPrefs));
  }

  bool _isQuietNow() {
    final h = DateTime.now().hour;
    final s = notifPrefs['quietHoursStart'] as int;
    final e = notifPrefs['quietHoursEnd'] as int;
    return s > e ? (h >= s || h < e) : (h >= s && h < e);
  }

  LinguaNotification _makeNotif(String type, String title, String message, [String? actionLabel, String? actionPath]) {
    return LinguaNotification(
      id: _idCounter++,
      type: type,
      title: title,
      message: message,
      actionLabel: actionLabel,
      actionPath: actionPath,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
  }

  void _pushNotification(LinguaNotification notif) {
    if (_isQuietNow()) {
      debugPrint('[NotifProvider] BLOCKED by quiet hours');
      return;
    }
    final now = DateTime.now().millisecondsSinceEpoch;
    if (now - _lastNotifAt < minGapMs) {
      debugPrint('[NotifProvider] THROTTLED — gap=${now - _lastNotifAt}ms < ${minGapMs}ms');
      return;
    }
    
    _lastNotifAt = now;
    notifications.insert(0, notif);
    if (notifications.length > 50) notifications.removeLast();
    toast = notif;
    debugPrint('[NotifProvider] PUSHED: "${notif.title}" — total=${notifications.length}, unread=${unreadCount}');
    notifyListeners();
  }

  void dismissToast() {
    toast = null;
    notifyListeners();
  }

  void markAllRead() {
    for (var n in notifications) {
      n.read = true;
    }
    notifyListeners();
  }

  void clearAll() {
    notifications.clear();
    notifyListeners();
  }

  int get unreadCount {
    return notifications.where((n) => !n.read).length;
  }

  // US1
  void _resetInactivity() {
    if (notifPrefs['inactivityReminders'] != true) return;
    _inactivityTimer?.cancel();
    _inactivityTimer = Timer(Duration(minutes: notifPrefs['inactivityMinutes'] as int), () {
      _pushNotification(_makeNotif(
        'inactivity',
        '👋 Still there?',
        "You've been away for a while. Ready to continue learning?",
        'Resume Learning',
        '/lessons/1',
      ));
    });
  }

  void reportUserActivity() {
    _resetInactivity();
  }

  // US4
  void startStudySession() {
    if (notifPrefs['breakReminders'] != true) return;
    _isStudying = true;
    _breakTimer?.cancel();
    _breakTimer = Timer(Duration(minutes: notifPrefs['breakIntervalMinutes'] as int), () {
      if (!_isStudying) return;
      _pushNotification(_makeNotif(
        'break',
        '☕ Time for a short break!',
        "You've been studying for ${notifPrefs['breakIntervalMinutes']} minutes. A quick rest helps you remember more.",
        'Take a Break',
      ));
    });
  }

  void endStudySession() {
    _isStudying = false;
    _breakTimer?.cancel();
  }

  // US3
  void triggerGoalReminder(int dailyGoalMinutes, int progressMinutes) {
    if (notifPrefs['goalReminders'] != true) return;
    if (dailyGoalMinutes <= 0) return;
    final pct = ((progressMinutes / dailyGoalMinutes) * 100).round();
    if (pct < 100) {
      _pushNotification(_makeNotif(
        'goal',
        '🎯 Daily Goal Check-in',
        "You're $pct% towards your $dailyGoalMinutes-minute goal today. Keep it up!",
        'Start a Lesson',
        '/lessons/1',
      ));
    }
  }

  // US5
  void triggerMilestone(String message, [String actionLabel = 'Keep Learning', String actionPath = '/lessons/1']) {
    if (notifPrefs['milestoneAlerts'] != true) return;
    _pushNotification(_makeNotif('milestone', '🏆 Achievement!', message, actionLabel, actionPath));
  }

  // US5
  void triggerEncouragement(String message) {
    if (notifPrefs['milestoneAlerts'] != true) return;
    _pushNotification(_makeNotif('encouragement', '⭐ Great work!', message));
  }

  Future<void> updateNotifPrefs(Map<String, dynamic> updates) async {
    notifPrefs = {...notifPrefs, ...updates};
    await _savePrefs();
    notifyListeners();
  }

  @override
  void dispose() {
    _inactivityTimer?.cancel();
    _breakTimer?.cancel();
    super.dispose();
  }
}

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<Map<String, dynamic>> weeklyData = [];
  int totalLessonsCompleted = 0;

  @override
  void initState() {
    super.initState();
    _syncAndLoad();
  }

  Future<void> _syncAndLoad() async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    if (provider.email.isNotEmpty) {
      try {
        final result = await ApiService.getUserData(provider.email);
        if (result['success'] == true && result['user'] != null) {
          final userData = Map<String, dynamic>.from(result['user'] as Map);
          // Pull streak fields from top-level (login response) if present
          if (result['streak'] != null) userData['streak'] = result['streak'];
          if (result['lastStreakDate'] != null) userData['lastStreakDate'] = result['lastStreakDate'];
          await provider.updateUser(userData);
        }
      } catch (_) {}
    }
    _buildWeeklyData();
  }

  void _buildWeeklyData() {
    final provider = Provider.of<UserProvider>(context, listen: false);
    final now = DateTime.now();
    final todayStr = _fmt(now);

    // Start of week (Monday)
    final dayOfWeek = now.weekday; // 1=Mon, 7=Sun
    final monday = now.subtract(Duration(days: dayOfWeek - 1));

    final scores = provider.dailyScores;
    final days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    final data = <Map<String, dynamic>>[];
    for (int i = 0; i < 7; i++) {
      final d = monday.add(Duration(days: i));
      final str = _fmt(d);
      int score = 0;
      for (final e in scores) {
        if (e is Map && e['date'] == str) {
          score = (e['score'] as num?)?.toInt() ?? 0;
        }
      }
      data.add({
        'day': days[i],
        'value': score,
        'isToday': str == todayStr,
      });
    }

    setState(() {
      weeklyData = data;
      totalLessonsCompleted = provider.completedLessons.length;
    });
  }

  String _fmt(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    final user = provider.user ?? {};
    final displayName = provider.username;
    final todayProgress = provider.todayProgress;
    final dailyGoal = provider.dailyGoalMinutes;
    final goalPct =
        dailyGoal > 0 ? (todayProgress / dailyGoal * 100).round().clamp(0, 100) : 0;
    final maxVal =
        weeklyData.isEmpty ? 1 : weeklyData.map((d) => d['value'] as int).reduce(max).clamp(1, 999);

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _syncAndLoad,
          color: const Color(0xFFF79C42),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- HEADER ---
                  _buildHeader(displayName, user, totalLessonsCompleted, provider),
                  const SizedBox(height: 24),

                  // --- HERO CARD ---
                  _buildHeroCard(),
                  const SizedBox(height: 20),

                  // --- DAILY GOAL + LESSONS ROW ---
                  Row(
                    children: [
                      Expanded(child: _buildGoalCard(goalPct, todayProgress, dailyGoal)),
                      const SizedBox(width: 14),
                      Expanded(child: _buildLessonsCard(totalLessonsCompleted)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // --- WEEKLY CHART ---
                  _buildWeeklyChart(maxVal),
                  const SizedBox(height: 20),

                  // --- QUICK ACTIONS ---
                  _buildQuickActions(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(
    String name,
    Map<String, dynamic> user,
    int totalLessons,
    UserProvider provider,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'नमस्ते,',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF79C42),
                ),
              ),
              Text(
                '$name 👋',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Ready to continue your Hindi journey?',
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
        // Streak + Avatar
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department, color: Colors.orange, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${provider.streak} Day${provider.streak == 1 ? '' : 's'}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                      color: Color(0xFFD97706),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_none, color: Colors.blueGrey),
                  onPressed: () => context.push('/settings'),
                  constraints: const BoxConstraints(),
                  padding: const EdgeInsets.only(right: 12),
                ),
                GestureDetector(
                  onTap: () => context.push('/settings'),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFF79C42), width: 2),
                      color: const Color(0xFFE2E8F0),
                    ),
                    child: ClipOval(
                      child: Image.network(
                        user['avatarUrl'] ??
                            'https://api.dicebear.com/7.x/avataaars/png?seed=$name',
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.person, size: 24),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  void _showLogoutSheet(UserProvider provider) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              provider.username,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              provider.email,
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await provider.logout();
                  if (mounted) {
                    Navigator.pop(ctx);
                    context.go('/');
                  }
                },
                icon: const Icon(Icons.logout, size: 18),
                label: const Text('Sign Out'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF3B82F6).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Text(
              '→ CONTINUE LEARNING',
              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 15),
          const Text(
            'Common Phrases',
            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const Text(
            'आम वाक्यांश',
            style: TextStyle(color: Colors.white70, fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          const Text(
            'Master 10 essential greetings for daily conversation',
            style: TextStyle(color: Colors.white, fontSize: 14),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => context.push('/lessons/1'),
            icon: const Icon(Icons.play_circle_fill),
            label: const Text('START NOW'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF1D4ED8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGoalCard(int goalPct, int progress, int goal) {
    String status;
    if (goalPct >= 100) {
      status = '🎉 Goal reached!';
    } else if (goalPct >= 50) {
      status = '🔥 Halfway!';
    } else {
      status = '💪 Keep going!';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          const Text('Daily Goal', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 12),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 70,
                height: 70,
                child: CircularProgressIndicator(
                  value: (goalPct / 100).clamp(0.0, 1.0),
                  strokeWidth: 8,
                  backgroundColor: Colors.grey.shade100,
                  color: const Color(0xFFF79C42),
                ),
              ),
              Text(
                '$goalPct%',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(status, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(
            'Target: $goal min',
            style: const TextStyle(color: Colors.grey, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildLessonsCard(int count) {
    return GestureDetector(
      onTap: () => context.push('/lessons/1'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            const Icon(Icons.trending_up, color: Color(0xFFF79C42), size: 28),
            const SizedBox(height: 12),
            Text(
              '$count',
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            const Text(
              'Lessons Completed',
              style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'View All',
                  style: TextStyle(
                    color: Color(0xFFF79C42),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Icon(Icons.chevron_right, size: 16, color: Color(0xFFF79C42)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeeklyChart(int maxVal) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'This Week',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              Icon(Icons.bar_chart, size: 18, color: Colors.grey.shade400),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 140,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: weeklyData.map((data) {
                final val = data['value'] as int;
                final isToday = data['isToday'] as bool;
                final barHeight = maxVal > 0 ? (val / maxVal * 100).clamp(4.0, 100.0) : 4.0;

                return Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (val > 0)
                        Text(
                          '$val',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: isToday
                                ? const Color(0xFFF79C42)
                                : Colors.grey.shade500,
                          ),
                        ),
                      const SizedBox(height: 4),
                      Container(
                        width: 14,
                        height: barHeight,
                        decoration: BoxDecoration(
                          color: isToday
                              ? const Color(0xFFF79C42)
                              : const Color(0xFFF79C42).withOpacity(0.35),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        data['day'],
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isToday ? FontWeight.w800 : FontWeight.w600,
                          color: isToday
                              ? const Color(0xFFF79C42)
                              : Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'label': 'Lessons', 'icon': Icons.menu_book, 'path': '/lessons', 'color': const Color(0xFFE67E22)},
      {'label': 'Leaderboard', 'icon': Icons.emoji_events, 'path': '/leaderboard', 'color': const Color(0xFF9B59B6)},
      {'label': 'Settings', 'icon': Icons.settings, 'path': '/settings', 'color': const Color(0xFF3B82F6)},
      {'label': 'Sign Out', 'icon': Icons.logout, 'path': 'logout', 'color': const Color(0xFFEF4444)},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 12),
        ...actions.map((action) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: InkWell(
              onTap: () async {
                if (action['path'] == 'logout') {
                  final provider = Provider.of<UserProvider>(context, listen: false);
                  await provider.logout();
                  if (mounted) context.go('/');
                } else {
                  context.push(action['path'] as String);
                }
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: (action['color'] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(action['icon'] as IconData, color: action['color'] as Color, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Text(
                      action['label'] as String,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    ),
                    const Spacer(),
                    Icon(Icons.chevron_right, size: 18, color: Colors.grey.shade400),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}

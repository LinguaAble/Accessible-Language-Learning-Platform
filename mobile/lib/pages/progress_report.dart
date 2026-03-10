import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';

class ProgressReportPage extends StatelessWidget {
  const ProgressReportPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final name = provider.username;
    final streak = provider.streak;
    
    // Total Lessons and Max Lesson
    int totalLessons = provider.completedLessons.length;
    int maxLessonCompleted = 0;
    if (provider.completedLessons.isNotEmpty) {
      final lessons = provider.completedLessons.map((e) => int.tryParse(e.toString()) ?? 0).toList();
      lessons.sort();
      maxLessonCompleted = lessons.last;
    }
    int currentLesson = maxLessonCompleted + 1;

    // Aggregating points
    int totalPoints = 0;
    for (var entry in provider.dailyScores) {
      if (entry is Map) {
        totalPoints += (entry['score'] as num?)?.toInt() ?? 0;
      }
    }

    // Active Sessions (unique days with scores or login)
    final activeDays = <String>{};
    for (var log in provider.loginHistory) {
      try {
        if (log is Map && log['timestamp'] != null) {
          activeDays.add(log['timestamp'].toString().split('T')[0]);
        }
      } catch (_) {}
    }
    for (var s in provider.dailyScores) {
      if (s is Map && (s['score'] ?? 0) > 0 && s['date'] != null) {
        activeDays.add(s['date']);
      }
    }
    final dailyCounts = provider.user?['dailyLessonCounts'] as List? ?? [];
    for (var c in dailyCounts) {
      if (c is Map && (c['count'] ?? 0) > 0 && c['date'] != null) {
        activeDays.add(c['date']);
      }
    }
    final activeSessions = activeDays.length;

    // Dynamic Skill Strengths Setup
    int baseProgress = activeSessions * 10;
    double vocabPct = (baseProgress + (totalLessons * 4)).clamp(10, 100) / 100.0;
    double grammarPct = (baseProgress + (totalLessons * 3)).clamp(5, 100) / 100.0;
    double pronPct = (baseProgress + (totalLessons * 2)).clamp(5, 100) / 100.0;
    double consPct = ((streak * 15) + (activeSessions * 5)).clamp(5, 100) / 100.0;

    // Encouragement message
    String message = "Every step you take is a beautiful beginning. You're doing wonderful.";
    if (totalLessons > 0) message = "You're making steady and amazing progress. Learning is a journey, not a race. Take it at your own gentle pace.";
    if (streak > 2) message = "Wow, $streak days in a row! You're building a wonderful habit. Take pride in your dedication, and don't forget to rest when needed.";

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: cs.surface,
                        shape: BoxShape.circle,
                        border: Border.all(color: cs.outline),
                      ),
                      child: Icon(Icons.chevron_left, color: cs.onSurface),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Progress 🌱',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: cs.onSurface,
                        ),
                      ),
                      Text(
                        'A calm reflection of your growing knowledge',
                        style: TextStyle(
                          fontSize: 12,
                          color: cs.onSurface.withOpacity(0.5),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Summary Stats Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildStatCard(context, '⭐', '$totalPoints', 'Points'),
                    const SizedBox(width: 12),
                    _buildStatCard(context, '📚', '$totalLessons', 'Lessons'),
                    const SizedBox(width: 12),
                    _buildStatCard(context, '📅', '$activeSessions', 'Active Days'),
                    const SizedBox(width: 12),
                    _buildStatCard(context, '🔥', '$streak', 'Streak'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Learning Path
              Text(
                'Learning Path Status',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: cs.onSurface,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: cs.outline),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildPathNode(
                      context,
                      'Done',
                      Icons.check_circle,
                      Colors.green,
                      'Lesson ${maxLessonCompleted > 0 ? maxLessonCompleted : 0}',
                      active: maxLessonCompleted > 0,
                    ),
                    Icon(Icons.chevron_right, color: cs.outline),
                    _buildPathNode(
                      context,
                      'Current',
                      Icons.play_circle_fill,
                      const Color(0xFFF79C42),
                      'Lesson $currentLesson',
                      active: true,
                      pulse: true,
                    ),
                    Icon(Icons.chevron_right, color: cs.outline),
                    _buildPathNode(
                      context,
                      'Next',
                      Icons.lock,
                      cs.onSurface.withOpacity(0.3),
                      'Lesson ${currentLesson + 1}',
                      active: false,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Skill Strengths
              Text(
                'Skill Strengths',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: cs.onSurface,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: cs.outline),
                ),
                child: Column(
                  children: [
                    _buildSkillBar(context, 'Vocabulary', vocabPct, Colors.orange),
                    const SizedBox(height: 16),
                    _buildSkillBar(context, 'Grammar', grammarPct, Colors.blue),
                    const SizedBox(height: 16),
                    _buildSkillBar(context, 'Pronunciation', pronPct, Colors.purple),
                    const SizedBox(height: 16),
                    _buildSkillBar(context, 'Consistency', consPct, Colors.green),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Button to Detailed Report
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => context.push('/report'),
                  icon: const Icon(Icons.bar_chart),
                  label: const Text('View Detailed Performance Report'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    side: BorderSide(color: cs.outline),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Calm Encouragement
              Container(
                padding: const EdgeInsets.all(30),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: cs.outline),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Text(
                  message,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    height: 1.5,
                    color: cs.onSurface.withOpacity(0.8),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String emoji, String val, String lbl) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: 100,
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(
            val,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          Text(
            lbl,
            style: TextStyle(fontSize: 11, color: cs.onSurface.withOpacity(0.5)),
          ),
        ],
      ),
    );
  }

  Widget _buildPathNode(BuildContext context, String label, IconData icon, Color color, String sub, {bool active = false, bool pulse = false}) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      children: [
        Icon(icon, color: color, size: pulse ? 36 : 28),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: active ? FontWeight.w800 : FontWeight.w500,
            color: active ? cs.onSurface : cs.onSurface.withOpacity(0.5),
          ),
        ),
        Text(
          sub,
          style: TextStyle(fontSize: 10, color: cs.onSurface.withOpacity(0.4)),
        ),
      ],
    );
  }

  Widget _buildSkillBar(BuildContext context, String label, double pct, Color color) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            Text('${(pct * 100).toInt()}%', style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.5))),
          ],
        ),
        const SizedBox(height: 6),
        Container(
          height: 6,
          decoration: BoxDecoration(
            color: cs.outline.withOpacity(0.3),
            borderRadius: BorderRadius.circular(3),
          ),
          child: FractionallySizedBox(
            widthFactor: pct,
            alignment: Alignment.centerLeft,
            child: Container(
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

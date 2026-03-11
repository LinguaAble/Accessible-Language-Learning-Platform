import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';

class LearningReportPage extends StatefulWidget {
  const LearningReportPage({super.key});

  @override
  State<LearningReportPage> createState() => _LearningReportPageState();
}

class _LearningReportPageState extends State<LearningReportPage> {
  bool _isWeekly = true;

  String _fmtDate(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  DateTime _startOfWeek(DateTime d) => d.subtract(Duration(days: d.weekday - 1));

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    final cs = Theme.of(context).colorScheme;

    // Type-safe extraction of nested lists using Map checking
    List<Map<String, dynamic>> safeList(List<dynamic> source) {
      return source.map((e) => e is Map ? Map<String, dynamic>.from(e) : <String, dynamic>{}).toList();
    }

    final dailyScores = safeList(provider.dailyScores);
    final dailyLessonCounts = safeList(provider.dailyLessonCounts);
    final loginHistory = safeList(provider.loginHistory);
    final completedLessons = provider.completedLessons;
    final streak = provider.streak;

    // Overall metrics
    final totalScore = dailyScores.fold<int>(0, (sum, s) => sum + ((s['score'] ?? 0) as num).toInt());
    final totalLessons = completedLessons.length;

    // This Week metrics
    final now = DateTime.now();
    final todayStr = _fmtDate(now);
    final sow = _startOfWeek(now);
    final sowStr = _fmtDate(sow);

    final thisWeekScores = dailyScores.where((s) {
      final d = s['date'] as String?;
      final eow = sow.add(const Duration(days: 6));
      final eowStr = _fmtDate(eow);
      return d != null && d.compareTo(sowStr) >= 0 && d.compareTo(eowStr) <= 0;
    }).toList();
    final weeklyPoints = thisWeekScores.fold<int>(0, (sum, s) => sum + ((s['score'] ?? 0) as num).toInt());

    final thisWeekLessons = dailyLessonCounts.where((l) {
      final d = l['date'] as String?;
      final eow = sow.add(const Duration(days: 6));
      final eowStr = _fmtDate(eow);
      return d != null && d.compareTo(sowStr) >= 0 && d.compareTo(eowStr) <= 0;
    }).toList();
    final weeklyLessonCount = thisWeekLessons.fold<int>(0, (sum, l) => sum + ((l['count'] ?? 0) as num).toInt());

    // Active Days computation
    final activeDaysSet = <String>{};
    for (var log in loginHistory) {
      try {
        if (log['timestamp'] != null) {
          final dt = DateTime.parse(log['timestamp'].toString());
          activeDaysSet.add(_fmtDate(dt));
        }
      } catch (_) {}
    }
    for (var s in dailyScores) {
      final score = ((s['score'] ?? 0) as num).toInt();
      final date = s['date'] as String?;
      if (score > 0 && date != null) activeDaysSet.add(date);
    }
    final activeSessions = activeDaysSet.length;

    // Weekly Chart Data points
    final maxWeeklyVal = max(20, thisWeekScores.fold<int>(0, (maxVal, s) {
      final sc = ((s['score'] ?? 0) as num).toInt();
      return maxVal > sc ? maxVal : sc;
    }));

    final dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final weeklyData = List.generate(7, (i) {
      final d = sow.add(Duration(days: i));
      final str = _fmtDate(d);
      final scoreObj = dailyScores.firstWhere((e) => e['date'] == str, orElse: () => {'score': 0});
      final sc = ((scoreObj['score'] ?? 0) as num).toInt();
      return {'day': dayNames[i], 'value': sc, 'isToday': str == todayStr};
    });

    // Skills computation
    final skillProgress = [
      {'label': 'Vocabulary', 'val': min(100, (totalLessons * 5) + (activeSessions * 2)).toDouble(), 'color': const Color(0xFF38BDF8)},
      {'label': 'Grammar', 'val': min(100, (totalLessons * 4) + (activeSessions * 1.5)).toDouble(), 'color': const Color(0xFF818CF8)},
      {'label': 'Pronunciation', 'val': min(100, (totalLessons * 3) + (activeSessions * 1)).toDouble(), 'color': const Color(0xFFA855F7)},
      {'label': 'Consistency', 'val': min(100, (streak * 10) + (activeSessions * 3)).toDouble(), 'color': const Color(0xFF34D399)},
    ];

    // Milestones state
    final milestones = [
      {'title': 'Seed Sower', 'desc': 'Complete 1st Lesson', 'unlocked': totalLessons >= 1, 'color': const Color(0xFFFBBF24), 'icon': Icons.diamond},
      {'title': 'Quick Learner', 'desc': 'Gain 100 Points Overall', 'unlocked': totalScore >= 100, 'color': const Color(0xFF38BDF8), 'icon': Icons.workspace_premium},
      {'title': 'Unstoppable', 'desc': 'Maintain 7 Day Streak', 'unlocked': streak >= 7, 'color': const Color(0xFFEF4444), 'icon': Icons.local_fire_department},
      {'title': 'Linguist', 'desc': 'Complete 10 Lessons', 'unlocked': totalLessons >= 10, 'color': const Color(0xFFA855F7), 'icon': Icons.emoji_events},
    ];

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: const Text('Performance Report', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: cs.onSurface.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text('LAST SYNCED: JUST NOW', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: cs.onSurface.withOpacity(0.5))),
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tracking your journey to language mastery.', style: TextStyle(color: cs.onSurface.withOpacity(0.6), fontSize: 16)),
              const SizedBox(height: 24),
              
              // Animated View Toggle
              Container(
                decoration: BoxDecoration(
                  color: cs.onSurface.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.all(4),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isWeekly = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _isWeekly ? cs.surface : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: _isWeekly ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4, offset: const Offset(0, 2))] : null,
                          ),
                          child: Center(child: Text('Weekly Snapshot', style: TextStyle(fontWeight: FontWeight.bold, color: _isWeekly ? cs.onSurface : cs.onSurface.withOpacity(0.5)))),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isWeekly = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: !_isWeekly ? cs.surface : Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: !_isWeekly ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4, offset: const Offset(0, 2))] : null,
                          ),
                          child: Center(child: Text('Overall Mastery', style: TextStyle(fontWeight: FontWeight.bold, color: !_isWeekly ? cs.onSurface : cs.onSurface.withOpacity(0.5)))),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              if (_isWeekly) ...[
                // Section 1: Weekly Snapshot
                _buildCard(
                  cs,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.show_chart, color: Color(0xFF38BDF8)),
                          const SizedBox(width: 8),
                          Text('Weekly Activity Velocity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: cs.onSurface)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(child: _buildSummaryItem(cs, '$weeklyPoints', 'Points this week', const Color(0xFF38BDF8))),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // Animated Bar chart
                      SizedBox(
                        height: 150,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: weeklyData.map((d) {
                            final val = d['value'] as int;
                            final isToday = d['isToday'] as bool;
                            final day = d['day'] as String;
                            final pct = maxWeeklyVal == 0 ? 0.0 : val / maxWeeklyVal;
                            return Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (val > 0) Text('$val', style: TextStyle(fontSize: 10, color: cs.onSurface.withOpacity(0.6))),
                                const SizedBox(height: 4),
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 500),
                                  width: 28,
                                  height: max(4.0, 100 * pct),
                                  decoration: BoxDecoration(
                                    color: isToday ? const Color(0xFF38BDF8) : cs.onSurface.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(day, style: TextStyle(fontSize: 12, color: isToday ? const Color(0xFF38BDF8) : cs.onSurface.withOpacity(0.6), fontWeight: isToday ? FontWeight.bold : FontWeight.normal)),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildMiniCard(cs, '${(() {
                      final todayMins = provider.todayProgress;
                      final goalMins = provider.preferences['dailyGoalMinutes'] as int? ?? 30;
                      return min(100, ((todayMins / goalMins) * 100).round());
                    })()}%', 'Goal Completed', Icons.track_changes, const Color(0xFF38BDF8))),
                    const SizedBox(width: 12),
                    Expanded(child: _buildMiniCard(cs, weeklyLessonCount > 0 ? 'High' : 'Low', 'Study Intensity', Icons.bolt, const Color(0xFFFBBF24))),
                  ],
                ),
                const SizedBox(height: 24),
                // Recommendation Block
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF38BDF8).withOpacity(0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.3), style: BorderStyle.solid),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(color: Color(0xFF38BDF8), shape: BoxShape.circle),
                        child: const Icon(Icons.auto_awesome, color: Colors.white),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Weekly Recommendation', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 6),
                            Text(
                              weeklyPoints > 50 
                                ? "You're showing incredible momentum! Keep this pace and you'll hit your monthly target 3 days early."
                                : "Consistency is key. Try to dedicate just 5 minutes today to keep your streak alive.",
                              style: TextStyle(color: cs.onSurface.withOpacity(0.7), fontSize: 13, height: 1.4),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ] else ...[
                // Section 2: Overall Mastery
                _buildCard(
                  cs,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.emoji_events, color: Color(0xFFFBBF24)),
                          const SizedBox(width: 8),
                          Text('Skill Proficiency', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: cs.onSurface)),
                        ],
                      ),
                      const SizedBox(height: 24),
                      ...skillProgress.map((s) => Padding(
                        padding: const EdgeInsets.only(bottom: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(s['label'] as String, style: const TextStyle(fontWeight: FontWeight.w600)),
                                Text('${(s['val'] as double).toInt()}%', style: TextStyle(color: s['color'] as Color, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Container(
                              height: 8,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: cs.onSurface.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: FractionallySizedBox(
                                alignment: Alignment.centerLeft,
                                widthFactor: (s['val'] as double) / 100.0,
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 600),
                                  curve: Curves.easeOutCubic,
                                  decoration: BoxDecoration(
                                    color: s['color'] as Color,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ),
                              ),
                            )
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _buildCard(
                  cs,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.workspace_premium, color: Color(0xFF34D399)),
                          const SizedBox(width: 8),
                          Text('Milestones & Unlocks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: cs.onSurface)),
                        ],
                      ),
                      const SizedBox(height: 20),
                      ...milestones.map((m) {
                        final unlocked = m['unlocked'] as bool;
                        final color = m['color'] as Color;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: unlocked ? color.withOpacity(0.05) : cs.onSurface.withOpacity(0.02),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: unlocked ? color.withOpacity(0.3) : cs.outline.withOpacity(0.2)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: unlocked ? color.withOpacity(0.1) : cs.onSurface.withOpacity(0.05),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(unlocked ? (m['icon'] as IconData) : Icons.lock, color: unlocked ? color : cs.onSurface.withOpacity(0.3), size: 20),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(m['title'] as String, style: TextStyle(fontWeight: FontWeight.bold, color: unlocked ? cs.onSurface : cs.onSurface.withOpacity(0.4))),
                                    const SizedBox(height: 2),
                                    Text(m['desc'] as String, style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.5))),
                                  ],
                                ),
                              ),
                              if (unlocked) Icon(Icons.check_circle, color: color),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Summary Grid stats
                GridView.count(
                  crossAxisCount: 3,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.0,
                  children: [
                    _buildGridStatCard(cs, '$weeklyPoints', 'Points This Week', const Color(0xFFFBBF24)),
                    _buildGridStatCard(cs, '$totalLessons', 'Lessons Done', const Color(0xFF38BDF8)),
                    _buildGridStatCard(cs, 'PRO', 'Tier Status', const Color(0xFF34D399)),
                  ],
                ),
              ],
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard(ColorScheme cs, {required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: cs.onSurface.withOpacity(0.02),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: cs.outline.withOpacity(0.2)),
      ),
      child: child,
    );
  }

  Widget _buildSummaryItem(ColorScheme cs, String val, String lbl, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(val, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: color)),
        Text(lbl, style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.6))),
      ],
    );
  }

  Widget _buildMiniCard(ColorScheme cs, String val, String lbl, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: cs.onSurface.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(val, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: cs.onSurface)),
          const SizedBox(height: 4),
          Text(lbl, textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: cs.onSurface.withOpacity(0.6))),
        ],
      ),
    );
  }

  Widget _buildGridStatCard(ColorScheme cs, String val, String lbl, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: cs.onSurface.withOpacity(0.02),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline.withOpacity(0.1)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(val, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: color)),
          const SizedBox(height: 4),
          Text(lbl, style: TextStyle(fontSize: 12, color: cs.onSurface.withOpacity(0.6))),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../providers/user_provider.dart';

class DailyStudyPlanWidget extends StatefulWidget {
  const DailyStudyPlanWidget({Key? key}) : super(key: key);

  @override
  _DailyStudyPlanWidgetState createState() => _DailyStudyPlanWidgetState();
}

class _DailyStudyPlanWidgetState extends State<DailyStudyPlanWidget> {
  String _plan = '';
  bool _loading = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    // Use addPostFrameCallback to avoid locking up initial build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchPlan();
    });
  }

  Future<void> _fetchPlan() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final userProv = Provider.of<UserProvider>(context, listen: false);
      if (userProv.user == null) {
        if (mounted) setState(() => _loading = false);
        return;
      }

      final prefs = await SharedPreferences.getInstance();
      final todayProgStr = prefs.getString('todayProgress');
      int todayProg =
          int.tryParse(todayProgStr ?? '0') ??
          userProv.user?['todayProgress'] ??
          0;
      int goalMins = userProv.preferences['dailyGoalMinutes'] ?? 5;

      final response = await ApiService.getDailyPlan(
        completedLessons: List<int>.from(
          userProv.user?['completedLessons'] ?? [],
        ),
        streak: userProv.user?['streak'] ?? 0,
        dailyGoalMinutes: goalMins,
        lessonScores: List<dynamic>.from(userProv.user?['lessonScores'] ?? []),
        todayProgress: todayProg,
      );

      if (mounted) {
        if (response['success']) {
          setState(() {
            _plan = response['plan'];
          });
        } else {
          setState(
            () => _error = 'Could not load your plan. Please try again.',
          );
        }
      }
    } catch (e) {
      if (mounted) setState(() => _error = 'Network error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome, color: Colors.orange, size: 20),
                const SizedBox(width: 8),
                const Text(
                  'AI Coach',
                  style: TextStyle(
                    color: Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: _loading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.refresh, size: 20),
                  onPressed: _loading ? null : _fetchPlan,
                  tooltip: 'Refresh',
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Today's Study Plan",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (_loading && _plan.isEmpty)
              const Text(
                "Generating your personalized plan...",
                style: TextStyle(color: Colors.grey),
              )
            else if (_error.isNotEmpty)
              Text(_error, style: const TextStyle(color: Colors.red))
            else if (_plan.isNotEmpty)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.menu_book, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _plan,
                      style: const TextStyle(fontSize: 15, height: 1.4),
                    ),
                  ),
                ],
              )
            else
              const Text(
                "Generating your personalized plan...",
                style: TextStyle(color: Colors.grey),
              ),
          ],
        ),
      ),
    );
  }
}

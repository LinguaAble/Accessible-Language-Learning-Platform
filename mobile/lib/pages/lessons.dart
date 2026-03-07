import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../data/lesson_data.dart';
import '../providers/user_provider.dart';
import '../widgets/accessibility_widget.dart';

class LessonsPage extends StatelessWidget {
  const LessonsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    final cs = Theme.of(context).colorScheme;
    final completed = provider.completedLessons.map((e) => int.parse('$e')).toList();
    final streak = provider.streak;

    String effectiveAvatar = provider.avatarUrl;
    if (effectiveAvatar.isEmpty) {
      effectiveAvatar = 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(provider.username)}&background=F79C42&color=fff&bold=true&size=128';
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      floatingActionButton: const AccessibilityFab(),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: cs.onSurface.withOpacity(0.6)),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Lessons',
          style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold),
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            margin: const EdgeInsets.only(right: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.local_fire_department,
                    color: Colors.orange, size: 14),
                const SizedBox(width: 3),
                Text(
                  '${streak}d',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                    color: Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/settings'),
            child: Container(
              margin: const EdgeInsets.only(right: 14, left: 4),
              child: CircleAvatar(
                radius: 15,
                backgroundColor: const Color(0xFFF79C42).withOpacity(0.3),
                backgroundImage: NetworkImage(effectiveAvatar),
                onBackgroundImageError: (_, __) {},
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Curriculum',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              'Master the Hindi alphabet and basic conversation.',
              style: TextStyle(fontSize: 14, color: cs.onSurface.withOpacity(0.55)),
            ),
            const SizedBox(height: 24),
            ...chapters.map((chapter) => _buildChapter(context, chapter, completed)),
          ],
        ),
      ),
    );
  }

  Widget _buildChapter(BuildContext context, Map<String, dynamic> chapter, List<int> completed) {
    final cs = Theme.of(context).colorScheme;
    final title = chapter['title'] as String;
    final subtitle = chapter['subtitle'] as String;
    final lessons = chapter['lessons'] as List<int>;

    Color chapterColor = const Color(0xFFE67E22);
    if (title.contains('Chapter 2')) chapterColor = const Color(0xFF3498DB);
    if (title.contains('Chapter 3')) chapterColor = const Color(0xFF9B59B6);

    return Container(
      margin: const EdgeInsets.only(bottom: 30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              border: Border(left: BorderSide(color: chapterColor, width: 5)),
            ),
            padding: const EdgeInsets.only(left: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(color: Colors.grey, fontSize: 14),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: chapterColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${lessons.length} Lessons',
                    style: TextStyle(
                      color: chapterColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.35,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: lessons.length,
            itemBuilder: (context, index) {
              final lessonId = lessons[index];
              final lessonMeta = lessonDatabase[lessonId];
              final isCompleted = completed.contains(lessonId);
              final isLocked = lessonId != 1 && !completed.contains(lessonId - 1);

              return GestureDetector(
                onTap: isLocked ? null : () => context.push('/lessons/$lessonId'),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? const Color(0xFF10B981).withOpacity(0.15)
                        : (isLocked
                            ? cs.surfaceContainerHighest
                            : cs.surface),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isCompleted
                          ? const Color(0xFF10B981)
                          : (isLocked
                              ? cs.outline.withOpacity(0.3)
                              : cs.outline),
                      width: 2,
                    ),
                    boxShadow: isLocked || isCompleted
                        ? []
                        : [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isCompleted
                            ? Icons.check_circle
                            : (isLocked
                                ? Icons.lock
                                : (lessonMeta?.title.contains('Pron') == true
                                    ? Icons.volume_up
                                    : (lessonMeta?.title.contains('Recap') == true
                                        ? Icons.refresh
                                        : Icons.play_circle_fill))),
                        color: isCompleted
                            ? const Color(0xFF10B981)
                            : (isLocked ? Colors.grey.shade400 : chapterColor),
                        size: 32,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Lesson $lessonId',
                        style: TextStyle(
                          color: isLocked
                              ? cs.onSurface.withOpacity(0.35)
                              : cs.onSurface.withOpacity(0.6),
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        lessonMeta?.title ?? 'Lesson $lessonId',
                        style: TextStyle(
                          color: isLocked
                              ? cs.onSurface.withOpacity(0.35)
                              : cs.onSurface,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

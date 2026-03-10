import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/notification_provider.dart';

class NotificationBell extends StatelessWidget {
  final Color? color;

  const NotificationBell({super.key, this.color});

  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationProvider>(
      builder: (context, provider, child) {
        final unreadCount = provider.unreadCount;
        debugPrint('[NotificationBell] rebuild — unread=$unreadCount, total=${provider.notifications.length}');

        return GestureDetector(
          onTap: () {
            provider.markAllRead();
            _showNotificationSheet(context);
          },
          child: SizedBox(
            width: 40,
            height: 40,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Center(
                  child: Icon(
                    Icons.notifications_outlined,
                    color: color ?? Colors.blueGrey,
                    size: 24,
                  ),
                ),
                if (unreadCount > 0)
                  Positioned(
                    right: 0,
                    top: 2,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: Theme.of(context).scaffoldBackgroundColor,
                          width: 1.5,
                        ),
                      ),
                      constraints:
                          const BoxConstraints(minWidth: 18, minHeight: 16),
                      child: Center(
                        child: Text(
                          unreadCount > 9 ? '9+' : unreadCount.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            height: 1,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showNotificationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _NotificationHistorySheet(),
    );
  }
}

class _NotificationHistorySheet extends StatelessWidget {
  const _NotificationHistorySheet();

  String _timeAgo(int timestamp) {
    final seconds =
        ((DateTime.now().millisecondsSinceEpoch - timestamp) / 1000).floor();
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return '${(seconds / 60).floor()}m ago';
    if (seconds < 86400) return '${(seconds / 3600).floor()}h ago';
    return '${(seconds / 86400).floor()}d ago';
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'inactivity':
        return Icons.waving_hand;
      case 'break':
        return Icons.local_cafe;
      case 'goal':
        return Icons.track_changes;
      case 'milestone':
        return Icons.workspace_premium;
      case 'encouragement':
        return Icons.star;
      default:
        return Icons.notifications;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'inactivity':
        return const Color(0xFFE67E22);
      case 'break':
        return const Color(0xFF3498DB);
      case 'goal':
        return const Color(0xFF9B59B6);
      case 'milestone':
        return const Color(0xFFF1C40F);
      case 'encouragement':
        return const Color(0xFF2ECC71);
      default:
        return const Color(0xFFE67E22);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Consumer<NotificationProvider>(
      builder: (context, provider, _) {
        final notifications = provider.notifications;

        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.65,
          ),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: cs.onSurface.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Row(
                  children: [
                    const Text(
                      '🔔 Notifications',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const Spacer(),
                    if (notifications.isNotEmpty)
                      GestureDetector(
                        onTap: () {
                          provider.clearAll();
                        },
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.delete_outline,
                                size: 14,
                                color: cs.onSurface.withOpacity(0.5)),
                            const SizedBox(width: 4),
                            Text(
                              'Clear all',
                              style: TextStyle(
                                fontSize: 12,
                                color: cs.onSurface.withOpacity(0.5),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),

              Divider(
                  height: 1,
                  color: cs.outline.withOpacity(0.3)),

              // Notification list
              if (notifications.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Column(
                    children: [
                      Icon(
                        Icons.notifications_none,
                        size: 40,
                        color: cs.onSurface.withOpacity(0.15),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'No notifications yet',
                        style: TextStyle(
                          color: cs.onSurface.withOpacity(0.4),
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                )
              else
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    padding: EdgeInsets.zero,
                    itemCount: notifications.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1,
                      indent: 56,
                      color: cs.outline.withOpacity(0.15),
                    ),
                    itemBuilder: (context, index) {
                      final n = notifications[index];
                      final typeColor = _colorForType(n.type);

                      return Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Icon
                            Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: typeColor.withOpacity(0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Icon(
                                  _iconForType(n.type),
                                  size: 16,
                                  color: typeColor,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),

                            // Content
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    n.title,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                      color: cs.onSurface,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    n.message,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color:
                                          cs.onSurface.withOpacity(0.6),
                                      height: 1.4,
                                    ),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (n.actionLabel != null &&
                                      n.actionPath != null) ...[
                                    const SizedBox(height: 4),
                                    GestureDetector(
                                      onTap: () {
                                        Navigator.pop(context);
                                        try {
                                          context.push(n.actionPath!);
                                        } catch (_) {}
                                      },
                                      child: Text(
                                        n.actionLabel!,
                                        style: TextStyle(
                                          color: typeColor,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 12,
                                          decoration:
                                              TextDecoration.underline,
                                        ),
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 4),
                                  Text(
                                    _timeAgo(n.timestamp),
                                    style: TextStyle(
                                      fontSize: 11,
                                      color:
                                          cs.onSurface.withOpacity(0.35),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

              // Bottom padding for safe area
              SizedBox(height: MediaQuery.of(context).padding.bottom + 8),
            ],
          ),
        );
      },
    );
  }
}

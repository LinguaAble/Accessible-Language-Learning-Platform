import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/notification_provider.dart';

class NotificationToastLayer extends StatefulWidget {
  final Widget child;
  const NotificationToastLayer({super.key, required this.child});

  @override
  State<NotificationToastLayer> createState() => _NotificationToastLayerState();
}

class _NotificationToastLayerState extends State<NotificationToastLayer>
    with SingleTickerProviderStateMixin {
  LinguaNotification? _currentToast;
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _showToast(LinguaNotification notif) {
    if (!mounted) return;
    setState(() => _currentToast = notif);
    _controller.forward(from: 0);

    // Auto-hide after 6 seconds
    Future.delayed(const Duration(seconds: 6), () {
      if (mounted && _currentToast?.id == notif.id) {
        _hideToast();
      }
    });
  }

  void _hideToast() {
    _controller.reverse().then((_) {
      if (mounted) {
        setState(() => _currentToast = null);
        context.read<NotificationProvider>().dismissToast();
      }
    });
  }

  IconData _getIconForType(String type) {
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

  Color _getColorForType(String type, BuildContext context) {
    switch (type) {
      case 'inactivity':
        return const Color(0xFFF59E0B);
      case 'break':
        return const Color(0xFF10B981);
      case 'goal':
        return const Color(0xFF3B82F6);
      case 'milestone':
        return const Color(0xFF9333EA);
      case 'encouragement':
        return const Color(0xFFF79C42);
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<NotificationProvider>(
      builder: (context, provider, _) {
        final toast = provider.toast;

        // Show new toast when provider has one
        if (toast != null &&
            (_currentToast == null || _currentToast!.id != toast.id)) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) _showToast(toast);
          });
        }

        return Stack(
          children: [
            widget.child,
            // Toast overlay
            if (_currentToast != null)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: SafeArea(
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      child: Material(
                        elevation: 12,
                        shadowColor: Colors.black38,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Theme.of(context).cardColor,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _getColorForType(
                                      _currentToast!.type, context)
                                  .withOpacity(0.4),
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: _getColorForType(
                                          _currentToast!.type, context)
                                      .withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _getIconForType(_currentToast!.type),
                                  color: _getColorForType(
                                      _currentToast!.type, context),
                                  size: 22,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      _currentToast!.title,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 14,
                                        color: Theme.of(context)
                                            .colorScheme
                                            .onSurface,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      _currentToast!.message,
                                      style: TextStyle(
                                        fontSize: 12.5,
                                        color: Theme.of(context)
                                            .colorScheme
                                            .onSurface
                                            .withOpacity(0.7),
                                      ),
                                      maxLines: 3,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    if (_currentToast!.actionLabel !=
                                        null) ...[
                                      const SizedBox(height: 6),
                                      GestureDetector(
                                        onTap: () {
                                          _hideToast();
                                          if (_currentToast!.actionPath !=
                                              null) {
                                            try {
                                              context.push(
                                                  _currentToast!.actionPath!);
                                            } catch (_) {}
                                          }
                                        },
                                        child: Text(
                                          _currentToast!.actionLabel!,
                                          style: TextStyle(
                                            color: _getColorForType(
                                                _currentToast!.type, context),
                                            fontWeight: FontWeight.w700,
                                            fontSize: 13,
                                            decoration:
                                                TextDecoration.underline,
                                          ),
                                        ),
                                      ),
                                    ]
                                  ],
                                ),
                              ),
                              GestureDetector(
                                onTap: _hideToast,
                                child: Padding(
                                  padding: const EdgeInsets.all(4),
                                  child: Icon(
                                    Icons.close,
                                    size: 18,
                                    color: Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withOpacity(0.4),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

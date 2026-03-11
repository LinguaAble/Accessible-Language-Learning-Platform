import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';

class UserProfilePage extends StatefulWidget {
  final String username;
  const UserProfilePage({super.key, required this.username});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  Map<String, dynamic>? _profile;
  bool _loading = true;
  String _error = '';
  bool _actionLoading = false;
  bool _showFriends = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    final data = await ApiService.getUserProfile(
      widget.username,
      requesterEmail: provider.email,
    );
    if (mounted) {
      setState(() {
        _loading = false;
        if (data.isEmpty) {
          _error = 'User not found';
        } else {
          _profile = data;
        }
      });
    }
  }

  Future<void> _handleFriendAction(String action) async {
    if (_profile == null) return;
    setState(() => _actionLoading = true);

    final provider = Provider.of<UserProvider>(context, listen: false);
    bool success;

    if (action == 'send') {
      success = await ApiService.sendFriendRequest(
        provider.email,
        widget.username,
      );
      if (success && mounted) {
        setState(() => _profile!['relationship'] = 'pending_sent');
      }
    } else if (action == 'accept') {
      success = await ApiService.acceptFriendRequest(
        provider.email,
        _profile!['_id'],
      );
      if (success && mounted) {
        // Refetch to get full stats
        await _loadProfile();
      }
    } else {
      success = false;
    }

    if (mounted) setState(() => _actionLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    if (_loading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: Text(
            'Loading ${widget.username}\'s profile...',
            style: TextStyle(color: cs.onSurface.withOpacity(0.5)),
          ),
        ),
      );
    }

    if (_error.isNotEmpty || _profile == null) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.person_off,
                  size: 60,
                  color: cs.onSurface.withOpacity(0.3),
                ),
                const SizedBox(height: 16),
                Text(
                  'User Not Found',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: cs.onSurface,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _error,
                  style: TextStyle(color: cs.onSurface.withOpacity(0.5)),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => context.pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF79C42),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Go Back'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final profile = _profile!;
    final relationship = profile['relationship'] ?? 'none';
    final isFriendOrSelf = relationship == 'friends' || relationship == 'self';
    final friends = (profile['friends'] as List<dynamic>?) ?? [];
    final friendCount = (profile['friendCount'] as int?) ?? friends.length;

    // Weekly points calculation
    int weeklyPoints = 0;
    if (isFriendOrSelf && profile['dailyScores'] != null) {
      final now = DateTime.now();
      final sow = now.subtract(Duration(days: now.weekday - 1));
      String fmtDate(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
      final sowStr = fmtDate(sow);
      final eow = sow.add(const Duration(days: 6));
      final eowStr = fmtDate(eow);
      for (var s in (profile['dailyScores'] as List<dynamic>)) {
        if (s is Map && s['date'] != null && s['score'] != null) {
          final d = s['date'] as String;
          if (d.compareTo(sowStr) >= 0 && d.compareTo(eowStr) <= 0) {
            weeklyPoints += (s['score'] as num).toInt();
          }
        }
      }
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button + header
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
                        'Learner Profile',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: cs.onSurface,
                        ),
                      ),
                      Text(
                        'Viewing ${profile['username']}\'s info',
                        style: TextStyle(
                          fontSize: 13,
                          color: cs.onSurface.withOpacity(0.5),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Profile Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: cs.outline),
                ),
                child: Column(
                  children: [
                    // Avatar
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFF79C42),
                          width: 3,
                        ),
                      ),
                      child: ClipOval(
                        child: Image.network(
                          profile['avatarUrl']?.isNotEmpty == true
                              ? profile['avatarUrl']
                              : 'https://api.dicebear.com/7.x/avataaars/svg?seed=${profile['username'] ?? 'default'}',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Icon(
                            Icons.person,
                            size: 40,
                            color: Color(0xFFF79C42),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      profile['fullName']?.isNotEmpty == true
                          ? profile['fullName']
                          : profile['username'] ?? '',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: cs.onSurface,
                      ),
                    ),
                    Text(
                      '@${profile['username'] ?? ''}',
                      style: TextStyle(
                        fontSize: 15,
                        color: cs.onSurface.withOpacity(0.5),
                      ),
                    ),
                    if (profile['bio']?.isNotEmpty == true) ...[
                      const SizedBox(height: 12),
                      Text(
                        '"${profile['bio']}"',
                        style: TextStyle(
                          fontStyle: FontStyle.italic,
                          color: cs.onSurface.withOpacity(0.7),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    const SizedBox(height: 12),

                    // Friend count
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people, size: 14, color: cs.onSurface.withOpacity(0.5)),
                        const SizedBox(width: 4),
                        Text(
                          '$friendCount friend${friendCount != 1 ? 's' : ''}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: cs.onSurface.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Friend Action Button
                    if (relationship != 'self')
                      _buildFriendButton(relationship),
                    const SizedBox(height: 10),

                    // View Friends Toggle
                    OutlinedButton.icon(
                      onPressed: () => setState(() => _showFriends = !_showFriends),
                      icon: Icon(Icons.people, size: 16, color: const Color(0xFF3498DB)),
                      label: Text(
                        _showFriends ? 'Hide Friends' : 'View Friends',
                        style: const TextStyle(color: Color(0xFF3498DB), fontWeight: FontWeight.w600),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF3498DB)),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Stats (only if friend or self)
              if (isFriendOrSelf) ...[
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        '🔥',
                        'Streak',
                        '${profile['streak'] ?? 0}',
                        'Days in a row',
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildStatCard(
                        '📚',
                        'Lessons',
                        '${(profile['completedLessons'] is List ? (profile['completedLessons'] as List).length : profile['completedLessons'] ?? 0)}',
                        'Lessons finished',
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildStatCard(
                        '⚡',
                        'Weekly',
                        '$weeklyPoints',
                        'Points this week',
                      ),
                    ),
                  ],
                ),
              ] else
                _buildPrivateCard(profile['username'] ?? ''),
              const SizedBox(height: 14),

              // Friends panel
              if (_showFriends)
                _buildFriendsPanel(friends, profile['username'] ?? ''),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFriendButton(String relationship) {
    if (relationship == 'none') {
      return ElevatedButton.icon(
        onPressed: _actionLoading ? null : () => _handleFriendAction('send'),
        icon: const Icon(Icons.person_add, size: 18),
        label: const Text('Add Friend'),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFF79C42),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    } else if (relationship == 'pending_sent') {
      return OutlinedButton.icon(
        onPressed: null,
        icon: const Icon(Icons.schedule, size: 18),
        label: const Text('Request Sent'),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    } else if (relationship == 'pending_received') {
      return ElevatedButton.icon(
        onPressed: _actionLoading ? null : () => _handleFriendAction('accept'),
        icon: const Icon(Icons.check, size: 18),
        label: const Text('Accept Request'),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2ECC71),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    } else if (relationship == 'friends') {
      return OutlinedButton.icon(
        onPressed: null,
        icon: const Icon(
          Icons.verified_user,
          size: 18,
          color: Color(0xFF3498DB),
        ),
        label: const Text(
          'Friends',
          style: TextStyle(color: Color(0xFF3498DB)),
        ),
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Color(0xFF3498DB)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }
    return const SizedBox();
  }

  Widget _buildStatCard(
    String emoji,
    String title,
    String value,
    String subtitle,
  ) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: cs.onSurface.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: cs.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12,
              color: cs.onSurface.withOpacity(0.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrivateCard(String username) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline),
      ),
      child: Column(
        children: [
          Icon(Icons.lock, size: 48, color: cs.onSurface.withOpacity(0.2)),
          const SizedBox(height: 16),
          Text(
            'Private Progress',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: cs.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add @$username as a friend to see their streak, lessons, and weekly points.',
            style: TextStyle(color: cs.onSurface.withOpacity(0.5)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFriendsPanel(List<dynamic> friends, String username) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 6),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.people, size: 18, color: Color(0xFFF79C42)),
                    const SizedBox(width: 8),
                    Text(
                      '$username\'s Friends (${friends.length})',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: cs.onSurface,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(Icons.close, size: 18, color: cs.onSurface.withOpacity(0.5)),
                  onPressed: () => setState(() => _showFriends = false),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: cs.outline),
          if (friends.isEmpty)
            Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                'No friends yet.',
                style: TextStyle(color: cs.onSurface.withOpacity(0.5)),
              ),
            )
          else
            ...friends.map((f) {
              final friend = f is Map ? Map<String, dynamic>.from(f) : <String, dynamic>{};
              final friendUsername = friend['username'] ?? '';
              final friendAvatar = friend['avatarUrl'] ?? '';
              return GestureDetector(
                onTap: () => context.push('/profile/$friendUsername'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: cs.outline,
                        backgroundImage: NetworkImage(
                          friendAvatar.isNotEmpty
                              ? friendAvatar
                              : 'https://api.dicebear.com/7.x/avataaars/svg?seed=$friendUsername',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              friendUsername,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: cs.onSurface,
                              ),
                            ),
                            Text(
                              '@$friendUsername',
                              style: TextStyle(
                                fontSize: 12,
                                color: cs.onSurface.withOpacity(0.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right, size: 16, color: cs.onSurface.withOpacity(0.3)),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

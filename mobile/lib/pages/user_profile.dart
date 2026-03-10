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
                    const SizedBox(height: 20),

                    // Friend Action Button
                    if (relationship != 'self')
                      _buildFriendButton(relationship),
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
                  ],
                ),
                const SizedBox(height: 14),
                _buildStatCard(
                  '⭐',
                  'Total XP',
                  '${_calcXP(profile)} XP',
                  'Knowledge gained over time',
                ),
              ] else
                _buildPrivateCard(profile['username'] ?? ''),
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
            'Add @$username as a friend to see their learning statistics, streak, and level up together!',
            style: TextStyle(color: cs.onSurface.withOpacity(0.5)),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  int _calcXP(Map<String, dynamic> profile) {
    final scores = profile['dailyScores'] as List<dynamic>? ?? [];
    int total = 0;
    for (final s in scores) {
      if (s is Map) total += (s['score'] as num?)?.toInt() ?? 0;
    }
    return total;
  }
}

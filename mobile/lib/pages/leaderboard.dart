import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';
import '../widgets/accessibility_widget.dart';

class LeaderboardPage extends StatefulWidget {
  const LeaderboardPage({super.key});

  @override
  State<LeaderboardPage> createState() => _LeaderboardPageState();
}

class _LeaderboardPageState extends State<LeaderboardPage> {
  List<dynamic> _entries = [];
  String _weekStart = '';
  String _weekEnd = '';
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiService.getLeaderboard();
      if (res['success'] == true) {
        setState(() {
          _entries = res['leaderboard'] ?? [];
          _weekStart = res['weekStart'] ?? '';
          _weekEnd = res['weekEnd'] ?? '';
        });
      } else {
        setState(() => _error = res['message']);
      }
    } catch (e) {
      setState(() => _error = 'Cannot connect to server.');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  bool _isCurrentUser(Map<String, dynamic> entry) {
    final provider = Provider.of<UserProvider>(context, listen: false);
    return entry['email'] == provider.email ||
        entry['username'] == provider.username;
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    final streak = provider.streak;

    String effectiveAvatar = provider.avatarUrl;
    if (effectiveAvatar.isEmpty || effectiveAvatar.contains('ui-avatars')) {
      effectiveAvatar =
          'https://api.dicebear.com/9.x/initials/png?seed=${Uri.encodeComponent(provider.username)}&backgroundColor=F79C42&textColor=ffffff';
    }

    final top3 = _entries.take(3).toList();
    final rest = _entries.skip(3).toList();
    Map<String, dynamic>? myEntry;
    for (var e in _entries) {
      if (_isCurrentUser(e)) myEntry = e;
    }
    final myRank = myEntry != null ? (myEntry['rank'] as int?) ?? 0 : 0;

    // Build visible rows for ranked list (4th+)
    // If user is in top-3 or not ranked: show next 7 after podium
    // If user is rank 4+: show 2 above, user, 2 below with gap dividers
    List<Map<String, dynamic>> visibleRows = [];
    if (myEntry == null || myRank <= 3) {
      final shown = rest.take(7).toList();
      visibleRows = shown.map((e) => {...Map<String, dynamic>.from(e), 'type': 'entry'}).toList();
      if (rest.length > 7) visibleRows.add({'type': 'gap'});
    } else {
      final myRestIndex = rest.indexWhere((e) => _isCurrentUser(e));
      if (myRestIndex >= 0) {
        final start = (myRestIndex - 2).clamp(0, rest.length - 1);
        final end = (myRestIndex + 2).clamp(0, rest.length - 1);
        if (start > 0) visibleRows.add({'type': 'gap'});
        for (int i = start; i <= end; i++) {
          visibleRows.add({...Map<String, dynamic>.from(rest[i]), 'type': 'entry'});
        }
        if (end < rest.length - 1) visibleRows.add({'type': 'gap'});
      }
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      floatingActionButton: const AccessibilityFab(),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
          ),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.emoji_events, color: Color(0xFFE67E22), size: 22),
            const SizedBox(width: 6),
            Text(
              'Leaderboard',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface,
                fontWeight: FontWeight.bold,
                fontSize: 17,
              ),
            ),
          ],
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
                const Icon(
                  Icons.local_fire_department,
                  color: Colors.orange,
                  size: 14,
                ),
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
          IconButton(
            icon: Icon(
              Icons.refresh,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              size: 20,
            ),
            onPressed: _fetchLeaderboard,
            padding: const EdgeInsets.symmetric(horizontal: 6),
            constraints: const BoxConstraints(),
          ),
          GestureDetector(
            onTap: () => context.push('/settings'),
            child: Container(
              margin: const EdgeInsets.only(right: 12, left: 4),
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
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: _fetchLeaderboard,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            )
          : _entries.isEmpty
          ? const Center(
              child: Text('No players yet! Complete a lesson to appear.'),
            )
          : RefreshIndicator(
              onRefresh: _fetchLeaderboard,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(
                    '📅 $_weekStart → $_weekEnd',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.grey,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (myEntry != null && myRank > 3)
                    _buildMyRankBanner(myEntry),
                  if (top3.isNotEmpty) _buildTop3Podium(top3),
                  if (visibleRows.isNotEmpty) _buildRankedList(visibleRows),
                ],
              ),
            ),
    );
  }

  Widget _buildMyRankBanner(Map<String, dynamic> myEntry) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: const Color(0xFFE67E22).withOpacity(0.08),
        border: Border.all(color: const Color(0xFFE67E22).withOpacity(0.4)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.emoji_events, color: Color(0xFFE67E22), size: 20),
          const SizedBox(width: 12),
          Text(
            'Your rank: #${myEntry['rank']}',
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: Color(0xFFE67E22),
            ),
          ),
          const Spacer(),
          Text(
            '${myEntry['weeklyScore'] ?? 0} pts',
            style: const TextStyle(fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  Widget _buildTop3Podium(List<dynamic> top3) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.fromLTRB(20, 30, 20, 0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'TOP PERFORMERS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Tap a player to view their profile',
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (top3.length > 1)
                Expanded(
                  flex: 3,
                  child: GestureDetector(
                    onTap: () => context.push('/profile/${top3[1]['username']}'),
                    child: _buildPodiumColumnContent(top3[1], 120, const Color(0xFFC0C0C0)),
                  ),
                ),
              Expanded(
                flex: 4,
                child: GestureDetector(
                  onTap: () => context.push('/profile/${top3[0]['username']}'),
                  child: _buildPodiumColumnContent(top3[0], 160, const Color(0xFFFFD700)),
                ),
              ),
              if (top3.length > 2)
                Expanded(
                  flex: 3,
                  child: GestureDetector(
                    onTap: () => context.push('/profile/${top3[2]['username']}'),
                    child: _buildPodiumColumnContent(top3[2], 90, const Color(0xFFCD7F32)),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumColumnContent(
    Map<String, dynamic> entry,
    double height,
    Color color,
  ) {
    final isMe = _isCurrentUser(entry);
    final size = entry['rank'] == 1 ? 80.0 : 60.0;

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Icon(
          entry['rank'] == 1 ? Icons.workspace_premium : Icons.star,
          color: color,
          size: 24,
        ),
        const SizedBox(height: 8),
        _buildAvatarWidget(
          url: entry['avatarUrl'] as String? ?? '',
          name: entry['username'] ?? 'U',
          size: size,
          borderColor: color,
          borderWidth: 3,
        ),
        const SizedBox(height: 8),
        Text(
          '${entry['username']}${isMe ? ' (You)' : ''}',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: isMe
                ? const Color(0xFFE67E22)
                : Theme.of(context).colorScheme.onSurface,
            fontSize: 13,
          ),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        Text(
          (entry['weeklyScore'] ?? 0) > 0
              ? '${entry['weeklyScore']} pts'
              : '—',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [color.withOpacity(0.3), color.withOpacity(0.05)],
            ),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(12),
            ),
            border: Border.all(color: color.withOpacity(0.4)),
          ),
          child: Center(
            child: Text(
              '#${entry['rank']}',
              style: TextStyle(
                fontSize: entry['rank'] == 1 ? 32 : 24,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRankedList(List<Map<String, dynamic>> rows) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: [
                const SizedBox(
                  width: 20,
                  child: Text(
                    '#',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    'PLAYER',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Text(
                  'LESSONS',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 20),
                const Text(
                  'SCORE',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const Divider(),
          ...rows.map((row) =>
            row['type'] == 'gap'
              ? _buildGapDivider()
              : _buildListRow(row),
          ),
        ],
      ),
    );
  }

  Widget _buildGapDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('•  •  •', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w700, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildListRow(Map<String, dynamic> entry) {
    final isMe = _isCurrentUser(entry);

    return GestureDetector(
      onTap: () => context.push('/profile/${entry['username']}'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        color: isMe
            ? const Color(0xFFE67E22).withOpacity(0.05)
            : Colors.transparent,
        child: Row(
          children: [
            SizedBox(
              width: 28,
              child: Text(
                '${entry['rank']}',
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(width: 10),
            _buildAvatarWidget(
              url: entry['avatarUrl'] as String? ?? '',
              name: entry['username'] ?? 'U',
              size: 36,
              borderColor: const Color(0xFF94A3B8),
              borderWidth: 1.5,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '${entry['username']}${isMe ? ' (You)' : ''}',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: isMe
                      ? const Color(0xFFE67E22)
                      : Theme.of(context).colorScheme.onSurface,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              '${entry['completedLessons'] ?? 0}',
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(width: 24),
            SizedBox(
              width: 50,
              child: Text(
                (entry['weeklyScore'] ?? 0) > 0 ? '${entry['weeklyScore']}' : '—',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: (entry['weeklyScore'] ?? 0) > 0
                      ? Theme.of(context).colorScheme.onSurface
                      : Colors.grey,
                ),
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Robust avatar widget with text-initials fallback.
  Widget _buildAvatarWidget({
    required String url,
    required String name,
    required double size,
    Color borderColor = const Color(0xFFF79C42),
    double borderWidth = 2,
  }) {
    final effectiveUrl = (url.isNotEmpty && !url.contains('ui-avatars'))
        ? url
        : 'https://api.dicebear.com/9.x/initials/png?seed=${Uri.encodeComponent(name)}&backgroundColor=94A3B8&textColor=ffffff';

    final initials = name.isNotEmpty
        ? name
              .trim()
              .split(RegExp(r'\s+'))
              .map((w) => w[0].toUpperCase())
              .take(2)
              .join()
        : '?';

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: borderColor, width: borderWidth),
        color: borderColor.withOpacity(0.15),
      ),
      child: ClipOval(
        child: Image.network(
          effectiveUrl,
          fit: BoxFit.cover,
          width: size,
          height: size,
          errorBuilder: (_, __, ___) => Center(
            child: Text(
              initials,
              style: TextStyle(
                color: borderColor,
                fontWeight: FontWeight.w800,
                fontSize: size * 0.35,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';

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
    return entry['email'] == provider.email || entry['username'] == provider.username;
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UserProvider>(context);
    final streak = provider.streak;

    String effectiveAvatar = provider.avatarUrl;
    if (effectiveAvatar.isEmpty) {
      effectiveAvatar = 'https://api.dicebear.com/7.x/avataaars/png?seed=${provider.username}';
    }

    final top3 = _entries.take(3).toList();
    final rest = _entries.skip(3).toList();
    Map<String, dynamic>? myEntry;
    for (var e in _entries) {
      if (_isCurrentUser(e)) myEntry = e;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.blueGrey),
          onPressed: () => context.pop(),
        ),
        title: const Row(
          children: [
            Icon(Icons.emoji_events, color: Color(0xFFE67E22), size: 28),
            SizedBox(width: 8),
            Text(
              'Leaderboard',
              style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            margin: const EdgeInsets.only(right: 8),
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
                  '$streak Day${streak != 1 ? 's' : ''}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                    color: Color(0xFFD97706),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.blueGrey),
            onPressed: _fetchLeaderboard,
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Colors.blueGrey),
            onPressed: () => context.push('/settings'),
          ),
          GestureDetector(
            onTap: () => context.push('/settings'),
            child: Container(
              margin: const EdgeInsets.only(right: 16, left: 4),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: const Color(0xFFF79C42).withOpacity(0.3),
                backgroundImage: NetworkImage(effectiveAvatar),
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
                      )
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
                          if (myEntry != null && (myEntry['rank'] as int) > 3)
                            _buildMyRankBanner(myEntry),
                          if (top3.isNotEmpty) _buildTop3Podium(top3),
                          if (rest.isNotEmpty) _buildRankedList(rest),
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade200),
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
          const SizedBox(height: 20),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (top3.length > 1) _buildPodiumColumn(top3[1], 120, const Color(0xFFC0C0C0)),
              _buildPodiumColumn(top3[0], 160, const Color(0xFFFFD700)),
              if (top3.length > 2) _buildPodiumColumn(top3[2], 90, const Color(0xFFCD7F32)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPodiumColumn(Map<String, dynamic> entry, double height, Color color) {
    final isMe = _isCurrentUser(entry);
    final size = entry['rank'] == 1 ? 80.0 : 60.0;
    
    return Expanded(
      flex: entry['rank'] == 1 ? 4 : 3,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Icon(
            entry['rank'] == 1 ? Icons.workspace_premium : Icons.star,
            color: color,
            size: 24,
          ),
          const SizedBox(height: 8),
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: color, width: 3),
              image: DecorationImage(
                image: NetworkImage(entry['avatarUrl'] ?? 'https://api.dicebear.com/7.x/avataaars/png?seed=${entry['username']}'),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${entry['username']}${isMe ? ' (You)' : ''}',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: isMe ? Color(0xFFE67E22) : Colors.black87,
              fontSize: 13,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            '${entry['weeklyScore']} pts',
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
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
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
      ),
    );
  }

  Widget _buildRankedList(List<dynamic> rest) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: [
                const SizedBox(width: 20, child: Text('#', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey, fontSize: 12))),
                const SizedBox(width: 16),
                const Expanded(child: Text('PLAYER', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey, fontSize: 12))),
                const Text('LESSONS', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey, fontSize: 12)),
                const SizedBox(width: 20),
                const Text('SCORE', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          const Divider(),
          ...rest.map((entry) => _buildListRow(entry)),
        ],
      ),
    );
  }

  Widget _buildListRow(Map<String, dynamic> entry) {
    final isMe = _isCurrentUser(entry);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: isMe ? const Color(0xFFE67E22).withOpacity(0.05) : Colors.transparent,
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text(
              '${entry['rank']}',
              style: const TextStyle(fontWeight: FontWeight.w800, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 10),
          CircleAvatar(
            radius: 18,
            backgroundImage: NetworkImage(entry['avatarUrl'] ?? 'https://api.dicebear.com/7.x/avataaars/png?seed=${entry['username']}'),
            backgroundColor: Colors.grey.shade200,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              '${entry['username']}${isMe ? ' (You)' : ''}',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isMe ? const Color(0xFFE67E22) : Colors.black87,
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
              '${entry['weeklyScore'] ?? 0}',
              style: const TextStyle(fontWeight: FontWeight.w800),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}

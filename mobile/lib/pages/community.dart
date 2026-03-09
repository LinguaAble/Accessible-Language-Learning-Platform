import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';
import '../widgets/accessibility_widget.dart';

class CommunityPage extends StatefulWidget {
  const CommunityPage({super.key});

  @override
  State<CommunityPage> createState() => _CommunityPageState();
}

class _CommunityPageState extends State<CommunityPage> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  List<Map<String, dynamic>> _searchResults = [];
  List<Map<String, dynamic>> _friendRequests = [];
  List<Map<String, dynamic>> _friends = [];
  bool _isSearching = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCommunityData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _loadCommunityData() async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    if (provider.email.isEmpty) return;

    final data = await ApiService.getCommunityData(provider.email);
    if (mounted) {
      setState(() {
        _friendRequests = List<Map<String, dynamic>>.from(
          data['friendRequests'] ?? [],
        );
        _friends = List<Map<String, dynamic>>.from(data['friends'] ?? []);
        _isLoading = false;
      });
    }
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    if (query.trim().isEmpty) {
      setState(() => _searchResults = []);
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      setState(() => _isSearching = true);
      final provider = Provider.of<UserProvider>(context, listen: false);
      final results = await ApiService.searchUsers(query);
      if (mounted) {
        setState(() {
          _searchResults = results
              .where((u) => u['username'] != provider.username)
              .toList();
          _isSearching = false;
        });
      }
    });
  }

  Future<void> _handleAction(String targetId, String action) async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    bool success;
    if (action == 'accept') {
      success = await ApiService.acceptFriendRequest(provider.email, targetId);
    } else {
      success = await ApiService.rejectFriendRequest(provider.email, targetId);
    }

    if (success && mounted) {
      if (action == 'accept') {
        final accepted = _friendRequests.firstWhere(
          (u) => u['_id'] == targetId,
          orElse: () => {},
        );
        setState(() {
          _friendRequests.removeWhere((u) => u['_id'] == targetId);
          if (accepted.isNotEmpty) _friends.add(accepted);
        });
      } else {
        setState(() {
          _friendRequests.removeWhere((u) => u['_id'] == targetId);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isSearchActive = _searchController.text.trim().isNotEmpty;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      floatingActionButton: const AccessibilityFab(),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadCommunityData,
          color: const Color(0xFFF79C42),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 30),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'Community',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Connect with other learners',
                  style: TextStyle(
                    fontSize: 14,
                    color: cs.onSurface.withOpacity(0.5),
                  ),
                ),
                const SizedBox(height: 20),

                // Search Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: cs.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cs.outline),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.search, color: cs.onSurface.withOpacity(0.4)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          decoration: const InputDecoration(
                            hintText: 'Find learners by name or username...',
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            filled: false,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Content
                if (isSearchActive) ...[
                  Text(
                    'Search Results',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: cs.onSurface,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_isSearching)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (_searchResults.isEmpty)
                    _buildEmptyState(
                      'No learners found matching "${_searchController.text}"',
                    )
                  else
                    ..._searchResults.map((u) => _buildUserCard(u)),
                ] else ...[
                  // Friend Requests
                  if (_friendRequests.isNotEmpty) ...[
                    Row(
                      children: [
                        Icon(
                          Icons.people,
                          color: const Color(0xFFF79C42),
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Friend Requests',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: cs.onSurface,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${_friendRequests.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ..._friendRequests.map((req) => _buildRequestCard(req)),
                    const SizedBox(height: 24),
                  ],

                  // Friends List
                  Text(
                    'Your Friends (${_friends.length})',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: cs.onSurface,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_isLoading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (_friends.isEmpty)
                    _buildEmptyState(
                      "You don't have any friends yet.\nUse the search bar to find someone!",
                    )
                  else
                    ..._friends.map((friend) => _buildFriendCard(friend)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
        ),
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: () => context.push('/profile/${user['username']}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outline),
        ),
        child: Row(
          children: [
            _buildAvatar(user['avatarUrl'], user['username'] ?? ''),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user['fullName'] ?? user['username'] ?? '',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: cs.onSurface,
                    ),
                  ),
                  Text(
                    '@${user['username'] ?? ''}',
                    style: TextStyle(
                      fontSize: 13,
                      color: cs.onSurface.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: cs.onSurface.withOpacity(0.3)),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestCard(Map<String, dynamic> req) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outline),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.push('/profile/${req['username']}'),
            child: Row(
              children: [
                _buildAvatar(req['avatarUrl'], req['username'] ?? ''),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      req['fullName'] ?? req['username'] ?? '',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: cs.onSurface,
                      ),
                    ),
                    Text(
                      '@${req['username'] ?? ''}',
                      style: TextStyle(
                        fontSize: 13,
                        color: cs.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: () => _handleAction(req['_id'], 'accept'),
            icon: const Icon(Icons.check, color: Colors.white, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFF2ECC71),
              shape: const CircleBorder(),
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            onPressed: () => _handleAction(req['_id'], 'reject'),
            icon: const Icon(Icons.close, color: Colors.white, size: 18),
            style: IconButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: const CircleBorder(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFriendCard(Map<String, dynamic> friend) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: () => context.push('/profile/${friend['username']}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outline),
        ),
        child: Row(
          children: [
            _buildAvatar(friend['avatarUrl'], friend['username'] ?? ''),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    friend['fullName'] ?? friend['username'] ?? '',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: cs.onSurface,
                    ),
                  ),
                  Text(
                    '@${friend['username'] ?? ''}',
                    style: TextStyle(
                      fontSize: 13,
                      color: cs.onSurface.withOpacity(0.5),
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if ((friend['streak'] ?? 0) > 0)
                  Text(
                    '🔥 ${friend['streak']} Streak',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFFEF4444),
                    ),
                  ),
                Text(
                  '📚 ${(friend['completedLessons'] is List ? (friend['completedLessons'] as List).length : friend['completedLessons'] ?? 0)} Lessons',
                  style: TextStyle(
                    fontSize: 12,
                    color: cs.onSurface.withOpacity(0.5),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar(String? avatarUrl, String username) {
    final url = (avatarUrl != null && avatarUrl.isNotEmpty)
        ? avatarUrl
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=${username.isNotEmpty ? username : 'default'}';
    return CircleAvatar(
      radius: 22,
      backgroundColor: const Color(0xFFF79C42).withOpacity(0.2),
      child: ClipOval(
        child: Image.network(
          url,
          width: 44,
          height: 44,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) =>
              const Icon(Icons.person, color: Color(0xFFF79C42)),
        ),
      ),
    );
  }
}

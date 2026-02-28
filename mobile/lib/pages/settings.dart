import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // ── Profile ────────────────────────────────────────────────────────────────
  bool _isEditingProfile = false;
  bool _savingProfile = false;
  String? _saveStatus; // 'success' | 'error' | null
  late TextEditingController _usernameCtrl;
  late TextEditingController _fullNameCtrl;
  late TextEditingController _bioCtrl;
  late TextEditingController _ageCtrl;
  String _gender = '';
  String _avatarUrl = '';

  // ── Preferences ────────────────────────────────────────────────────────────
  bool _savingPrefs = false;
  late bool _soundEffects;
  late bool _animationReduced;
  late bool _dyslexiaFont;
  late String _fontSize;
  late String _theme;
  late String _colorOverlay;
  late int _dailyGoalMinutes;

  static const List<int> _goalOptions = [3, 5, 10, 15];
  static const List<String> _fontSizes = ['small', 'medium', 'large'];
  static const List<Map<String, String>> _overlays = [
    {'value': 'none', 'label': 'None', 'emoji': '✕'},
    {'value': 'yellow', 'label': 'Yellow', 'emoji': '🟡'},
    {'value': 'blue', 'label': 'Blue', 'emoji': '🔵'},
    {'value': 'green', 'label': 'Green', 'emoji': '🟢'},
    {'value': 'rose', 'label': 'Rose', 'emoji': '🌸'},
  ];

  // Preset avatar seeds (DiceBear)
  static const List<Map<String, String>> _presetAvatars = [
    {'seed': 'John', 'bg': 'b6e3f4', 'label': 'Avatar 1'},
    {'seed': 'Robert', 'bg': 'c0aede', 'label': 'Avatar 2'},
    {'seed': 'James', 'bg': 'd1d4f9', 'label': 'Avatar 3'},
    {'seed': 'Sarah', 'bg': 'ffd5dc', 'label': 'Avatar 4'},
    {'seed': 'Jessica', 'bg': 'ffdfbf', 'label': 'Avatar 5'},
    {'seed': 'Emily', 'bg': 'e4c1f9', 'label': 'Avatar 6'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    final provider = Provider.of<UserProvider>(context, listen: false);
    _usernameCtrl = TextEditingController(text: provider.username);
    _fullNameCtrl = TextEditingController(text: provider.fullName);
    _bioCtrl = TextEditingController(text: provider.bio);
    _ageCtrl = TextEditingController(text: provider.age);
    _gender = provider.gender;
    _avatarUrl = provider.avatarUrl;

    final p = provider.preferences;
    _soundEffects = provider.soundEffects;
    _animationReduced = provider.animationReduced;
    _dyslexiaFont = provider.dyslexiaFont;
    _fontSize = provider.fontSize;
    _theme = p['theme'] as String? ?? 'dark';
    _colorOverlay = provider.colorOverlay;
    _dailyGoalMinutes = provider.dailyGoalMinutes;
  }

  @override
  void dispose() {
    _tabController.dispose();
    _usernameCtrl.dispose();
    _fullNameCtrl.dispose();
    _bioCtrl.dispose();
    _ageCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  String _avatarUrlForSeed(String seed, String bg) =>
      'https://api.dicebear.com/7.x/avataaars/png?seed=$seed&backgroundColor=$bg';

  String get _effectiveAvatar {
    if (_avatarUrl.isNotEmpty) return _avatarUrl;
    final provider = Provider.of<UserProvider>(context, listen: false);
    return 'https://api.dicebear.com/7.x/avataaars/png?seed=${provider.username}';
  }

  // ── Save profile (offline-first) ─────────────────────────────────────────
  Future<void> _saveProfile() async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    final messenger = ScaffoldMessenger.of(context);
    setState(() { _savingProfile = true; _saveStatus = null; });

    // 1. Save locally IMMEDIATELY — no backend needed
    final updatedFields = {
      'username': _usernameCtrl.text.trim(),
      'fullName': _fullNameCtrl.text.trim(),
      'bio': _bioCtrl.text.trim(),
      'age': _ageCtrl.text.trim(),
      'gender': _gender,
      'avatarUrl': _avatarUrl,
    };
    await provider.updateUser(updatedFields);

    if (mounted) {
      setState(() { _saveStatus = 'success'; _isEditingProfile = false; _savingProfile = false; });
      messenger.showSnackBar(const SnackBar(
        content: Text('✓ Profile saved!'),
        backgroundColor: Color(0xFF10B981),
        duration: Duration(seconds: 2),
      ));
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) setState(() => _saveStatus = null);
      });
    }

    // 2. Sync to backend in background (fire-and-forget)
    if (provider.email.isNotEmpty) {
      ApiService.updateProfile(
        email: provider.email,
        username: updatedFields['username'] as String,
        fullName: updatedFields['fullName'] as String,
        bio: updatedFields['bio'] as String,
        avatarUrl: _avatarUrl,
        age: updatedFields['age'] as String,
        gender: updatedFields['gender'] as String,
      ).catchError((_) {}); // ignore backend errors silently
    }
  }

  // ── Save preferences (offline-first) ─────────────────────────────────────
  Future<void> _savePrefs() async {
    final provider = Provider.of<UserProvider>(context, listen: false);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _savingPrefs = true);

    final prefs = {
      'soundEffects': _soundEffects,
      'animationReduced': _animationReduced,
      'dyslexiaFont': _dyslexiaFont,
      'fontSize': _fontSize,
      'theme': _theme,
      'colorOverlay': _colorOverlay,
      'dailyGoalMinutes': _dailyGoalMinutes,
    };

    // 1. Save locally IMMEDIATELY — works offline
    await provider.updateUser({'preferences': prefs});

    if (mounted) {
      setState(() => _savingPrefs = false);
      messenger.showSnackBar(const SnackBar(
        content: Text('✓ Preferences saved!'),
        backgroundColor: Color(0xFF10B981),
        duration: Duration(seconds: 2),
      ));
    }

    // 2. Sync to backend in background (fire-and-forget)
    if (provider.email.isNotEmpty) {
      ApiService.updateSettings(
        email: provider.email,
        preferences: prefs,
      ).catchError((_) {}); // ignore backend errors silently
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Consumer<UserProvider>(builder: (context, provider, _) {
      return Scaffold(
        backgroundColor: const Color(0xFFF9FAFB),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: Color(0xFF1E293B), size: 20),
            onPressed: () => context.pop(),
          ),
          title: const Text('Settings',
              style: TextStyle(
                  color: Color(0xFF1E293B),
                  fontWeight: FontWeight.w800,
                  fontSize: 20)),
          bottom: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFFF79C42),
            labelColor: const Color(0xFFF79C42),
            unselectedLabelColor: Colors.grey,
            labelStyle:
                const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            tabs: const [
              Tab(text: 'Profile'),
              Tab(text: 'Display'),
              Tab(text: 'History'),
            ],
          ),
        ),
        body: TabBarView(controller: _tabController, children: [
          _buildProfileTab(provider),
          _buildDisplayTab(provider),
          _buildHistoryTab(provider),
        ]),
      );
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1: PROFILE
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildProfileTab(UserProvider provider) {
    return ListView(padding: const EdgeInsets.all(20), children: [
      _card(children: [
        // Header row
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            const Text('Profile Information',
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: Color(0xFF1E293B))),
            const Spacer(),
            TextButton(
              onPressed: () =>
                  setState(() => _isEditingProfile = !_isEditingProfile),
              child: Text(_isEditingProfile ? 'Cancel' : 'Edit Profile',
                  style: const TextStyle(color: Color(0xFFF79C42),
                      fontWeight: FontWeight.w700)),
            ),
          ]),
        ),

        if (!_isEditingProfile) _buildProfileView(provider)
        else _buildProfileEditor(provider),
      ]),
    ]);
  }

  Widget _buildProfileView(UserProvider provider) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: const Color(0xFFF79C42).withAlpha(30),
          backgroundImage: NetworkImage(_effectiveAvatar),
        ),
        const SizedBox(width: 16),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              provider.fullName.isNotEmpty
                  ? provider.fullName
                  : provider.username,
              style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                  color: Color(0xFF1E293B)),
            ),
            const SizedBox(height: 2),
            Text('@${provider.username}',
                style: const TextStyle(color: Colors.grey, fontSize: 13)),
            if (provider.bio.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('"${provider.bio}"',
                  style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 13,
                      fontStyle: FontStyle.italic)),
            ],
            const SizedBox(height: 8),
            Row(children: [
              if (provider.age.isNotEmpty)
                _chip('📅 ${provider.age} yrs'),
              if (provider.gender.isNotEmpty)
                _chip('👤 ${_capitalize(provider.gender)}'),
            ]),
          ],
        )),
      ]),
    );
  }

  Widget _chip(String label) => Container(
    margin: const EdgeInsets.only(right: 8),
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(
      color: const Color(0xFFF79C42).withAlpha(20),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(label, style: const TextStyle(fontSize: 12)),
  );

  Widget _buildProfileEditor(UserProvider provider) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Avatar picker
        const Text('Choose Avatar',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 12),
        Center(
          child: CircleAvatar(
            radius: 44,
            backgroundColor: const Color(0xFFF79C42).withAlpha(30),
            backgroundImage: NetworkImage(_effectiveAvatar),
          ),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 6, mainAxisSpacing: 8, crossAxisSpacing: 8),
          itemCount: _presetAvatars.length,
          itemBuilder: (_, i) {
            final a = _presetAvatars[i];
            final url = _avatarUrlForSeed(a['seed']!, a['bg']!);
            final selected = _avatarUrl == url;
            return GestureDetector(
              onTap: () => setState(() => _avatarUrl = url),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected
                        ? const Color(0xFFF79C42)
                        : Colors.grey.shade300,
                    width: selected ? 3 : 1.5,
                  ),
                ),
                child: CircleAvatar(backgroundImage: NetworkImage(url)),
              ),
            );
          },
        ),
        const SizedBox(height: 20),

        // Display name
        _inputLabel('Display Name'),
        _textField(_usernameCtrl, 'Enter display name'),
        const SizedBox(height: 12),

        // Full name
        _inputLabel('Full Name'),
        _textField(_fullNameCtrl, 'Enter full name'),
        const SizedBox(height: 12),

        // Age + Gender row
        Row(children: [
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _inputLabel('Age'),
              TextFormField(
                controller: _ageCtrl,
                keyboardType: TextInputType.number,
                decoration: _inputDecoration('Age'),
              ),
            ],
          )),
          const SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _inputLabel('Gender'),
              DropdownButtonFormField<String>(
                value: _gender.isEmpty ? null : _gender,
                decoration: _inputDecoration('Select'),
                items: const [
                  DropdownMenuItem(value: 'male', child: Text('Male')),
                  DropdownMenuItem(value: 'female', child: Text('Female')),
                  DropdownMenuItem(value: 'other', child: Text('Other')),
                  DropdownMenuItem(
                      value: 'prefer-not-to-say',
                      child: Text('Prefer not to say')),
                ],
                onChanged: (v) => setState(() => _gender = v ?? ''),
              ),
            ],
          )),
        ]),
        const SizedBox(height: 12),

        // Bio
        _inputLabel('Bio'),
        TextFormField(
          controller: _bioCtrl,
          maxLines: 3,
          maxLength: 500,
          decoration: _inputDecoration('Write something about yourself...'),
        ),
        const SizedBox(height: 16),

        // Save button
        Row(children: [
          Expanded(child: ElevatedButton(
            onPressed: _savingProfile ? null : _saveProfile,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF79C42),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: _savingProfile
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : const Text('Save Profile',
                    style: TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 15)),
          )),
          if (_saveStatus == 'success') ...[
            const SizedBox(width: 12),
            const Text('✓ Saved!',
                style: TextStyle(
                    color: Color(0xFF10B981), fontWeight: FontWeight.w700)),
          ],
          if (_saveStatus == 'error') ...[
            const SizedBox(width: 12),
            const Text('✗ Failed',
                style: TextStyle(
                    color: Color(0xFFEF4444), fontWeight: FontWeight.w700)),
          ],
        ]),
      ]),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2: DISPLAY & ACCESSIBILITY
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildDisplayTab(UserProvider provider) {
    return ListView(padding: const EdgeInsets.all(20), children: [
      _sectionHeader('Display & Accessibility'),
      _card(children: [
        // Font Size
        _prefRow(
          icon: Icons.text_fields,
          iconColor: const Color(0xFFF79C42),
          title: 'Font Size',
          subtitle: 'Adjust text size for better readability',
          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
            for (final s in _fontSizes)
              GestureDetector(
                onTap: () {
                  setState(() => _fontSize = s);
                  _savePrefs();
                },
                child: Container(
                  margin: const EdgeInsets.only(left: 4),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _fontSize == s
                        ? const Color(0xFFF79C42)
                        : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _fontSize == s
                          ? const Color(0xFFF79C42)
                          : Colors.grey.shade300,
                    ),
                  ),
                  child: Text(
                    s == 'small' ? 'A' : s == 'medium' ? 'A' : 'A',
                    style: TextStyle(
                      fontSize: s == 'small'
                          ? 12
                          : s == 'medium'
                              ? 16
                              : 20,
                      color:
                          _fontSize == s ? Colors.white : Colors.black87,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ]),
        ),
        _divider(),

        // Theme
        _prefRow(
          icon: _theme == 'dark' ? Icons.dark_mode : Icons.light_mode,
          iconColor: const Color(0xFF3B82F6),
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark themes',
          trailing: Switch(
            value: _theme == 'dark',
            onChanged: (v) {
              setState(() => _theme = v ? 'dark' : 'minimalist');
              _savePrefs();
            },
            activeColor: const Color(0xFFF79C42),
          ),
        ),
        _divider(),

        // Sound Effects
        _prefRow(
          icon: _soundEffects ? Icons.volume_up : Icons.volume_off,
          iconColor: const Color(0xFF10B981),
          title: 'Sound Effects',
          subtitle: 'Play sounds on correct/incorrect answers',
          trailing: Switch(
            value: _soundEffects,
            onChanged: (v) {
              setState(() => _soundEffects = v);
              _savePrefs();
            },
            activeColor: const Color(0xFFF79C42),
          ),
        ),
        _divider(),

        // Reduce Motion
        _prefRow(
          icon: Icons.animation,
          iconColor: const Color(0xFF9B59B6),
          title: 'Reduce Motion',
          subtitle: 'Minimize animations for better focus (ADHD-friendly)',
          trailing: Switch(
            value: _animationReduced,
            onChanged: (v) {
              setState(() => _animationReduced = v);
              _savePrefs();
            },
            activeColor: const Color(0xFFF79C42),
          ),
        ),
        _divider(),

        // Dyslexia Font
        _prefRow(
          icon: Icons.menu_book,
          iconColor: const Color(0xFFE67E22),
          title: 'Dyslexia-Friendly Font',
          subtitle: 'Switches to a font that reduces letter confusion',
          trailing: Switch(
            value: _dyslexiaFont,
            onChanged: (v) {
              setState(() => _dyslexiaFont = v);
              _savePrefs();
            },
            activeColor: const Color(0xFFF79C42),
          ),
        ),
      ]),

      const SizedBox(height: 20),
      _sectionHeader('Reading Color Overlay'),
      _card(children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Adds a tinted overlay to reduce visual stress',
                  style: TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 14),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _overlays.map((o) {
                  final selected = _colorOverlay == o['value'];
                  Color chipColor;
                  switch (o['value']) {
                    case 'yellow':
                      chipColor = const Color(0xFFFBBF24);
                      break;
                    case 'blue':
                      chipColor = const Color(0xFF60A5FA);
                      break;
                    case 'green':
                      chipColor = const Color(0xFF34D399);
                      break;
                    case 'rose':
                      chipColor = const Color(0xFFF472B6);
                      break;
                    default:
                      chipColor = Colors.grey.shade200;
                  }
                  return GestureDetector(
                    onTap: () {
                      setState(() => _colorOverlay = o['value']!);
                      _savePrefs();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected ? chipColor : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: selected
                              ? const Color(0xFFF79C42)
                              : Colors.grey.shade300,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Text('${o['emoji']} ${o['label']}',
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: selected &&
                                      o['value'] != 'none'
                                  ? Colors.white
                                  : Colors.black87)),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ]),

      const SizedBox(height: 20),
      _sectionHeader('Daily Learning Goal'),
      _card(children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            Row(children: [
              const Icon(Icons.flag, color: Colors.orange),
              const SizedBox(width: 10),
              Text('$_dailyGoalMinutes min / day',
                  style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Color(0xFFF79C42))),
            ]),
            const SizedBox(height: 16),
            Row(
              children: _goalOptions.map((g) {
                final sel = g == _dailyGoalMinutes;
                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _dailyGoalMinutes = g);
                      _savePrefs();
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: sel
                            ? const Color(0xFFF79C42)
                            : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: sel
                              ? const Color(0xFFF79C42)
                              : Colors.grey.shade300,
                        ),
                      ),
                      child: Text('$g min',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: sel ? Colors.white : Colors.black87)),
                    ),
                  ),
                );
              }).toList(),
            ),
          ]),
        ),
      ]),

      const SizedBox(height: 20),
    ]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3: LOGIN HISTORY
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildHistoryTab(UserProvider provider) {
    final history = provider.loginHistory;
    return ListView(padding: const EdgeInsets.all(20), children: [
      _sectionHeader('Login History (Recent 10)'),
      _card(children: [
        if (history.isEmpty)
          Padding(
            padding: const EdgeInsets.all(30),
            child: Column(children: [
              const Icon(Icons.history, size: 48, color: Colors.grey),
              const SizedBox(height: 12),
              const Text('No login history yet.',
                  style: TextStyle(
                      color: Colors.grey, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              const Text(
                'History is recorded each time you sign in.',
                style: TextStyle(color: Colors.grey, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ]),
          )
        else
          for (final entry in history.reversed.take(10))
            _historyItem(entry as Map<String, dynamic>),
      ]),
    ]);
  }

  Widget _historyItem(Map<String, dynamic> entry) {
    final ts = entry['timestamp'];
    String formatted = '';
    if (ts != null) {
      try {
        formatted = DateTime.parse(ts.toString()).toLocal().toString();
        formatted = formatted.substring(0, 16);
      } catch (_) {
        formatted = ts.toString();
      }
    }
    final device = entry['device']?.toString() ?? 'Unknown device';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade100)),
      ),
      child: Row(children: [
        const Icon(Icons.access_time, color: Colors.grey, size: 18),
        const SizedBox(width: 12),
        Expanded(
          child: Text(formatted,
              style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(device,
              style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ),
      ]),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SHARED HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  Widget _sectionHeader(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(
      title.toUpperCase(),
      style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Colors.grey,
          letterSpacing: 1.2),
    ),
  );

  Widget _card({required List<Widget> children}) => Container(
    margin: const EdgeInsets.only(bottom: 4),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: Colors.grey.shade200),
    ),
    child: Column(children: children),
  );

  Widget _prefRow({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: iconColor.withAlpha(25),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 2),
            Text(subtitle,
                style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        )),
        trailing,
      ]),
    );
  }

  Widget _divider() => Divider(
      height: 1, color: Colors.grey.shade100, indent: 16, endIndent: 16);

  Widget _inputLabel(String label) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(label,
        style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 13,
            color: Color(0xFF1E293B))),
  );

  Widget _textField(TextEditingController ctrl, String hint) =>
      TextFormField(controller: ctrl, decoration: _inputDecoration(hint));

  InputDecoration _inputDecoration(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: Colors.grey),
    filled: true,
    fillColor: Colors.grey.shade50,
    contentPadding:
        const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: BorderSide(color: Colors.grey.shade300),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: BorderSide(color: Colors.grey.shade300),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: const BorderSide(color: Color(0xFFF79C42)),
    ),
  );

  String _capitalize(String s) =>
      s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
}

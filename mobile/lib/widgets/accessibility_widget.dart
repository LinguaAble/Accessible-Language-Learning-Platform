import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';

/// Floating Accessibility button — use as Scaffold's floatingActionButton.
class AccessibilityFab extends StatelessWidget {
  const AccessibilityFab({super.key});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      heroTag: 'accessibility_fab',
      mini: true,
      backgroundColor: const Color(0xFFF79C42),
      onPressed: () => showAccessibilitySheet(context),
      child: const Icon(Icons.accessibility_new, color: Colors.white, size: 24),
    );
  }

  static void showAccessibilitySheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => ChangeNotifierProvider.value(
        value: Provider.of<UserProvider>(context, listen: false),
        child: const _AccessibilityPanel(),
      ),
    );
  }
}

class _AccessibilityPanel extends StatelessWidget {
  const _AccessibilityPanel();

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final provider = Provider.of<UserProvider>(context);

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: cs.onSurface.withOpacity(0.2),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(children: [
                const Icon(Icons.accessibility_new, color: Color(0xFFF79C42), size: 22),
                const SizedBox(width: 8),
                Text('Accessibility Tools',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: cs.onSurface)),
              ]),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Icon(Icons.close, size: 22, color: cs.onSurface.withOpacity(0.4)),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Font Size
          _sectionTitle(context, Icons.text_fields, 'Font Size'),
          const SizedBox(height: 10),
          Row(children: [
            _toggleBtn(context, 'A', provider.fontSize == 'small',
                () => provider.updatePreferences({'fontSize': 'small'}), fontSize: 12),
            const SizedBox(width: 8),
            _toggleBtn(context, 'A', provider.fontSize == 'medium',
                () => provider.updatePreferences({'fontSize': 'medium'}), fontSize: 15),
            const SizedBox(width: 8),
            _toggleBtn(context, 'A', provider.fontSize == 'large',
                () => provider.updatePreferences({'fontSize': 'large'}), fontSize: 20),
          ]),
          const SizedBox(height: 20),

          // Theme
          _sectionTitle(context,
              provider.preferences['theme'] == 'dark' ? Icons.dark_mode : Icons.light_mode,
              'Theme Design'),
          const SizedBox(height: 10),
          Row(children: [
            _toggleBtn(context, '☀  Light', provider.preferences['theme'] != 'dark',
                () => provider.updatePreferences({'theme': 'light'})),
            const SizedBox(width: 8),
            _toggleBtn(context, '🌙  Dark', provider.preferences['theme'] == 'dark',
                () => provider.updatePreferences({'theme': 'dark'})),
          ]),
          const SizedBox(height: 20),

          // Dyslexia Font
          _sectionTitle(context, Icons.auto_stories, 'Dyslexia Friendly Font'),
          const SizedBox(height: 10),
          Row(children: [
            _toggleBtn(context, provider.dyslexiaFont ? 'ON ✓' : 'OFF',
                provider.dyslexiaFont,
                () => provider.updatePreferences({'dyslexiaFont': !provider.dyslexiaFont})),
            const Spacer(flex: 2),
          ]),
          const SizedBox(height: 20),

          // Color Overlay
          _sectionTitle(context, Icons.layers, 'Reading Color Overlay'),
          const SizedBox(height: 10),
          Row(children: [
            _colorBtn(context, '✕', 'none', provider),
            const SizedBox(width: 10),
            _colorBtn(context, '🟡', 'yellow', provider),
            const SizedBox(width: 10),
            _colorBtn(context, '🔵', 'blue', provider),
            const SizedBox(width: 10),
            _colorBtn(context, '🟢', 'green', provider),
            const SizedBox(width: 10),
            _colorBtn(context, '🌸', 'rose', provider),
          ]),
        ],
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, IconData icon, String title) {
    final cs = Theme.of(context).colorScheme;
    return Row(children: [
      Icon(icon, size: 16, color: cs.onSurface.withOpacity(0.5)),
      const SizedBox(width: 6),
      Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
          color: cs.onSurface.withOpacity(0.6))),
    ]);
  }

  Widget _toggleBtn(BuildContext context, String label, bool active, VoidCallback onTap,
      {double fontSize = 14}) {
    final cs = Theme.of(context).colorScheme;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: active ? const Color(0xFFF79C42) : cs.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: active ? const Color(0xFFF79C42) : cs.outline,
                width: active ? 2 : 1),
          ),
          child: Text(label, textAlign: TextAlign.center,
              style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.w700,
                  color: active ? Colors.white : cs.onSurface)),
        ),
      ),
    );
  }

  Widget _colorBtn(BuildContext context, String emoji, String value, UserProvider provider) {
    final active = provider.colorOverlay == value;
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: () => provider.updatePreferences({'colorOverlay': value}),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 48, height: 48,
        decoration: BoxDecoration(
          color: active ? const Color(0xFFF79C42).withOpacity(0.15) : cs.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: active ? const Color(0xFFF79C42) : cs.outline,
              width: active ? 2.5 : 1),
        ),
        child: Center(child: Text(emoji, style: const TextStyle(fontSize: 20))),
      ),
    );
  }
}

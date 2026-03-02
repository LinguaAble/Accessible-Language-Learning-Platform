import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'pages/dashboard.dart';
import 'pages/learning.dart';
import 'pages/lessons.dart';
import 'pages/leaderboard.dart';
import 'pages/login.dart';
import 'pages/settings.dart';
import 'pages/signup.dart';
import 'providers/user_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final userProvider = UserProvider();
  await userProvider.init();

  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider.value(value: userProvider)],
      child: const LinguaAbleApp(),
    ),
  );
}

final GoRouter _router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final isGoingToAuth =
        state.matchedLocation == '/login' ||
        state.matchedLocation == '/signup' ||
        state.matchedLocation == '/';

    if (userProvider.isAuthenticated && isGoingToAuth) return '/dashboard';
    if (!userProvider.isAuthenticated && !isGoingToAuth) return '/';
    return null;
  },
  routes: [
    GoRoute(path: '/', builder: (context, state) => const LandingPage()),
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupPage()),
    GoRoute(path: '/dashboard', builder: (context, state) => const DashboardPage()),
    GoRoute(path: '/lessons', builder: (context, state) => const LessonsPage()),
    GoRoute(path: '/leaderboard', builder: (context, state) => const LeaderboardPage()),
    GoRoute(path: '/settings', builder: (context, state) => const SettingsPage()),
    GoRoute(
      path: '/lessons/:id',
      builder: (context, state) {
        final id = int.tryParse(state.pathParameters['id'] ?? '1') ?? 1;
        return LearningScreen(lessonId: id);
      },
    ),
  ],
);

// ── Brand colours (shared) ────────────────────────────────────────────────────
const _kOrange = Color(0xFFF79C42);
const _kBlue   = Color(0xFF1E3A8A);

// ── LIGHT THEME ───────────────────────────────────────────────────────────────
final _lightTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.light,
  scaffoldBackgroundColor: const Color(0xFFF5F7FA),
  colorScheme: const ColorScheme.light(
    primary: _kOrange,
    onPrimary: Colors.white,
    secondary: _kBlue,
    onSecondary: Colors.white,
    surface: Colors.white,
    onSurface: Color(0xFF1F2937),
    surfaceContainerHighest: Color(0xFFF1F5F9),
    outline: Color(0xFFE2E8F0),
    error: Color(0xFFEF4444),
    onError: Colors.white,
  ),
  cardColor: Colors.white,
  cardTheme: CardThemeData(
    color: Colors.white,
    elevation: 1,
    shadowColor: const Color(0x14000000),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.white,
    foregroundColor: Color(0xFF1F2937),
    elevation: 0,
    surfaceTintColor: Colors.transparent,
    iconTheme: IconThemeData(color: Color(0xFF6B7280)),
  ),
  dividerColor: const Color(0xFFE2E8F0),
  switchTheme: SwitchThemeData(
    thumbColor: WidgetStateProperty.resolveWith(
      (s) => s.contains(WidgetState.selected) ? _kOrange : Colors.grey.shade400,
    ),
    trackColor: WidgetStateProperty.resolveWith(
      (s) => s.contains(WidgetState.selected)
          ? _kOrange.withOpacity(0.35)
          : Colors.grey.shade300,
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: const Color(0xFFF8FAFC),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: _kOrange, width: 2),
    ),
    labelStyle: const TextStyle(color: Color(0xFF6B7280)),
    hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
  ),
  tabBarTheme: const TabBarThemeData(
    labelColor: _kOrange,
    unselectedLabelColor: Color(0xFF6B7280),
    indicatorColor: _kOrange,
  ),
  dialogTheme: DialogThemeData(
    backgroundColor: Colors.white,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
  ),
  bottomSheetTheme: const BottomSheetThemeData(
    backgroundColor: Colors.white,
  ),
  listTileTheme: const ListTileThemeData(
    iconColor: Color(0xFF6B7280),
  ),
  textTheme: const TextTheme(
    titleLarge: TextStyle(color: Color(0xFF1F2937), fontWeight: FontWeight.w800),
    titleMedium: TextStyle(color: Color(0xFF1F2937), fontWeight: FontWeight.w700),
    bodyMedium: TextStyle(color: Color(0xFF374151)),
    bodySmall: TextStyle(color: Color(0xFF6B7280)),
  ),
);

// ── DARK THEME ────────────────────────────────────────────────────────────────
final _darkTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  scaffoldBackgroundColor: const Color(0xFF0F172A),    // deep navy/slate
  colorScheme: const ColorScheme.dark(
    primary: _kOrange,
    onPrimary: Colors.white,
    secondary: Color(0xFF60A5FA),                      // sky blue
    onSecondary: Colors.white,
    surface: Color(0xFF1E293B),                        // slate-800
    onSurface: Color(0xFFF1F5F9),                      // slate-100
    surfaceContainerHighest: Color(0xFF334155),         // slate-700
    outline: Color(0xFF334155),
    error: Color(0xFFF87171),
    onError: Colors.white,
  ),
  cardColor: const Color(0xFF1E293B),
  cardTheme: CardThemeData(
    color: const Color(0xFF1E293B),
    elevation: 2,
    shadowColor: Colors.black45,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: Color(0xFF1E293B),
    foregroundColor: Color(0xFFF1F5F9),
    elevation: 0,
    surfaceTintColor: Colors.transparent,
    iconTheme: IconThemeData(color: Color(0xFF94A3B8)),
  ),
  dividerColor: const Color(0xFF334155),
  switchTheme: SwitchThemeData(
    thumbColor: WidgetStateProperty.resolveWith(
      (s) => s.contains(WidgetState.selected) ? _kOrange : const Color(0xFF64748B),
    ),
    trackColor: WidgetStateProperty.resolveWith(
      (s) => s.contains(WidgetState.selected)
          ? _kOrange.withOpacity(0.35)
          : const Color(0xFF334155),
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: const Color(0xFF1E293B),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFF334155)),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFF334155)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: _kOrange, width: 2),
    ),
    labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
    hintStyle: const TextStyle(color: Color(0xFF64748B)),
  ),
  tabBarTheme: const TabBarThemeData(
    labelColor: _kOrange,
    unselectedLabelColor: Color(0xFF64748B),
    indicatorColor: _kOrange,
  ),
  dialogTheme: DialogThemeData(
    backgroundColor: const Color(0xFF1E293B),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
  ),
  bottomSheetTheme: const BottomSheetThemeData(
    backgroundColor: Color(0xFF1E293B),
  ),
  listTileTheme: const ListTileThemeData(
    iconColor: Color(0xFF94A3B8),
    textColor: Color(0xFFF1F5F9),
  ),
  textTheme: const TextTheme(
    titleLarge: TextStyle(color: Color(0xFFF1F5F9), fontWeight: FontWeight.w800),
    titleMedium: TextStyle(color: Color(0xFFF1F5F9), fontWeight: FontWeight.w700),
    bodyMedium: TextStyle(color: Color(0xFFCBD5E1)),
    bodySmall: TextStyle(color: Color(0xFF94A3B8)),
  ),
);

// ── No-animation page transition (used when Reduce Motion is ON) ────────────
// GoRouter page transitions don't respect MediaQuery.disableAnimations, so we
// use a custom PageTransitionsBuilder that simply renders the page instantly.
class _NoAnimationPageTransitionsBuilder extends PageTransitionsBuilder {
  const _NoAnimationPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T>? route,
    BuildContext? context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) =>
      child; // Instant — no slide, zoom, or fade
}

// ── App ───────────────────────────────────────────────────────────────────────
class LinguaAbleApp extends StatelessWidget {
  const LinguaAbleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<UserProvider>(
      builder: (context, userProvider, child) {
        final bool isDark = userProvider.preferences['theme'] == 'dark';
        final bool dyslexiaFont = userProvider.dyslexiaFont;
        final bool animationReduced = userProvider.animationReduced;

        // Text scale from font-size preference
        double textScaleFactor = 1.0;
        if (userProvider.fontSize == 'small') textScaleFactor = 0.85;
        if (userProvider.fontSize == 'large') textScaleFactor = 1.2;

        // Dyslexia-friendly font: Lexend (purpose-built for reading ease).
        // 'Comic Sans MS' is a Windows font and does NOT exist on Android.
        final TextTheme lightText = dyslexiaFont
            ? GoogleFonts.lexendTextTheme(_lightTheme.textTheme)
            : _lightTheme.textTheme;
        final TextTheme darkText = dyslexiaFont
            ? GoogleFonts.lexendTextTheme(_darkTheme.textTheme)
            : _darkTheme.textTheme;

        // Reduce Motion: swap page transitions for instant (no-animation) ones.
        // MaterialApp theme controls GoRouter page transitions — MediaQuery
        // disableAnimations alone does NOT affect them.
        const _noAnim = _NoAnimationPageTransitionsBuilder();
        final pageTransTheme = animationReduced
            ? const PageTransitionsTheme(builders: {
                TargetPlatform.android: _noAnim,
                TargetPlatform.iOS: _noAnim,
                TargetPlatform.linux: _noAnim,
                TargetPlatform.macOS: _noAnim,
                TargetPlatform.windows: _noAnim,
                TargetPlatform.fuchsia: _noAnim,
              })
            : null; // null keeps the theme's default transitions

        final activeLight = _lightTheme.copyWith(
          textTheme: lightText,
          pageTransitionsTheme: pageTransTheme,
        );
        final activeDark = _darkTheme.copyWith(
          textTheme: darkText,
          pageTransitionsTheme: pageTransTheme,
        );

        return MaterialApp.router(
          routerConfig: _router,
          title: 'LinguaAble',
          debugShowCheckedModeBanner: false,
          theme: activeLight,
          darkTheme: activeDark,
          themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
          builder: (context, widget) {
            // Accessibility: colour overlay
            Color overlayColor = Colors.transparent;
            switch (userProvider.colorOverlay) {
              case 'yellow':
                overlayColor = const Color(0xFFFBBF24).withOpacity(0.15);
                break;
              case 'blue':
                overlayColor = const Color(0xFF60A5FA).withOpacity(0.15);
                break;
              case 'green':
                overlayColor = const Color(0xFF34D399).withOpacity(0.15);
                break;
              case 'rose':
                overlayColor = const Color(0xFFF472B6).withOpacity(0.15);
                break;
            }

            Widget wrapped = MediaQuery(
              data: MediaQuery.of(context).copyWith(
                textScaler: TextScaler.linear(textScaleFactor),
                disableAnimations: animationReduced,
              ),
              child: widget ?? const SizedBox(),
            );

            if (overlayColor != Colors.transparent) {
              return Stack(children: [
                wrapped,
                IgnorePointer(child: Container(color: overlayColor)),
              ]);
            }
            return wrapped;
          },
        );
      },
    );
  }
}

// ── Landing Page ──────────────────────────────────────────────────────────────
class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final List<Map<String, String>> features = [
    {
      'icon': '🧠',
      'title': 'Dyslexia-Friendly Design',
      'description': 'Clear fonts, high contrast, and customizable text spacing',
    },
    {
      'icon': '⏱️',
      'title': 'ADHD-Optimized Learning',
      'description': 'Short, focused lessons with frequent breaks',
    },
    {
      'icon': '🎤',
      'title': 'Interactive Speech Practice',
      'description': 'Real-time pronunciation feedback and voice recognition',
    },
    {
      'icon': '📖',
      'title': 'Multi-Sensory Approach',
      'description': 'Visual, auditory, and kinesthetic learning methods',
    },
    {
      'icon': '🎯',
      'title': 'Adaptive Difficulty',
      'description': 'Lessons adjust to your learning pace automatically',
    },
    {
      'icon': '🏆',
      'title': 'Motivational Rewards',
      'description': 'Achievements, streaks, and progress celebrations',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 60),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              // Logo circle
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  color: cs.surface,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: _kOrange.withOpacity(0.35),
                      blurRadius: 40,
                      offset: const Offset(0, 15),
                    ),
                  ],
                ),
                child: const Icon(Icons.school, size: 60, color: _kOrange),
              ),
              const SizedBox(height: 30),
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.5,
                  ),
                  children: [
                    TextSpan(text: 'Lingua', style: TextStyle(color: _kBlue)),
                    TextSpan(text: 'Able', style: TextStyle(color: _kOrange)),
                  ],
                ),
              ),
              const SizedBox(height: 15),
              const Text(
                'BUILT AROUND LEARNERS, NOT LIMITATIONS!',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: _kOrange,
                  letterSpacing: 2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  'Master Hindi with confidence! Specially designed for learners with dyslexia, ADHD, and other learning disabilities. Our accessible, multi-sensory approach makes learning Hindi engaging, effective, and stress-free.',
                  style: TextStyle(fontSize: 16, height: 1.6, color: cs.onSurface.withOpacity(0.6)),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 40),

              // CTA Buttons
              Wrap(
                spacing: 15,
                runSpacing: 15,
                alignment: WrapAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: () => context.push('/login'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _kOrange,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      elevation: 8,
                    ),
                    child: const Text('SIGN IN', style: TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1)),
                  ),
                  OutlinedButton(
                    onPressed: () => context.push('/signup'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: _kOrange,
                      side: const BorderSide(color: _kOrange, width: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                    child: const Text('CREATE ACCOUNT', style: TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1)),
                  ),
                ],
              ),

              const SizedBox(height: 80),

              // Features Section
              Text(
                'Why Choose LinguaAble?',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: cs.onSurface),
                textAlign: TextAlign.center,
              ),
              Container(
                margin: const EdgeInsets.only(top: 15, bottom: 40),
                width: 80,
                height: 4,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF3B82F6), _kOrange]),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              Wrap(
                spacing: 20,
                runSpacing: 20,
                alignment: WrapAlignment.center,
                children: features.map((feature) {
                  return Container(
                    width: MediaQuery.of(context).size.width > 600 ? 300 : double.infinity,
                    padding: const EdgeInsets.all(25),
                    decoration: BoxDecoration(
                      color: cs.surface,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(feature['icon']!, style: const TextStyle(fontSize: 48)),
                        const SizedBox(height: 15),
                        Text(
                          feature['title']!,
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: cs.onSurface),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          feature['description']!,
                          style: TextStyle(fontSize: 15, color: cs.onSurface.withOpacity(0.6), height: 1.5),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

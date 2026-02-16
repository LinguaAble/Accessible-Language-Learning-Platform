import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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

    // Redirect to dashboard if logged in and trying to access auth pages
    if (userProvider.isAuthenticated && isGoingToAuth) {
      return '/dashboard';
    }

    // Prevent unauthenticated users from accessing protected routes
    if (!userProvider.isAuthenticated && !isGoingToAuth) {
      return '/';
    }

    return null; // no redirect
  },
  routes: [
    GoRoute(path: '/', builder: (context, state) => const LandingPage()),
    GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupPage()),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardPage(),
    ),
    GoRoute(
      path: '/lessons',
      builder: (context, state) => const LessonsPage(),
    ),
    GoRoute(
      path: '/leaderboard',
      builder: (context, state) => const LeaderboardPage(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsPage(),
    ),
    GoRoute(
      path: '/lessons/:id',
      builder: (context, state) {
        final id = int.tryParse(state.pathParameters['id'] ?? '1') ?? 1;
        return LearningScreen(lessonId: id);
      },
    ),
  ],
);

class LinguaAbleApp extends StatelessWidget {
  const LinguaAbleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<UserProvider>(
      builder: (context, userProvider, child) {
        final bool isDark = userProvider.preferences['theme'] == 'dark';
        
        final colorScheme = ColorScheme.fromSeed(
          seedColor: const Color(0xFFF79C42),
          brightness: isDark ? Brightness.dark : Brightness.light,
        );

        final String fontSizePref = userProvider.fontSize;
        double textScaleFactor = 1.0;
        if (fontSizePref == 'small') textScaleFactor = 0.85;
        if (fontSizePref == 'large') textScaleFactor = 1.2;

        return MaterialApp.router(
          routerConfig: _router,
          title: 'LinguaAble',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: colorScheme,
            useMaterial3: true,
            scaffoldBackgroundColor: isDark ? const Color(0xFF121212) : const Color(0xFFF5F5F5),
            fontFamily: userProvider.dyslexiaFont ? 'Comic Sans MS' : null,
          ),
          builder: (context, widget) {
            Color overlayColor = Colors.transparent;
            switch (userProvider.colorOverlay) {
              case 'yellow': overlayColor = const Color(0xFFFBBF24).withOpacity(0.15); break;
              case 'blue': overlayColor = const Color(0xFF60A5FA).withOpacity(0.15); break;
              case 'green': overlayColor = const Color(0xFF34D399).withOpacity(0.15); break;
              case 'rose': overlayColor = const Color(0xFFF472B6).withOpacity(0.15); break;
            }

            final mediaQuery = MediaQuery.of(context);
            
            Widget wrappedWidget = MediaQuery(
              data: mediaQuery.copyWith(
                textScaler: TextScaler.linear(textScaleFactor),
                // disableAnimations works for implicit animations and pagetransitions
                disableAnimations: userProvider.animationReduced,
              ),
              child: widget ?? const SizedBox(),
            );

            if (overlayColor != Colors.transparent) {
              return Stack(
                children: [
                   wrappedWidget,
                   IgnorePointer(
                     child: Container(color: overlayColor),
                   ),
                ],
              );
            }

            return wrappedWidget;
          },
        );
      },
    );
  }
}

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
      'description':
          'Clear fonts, high contrast, and customizable text spacing',
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
    // Basic landing page translated from LandingPage.jsx
    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 60),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Hero Section
              const SizedBox(height: 40),
              // We'll replace this box with your actual logo later by adding it to pubspec.yaml
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE67E22).withOpacity(0.4),
                      blurRadius: 40,
                      offset: const Offset(0, 15),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.school,
                  size: 60,
                  color: Color(0xFFF79C42),
                ),
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
                    TextSpan(
                      text: 'Lingua',
                      style: TextStyle(color: Color(0xFF1E3A8A)),
                    ), // Simulated text-brand-blue
                    TextSpan(
                      text: 'Able',
                      style: TextStyle(color: Color(0xFFF79C42)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 15),
              const Text(
                'BUILT AROUND LEARNERS, NOT LIMITATIONS!',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFFE67E22), // accent color
                  letterSpacing: 2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  'Master Hindi with confidence! Specially designed for learners with dyslexia, ADHD, and other learning disabilities. Our accessible, multi-sensory approach makes learning Hindi engaging, effective, and stress-free.',
                  style: TextStyle(
                    fontSize: 16,
                    height: 1.6,
                    color: Colors.black54,
                  ),
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
                    onPressed: () {
                      context.push('/login');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF79C42),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 40,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      elevation: 8,
                    ),
                    child: const Text(
                      'SIGN IN',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () {
                      context.push('/signup');
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFF79C42),
                      side: const BorderSide(
                        color: Color(0xFFF79C42),
                        width: 2,
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 30,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                    ),
                    child: const Text(
                      'CREATE ACCOUNT',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 80),

              // Features Section
              const Text(
                'Why Choose LinguaAble?',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1F2937),
                ),
                textAlign: TextAlign.center,
              ),
              Container(
                margin: const EdgeInsets.only(top: 15, bottom: 40),
                width: 80,
                height: 4,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFFF79C42)],
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              Wrap(
                spacing: 20,
                runSpacing: 20,
                alignment: WrapAlignment.center,
                children: features.map((feature) {
                  return Container(
                    width: MediaQuery.of(context).size.width > 600
                        ? 300
                        : double.infinity,
                    padding: const EdgeInsets.all(25),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          feature['icon']!,
                          style: const TextStyle(fontSize: 48),
                        ),
                        const SizedBox(height: 15),
                        Text(
                          feature['title']!,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1F2937),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          feature['description']!,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Colors.black54,
                            height: 1.5,
                          ),
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

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/user_provider.dart';
import '../services/api_service.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;
  bool _rememberMe = false;
  bool _isLoading = false;
  String? _errorMessage;

  void _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an email and password')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await ApiService.login(email, password);

      if (!mounted) return;

      if (result['success'] == true && result['token'] != null) {
        final userProvider = Provider.of<UserProvider>(context, listen: false);

        await userProvider.login(
          result['token'],
          result['user'] as Map<String, dynamic>,
          _rememberMe,
        );

        if (mounted) {
          context.go('/dashboard');
        }
      } else {
        setState(() {
          _errorMessage = result['message'] ?? 'Invalid email or password';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Cannot connect to server. Check your connection.';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        clientId: kIsWeb
            ? '881849579766-1gv9l5lrfs9ie0t6o13pk4v38hl74glb.apps.googleusercontent.com'
            : null,
      );

      // Force the account picker instead of auto-signing in
      await googleSignIn.signOut();
      final GoogleSignInAccount? account = await googleSignIn.signIn();
      if (account == null) {
        setState(() => _isLoading = false);
        return; // user canceled
      }

      // 2. Secretly register/login them on our backend !
      final serverResult = await ApiService.googleLogin(
        email: account.email,
        username: account.email.split('@')[0],
        fullName: account.displayName,
        avatarUrl: account.photoUrl,
      );

      if (serverResult['success'] != true) {
        await googleSignIn.signOut();
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage =
                serverResult['message'] ?? 'Failed to complete Google login.';
          });
        }
        return;
      }

      if (!mounted) return;
      final provider = Provider.of<UserProvider>(context, listen: false);

      // Log them in beautifully with actual server token and official user record!
      await provider.login(
        serverResult['token'],
        serverResult['user'] as Map<String, dynamic>,
        _rememberMe,
      );

      if (mounted) {
        context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) {
        print('Google Sign In Error: $e');
        setState(() {
          _errorMessage = kIsWeb
              ? 'Google Sign In Failed. Wait for popup.'
              : 'Google Sign In Failed on Mobile. \nError: $e';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: cs.onSurface.withOpacity(0.6)),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE67E22).withOpacity(0.4),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Image.asset(
                    'assets/logo.png',
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Welcome to',
                style: TextStyle(
                  fontSize: 16,
                  color: cs.onSurface.withOpacity(0.6),
                ),
              ),
              RichText(
                text: TextSpan(
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.0,
                  ),
                  children: [
                    TextSpan(
                      text: 'Lingua',
                      style: TextStyle(
                        color: isDark
                            ? const Color(0xFF60A5FA)
                            : const Color(0xFF1E3A8A),
                      ),
                    ),
                    const TextSpan(
                      text: 'Able',
                      style: TextStyle(color: Color(0xFFF79C42)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                'Built Around Learners, Not Limitations!',
                style: TextStyle(
                  color: Colors.orange,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 30),

              // Error message
              if (_errorMessage != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: cs.error.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: cs.error.withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: cs.error, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(
                            color: cs.error,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'name@example.com',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.email_outlined),
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _passwordController,
                obscureText: !_showPassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'Enter your password',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _showPassword ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () =>
                        setState(() => _showPassword = !_showPassword),
                  ),
                ),
                onSubmitted: (_) => _handleLogin(),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Checkbox(
                        value: _rememberMe,
                        onChanged: (val) => setState(() => _rememberMe = val!),
                        activeColor: const Color(0xFFF79C42),
                      ),
                      const Text('Stay signed in'),
                    ],
                  ),
                  TextButton(
                    onPressed: () => context.push('/forgot-password'),
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(color: Color(0xFFF79C42)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF79C42),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(color: Colors.white),
                        )
                      : const Text(
                          'Sign In',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(child: Divider(color: cs.outline)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'OR',
                      style: TextStyle(color: cs.onSurface.withOpacity(0.5)),
                    ),
                  ),
                  Expanded(child: Divider(color: cs.outline)),
                ],
              ),
              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isLoading ? null : _handleGoogleLogin,
                  icon: Image.network(
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png',
                    height: 20,
                  ),
                  label: const Text(
                    'Sign in with Google',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(color: cs.outline),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('New here? '),
                  GestureDetector(
                    child: const Text(
                      'Create an Account',
                      style: TextStyle(
                        color: Color(0xFFF79C42),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onTap: () => context.push('/signup'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

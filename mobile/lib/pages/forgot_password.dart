import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  int _step = 1;
  
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _showPassword = false;
  bool _showConfirm = false;
  bool _isLoading = false;
  
  String? _errorMessage;
  String? _successMessage;

  int _timer = 60;
  bool _canResend = false;
  Timer? _countdownTimer;

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _emailController.dispose();
    _otpController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _startTimer() {
    setState(() {
      _timer = 60;
      _canResend = false;
    });
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_timer > 0) {
          _timer--;
        } else {
          _canResend = true;
          timer.cancel();
        }
      });
    });
  }

  void _handleSendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an email address')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final result = await ApiService.forgotPassword(email);

      if (!mounted) return;

      if (result['success'] == true) {
        setState(() {
          _successMessage = result['message'] ?? 'OTP sent to $email';
          _step = 2;
        });
        _startTimer();
      } else {
        setState(() {
          _errorMessage = result['message'] ?? 'User not found';
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

  void _handleResetPassword() async {
    final otp = _otpController.text.trim();
    final newPassword = _passwordController.text.trim();
    final confirm = _confirmController.text.trim();

    if (otp.isEmpty || newPassword.isEmpty || confirm.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    if (newPassword.length < 6) {
      setState(() => _errorMessage = 'Password must be at least 6 characters');
      return;
    }

    if (newPassword != confirm) {
      setState(() => _errorMessage = 'Passwords do not match');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final result = await ApiService.resetPassword(otp, newPassword);

      if (!mounted) return;

      if (result['success'] == true) {
        setState(() {
          _successMessage = 'Password Changed Successfully! Redirecting...';
        });
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            context.go('/login');
          }
        });
      } else {
        setState(() {
          _errorMessage = result['message'] ?? 'Invalid OTP or Expired';
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
              RichText(
                text: TextSpan(
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1.0,
                  ),
                  children: [
                    TextSpan(
                      text: 'Lingua',
                      style: TextStyle(
                        color: isDark ? const Color(0xFF60A5FA) : const Color(0xFF1E3A8A),
                      ),
                    ),
                    const TextSpan(
                      text: 'Able',
                      style: TextStyle(color: Color(0xFFF79C42)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(
                _step == 1 ? 'Forgot Password?' : 'Enter the OTP',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: cs.onSurface.withOpacity(0.7),
                ),
              ),
              const SizedBox(height: 25),

              // Success message
              if (_successMessage != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2ECC71).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF2ECC71).withOpacity(0.4)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_outline, color: Color(0xFF2ECC71), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _successMessage!,
                          style: const TextStyle(
                            color: Color(0xFF2ECC71),
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

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

              // --- STEP 1 ---
              if (_step == 1) ...[
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
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleSendOtp,
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
                            'Send OTP Code',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 25),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Remembered your password? ', style: TextStyle(color: cs.onSurface.withOpacity(0.7))),
                    GestureDetector(
                      onTap: () => context.go('/login'),
                      child: const Text(
                        'Sign In',
                        style: TextStyle(
                          color: Color(0xFFF79C42),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              // --- STEP 2 ---
              if (_step == 2) ...[
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: const TextStyle(letterSpacing: 10, fontWeight: FontWeight.bold, fontSize: 18),
                  decoration: InputDecoration(
                    labelText: 'Enter 6-Digit OTP',
                    hintText: '123456',
                    alignLabelWithHint: true,
                    floatingLabelAlignment: FloatingLabelAlignment.center,
                    counterText: "",
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _passwordController,
                  obscureText: !_showPassword,
                  decoration: InputDecoration(
                    labelText: 'New Password',
                    hintText: 'New secure password',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showPassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () => setState(() => _showPassword = !_showPassword),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _confirmController,
                  obscureText: !_showConfirm,
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    hintText: 'Type password again',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showConfirm ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () => setState(() => _showConfirm = !_showConfirm),
                    ),
                  ),
                ),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleResetPassword,
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
                            'Change Password',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 25),
                TextButton(
                  onPressed: _canResend && !_isLoading ? _handleSendOtp : null,
                  child: Text(
                    _canResend ? 'Resend OTP' : 'Resend OTP in ${_timer}s',
                    style: TextStyle(
                      color: _canResend ? const Color(0xFFE67E22) : cs.onSurface.withOpacity(0.4),
                      fontWeight: FontWeight.bold,
                      decoration: _canResend ? TextDecoration.underline : TextDecoration.none,
                    ),
                  ),
                ),
                const SizedBox(height: 5),
                TextButton(
                  onPressed: () => setState(() {
                    _step = 1;
                    _errorMessage = null;
                    _successMessage = null;
                  }),
                  child: Text(
                    'Wrong email? Go back',
                    style: TextStyle(color: cs.onSurface.withOpacity(0.6), decoration: TextDecoration.underline),
                  ),
                ),
              ],
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

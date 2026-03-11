import 'dart:math';
import 'package:flutter/material.dart';

class ConfettiOverlay extends StatefulWidget {
  const ConfettiOverlay({super.key});

  @override
  State<ConfettiOverlay> createState() => _ConfettiOverlayState();
}

class _ConfettiOverlayState extends State<ConfettiOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  final List<_ConfettiPiece> _pieces = [];
  final Random _rnd = Random();
  final List<Color> _colors = const [
    Color(0xFFF97316), Color(0xFF38BDF8), Color(0xFFA855F7), Color(0xFF34D399),
    Color(0xFFFBBF24), Color(0xFFF43F5E), Color(0xFF818CF8), Color(0xFF4ADE80),
    Color(0xFFFB923C), Color(0xFF22D3EE), Color(0xFFE879F9), Color(0xFF86EFAC),
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (_pieces.isEmpty) {
          for (int i = 0; i < 130; i++) {
            _pieces.add(_ConfettiPiece(
              x: _rnd.nextDouble() * constraints.maxWidth,
              y: _rnd.nextDouble() * -constraints.maxHeight,
              w: _rnd.nextDouble() * 11 + 6,
              h: _rnd.nextDouble() * 7 + 4,
              color: _colors[_rnd.nextInt(_colors.length)],
              speed: _rnd.nextDouble() * 3.5 + 1.8,
              drift: (_rnd.nextDouble() - 0.5) * 1.8,
              rot: _rnd.nextDouble() * pi * 2,
              rotSpeed: (_rnd.nextDouble() - 0.5) * 0.14,
            ));
          }
        }
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return CustomPaint(
              size: Size(constraints.maxWidth, constraints.maxHeight),
              painter: _ConfettiPainter(_pieces),
            );
          },
        );
      },
    );
  }
}

class _ConfettiPiece {
  double x, y, w, h;
  Color color;
  double speed, drift, rot, rotSpeed;
  _ConfettiPiece({required this.x, required this.y, required this.w, required this.h, required this.color, required this.speed, required this.drift, required this.rot, required this.rotSpeed});
}

class _ConfettiPainter extends CustomPainter {
  final List<_ConfettiPiece> pieces;
  _ConfettiPainter(this.pieces);

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width == 0 || size.height == 0) return;
    final paint = Paint()..style = PaintingStyle.fill;
    final Random rnd = Random();

    for (var p in pieces) {
      canvas.save();
      canvas.translate(p.x, p.y);
      canvas.rotate(p.rot);
      paint.color = p.color.withOpacity(0.88);
      canvas.drawRect(Rect.fromCenter(center: Offset.zero, width: p.w, height: p.h), paint);
      canvas.restore();

      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;

      if (p.y > size.height + 20) {
        p.y = -20;
        p.x = rnd.nextDouble() * size.width;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _ConfettiPainter oldDelegate) => true;
}

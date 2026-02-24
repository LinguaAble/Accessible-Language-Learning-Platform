import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:mobile/main.dart';
import 'package:mobile/providers/user_provider.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    final userProvider = UserProvider();
    
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider.value(value: userProvider),
        ],
        child: const LinguaAbleApp(),
      ),
    );

    // Give it a chance to render the Landing page
    await tester.pumpAndSettle();

    // Verify app starts up
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

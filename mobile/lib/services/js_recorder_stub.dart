/// Stub for native platforms — JS recorder functions are never called on native.

Future<bool> jsStartRecording() async {
  throw UnsupportedError('JS recorder not available on native');
}

Future<String> jsStopRecording() async {
  throw UnsupportedError('JS recorder not available on native');
}

void jsCancelRecording() {}

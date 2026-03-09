/// Web implementation — uses dart:js_interop to call browser's MediaRecorder.
// ignore_for_file: avoid_web_libraries_in_flutter

import 'dart:js_interop';

@JS('startAudioRecording')
external JSPromise<JSBoolean> _jsStart();

@JS('stopAudioRecording')
external JSPromise<JSString> _jsStop();

@JS('cancelAudioRecording')
external void _jsCancel();

Future<bool> jsStartRecording() async {
  try {
    final result = await _jsStart().toDart;
    return result.toDart;
  } catch (e) {
    return false;
  }
}

Future<String> jsStopRecording() async {
  final result = await _jsStop().toDart;
  return result.toDart;
}

void jsCancelRecording() {
  _jsCancel();
}

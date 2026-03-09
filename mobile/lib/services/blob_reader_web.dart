/// Reads bytes from a blob URL on Flutter web.
/// Uses dart:html's HttpRequest with 'arraybuffer' response type
/// to avoid the binary data corruption that happens with package:http.
// ignore_for_file: avoid_web_libraries_in_flutter

import 'dart:async';
import 'dart:html' as html;
import 'dart:typed_data';

Future<List<int>> readBlobBytes(String blobUrl) async {
  final completer = Completer<List<int>>();

  final xhr = html.HttpRequest();
  xhr.open('GET', blobUrl);
  xhr.responseType = 'arraybuffer';

  xhr.onLoad.listen((_) {
    final buffer = xhr.response as ByteBuffer?;
    if (buffer != null) {
      completer.complete(buffer.asUint8List());
    } else {
      completer.complete([]);
    }
  });

  xhr.onError.listen((_) {
    completer.complete([]);
  });

  xhr.send();

  return completer.future;
}

/// Stub for non-web platforms — never used on native.
Future<List<int>> readBlobBytes(String blobUrl) async {
  throw UnsupportedError('readBlobBytes is only for web');
}

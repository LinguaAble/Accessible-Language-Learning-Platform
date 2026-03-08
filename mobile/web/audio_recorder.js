// Flutter Web — Audio recorder using browser's MediaRecorder API.
// Exactly matches the web frontend's googleSpeechService.js approach.

let _mediaRecorder = null;
let _audioChunks = [];
let _stream = null;

// Start recording from microphone
async function startAudioRecording() {
    try {
        _audioChunks = [];
        _stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 48000,
            }
        });

        // Use webm/opus — same as Chrome's default, same as web frontend
        _mediaRecorder = new MediaRecorder(_stream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        _mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                _audioChunks.push(event.data);
            }
        };

        _mediaRecorder.start();
        console.log('AudioRecorder: started recording');
        return true;
    } catch (e) {
        console.error('AudioRecorder: failed to start:', e);
        return false;
    }
}

// Stop recording and return base64-encoded audio
function stopAudioRecording() {
    return new Promise((resolve, reject) => {
        if (!_mediaRecorder || _mediaRecorder.state === 'inactive') {
            reject('Not recording');
            return;
        }

        _mediaRecorder.onstop = () => {
            const blob = new Blob(_audioChunks, { type: 'audio/webm;codecs=opus' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                // Extract base64 from data URL (remove "data:audio/webm;codecs=opus;base64," prefix)
                const base64data = reader.result.split(',')[1];
                console.log('AudioRecorder: stopped, blob size=' + blob.size + ', base64 length=' + base64data.length);

                // Clean up stream
                if (_stream) {
                    _stream.getTracks().forEach(track => track.stop());
                    _stream = null;
                }
                _mediaRecorder = null;
                _audioChunks = [];

                resolve(base64data);
            };
            reader.onerror = reject;
        };

        _mediaRecorder.stop();
    });
}

// Cancel recording without returning data
function cancelAudioRecording() {
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
        _mediaRecorder.stop();
    }
    if (_stream) {
        _stream.getTracks().forEach(track => track.stop());
        _stream = null;
    }
    _mediaRecorder = null;
    _audioChunks = [];
}

// Expose globally for Dart JS interop
window.startAudioRecording = startAudioRecording;
window.stopAudioRecording = stopAudioRecording;
window.cancelAudioRecording = cancelAudioRecording;

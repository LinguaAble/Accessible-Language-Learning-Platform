
import axios from 'axios';

const API_KEY = 'AIzaSyDynztlgYVKEr67mfb_4LLsZCqIK6bShUA'; // Provided API Key
const GOOGLE_SPEECH_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;

/**
 * Converts a Blob to a Base64 string suitable for Google API
 */
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve(base64data);
        };
        reader.onerror = reject;
    });
};

/**
 * Sends audio data to Google Speech-to-Text API
 * @param {Blob} audioBlob - The recorded audio blob
 * @returns {Promise<string>} - The transcribed text
 */
export const transcribeAudio = async (audioBlob) => {
    try {
        const base64Audio = await blobToBase64(audioBlob);

        const requestBody = {
            config: {
                encoding: 'WEBM_OPUS', // Standard format for Chrome/Firefox MediaRecorder
                sampleRateHertz: 48000, // Optional, can often be omitted for WEBM
                languageCode: 'hi-IN',  // Hindi India
                enableAutomaticPunctuation: true,
                model: 'default'
            },
            audio: {
                content: base64Audio
            }
        };

        const response = await axios.post(GOOGLE_SPEECH_URL, requestBody);

        if (response.data.results && response.data.results.length > 0) {
            // Combine all transcripts
            return response.data.results
                .map(result => result.alternatives[0].transcript)
                .join(' ');
        } else {
            return ""; // No speech detected
        }

    } catch (error) {
        console.error("Google Speech API Error:", error);
        throw error;
    }
};


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
 * @param {Array<string>} phrases - Optional list of phrases/words to boost in detection (Speech Context)
 * @returns {Promise<string>} - The transcribed text
 */
export const transcribeAudio = async (audioBlob, phrases = []) => {
    try {
        const base64Audio = await blobToBase64(audioBlob);

        const requestBody = {
            config: {
                encoding: 'WEBM_OPUS', // Standard format for Chrome/Firefox MediaRecorder
                languageCode: 'hi-IN',  // Hindi India
                enableAutomaticPunctuation: true,
                model: 'default',
                speechContexts: phrases.length > 0 ? [{
                    phrases: phrases,
                    boost: 20.0 // Boost the likelihood of these phrases
                }] : []
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

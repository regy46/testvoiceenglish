/**
 * Helper utility for Audio Recording, Data Conversion, and Synthesizing sample audio
 */

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Convert Blob to Base64 Data URL for persistent local storage
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates a clean synthetic audio voice-like melody tone as a WAV Data URL.
 * Used for mock initial data so audio buttons play actual sound in browser!
 */
export function generateSampleAudioDataUrl(durationSeconds: number = 3, freq: number = 440): string {
  const sampleRate = 22050;
  const numChannels = 1;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Create a speech-like tone envelope with slight frequency modulation
    const env = Math.sin((Math.PI * i) / numSamples);
    const wave = Math.sin(2 * Math.PI * (freq + Math.sin(t * 8) * 30) * t) * 0.4 
               + Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.1;
    buffer[i] = Math.max(-32768, Math.min(32767, wave * env * 32767));
  }

  const wavHeader = createWavHeader(numSamples * 2, sampleRate, numChannels);
  const blob = new Blob([wavHeader, buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function createWavHeader(dataLength: number, sampleRate: number, numChannels: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + dataLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

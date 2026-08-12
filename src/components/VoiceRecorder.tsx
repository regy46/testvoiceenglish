import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Upload, Volume2, AlertTriangle, CheckCircle2, Music } from 'lucide-react';
import { formatTime, blobToDataURL } from '../utils/audioUtils';

interface VoiceRecorderProps {
  onAudioRecorded: (audioDataUrl: string, durationInSeconds: number) => void;
  onClearAudio: () => void;
  hasAudioRecorded: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioRecorded,
  onClearAudio,
  hasAudioRecorded,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up timer and streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording, isPaused]);

  // Start Voice Recording
  const startRecording = async () => {
    setMicPermissionError(null);
    audioChunksRef.current = [];
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = recordingTime || 1;
        const dataUrl = await blobToDataURL(audioBlob);

        setPreviewAudioUrl(dataUrl);
        setPreviewDuration(duration);
        onAudioRecorded(dataUrl, duration);

        // Stop all audio tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(200); // Collect slice every 200ms
      setIsRecording(true);
      setIsPaused(false);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicPermissionError(
        'Tidak dapat mengakses mikrofon. Pastikan izin mikrofon diizinkan di browser atau gunakan opsi Upload File Audio.'
      );
    }
  };

  // Pause / Resume Recording
  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Reset / Re-record
  const handleReset = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setPreviewAudioUrl(null);
    setIsPlayingPreview(false);
    setRecordingTime(0);
    setPreviewCurrentTime(0);
    onClearAudio();
  };

  // Toggle Audio Preview Play/Pause
  const togglePlayPreview = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Handle File Upload Fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Mohon pilih file audio berformat .mp3, .wav, .m4a, .webm, atau .ogg');
      return;
    }

    try {
      const dataUrl = await blobToDataURL(file);
      // Estimate duration or load metadata
      const tempAudio = new Audio(dataUrl);
      tempAudio.onloadedmetadata = () => {
        const duration = Math.round(tempAudio.duration) || 5;
        setPreviewAudioUrl(dataUrl);
        setPreviewDuration(duration);
        onAudioRecorded(dataUrl, duration);
      };
    } catch (err) {
      alert('Gagal membaca file audio.');
    }
  };

  return (
    <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-6 shadow-xs text-[#3D3D3D]">
      
      {/* Header Tabs: Record vs Upload */}
      <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4 mb-5">
        <label className="text-sm font-semibold text-[#4A5D45] flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-[#8BA888]" />
          <span>Rekaman Pesan Suara (Voice Note) <span className="text-[#D48C70]">*</span></span>
        </label>
        
        {!hasAudioRecorded && !isRecording && (
          <div className="flex bg-[#F1EFE7] p-1 rounded-full border border-[#E5E2D9] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              className={`px-3.5 py-1 rounded-full font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'record'
                  ? 'bg-[#8BA888] text-white shadow-xs'
                  : 'text-[#8C8679] hover:text-[#4A5D45]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Rekam Langsung</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1 rounded-full font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'upload'
                  ? 'bg-[#8BA888] text-white shadow-xs'
                  : 'text-[#8C8679] hover:text-[#4A5D45]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      {/* Mic Permission Warning */}
      {micPermissionError && activeTab === 'record' && (
        <div className="mb-4 bg-[#D48C70]/10 border border-[#D48C70]/30 text-[#D48C70] p-3.5 rounded-2xl text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{micPermissionError}</p>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="mt-1.5 underline text-[#4A5D45] font-semibold"
            >
              Klik di sini untuk berpindah ke opsi Upload File Audio
            </button>
          </div>
        </div>
      )}

      {/* CASE 1: Audio Has Been Recorded / Selected (Preview Mode) */}
      {hasAudioRecorded && previewAudioUrl ? (
        <div className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#4A5D45]">
            <span className="flex items-center space-x-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#8BA888]" />
              <span>Voice Note Siap Dikirim!</span>
            </span>
            <span className="text-[#8C8679] font-mono">Durasi: {formatTime(previewDuration)}</span>
          </div>

          {/* Audio Player Element */}
          <audio
            ref={audioPlayerRef}
            src={previewAudioUrl}
            onTimeUpdate={() => {
              if (audioPlayerRef.current) {
                setPreviewCurrentTime(audioPlayerRef.current.currentTime);
              }
            }}
            onEnded={() => setIsPlayingPreview(false)}
            className="hidden"
          />

          {/* Player Wave Visualizer Controls */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-[#E5E2D9]">
            <button
              type="button"
              onClick={togglePlayPreview}
              className="w-10 h-10 rounded-full bg-[#8BA888] hover:bg-[#4A5D45] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs flex-shrink-0"
            >
              {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              {/* Progress Slider */}
              <input
                type="range"
                min={0}
                max={previewDuration || 1}
                value={previewCurrentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPreviewCurrentTime(val);
                  if (audioPlayerRef.current) {
                    audioPlayerRef.current.currentTime = val;
                  }
                }}
                className="w-full accent-[#8BA888] h-1.5 bg-[#F1EFE7] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8C8679] font-mono">
                <span>{formatTime(previewCurrentTime)}</span>
                <span>{formatTime(previewDuration)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-[#D48C70] hover:bg-[#D48C70]/10 rounded-xl transition-colors text-xs flex items-center space-x-1 font-medium"
              title="Rekam Ulang / Hapus"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Ulangi</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'record' ? (
        /* CASE 2: Live Recording View */
        <div className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          
          {/* Animated Waveform Visualizer or Mic Icon */}
          <div className="relative mb-4">
            {isRecording ? (
              <div className="w-20 h-20 rounded-full bg-[#D48C70]/20 border-2 border-[#D48C70] flex items-center justify-center animate-pulse">
                <div className="flex items-center space-x-1">
                  <div className="w-1 bg-[#D48C70] h-6 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 bg-[#D48C70] h-10 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 bg-[#D48C70] h-8 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 bg-[#D48C70] h-12 animate-bounce" style={{ animationDelay: '450ms' }} />
                  <div className="w-1 bg-[#D48C70] h-5 animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#F1EFE7] border border-[#E5E2D9] flex items-center justify-center">
                <Mic className="w-8 h-8 text-[#8BA888]" />
              </div>
            )}
          </div>

          {/* Live Timer Counter */}
          <div className="font-mono text-3xl font-bold text-[#4A5D45] tracking-wider mb-2">
            {formatTime(recordingTime)}
          </div>

          <p className="text-xs text-[#8C8679] max-w-xs mb-6">
            {isRecording
              ? isPaused
                ? 'Perekaman dihentikan sementara. Klik Lanjutkan atau Selesai.'
                : 'Merekam suara Anda... Bicara dengan jelas dekat mikrofon.'
              : 'Klik tombol di bawah untuk mulai merekam voice note Anda.'}
          </p>

          {/* Action Control Buttons */}
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-6 py-3.5 bg-[#D48C70] hover:bg-[#c27a5f] text-white font-semibold rounded-full shadow-xs flex items-center space-x-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="w-3 h-3 rounded-full bg-white animate-ping" />
              <span>Mulai Merekam Suara</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePauseRecording}
                className="px-4 py-2.5 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] border border-[#E5E2D9] rounded-full font-medium text-xs flex items-center space-x-2 transition-colors"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 text-[#8BA888]" />
                    <span>Lanjutkan</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 text-[#D48C70]" />
                    <span>Jeda</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={stopRecording}
                className="px-5 py-2.5 bg-[#8BA888] hover:bg-[#4A5D45] text-white rounded-full font-semibold text-xs flex items-center space-x-2 shadow-xs transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Selesai & Simpan</span>
              </button>
            </div>
          )}

        </div>
      ) : (
        /* CASE 3: File Upload Fallback View */
        <div className="bg-[#F9F8F4] border border-dashed border-[#E5E2D9] rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F1EFE7] flex items-center justify-center mb-3">
            <Music className="w-6 h-6 text-[#8BA888]" />
          </div>
          <h4 className="text-sm font-semibold text-[#4A5D45] mb-1">Upload Rekaman Suara (.mp3, .wav, .m4a)</h4>
          <p className="text-xs text-[#8C8679] max-w-sm mx-auto mb-4">
            Pilih file rekaman suara dari perangkat Anda jika tidak menggunakan rekam langsung.
          </p>
          <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#8BA888] hover:bg-[#4A5D45] text-white text-xs font-semibold rounded-full cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4" />
            <span>Pilih File Audio</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

    </div>
  );
};

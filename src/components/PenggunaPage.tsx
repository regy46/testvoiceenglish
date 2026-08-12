import React, { useState, useEffect } from 'react';
import { VoiceNoteItem } from '../types';
import { VoiceRecorder } from './VoiceRecorder';
import { saveNewVoiceNote, getStoredVoiceNotes, getMySubmissionIds } from '../utils/storage';
import { formatTime } from '../utils/audioUtils';
import { 
  Send, 
  User, 
  GraduationCap, 
  CheckCircle2, 
  History, 
  Clock, 
  MessageSquare, 
  Sparkles,
  Volume2,
  RefreshCw
} from 'lucide-react';

interface PenggunaPageProps {
  onSubmissionsUpdated?: () => void;
}

export const PenggunaPage: React.FC<PenggunaPageProps> = ({ onSubmissionsUpdated }) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [kelas, setKelas] = useState('');
  
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<VoiceNoteItem | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // History state
  const [myHistory, setMyHistory] = useState<VoiceNoteItem[]>([]);

  useEffect(() => {
    loadMyHistory();
  }, [submittedItem]);

  const loadMyHistory = () => {
    const all = getStoredVoiceNotes();
    const myIds = getMySubmissionIds();
    const filtered = all.filter((item) => myIds.includes(item.id));
    setMyHistory(filtered);
  };

  const handleAudioRecorded = (dataUrl: string, duration: number) => {
    setAudioDataUrl(dataUrl);
    setAudioDuration(duration);
  };

  const handleClearAudio = () => {
    setAudioDataUrl(null);
    setAudioDuration(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim()) {
      alert('Mohon isi Nama Lengkap Anda terlebih dahulu.');
      return;
    }

    if (!kelas.trim()) {
      alert('Mohon tuliskan Kelas Anda.');
      return;
    }

    if (!audioDataUrl) {
      alert('Mohon rekam atau upload voice note terlebih dahulu sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newItem: VoiceNoteItem = {
        id: 'vn-' + Date.now(),
        namaLengkap: namaLengkap.trim(),
        kelas: kelas.trim(),
        audioUrl: audioDataUrl,
        duration: audioDuration,
        createdAt: new Date().toISOString(),
        status: 'unread',
      };

      saveNewVoiceNote(newItem);
      setIsSubmitting(false);
      setSubmittedItem(newItem);
      if (onSubmissionsUpdated) onSubmissionsUpdated();
    }, 600);
  };

  const handleResetForm = () => {
    setSubmittedItem(null);
    setAudioDataUrl(null);
    setAudioDuration(0);
    // Keep name & class for user convenience if sending multiple
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-[#3D3D3D]">
      
      {/* Top Welcome Banner */}
      <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#F1EFE7] border border-[#E5E2D9] text-[#4A5D45] text-xs px-3.5 py-1.5 rounded-full font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#8BA888]" />
            <span>Portal Siswa & Pengguna</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#4A5D45]">
            Kirim Voice Note Laporan & Tugas
          </h2>
          <p className="text-sm text-[#8C8679] max-w-2xl leading-relaxed">
            Lengkapi nama lengkap dan kelas Anda, lalu rekam pesan suara (voice note). Hasil rekaman akan langsung masuk ke Dashboard Guru / Admin untuk didengar & ditanggapi.
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center space-x-3 pt-6 border-t border-[#E5E2D9] mt-6">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'form'
                ? 'bg-[#8BA888] text-white shadow-xs'
                : 'bg-[#F1EFE7] text-[#4A3728] hover:bg-[#E5E2D9] border border-[#E5E2D9]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Form Pengiriman Suara</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              loadMyHistory();
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-[#8BA888] text-white shadow-xs'
                : 'bg-[#F1EFE7] text-[#4A3728] hover:bg-[#E5E2D9] border border-[#E5E2D9]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Kirim Saya ({myHistory.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Form Pengiriman */}
      {activeTab === 'form' && (
        <>
          {submittedItem ? (
            /* SUCCESS SUBMISSION TICKET MODAL/CARD */
            <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-8 sm:p-10 shadow-xs text-center space-y-6 text-[#3D3D3D] animate-fade-in">
              <div className="w-16 h-16 bg-[#8BA888]/20 border-2 border-[#8BA888] rounded-full flex items-center justify-center mx-auto text-[#4A5D45]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-[#4A5D45]">Voice Note Berhasil Terkirim!</h3>
                <p className="text-xs text-[#8C8679] max-w-md mx-auto">
                  Pesan suara Anda telah tercatat dan dapat langsung didengar oleh Admin di Dashboard Sekolah.
                </p>
              </div>

              {/* Receipt Summary */}
              <div className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl p-5 max-w-md mx-auto text-left space-y-2.5 text-xs text-[#3D3D3D]">
                <div className="flex justify-between border-b border-[#E5E2D9] pb-2">
                  <span className="text-[#8C8679]">Nama Pengirim:</span>
                  <span className="font-semibold text-[#4A5D45]">{submittedItem.namaLengkap}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E2D9] pb-2">
                  <span className="text-[#8C8679]">Kelas:</span>
                  <span className="font-semibold text-[#8BA888]">{submittedItem.kelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8679]">Durasi Suara:</span>
                  <span className="font-mono text-[#8BA888] font-bold">{formatTime(submittedItem.duration)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-[#8BA888] hover:bg-[#4A5D45] text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Kirim Voice Note Lain</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('history');
                    loadMyHistory();
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] font-semibold text-xs rounded-full border border-[#E5E2D9] transition-colors flex items-center justify-center space-x-2"
                >
                  <History className="w-4 h-4" />
                  <span>Lihat Riwayat Kirim Saya</span>
                </button>
              </div>
            </div>
          ) : (
            /* MAIN INPUT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Identity Details Card */}
              <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-8 shadow-xs space-y-6">
                <div className="flex items-center space-x-2 border-b border-[#E5E2D9] pb-4">
                  <User className="w-5 h-5 text-[#8BA888]" />
                  <h3 className="font-serif font-bold text-lg text-[#4A5D45]">Identitas Pengirim</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#7A7466]">
                      Nama Lengkap Siswa / Pengguna <span className="text-[#D48C70]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8679]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={namaLengkap}
                        onChange={(e) => setNamaLengkap(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 focus:border-[#8BA888] transition-all"
                      />
                    </div>
                  </div>

                  {/* Kelas */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#7A7466]">
                      Kelas <span className="text-[#D48C70]">*</span>
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8679]">
                        <GraduationCap className="w-4 h-4" />
                      </div>

                      <input
                        type="text"
                        required
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        placeholder="Tuliskan nama kelas Anda (contoh: 10 IPA 1 / XII MIPA 2 / 7B)..."
                        className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 focus:border-[#8BA888] transition-all"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Voice Recorder Component */}
              <VoiceRecorder
                onAudioRecorded={handleAudioRecorded}
                onClearAudio={handleClearAudio}
                hasAudioRecorded={Boolean(audioDataUrl)}
              />

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !namaLengkap.trim() || !kelas.trim() || !audioDataUrl}
                  className="w-full py-4 px-6 bg-[#4A5D45] hover:bg-[#3E4D39] text-white font-bold text-base rounded-full transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Kirim Voice Note ke Admin</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </>
      )}

      {/* VIEW 2: Riwayat Pengiriman Saya */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-8 shadow-xs space-y-6 text-[#3D3D3D]">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-[#8BA888]" />
              <h3 className="font-serif font-bold text-lg text-[#4A5D45]">Riwayat Pengiriman Voice Note Saya</h3>
            </div>
            <span className="text-xs text-[#8C8679] font-medium">
              {myHistory.length} Dikirim di perangkat ini
            </span>
          </div>

          {myHistory.length === 0 ? (
            <div className="text-center py-12 text-[#8C8679] space-y-3">
              <Volume2 className="w-12 h-12 mx-auto text-[#A39E93]" />
              <p className="text-sm">Belum ada riwayat pengiriman voice note dari perangkat ini.</p>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="text-xs text-[#4A5D45] underline hover:text-[#3E4D39] font-semibold pt-2"
              >
                Klik di sini untuk mengirim voice note pertama Anda
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl p-5 space-y-3 hover:border-[#8BA888] transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2D9] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#4A5D45]">{item.namaLengkap}</span>
                      <span className="bg-[#F1EFE7] text-[#4A3728] border border-[#E5E2D9] text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                        {item.kelas}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {item.status === 'read' || item.status === 'replied' ? (
                        <span className="bg-[#8BA888]/20 text-[#4A5D45] border border-[#8BA888]/30 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8BA888]" />
                          <span>Sudah Didengar Admin</span>
                        </span>
                      ) : (
                        <span className="bg-[#D48C70]/15 text-[#D48C70] border border-[#D48C70]/30 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-[#D48C70]" />
                          <span>Menunggu Didengar</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detail Info & Player */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#8C8679]">
                    <div>
                      <p>Waktu Kirim: {new Date(item.createdAt).toLocaleString('id-ID')}</p>
                    </div>

                    <div>
                      <audio controls src={item.audioUrl} className="w-full h-8" />
                    </div>
                  </div>

                  {/* Admin Feedback / Catatan jika ada */}
                  {item.catatanAdmin && (
                    <div className="bg-[#F1EFE7] border border-[#E5E2D9] rounded-2xl p-4 text-xs text-[#4A3728] space-y-1">
                      <div className="flex items-center space-x-1.5 font-semibold text-[#4A5D45]">
                        <MessageSquare className="w-3.5 h-3.5 text-[#8BA888]" />
                        <span>Catatan / Tanggapan dari Admin:</span>
                      </div>
                      <p className="pl-5 text-[#3D3D3D] leading-relaxed">{item.catatanAdmin}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

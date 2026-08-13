import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VoiceNoteItem, VoiceNoteStatus } from '../types';
import { formatTime } from '../utils/audioUtils';
import { 
  getStoredVoiceNotes, 
  saveVoiceNotes, 
  resetToDefaultData, 
  getAdminPassword, 
  setAdminPassword 
} from '../utils/storage';
import {
  subscribeToVoiceNotes,
  updateVoiceNoteInFirestore,
  deleteVoiceNoteFromFirestore,
  bulkDeleteVoiceNotesInFirestore,
  bulkUpdateStatusInFirestore
} from '../firebase';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Star, 
  FileSpreadsheet, 
  RefreshCcw, 
  Key, 
  X, 
  Sparkles, 
  Users, 
  GraduationCap, 
  Mic, 
  SlidersHorizontal,
  CheckCheck,
  Plus
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [items, setItems] = useState<VoiceNoteItem[]>(getStoredVoiceNotes);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest' | 'starred'>('newest');

  // Currently Active Playing Audio
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioVolume, setAudioVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Admin Response Modal State
  const [editingNoteItem, setEditingNoteItem] = useState<VoiceNoteItem | null>(null);
  const [noteText, setNoteText] = useState('');

  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Password Change Modal
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');

  // Selected Checkboxes for Bulk Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubscribe = subscribeToVoiceNotes((firestoreNotes) => {
      if (firestoreNotes && firestoreNotes.length > 0) {
        setItems(firestoreNotes);
        saveVoiceNotes(firestoreNotes);
      }
    });

    return () => unsubscribe();
  }, []);

  // Unique list of classes currently present in data for filter dropdown
  const availableClasses = useMemo(() => {
    const classSet = new Set(items.map((i) => i.kelas).filter(Boolean));
    return Array.from(classSet).sort();
  }, [items]);

  // Update Storage whenever items state changes
  const updateItems = (newItems: VoiceNoteItem[]) => {
    setItems(newItems);
    saveVoiceNotes(newItems);
  };

  // Filtered & Sorted Voice Notes
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch = 
          item.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.catatanAdmin && item.catatanAdmin.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesKelas = selectedKelas === 'all' || item.kelas === selectedKelas;
        
        let matchesStatus = true;
        if (selectedStatus === 'unread') matchesStatus = item.status === 'unread';
        if (selectedStatus === 'read') matchesStatus = item.status === 'read' || item.status === 'replied';
        if (selectedStatus === 'hasNote') matchesStatus = Boolean(item.catatanAdmin);

        return matchesSearch && matchesKelas && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'longest') return b.duration - a.duration;
        if (sortBy === 'starred') return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
        return 0;
      });
  }, [items, searchTerm, selectedKelas, selectedStatus, sortBy]);

  // Analytics Stats Calculation
  const stats = useMemo(() => {
    const totalNotes = items.length;
    const uniqueStudents = new Set(items.map((i) => i.namaLengkap.toLowerCase())).size;
    const uniqueClasses = new Set(items.map((i) => i.kelas)).size;
    const unreadCount = items.filter((i) => i.status === 'unread').length;
    const totalDurationSeconds = items.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    return { totalNotes, uniqueStudents, uniqueClasses, unreadCount, totalDurationSeconds };
  }, [items]);

  // Audio Playback Controls
  const handlePlayAudio = (item: VoiceNoteItem) => {
    if (playingId === item.id) {
      if (audioRef.current?.paused) {
        audioRef.current.play();
      } else {
        audioRef.current?.pause();
      }
    } else {
      setPlayingId(item.id);
      setCurrentTime(0);
      
      // Auto mark as read when played
      if (item.status === 'unread') {
        const updated = items.map((i) => (i.id === item.id ? { ...i, status: 'read' as VoiceNoteStatus } : i));
        updateItems(updated);
        updateVoiceNoteInFirestore(item.id, { status: 'read' }).catch(() => {});
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setPlayingId(null);
    setCurrentTime(0);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Toggle Star / Bookmark
  const toggleStar = (id: string) => {
    const currentItem = items.find((i) => i.id === id);
    const newStarred = !currentItem?.starred;
    const updated = items.map((item) =>
      item.id === id ? { ...item, starred: newStarred } : item
    );
    updateItems(updated);
    updateVoiceNoteInFirestore(id, { starred: newStarred }).catch(() => {});
  };

  // Toggle Read / Unread
  const toggleReadStatus = (id: string) => {
    const currentItem = items.find((i) => i.id === id);
    const nextStatus: VoiceNoteStatus = currentItem?.status === 'unread' ? 'read' : 'unread';
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, status: nextStatus };
      }
      return item;
    });
    updateItems(updated);
    updateVoiceNoteInFirestore(id, { status: nextStatus }).catch(() => {});
  };

  // Save Admin Note / Response
  const handleSaveNote = () => {
    if (!editingNoteItem) return;
    const trimmed = noteText.trim();
    const updated = items.map((item) =>
      item.id === editingNoteItem.id
        ? { ...item, catatanAdmin: trimmed, status: 'replied' as VoiceNoteStatus }
        : item
    );
    updateItems(updated);
    updateVoiceNoteInFirestore(editingNoteItem.id, { catatanAdmin: trimmed, status: 'replied' }).catch(() => {});
    setEditingNoteItem(null);
    setNoteText('');
  };

  // Delete Item
  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    if (playingId === deletingId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    const targetId = deletingId;
    const updated = items.filter((item) => item.id !== targetId);
    updateItems(updated);
    deleteVoiceNoteFromFirestore(targetId).catch(() => {});
    setDeletingId(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'Kelas', 'Durasi (Detik)', 'Tanggal Kirim', 'Status', 'Catatan Admin'];
    const rows = filteredItems.map((item) => [
      item.id,
      `"${item.namaLengkap}"`,
      `"${item.kelas}"`,
      item.duration,
      `"${new Date(item.createdAt).toLocaleString('id-ID')}"`,
      item.status,
      `"${item.catatanAdmin || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VoiceNote_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkRead = () => {
    const idsToUpdate = [...selectedIds];
    const updated = items.map((i) =>
      idsToUpdate.includes(i.id) ? { ...i, status: 'read' as VoiceNoteStatus } : i
    );
    updateItems(updated);
    bulkUpdateStatusInFirestore(idsToUpdate, 'read').catch(() => {});
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Yakin ingin menghapus ${selectedIds.length} voice note yang dipilih?`)) {
      const idsToDelete = [...selectedIds];
      const updated = items.filter((i) => !idsToDelete.includes(i.id));
      updateItems(updated);
      bulkDeleteVoiceNotesInFirestore(idsToDelete).catch(() => {});
      setSelectedIds([]);
    }
  };

  // Change Password Handle
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak cocok.');
      return;
    }
    if (newPassword.length < 4) {
      alert('Password minimal 4 karakter.');
      return;
    }
    setAdminPassword(newPassword);
    setPassChangeSuccess('Password admin berhasil diperbarui!');
    setTimeout(() => {
      setShowPassModal(false);
      setPassChangeSuccess('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan data ke sampel awal?')) {
      const reseted = resetToDefaultData();
      setItems(reseted);
      setSelectedIds([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#3D3D3D]">
      
      {/* Global Hidden Audio Element */}
      {playingId && (
        <audio
          ref={audioRef}
          src={items.find((i) => i.id === playingId)?.audioUrl}
          autoPlay
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Admin Welcome & Header Bar */}
      <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-[#F1EFE7] border border-[#E5E2D9] text-[#4A5D45] text-xs px-3.5 py-1.5 rounded-full font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#8BA888]" />
            <span>Administrator Dashboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#4A5D45]">
            Pusat Pengelolaan Voice Note Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-[#8C8679] max-w-xl">
            Dengar, kelola, berikan catatan tanggapan, serta unduh rekapitulasi laporan suara siswa secara realtime.
          </p>
        </div>

        {/* Quick Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] border border-[#E5E2D9] text-xs font-semibold rounded-full transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#8BA888]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowPassModal(true)}
            className="px-4 py-2 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] border border-[#E5E2D9] text-xs font-semibold rounded-full transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#D48C70]" />
            <span>Ubah Password</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] border border-[#E5E2D9] text-xs font-semibold rounded-full transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Reset ke data sampel awal"
          >
            <RefreshCcw className="w-4 h-4 text-[#4A5D45]" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Notes */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F1EFE7] border border-[#E5E2D9] flex items-center justify-center text-[#4A5D45] flex-shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8C8679] font-medium">Total Pesan Suara</p>
            <h4 className="text-2xl font-bold text-[#4A5D45]">{stats.totalNotes}</h4>
          </div>
        </div>

        {/* Card 2: Unread */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D48C70]/15 border border-[#D48C70]/30 flex items-center justify-center text-[#D48C70] flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8C8679] font-medium">Belum Didengar</p>
            <h4 className="text-2xl font-bold text-[#D48C70]">{stats.unreadCount}</h4>
          </div>
        </div>

        {/* Card 3: Students & Classes */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8BA888]/20 border border-[#8BA888]/30 flex items-center justify-center text-[#4A5D45] flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8C8679] font-medium">Siswa & Kelas</p>
            <h4 className="text-2xl font-bold text-[#4A5D45]">{stats.uniqueStudents} <span className="text-xs text-[#8C8679] font-normal">({stats.uniqueClasses} kelas)</span></h4>
          </div>
        </div>

        {/* Card 4: Total Duration */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F1EFE7] border border-[#E5E2D9] flex items-center justify-center text-[#4A3728] flex-shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8C8679] font-medium">Total Durasi Suara</p>
            <h4 className="text-2xl font-bold text-[#4A3728]">{formatTime(stats.totalDurationSeconds)}</h4>
          </div>
        </div>

      </div>

      {/* Filter, Search & Sorting Controls Panel */}
      <div className="bg-white border border-[#E5E2D9] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8679]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama siswa, kelas, atau isi catatan..."
              className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 focus:border-[#8BA888] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C8679] hover:text-[#3D3D3D]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter Kelas */}
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 cursor-pointer"
            >
              <option value="all">Semua Kelas</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="unread">Belum Didengar</option>
              <option value="read">Sudah Didengar</option>
              <option value="hasNote">Memiliki Catatan</option>
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F9F8F4] border border-[#E5E2D9] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 cursor-pointer font-medium"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="longest">Durasi Terpanjang</option>
              <option value="starred">Favorit (Bintang)</option>
            </select>

          </div>

        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#F1EFE7] border border-[#E5E2D9] rounded-xl p-2.5 px-4 flex items-center justify-between text-xs animate-fade-in">
            <span className="font-semibold text-[#4A5D45]">
              {selectedIds.length} Voice Note Terpilih
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkMarkRead}
                className="px-3 py-1 bg-[#8BA888] hover:bg-[#4A5D45] text-white rounded-lg font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Sudah Didengar</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-[#D48C70] hover:bg-[#b87358] text-white rounded-lg font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Notes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#8C8679] font-medium px-1">
          <span>Menampilkan {filteredItems.length} dari {items.length} Pesan Suara</span>
          {filteredItems.length > 0 && (
            <label className="flex items-center space-x-2 cursor-pointer hover:text-[#3D3D3D]">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
                className="accent-[#8BA888] rounded cursor-pointer"
              />
              <span>Pilih Semua yang Tampil</span>
            </label>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white border border-[#E5E2D9] rounded-[32px] p-12 text-center text-[#8C8679] space-y-3">
            <Mic className="w-12 h-12 mx-auto text-[#A39E93]" />
            <h4 className="text-base font-serif font-bold text-[#4A5D45]">Tidak ada pesan suara yang sesuai</h4>
            <p className="text-xs text-[#8C8679] max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau reset filter kelas dan status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const isPlaying = playingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-6 shadow-xs transition-all ${
                    item.status === 'unread'
                      ? 'border-[#D48C70]/60 bg-[#FAF9F6]'
                      : 'border-[#E5E2D9] hover:border-[#8BA888]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left Checkbox & Student Identity */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="mt-1 accent-[#8BA888] rounded cursor-pointer"
                      />

                      <button
                        onClick={() => toggleStar(item.id)}
                        className={`mt-0.5 p-0.5 rounded transition-colors ${
                          item.starred ? 'text-[#D48C70] fill-[#D48C70]' : 'text-[#A39E93] hover:text-[#3D3D3D]'
                        }`}
                        title={item.starred ? 'Hapus Bintang' : 'Beri Bintang'}
                      >
                        <Star className={`w-4 h-4 ${item.starred ? 'fill-current' : ''}`} />
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-base text-[#4A5D45]">{item.namaLengkap}</h3>
                          <span className="bg-[#F1EFE7] text-[#4A3728] border border-[#E5E2D9] text-xs px-2.5 py-0.5 rounded-full font-semibold">
                            {item.kelas}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#8C8679]">
                          <span>{new Date(item.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Badges & Audio Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* Status Badge */}
                      <button
                        onClick={() => toggleReadStatus(item.id)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          item.status === 'unread'
                            ? 'bg-[#D48C70]/15 text-[#D48C70] border border-[#D48C70]/30 hover:bg-[#D48C70]/25'
                            : 'bg-[#8BA888]/20 text-[#4A5D45] border border-[#8BA888]/30 hover:bg-[#8BA888]/35'
                        }`}
                        title="Klik untuk ubah status read/unread"
                      >
                        {item.status === 'unread' ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-[#D48C70]" />
                            <span>Belum Didengar</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#8BA888]" />
                            <span>Sudah Didengar</span>
                          </>
                        )}
                      </button>

                      {/* Add/Edit Catatan Admin */}
                      <button
                        onClick={() => {
                          setEditingNoteItem(item);
                          setNoteText(item.catatanAdmin || '');
                        }}
                        className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                          item.catatanAdmin
                            ? 'bg-[#F1EFE7] border-[#E5E2D9] text-[#4A3728] hover:bg-[#E5E2D9]'
                            : 'bg-[#F9F8F4] border-[#E5E2D9] text-[#7A7466] hover:bg-[#F1EFE7]'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.catatanAdmin ? 'Edit Catatan' : '+ Catatan'}</span>
                      </button>

                      {/* Download Audio */}
                      <a
                        href={item.audioUrl}
                        download={`VoiceNote_${item.namaLengkap}_${item.kelas}.wav`}
                        className="p-2 bg-[#F9F8F4] hover:bg-[#F1EFE7] text-[#4A3728] border border-[#E5E2D9] rounded-xl transition-colors"
                        title="Download File Audio"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      {/* Delete Item */}
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-2 bg-[#D48C70]/15 hover:bg-[#D48C70]/25 text-[#D48C70] border border-[#D48C70]/30 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Voice Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>

                  {/* Audio Player Strip */}
                  <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center gap-3 bg-[#F9F8F4] border border-[#E5E2D9] p-3 rounded-2xl">
                    <button
                      onClick={() => handlePlayAudio(item)}
                      className="w-10 h-10 rounded-full bg-[#8BA888] hover:bg-[#4A5D45] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs flex-shrink-0 cursor-pointer"
                    >
                      {isPlaying && !audioRef.current?.paused ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 w-full space-y-1">
                      {/* Audio Progress Slider */}
                      <input
                        type="range"
                        min={0}
                        max={isPlaying && duration ? duration : item.duration}
                        value={isPlaying ? currentTime : 0}
                        onChange={(e) => {
                          if (isPlaying && audioRef.current) {
                            const val = parseFloat(e.target.value);
                            audioRef.current.currentTime = val;
                            setCurrentTime(val);
                          }
                        }}
                        className="w-full accent-[#8BA888] h-1.5 bg-[#E5E2D9] rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-[#8C8679] font-mono">
                        <span>{isPlaying ? formatTime(currentTime) : '00:00'}</span>
                        <span>{formatTime(item.duration)}</span>
                      </div>
                    </div>

                    {/* Speed Toggle & Mute */}
                    {isPlaying && (
                      <div className="flex items-center space-x-2 text-xs">
                        <button
                          onClick={toggleSpeed}
                          className="px-2.5 py-1 bg-[#F1EFE7] hover:bg-[#E5E2D9] border border-[#E5E2D9] text-[#4A3728] font-mono rounded-lg font-semibold cursor-pointer"
                          title="Ubah Kecepatan Putar"
                        >
                          {playbackSpeed}x
                        </button>
                        <button
                          onClick={toggleMute}
                          className="p-1.5 text-[#8C8679] hover:text-[#3D3D3D] cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-[#D48C70]" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Display Catatan Admin jika ada */}
                  {item.catatanAdmin && (
                    <div className="mt-3 bg-[#F1EFE7] border border-[#E5E2D9] rounded-xl p-3 text-xs text-[#4A3728] flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-[#8BA888] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#4A5D45]">Catatan Admin: </span>
                        <span className="text-[#3D3D3D]">{item.catatanAdmin}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Admin Note / Tanggapan Modal */}
      {editingNoteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3D3D]/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E2D9] rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h3 className="text-base font-serif font-bold text-[#4A5D45] flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#8BA888]" />
                <span>Tambah / Edit Catatan Admin</span>
              </h3>
              <button
                onClick={() => setEditingNoteItem(null)}
                className="text-[#8C8679] hover:text-[#3D3D3D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#8C8679] bg-[#F9F8F4] p-3 rounded-2xl border border-[#E5E2D9]">
              <p>Siswa: <strong className="text-[#3D3D3D]">{editingNoteItem.namaLengkap}</strong> ({editingNoteItem.kelas})</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7A7466] mb-1.5">
                Tanggapan / Catatan Khusus untuk Voice Note Ini:
              </label>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Tuliskan umpan balik, instruksi lanjutan, atau catatan internal..."
                className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl p-3.5 text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNoteItem(null)}
                className="px-4 py-2 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] rounded-full text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-5 py-2 bg-[#4A5D45] hover:bg-[#3E4D39] text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Single Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3D3D]/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E2D9] rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#D48C70]/15 text-[#D48C70] border border-[#D48C70]/30 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#4A5D45]">Konfirmasi Hapus Voice Note</h3>
              <p className="text-xs text-[#8C8679] mt-1">
                Apakah Anda yakin ingin menghapus data voice note ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] rounded-full text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-[#D48C70] hover:bg-[#b87358] text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Change Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D3D3D]/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E2D9] rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
              <h3 className="text-base font-serif font-bold text-[#4A5D45] flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#D48C70]" />
                <span>Ubah Password Admin</span>
              </h3>
              <button
                onClick={() => setShowPassModal(false)}
                className="text-[#8C8679] hover:text-[#3D3D3D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passChangeSuccess && (
              <div className="bg-[#8BA888]/15 border border-[#8BA888]/30 text-[#4A5D45] p-3 rounded-2xl text-xs flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#8BA888]" />
                <span>{passChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7A7466] mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min 4 karakter)..."
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl px-3.5 py-2.5 text-sm text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7A7466] mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru..."
                  className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl px-3.5 py-2.5 text-sm text-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-4 py-2 bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] rounded-full text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A5D45] hover:bg-[#3E4D39] text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import { VoiceNoteItem } from '../types';
import { generateSampleAudioDataUrl } from '../utils/audioUtils';

export const INITIAL_CLASSES = [
  'X IPA 1',
  'X IPA 2',
  'X IPS 1',
  'X IPS 2',
  'XI MIPA 1',
  'XI MIPA 2',
  'XI IPS 1',
  'XII MIPA 1',
  'XII MIPA 2',
  'XII IPS 1',
];

export const MOCK_VOICE_NOTES: VoiceNoteItem[] = [
  {
    id: 'vn-101',
    namaLengkap: 'Ahmad Rizky Pratama',
    kelas: 'XII MIPA 1',
    audioUrl: generateSampleAudioDataUrl(8, 380),
    duration: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 min ago
    status: 'unread',
    starred: true,
  },
  {
    id: 'vn-102',
    namaLengkap: 'Siti Nur Aini',
    kelas: 'XI MIPA 2',
    audioUrl: generateSampleAudioDataUrl(14, 480),
    duration: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    status: 'unread',
    starred: false,
  },
  {
    id: 'vn-103',
    namaLengkap: 'Budi Santoso',
    kelas: 'X IPA 1',
    audioUrl: generateSampleAudioDataUrl(11, 320),
    duration: 11,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    status: 'read',
    catatanAdmin: 'Sudah dijawab via pesan guru wali kelas.',
    starred: true,
  },
  {
    id: 'vn-104',
    namaLengkap: 'Dewa Bagus Mahendra',
    kelas: 'XI IPS 1',
    audioUrl: generateSampleAudioDataUrl(6, 420),
    duration: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // yesterday
    status: 'replied',
    catatanAdmin: 'Usulan perbaikan fasilitas lapangan olahraga telah dicatat.',
    starred: false,
  },
  {
    id: 'vn-105',
    namaLengkap: 'Fitri Handayani',
    kelas: 'X IPS 2',
    audioUrl: generateSampleAudioDataUrl(18, 520),
    duration: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: 'read',
    starred: false,
  },
];

export type UserRole = 'guest' | 'pengguna' | 'admin';

export type VoiceNoteStatus = 'unread' | 'read' | 'replied';

export interface VoiceNoteItem {
  id: string;
  namaLengkap: string;
  kelas: string;
  kategori?: string;
  audioUrl: string; // Data URL or Blob URL
  duration: number; // in seconds
  createdAt: string; // ISO string
  status: VoiceNoteStatus;
  catatanAdmin?: string;
  starred?: boolean;
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

export interface ClassOption {
  id: string;
  name: string;
}

export interface StatSummary {
  totalNotes: number;
  totalStudents: number;
  unreadNotes: number;
  totalDurationSeconds: number;
}

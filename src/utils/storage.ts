import { VoiceNoteItem } from '../types';
import { MOCK_VOICE_NOTES } from '../data/mockData';

const STORAGE_KEY = 'portal_voice_notes_v1';
const MY_HISTORY_KEY = 'portal_my_submission_ids_v1';
const ADMIN_PASS_KEY = 'portal_admin_pass_v1';

export function getStoredVoiceNotes(): VoiceNoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VOICE_NOTES));
      return MOCK_VOICE_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_VOICE_NOTES;
  } catch (e) {
    console.error('Failed to parse voice notes from storage', e);
    return MOCK_VOICE_NOTES;
  }
}

export function saveVoiceNotes(items: VoiceNoteItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save voice notes to storage', e);
  }
}

export function saveNewVoiceNote(item: VoiceNoteItem): VoiceNoteItem[] {
  const current = getStoredVoiceNotes();
  const updated = [item, ...current];
  saveVoiceNotes(updated);
  
  // Also track student's own submission IDs on this device
  saveMySubmissionId(item.id);
  return updated;
}

export function getMySubmissionIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMySubmissionId(id: string): void {
  const ids = getMySubmissionIds();
  if (!ids.includes(id)) {
    localStorage.setItem(MY_HISTORY_KEY, JSON.stringify([id, ...ids]));
  }
}

export function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_PASS_KEY) || 'admin123';
}

export function setAdminPassword(newPass: string): void {
  localStorage.setItem(ADMIN_PASS_KEY, newPass);
}

export function resetToDefaultData(): VoiceNoteItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_VOICE_NOTES));
  return MOCK_VOICE_NOTES;
}

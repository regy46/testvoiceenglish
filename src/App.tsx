import React, { useState } from 'react';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { RoleSelector } from './components/RoleSelector';
import { PenggunaPage } from './components/PenggunaPage';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { getAdminPassword } from './utils/storage';

export default function App() {
  const [role, setRole] = useState<UserRole>('guest');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSelectRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setIsLoginModalOpen(true);
    } else {
      setRole(newRole);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setRole('admin');
  };

  const handleLogout = () => {
    setRole('guest');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3D3D3D] flex flex-col font-sans selection:bg-[#8BA888] selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        role={role}
        onSelectRole={handleSelectRole}
        onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {role === 'guest' && (
          <RoleSelector
            onSelectPengguna={() => setRole('pengguna')}
            onOpenAdminLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {role === 'pengguna' && (
          <PenggunaPage />
        )}

        {role === 'admin' && (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2D9] bg-white py-6 text-center text-xs text-[#8C8679]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VoiceTestEnglish. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleSelectRole('pengguna')}
              className="hover:text-[#4A5D45] transition-colors"
            >
              Mode Pengguna
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-[#4A5D45] transition-colors"
            >
              Login Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Login Admin Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        getStoredPassword={getAdminPassword}
      />

    </div>
  );
}

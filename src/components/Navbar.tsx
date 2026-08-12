import React from 'react';
import { UserRole } from '../types';
import { Mic, ShieldCheck, User, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  role: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  onSelectRole,
  onOpenAdminLogin,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-[#E5E2D9] text-[#3D3D3D] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => onSelectRole('guest')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8BA888] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-xl text-[#4A5D45] tracking-tight leading-none">
                VoiceTest<span className="text-[#8BA888]">English</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Current Role Badge & Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {role === 'guest' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectRole('pengguna')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-[#4A5D45] hover:bg-[#3E4D39] text-white transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Masuk Pengguna</span>
              </button>
              <button
                onClick={onOpenAdminLogin}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-[#F1EFE7] hover:bg-[#E5E2D9] text-[#4A3728] border border-[#E5E2D9] transition-colors flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-[#8BA888]" />
                <span>Area Admin</span>
              </button>
            </div>
          )}

          {role === 'pengguna' && (
            <div className="flex items-center space-x-3">
              <div className="bg-[#F1EFE7] border border-[#E5E2D9] text-[#4A5D45] text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 font-medium">
                <div className="w-2 h-2 bg-[#8BA888] rounded-full"></div>
                <span>Sesi: Pengguna (Siswa)</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-[#8C8679] hover:text-[#4A3728] hover:bg-[#F1EFE7] rounded-xl transition-colors flex items-center text-xs space-x-1 font-medium"
                title="Ganti Peran"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          )}

          {role === 'admin' && (
            <div className="flex items-center space-x-3">
              <div className="bg-[#4A3728] text-white text-xs px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8BA888]" />
                <span className="font-semibold">Dashboard Admin</span>
              </div>
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#D48C70] bg-[#D48C70]/10 hover:bg-[#D48C70]/20 border border-[#D48C70]/30 rounded-full transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Admin</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

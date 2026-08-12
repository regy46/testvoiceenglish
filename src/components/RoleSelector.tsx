import React from 'react';
import { User, ShieldCheck, Mic, ArrowRight, CheckCircle, Sparkles, Volume2 } from 'lucide-react';

interface RoleSelectorProps {
  onSelectPengguna: () => void;
  onOpenAdminLogin: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  onSelectPengguna,
  onOpenAdminLogin,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12 text-[#3D3D3D]">
      
      {/* Hero Welcome Text */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-[#F1EFE7] border border-[#E5E2D9] text-[#4A5D45] text-xs px-4 py-1.5 rounded-full font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#8BA888]" />
          <span>Selamat Datang di VoiceTestEnglish</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-[#4A5D45] leading-tight">
          Pilih Peran Akses Anda
        </h1>
        <p className="text-sm sm:text-base text-[#8C8679] leading-relaxed">
          Silakan pilih akses di bawah ini. Pengguna dapat langsung mengirimkan voice note dengan menyertakan nama lengkap dan kelas. Admin dapat mengakses dashboard dengan akun khusus.
        </p>
      </div>

      {/* 2 Main Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* CARD 1: Pengguna (Siswa) */}
        <div 
          onClick={onSelectPengguna}
          className="bg-white border border-[#E5E2D9] hover:border-[#8BA888] rounded-[32px] p-8 sm:p-10 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#8BA888]/20 flex items-center justify-center text-[#4A5D45] group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8BA888]">Akses Langsung</span>
              <h3 className="text-2xl font-serif font-bold text-[#4A5D45] mt-1">Pengguna / Siswa</h3>
              <p className="text-xs sm:text-sm text-[#8C8679] mt-2 leading-relaxed">
                Kirim rekaman suara (voice note) tugas, hafalan, atau saran sekolah secara cepat & praktis.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-[#3D3D3D] pt-4 border-t border-[#F1EFE7]">
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#8BA888] flex-shrink-0" />
                <span>Isi Nama Lengkap & Pilih Kelas</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#8BA888] flex-shrink-0" />
                <span>Merekam Suara Langsung / Upload Audio</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#8BA888] flex-shrink-0" />
                <span>Melihat Riwayat Pengiriman & Tanggapan</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              type="button"
              className="w-full py-3.5 px-6 bg-[#8BA888] hover:bg-[#4A5D45] text-white font-semibold text-sm rounded-full shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              <span>Masuk Sebagai Pengguna</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: Admin */}
        <div 
          onClick={onOpenAdminLogin}
          className="bg-white border border-[#E5E2D9] hover:border-[#D48C70] rounded-[32px] p-8 sm:p-10 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#D48C70]/20 flex items-center justify-center text-[#D48C70] group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D48C70]">Proteksi Admin</span>
              <h3 className="text-2xl font-serif font-bold text-[#4A3728] mt-1">Administrator</h3>
              <p className="text-xs sm:text-sm text-[#8C8679] mt-2 leading-relaxed">
                Kelola, dengar seluruh pesan suara, berikan masukan, dan ekspor rekap siswa.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-[#3D3D3D] pt-4 border-t border-[#F1EFE7]">
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#D48C70] flex-shrink-0" />
                <span>Login Username & Password Khusus</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#D48C70] flex-shrink-0" />
                <span>Pencarian, Filter Kelas & Status Baca</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-[#D48C70] flex-shrink-0" />
                <span>Pemutar Audio Waveform & Catatan Balasan</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <button
              type="button"
              className="w-full py-3.5 px-6 bg-[#4A3728] hover:bg-[#322419] text-white font-semibold text-sm rounded-full shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              <span>Masuk Sebagai Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D48C70]" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

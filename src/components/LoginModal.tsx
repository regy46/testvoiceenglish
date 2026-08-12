import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  getStoredPassword: () => string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  getStoredPassword,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const validPass = getStoredPassword();
      if (username.trim() === 'admin' && password === validPass) {
        setIsLoading(false);
        setUsername('');
        setPassword('');
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau password admin salah. Silakan coba lagi.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E5E2D9] rounded-[32px] w-full max-w-md p-8 shadow-2xl relative text-[#3D3D3D]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8C8679] hover:text-[#4A3728] p-1.5 rounded-full hover:bg-[#F1EFE7] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#D48C70]/20 flex items-center justify-center text-[#D48C70] mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#4A3728]">Login Admin</h3>
          <p className="text-xs text-[#8C8679] mt-1">
            Masukkan kredensial khusus administrator untuk mengakses dashboard voice note.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 bg-[#D48C70]/10 border border-[#D48C70]/30 text-[#D48C70] p-3 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7A7466] mb-1.5">
              Username Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8679]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin..."
                className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 focus:border-[#8BA888] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A7466] mb-1.5">
              Password Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C8679]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full bg-[#F9F8F4] border border-[#E5E2D9] rounded-2xl pl-10 pr-10 py-3 text-sm text-[#3D3D3D] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#8BA888]/40 focus:border-[#8BA888] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C8679] hover:text-[#4A3728]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#4A3728] hover:bg-[#322419] text-white font-semibold text-sm rounded-full transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#8BA888]" />
                  <span>Masuk Dashboard Admin</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#8C8679] hover:text-[#4A3728] transition-colors"
          >
            Batal dan kembali ke halaman depan
          </button>
        </div>

      </div>
    </div>
  );
};

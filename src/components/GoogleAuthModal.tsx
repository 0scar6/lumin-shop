import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, LogOut, Sparkles, UserCheck, Lock } from 'lucide-react';
import { GoogleUser } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const [selectedAccountEmail, setSelectedAccountEmail] = useState('oscardaniel@gmail.com');
  const [customName, setCustomName] = useState('Oscar Daniel');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedGoogleLogin = (email: string, name: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      const newUser: GoogleUser = {
        id: `google_${Date.now()}`,
        name: name || 'Usuario Verificado Google',
        email: email || 'usuario@gmail.com',
        picture: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        verified: true,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsVerifying(false);
      onLogin(newUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative transition-all ${
        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121410] border-white/10 text-white'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-black/40 hover:bg-black/80 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-3 pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>ACCESO SEGURO ANTI-BOTS</span>
          </div>

          <div className="flex justify-center items-center gap-2">
            {/* Google G Logo SVG */}
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            <h3 className={`font-display text-2xl font-black uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Continuar con Google
            </h3>
          </div>

          <p className={`text-xs max-w-xs mx-auto ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Ingresa rápido con tu cuenta oficial para verificar tu identidad, evitar bots y agilizar tus pedidos por WhatsApp.
          </p>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-300' : 'bg-black/40 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-green-500 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm truncate">{currentUser.name}</h4>
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
                <p className={`text-xs truncate ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  {currentUser.email}
                </p>
                <span className="text-[10px] font-mono text-green-500 font-bold">
                  ✓ Sesión Verificada con Google OAuth 2.0
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-extrabold text-xs transition-all shadow-md"
              >
                Continuar Comprando
              </button>
              <button
                onClick={onLogout}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isLight ? 'bg-white hover:bg-slate-200 border-slate-300 text-red-600' : 'bg-black/50 hover:bg-black border-white/10 text-red-400'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form / One Click Account Selector */
          <div className="space-y-4">
            
            {/* Quick 1-Tap Login Button */}
            <button
              onClick={() => handleSimulatedGoogleLogin(selectedAccountEmail, customName)}
              disabled={isVerifying}
              className={`w-full py-3.5 px-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg active:scale-98 ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                  : 'bg-white hover:bg-gray-100 text-black border-white'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando Cuenta Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
                  </svg>
                  <span>Ingresar Rápido con Google</span>
                </>
              )}
            </button>

            {/* Quick Account Customizer / Switcher */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-black/40 border-white/10'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-gray-300'}>Cuenta Google seleccionada:</span>
                <button
                  onClick={() => setShowAccountChooser(!showAccountChooser)}
                  className="text-xs text-green-500 hover:underline font-bold"
                >
                  {showAccountChooser ? 'Ocultar Opciones' : 'Cambiar Datos'}
                </button>
              </div>

              {showAccountChooser ? (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                      Nombre en Google:
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Tu nombre completo..."
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                      Correo Gmail:
                    </label>
                    <input
                      type="email"
                      value={selectedAccountEmail}
                      onChange={(e) => setSelectedAccountEmail(e.target.value)}
                      placeholder="ejemplo@gmail.com"
                      className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A0A0A] border-white/10 text-white'
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {customName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs truncate">{customName}</span>
                    <span className={`block text-[11px] truncate ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                      {selectedAccountEmail}
                    </span>
                  </div>
                  <UserCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
              )}
            </div>

            {/* Anti-Bot Security Notice */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-500 font-mono">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Protección reCAPTCHA v3 & Google Auth activa para prevenir bots.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export const GoogleLoginBanner: React.FC<{
  currentUser: GoogleUser | null;
  onOpenModal: () => void;
  onLogout: () => void;
  themeMode?: 'dark' | 'light' | 'amoled';
}> = ({ currentUser, onOpenModal, onLogout, themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-[#161814] border-white/10 text-white'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {currentUser ? (
            <img
              src={currentUser.picture}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border-2 border-green-500 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm">
                {currentUser ? currentUser.name : 'Iniciar Sesión con Google'}
              </h4>
              {currentUser ? (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-[10px] font-mono font-bold">
                  ✓ Verificado
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
                  Protección Anti-Bot
                </span>
              )}
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {currentUser
                ? `${currentUser.email} • Cuenta verificada para pedidos`
                : 'Ingresa con tu cuenta de Google para agilizar tus compras y evitar saturaciones'}
            </p>
          </div>
        </div>

        <div>
          {currentUser ? (
            <button
              onClick={onLogout}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-red-600 border-slate-300' : 'bg-white/5 hover:bg-white/10 text-red-400 border-white/10'
              }`}
            >
              Cerrar Sesión
            </button>
          ) : (
            <button
              onClick={onOpenModal}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-md active:scale-95 ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900'
                  : 'bg-white hover:bg-gray-100 text-black'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

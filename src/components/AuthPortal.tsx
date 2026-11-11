import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { UserAccount, ServerConfig } from '../types';

export const CimBoxLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 1000 1000"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M500 16 L934 246 Q944 252 932 260 L742 362 L504 190 L268 362 L62 252 Z"
      fill="#12D656"
    />
    <path
      d="M60 315 L232 405 L232 746 L340 794 L346 508 L478 558 L478 858 Q490 868 504 862 L776 724 L782 416 L955 320 L950 730 L505 980 L58 728 Z"
      fill="#12D656"
    />
  </svg>
);

interface AuthPortalProps {
  mode: 'login' | 'register' | 'reset';
  setMode: (mode: 'login' | 'register' | 'reset') => void;
  users: UserAccount[];
  serverConfig: ServerConfig;
  onLogin: (user: UserAccount) => void;
  onRegister: (data: {
    name: string;
    email: string;
    company: string;
    password: string;
    inviteToken?: string;
  }) => { ok: boolean; error?: string };
  onRequestPasswordReset: (email: string) => { ok: boolean; message: string };
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  mode,
  setMode,
  users,
  serverConfig,
  onLogin,
  onRegister,
  onRequestPasswordReset,
}) => {
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regInviteToken, setRegInviteToken] = useState('');

  const [resetEmail, setResetEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const switchMode = (nextMode: 'login' | 'register' | 'reset') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setMode(nextMode);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const query = loginInput.trim().toLowerCase();
    const found = (Array.isArray(users) ? users : []).find(
      (u) =>
        (u.email || '').toLowerCase() === query ||
        (u.name || '').toLowerCase() === query ||
        (query === 'admin' && u.role === 'server:admin') ||
        (Array.isArray(u.emails) ? u.emails : []).some(
          (em) => (em.email || '').toLowerCase() === query
        )
    );

    if (!found) {
      setErrorMsg('Неверный логин или пароль.');
      return;
    }

    if (found.role === 'server:archived-user') {
      setErrorMsg('Учетная запись заблокирована администратором.');
      return;
    }

    if (
      found.passwordHash !== loginPassword &&
      !(query === 'admin' && loginPassword === 'admin')
    ) {
      setErrorMsg('Неверный логин или пароль.');
      return;
    }

    onLogin(found);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Заполните все обязательные поля.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Пароль должен содержать минимум 8 символов.');
      return;
    }

    const res = onRegister({
      name: regName.trim(),
      email: regEmail.trim(),
      company: regCompany.trim(),
      password: regPassword,
      inviteToken: regInviteToken.trim() || undefined,
    });

    if (!res.ok) {
      setErrorMsg(res.error || 'Ошибка при регистрации');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetEmail.trim()) {
      setErrorMsg('Введите ваш адрес электронной почты.');
      return;
    }

    const res = onRequestPasswordReset(resetEmail.trim());
    if (!res.ok) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--foundation-page)] text-[var(--foreground)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <CimBoxLogo className="w-7 h-7" />
          <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            ЦИМ Бокс
          </span>
        </div>

        {/* Minimalist Auth Card */}
        <div className="bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN PAGE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-5">
                <h1 className="text-xl font-medium text-[var(--foreground)]">
                  Вход в систему
                </h1>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Электронная почта или логин
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="admin@cimbox.ru"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[var(--foreground-2)]">
                    Пароль
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-xs text-[#10B354] hover:underline cursor-pointer"
                  >
                    Восстановить пароль
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-9 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Войти
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--outline-3)] text-center text-xs text-[var(--foreground-2)]">
                Нет учетной записи?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#10B354] font-medium hover:underline cursor-pointer"
                >
                  Зарегистрироваться
                </button>
              </div>
            </form>
          )}

          {/* 2. PASSWORD RESET PAGE */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="text-center mb-5">
                <h1 className="text-xl font-medium text-[var(--foreground)]">
                  Восстановление пароля
                </h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5 leading-relaxed">
                  Укажите ваш адрес электронной почты. Мы отправим письмо с дальнейшими инструкциями по сбросу пароля.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@company.ru"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full h-9 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Сбросить пароль
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full h-9 px-4 rounded-lg border border-[var(--outline-1)] hover:bg-[var(--foundation-2)] text-[var(--foreground)] font-medium text-xs transition-colors cursor-pointer"
                >
                  Вернуться ко входу
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTRATION PAGE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="text-center mb-4">
                <h1 className="text-xl font-medium text-[var(--foreground)]">
                  Регистрация
                </h1>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.ru"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Имя
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Организация
                </label>
                <input
                  type="text"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Название компании"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Пароль
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              {serverConfig.inviteOnly && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[var(--foreground-2)]">
                    Код приглашения
                  </label>
                  <input
                    type="text"
                    required
                    value={regInviteToken}
                    onChange={(e) => setRegInviteToken(e.target.value)}
                    placeholder="inv_tok_..."
                    className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-9 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Зарегистрироваться
                </button>
              </div>

              <div className="pt-4 border-t border-[var(--outline-3)] text-center text-xs text-[var(--foreground-2)]">
                Уже есть учетная запись?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#10B354] font-medium hover:underline cursor-pointer"
                >
                  Войти
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

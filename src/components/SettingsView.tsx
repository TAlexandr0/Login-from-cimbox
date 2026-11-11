import React, { useState } from 'react';
import {
  ChevronLeft,
  User,
  Server,
  Search,
  Trash2,
  Check,
  Plus,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  UserAccount,
  ServerConfig,
  SmtpConfig,
  ProjectItem,
  ServerInviteItem,
  OutboxEmailItem,
  ServerRole,
} from '../types';

export type SettingsTab =
  | 'user-profile'
  | 'user-notifications'
  | 'user-developer'
  | 'user-email'
  | 'server-general'
  | 'server-users'
  | 'server-access'
  | 'server-projects';

interface SettingsViewProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  onExitSettings: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  projects: ProjectItem[];
  invites: ServerInviteItem[];
  outbox: OutboxEmailItem[];
  serverConfig: ServerConfig;
  smtpConfig: SmtpConfig;
  onUpdateProfile: (updates: { name: string; company: string }) => void;
  onRequestPasswordReset: (email: string) => { ok: boolean; message: string };
  onVerifyEmailByCode: (email: string, code: string) => { ok: boolean; message: string };
  onRequestVerificationEmail: (email: string) => void;
  onAddUserEmail: (email: string) => { ok: boolean; message: string };
  onSetPrimaryEmail: (emailId: string) => void;
  onDeleteUserEmail: (emailId: string) => void;
  onUpdateServerConfig: (config: ServerConfig) => void;
  onUpdateSmtpConfig: (config: SmtpConfig) => void;
  onChangeUserRole: (userId: string, newRole: ServerRole) => void;
  onForceVerifyUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onSendInvite: (data: { email: string; serverRole: ServerRole; message?: string }) => void;
  onRevokeInvite: (inviteId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeTab,
  setActiveTab,
  onExitSettings,
  currentUser,
  users,
  projects,
  invites,
  outbox,
  serverConfig,
  smtpConfig,
  onUpdateProfile,
  onRequestPasswordReset,
  onVerifyEmailByCode,
  onRequestVerificationEmail,
  onAddUserEmail,
  onSetPrimaryEmail,
  onDeleteUserEmail,
  onUpdateServerConfig,
  onUpdateSmtpConfig,
  onChangeUserRole,
  onForceVerifyUser,
  onDeleteUser,
  onDeleteProject,
  onSendInvite,
  onRevokeInvite,
}) => {
  const isAdmin = currentUser.role === 'server:admin';

  // Ensure non-admin cannot view server-* tabs
  const safeTab: SettingsTab =
    !isAdmin && activeTab.startsWith('server-') ? 'user-profile' : activeTab;

  // Profile form state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileCompany, setProfileCompany] = useState(currentUser.company);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // User Email tab state
  const [newEmailInput, setNewEmailInput] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyTargetEmail, setVerifyTargetEmail] = useState(currentUser.email);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);

  // Notifications state
  const [notifyInvites, setNotifyInvites] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  // Developer tokens state
  const [tokens, setTokens] = useState([
    { id: 'tok-1', name: 'Коннектор Revit / IFC', createdAt: '12.09.2026', preview: 'cimb_9f2a...81c' },
  ]);
  const [newTokenName, setNewTokenName] = useState('');

  // Server general state
  const [srvForm, setSrvForm] = useState<ServerConfig>(serverConfig);
  const [srvSaved, setSrvSaved] = useState(false);

  // Server users search
  const [userSearch, setUserSearch] = useState('');

  // Server access / SMTP / invites state
  const [smtpForm, setSmtpForm] = useState<SmtpConfig>(smtpConfig);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ServerRole>('server:user');

  // Server projects search
  const [projectSearch, setProjectSearch] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: profileName.trim() || currentUser.name,
      company: profileCompany.trim(),
    });
    setProfileNotice('Данные профиля сохранены.');
    setTimeout(() => setProfileNotice(null), 3000);
  };

  const userNavItems: { id: SettingsTab; label: string }[] = [
    { id: 'user-profile', label: 'Профиль' },
    { id: 'user-notifications', label: 'Уведомления' },
    { id: 'user-developer', label: 'Разработка' },
    { id: 'user-email', label: 'Email' },
  ];

  const serverNavItems: { id: SettingsTab; label: string }[] = [
    { id: 'server-general', label: 'Общие' },
    { id: 'server-users', label: 'Пользователи' },
    { id: 'server-access', label: 'Доступ' },
    { id: 'server-projects', label: 'Проекты' },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.company.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-3.25rem)] bg-[var(--foundation)]">
      {/* Left Settings Sidebar (matching Image 2) */}
      <aside className="w-56 shrink-0 bg-[var(--foundation-2)] border-r border-[var(--outline-2)] p-3 flex flex-col gap-5">
        <button
          type="button"
          onClick={onExitSettings}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foundation-3)] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[var(--foreground-2)]" />
          <span>Выйти из настроек</span>
        </button>

        {/* Пользовательские настройки */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[var(--foreground-2)]">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Пользовательские нас...</span>
          </div>

          <div className="space-y-0.5">
            {userNavItems.map((item) => {
              const active = safeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left pl-6 pr-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--foundation-focus)] font-medium text-[var(--foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--foundation-3)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Настройки сервера — STRICTLY FOR ADMIN ONLY */}
        {isAdmin && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[var(--foreground-2)]">
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Настройки сервера</span>
            </div>

            <div className="space-y-0.5">
              {serverNavItems.map((item) => {
                const active = safeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left pl-6 pr-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--foundation-focus)] font-medium text-[var(--foreground)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--foundation-3)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Right Settings Content Area */}
      <div className="flex-1 py-10 px-6 sm:px-12 overflow-y-auto">
        <div className="max-w-[700px] mx-auto">
          {/* 1. USER PROFILE (Exact match to Image 2) */}
          {safeTab === 'user-profile' && (
            <div>
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">Профиль</h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Управление профилем
                </p>
              </div>

              <hr className="border-[var(--outline-3)] my-7" />

              {profileNotice && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{profileNotice}</span>
                </div>
              )}

              {/* Ваши данные */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <h2 className="text-base font-medium text-[var(--foreground)]">
                  Ваши данные
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
                  <label className="sm:col-span-5 text-xs font-medium text-[var(--foreground)]">
                    Имя
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
                  <label className="sm:col-span-5 text-xs font-medium text-[var(--foreground)]">
                    Организация
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={profileCompany}
                      onChange={(e) => setProfileCompany(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                    />
                  </div>
                </div>

                {(profileName !== currentUser.name ||
                  profileCompany !== currentUser.company) && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="h-8 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
                    >
                      Сохранить
                    </button>
                  </div>
                )}
              </form>

              <hr className="border-[var(--outline-3)] my-7" />

              {/* Фото */}
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
                <div className="sm:col-span-5 space-y-1">
                  <div className="text-xs font-medium text-[var(--foreground)]">Фото</div>
                  <p className="text-xs text-[var(--foreground-2)] leading-relaxed">
                    Загрузите изображение аватара вашего профиля или используйте инициалы
                  </p>
                </div>

                <div className="sm:col-span-7 flex justify-center sm:justify-start sm:pl-14">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-[var(--outline-2)] bg-[var(--foundation-3)] flex items-center justify-center text-2xl font-medium text-[var(--foreground)]">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentUser.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-[var(--outline-3)] my-7" />

              {/* Сброс пароля */}
              <div className="space-y-4">
                <h2 className="text-base font-medium text-[var(--foreground)]">
                  Сброс пароля
                </h2>

                <div className="rounded-xl border border-[var(--outline-2)] p-5 space-y-4">
                  <div className="text-xs text-[var(--foreground)] space-y-1 leading-relaxed">
                    <p>Нажмите кнопку ниже, для того чтобы сбросить пароль</p>
                    <p>
                      После нажатия кнопки вы получите электронное письмо с дальнейшими инструкциями
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const res = onRequestPasswordReset(currentUser.email);
                      setProfileNotice(res.message);
                    }}
                    className="h-8 px-3.5 rounded-lg border border-[var(--outline-1)] bg-[var(--foundation)] hover:bg-[var(--foundation-2)] text-xs font-medium text-[var(--foreground)] transition-colors cursor-pointer"
                  >
                    Сбросить пароль
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. USER EMAIL SETTINGS & VERIFICATION */}
          {safeTab === 'user-email' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">Email</h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Управление адресами электронной почты и подтверждение аккаунта
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              {emailFeedback && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
                  {emailFeedback}
                </div>
              )}

              {/* Emails list */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--foreground)]">
                  Ваши адреса электронной почты
                </h2>

                <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-xl">
                  {(currentUser.emails || []).map((em) => (
                    <div
                      key={em.id}
                      className="p-3.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[var(--foreground-2)]" />
                        <span className="font-medium text-[var(--foreground)]">
                          {em.email}
                        </span>
                        {em.primary && (
                          <span className="text-[11px] text-[var(--foreground-2)]">
                            (Основной)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={
                            em.verified
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {em.verified ? 'Подтвержден' : 'Не подтвержден'}
                        </span>

                        {!em.verified && (
                          <button
                            type="button"
                            onClick={() => {
                              onRequestVerificationEmail(em.email);
                              setVerifyTargetEmail(em.email);
                              setEmailFeedback(`Код подтверждения отправлен на ${em.email}`);
                            }}
                            className="text-[#10B354] hover:underline cursor-pointer"
                          >
                            Выслать код
                          </button>
                        )}

                        {em.verified && !em.primary && (
                          <button
                            type="button"
                            onClick={() => onSetPrimaryEmail(em.id)}
                            className="text-[#10B354] hover:underline cursor-pointer"
                          >
                            Сделать основным
                          </button>
                        )}

                        {!em.primary && (
                          <button
                            type="button"
                            onClick={() => onDeleteUserEmail(em.id)}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verify Email by Code */}
              {(currentUser.emails || []).some((e) => !e.verified) && (
                <div className="rounded-xl border border-[var(--outline-2)] p-4 space-y-3">
                  <div className="text-xs font-medium text-[var(--foreground)]">
                    Подтверждение Email по коду из письма
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const res = onVerifyEmailByCode(verifyTargetEmail, verifyCodeInput.trim());
                      setEmailFeedback(res.message);
                      if (res.ok) setVerifyCodeInput('');
                    }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verifyCodeInput}
                      onChange={(e) => setVerifyCodeInput(e.target.value)}
                      placeholder="6-значный код"
                      className="w-40 h-9 px-3 text-xs font-mono rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
                    >
                      Подтвердить
                    </button>
                  </form>
                </div>
              )}

              {/* Add new email */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-medium text-[var(--foreground)]">
                  Добавить дополнительный Email
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newEmailInput.trim()) return;
                    const res = onAddUserEmail(newEmailInput.trim());
                    setEmailFeedback(res.message);
                    if (res.ok) {
                      setVerifyTargetEmail(newEmailInput.trim());
                      setNewEmailInput('');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="email"
                    required
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="secondary@company.ru"
                    className="flex-1 h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                  />
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg border border-[var(--outline-1)] hover:bg-[var(--foundation-2)] text-xs font-medium text-[var(--foreground)] cursor-pointer"
                  >
                    Добавить
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. USER NOTIFICATIONS */}
          {safeTab === 'user-notifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">
                  Уведомления
                </h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Настройка почтовых уведомлений
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              <div className="space-y-4 text-xs">
                <label className="flex items-center justify-between py-2 cursor-pointer">
                  <div>
                    <div className="font-medium text-[var(--foreground)]">
                      Приглашения в проекты
                    </div>
                    <div className="text-[var(--foreground-2)]">
                      Получать письмо при приглашении в новый проект
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyInvites}
                    onChange={(e) => setNotifyInvites(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between py-2 cursor-pointer">
                  <div>
                    <div className="font-medium text-[var(--foreground)]">
                      Комментарии в моделях
                    </div>
                    <div className="text-[var(--foreground-2)]">
                      Уведомлять об упоминаниях и новых комментариях
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={(e) => setNotifyComments(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between py-2 cursor-pointer">
                  <div>
                    <div className="font-medium text-[var(--foreground)]">
                      Обновления версий моделей
                    </div>
                    <div className="text-[var(--foreground-2)]">
                      Ежедневная сводка по изменениям в проектах
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyUpdates}
                    onChange={(e) => setNotifyUpdates(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* 4. USER DEVELOPER SETTINGS */}
          {safeTab === 'user-developer' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">
                  Разработка
                </h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Персональные токены доступа для коннекторов и API
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTokenName.trim()) return;
                  setTokens((prev) => [
                    {
                      id: `tok-${Date.now()}`,
                      name: newTokenName.trim(),
                      createdAt: new Date().toLocaleDateString('ru-RU'),
                      preview: `cimb_${Math.random().toString(36).slice(2, 8)}...`,
                    },
                    ...prev,
                  ]);
                  setNewTokenName('');
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  required
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="Название токена"
                  className="flex-1 h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Создать токен</span>
                </button>
              </form>

              <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-xl text-xs">
                {tokens.map((t) => (
                  <div key={t.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[var(--foreground)]">{t.name}</div>
                      <div className="text-[var(--foreground-2)] font-mono text-[11px]">
                        {t.preview} · Создан {t.createdAt}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTokens((prev) => prev.filter((x) => x.id !== t.id))}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Отозвать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SERVER GENERAL (Admin Only) */}
          {isAdmin && safeTab === 'server-general' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">Общие</h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Основные параметры сервера ЦИМ Бокс
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              {srvSaved && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
                  Настройки сервера сохранены.
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateServerConfig(srvForm);
                  setSrvSaved(true);
                  setTimeout(() => setSrvSaved(false), 3000);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
                  <label className="sm:col-span-5 text-xs font-medium text-[var(--foreground)]">
                    Название сервера
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={srvForm.name}
                      onChange={(e) => setSrvForm({ ...srvForm, name: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
                  <label className="sm:col-span-5 text-xs font-medium text-[var(--foreground)]">
                    Организация
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={srvForm.company}
                      onChange={(e) => setSrvForm({ ...srvForm, company: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
                  <label className="sm:col-span-5 text-xs font-medium text-[var(--foreground)]">
                    Контакт администратора
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="email"
                      value={srvForm.adminContact}
                      onChange={(e) =>
                        setSrvForm({ ...srvForm, adminContact: e.target.value })
                      }
                      className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-4">
                  <label className="sm:col-span-5 text-xs font-medium text-[var(--foreground)] pt-2">
                    Описание
                  </label>
                  <div className="sm:col-span-7">
                    <textarea
                      rows={2}
                      value={srvForm.description}
                      onChange={(e) =>
                        setSrvForm({ ...srvForm, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <hr className="border-[var(--outline-3)] my-4" />

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Регистрация только по приглашениям</span>
                    <input
                      type="checkbox"
                      checked={srvForm.inviteOnly}
                      onChange={(e) =>
                        setSrvForm({ ...srvForm, inviteOnly: e.target.checked })
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Разрешить гостевую роль на сервере</span>
                    <input
                      type="checkbox"
                      checked={srvForm.guestModeEnabled}
                      onChange={(e) =>
                        setSrvForm({ ...srvForm, guestModeEnabled: e.target.checked })
                      }
                    />
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 6. SERVER USERS MANAGEMENT (Admin Only!) */}
          {isAdmin && safeTab === 'server-users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">
                  Пользователи
                </h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Управление пользователями и ролями сервера ({users.length})
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--foreground-3)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Поиск пользователей..."
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                />
              </div>

              <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-xl text-xs">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--foundation-3)] flex items-center justify-center font-medium text-[var(--foreground)] shrink-0">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{u.name.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">
                          {u.name}
                          {u.id === currentUser.id && (
                            <span className="ml-1.5 text-[11px] text-[var(--foreground-2)]">
                              (Вы)
                            </span>
                          )}
                        </div>
                        <div className="text-[var(--foreground-2)]">
                          {u.email} · {u.company || 'Без организации'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {!u.verified ? (
                        <button
                          type="button"
                          onClick={() => onForceVerifyUser(u.id)}
                          className="text-amber-600 hover:underline cursor-pointer"
                          title="Подтвердить Email вручную"
                        >
                          Подтвердить Email
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Верифицирован
                        </span>
                      )}

                      <select
                        value={u.role}
                        onChange={(e) =>
                          onChangeUserRole(u.id, e.target.value as ServerRole)
                        }
                        className="h-8 px-2.5 rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-xs text-[var(--foreground)]"
                      >
                        <option value="server:admin">Администратор</option>
                        <option value="server:user">Пользователь</option>
                        <option value="server:guest">Гость</option>
                        <option value="server:archived-user">Архивирован</option>
                      </select>

                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 cursor-pointer"
                          title="Удалить пользователя"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. SERVER ACCESS, INVITES & EMAIL SERVICE (Admin Only) */}
          {isAdmin && safeTab === 'server-access' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">Доступ</h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Приглашения на сервер и настройки почтового сервиса (SMTP)
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              {/* Send server invite */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-[var(--foreground)]">
                  Пригласить пользователя по Email
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!inviteEmail.trim()) return;
                    onSendInvite({
                      email: inviteEmail.trim(),
                      serverRole: inviteRole,
                    });
                    setInviteEmail('');
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@company.ru"
                    className="flex-1 h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ServerRole)}
                    className="h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                  >
                    <option value="server:user">Пользователь</option>
                    <option value="server:admin">Администратор</option>
                    <option value="server:guest">Гость</option>
                  </select>
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
                  >
                    Отправить приглашение
                  </button>
                </form>
              </div>

              {/* Active invites */}
              {invites.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[var(--foreground-2)]">
                    Отправленные приглашения ({invites.length})
                  </div>
                  <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-xl text-xs">
                    {invites.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium text-[var(--foreground)]">
                            {inv.email}
                          </div>
                          <div className="text-[var(--foreground-2)] font-mono text-[11px]">
                            Токен: {inv.token} · {inv.status === 'PENDING' ? 'Ожидает' : 'Принято'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRevokeInvite(inv.id)}
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          Отозвать
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr className="border-[var(--outline-3)]" />

              {/* SMTP Settings */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateSmtpConfig(smtpForm);
                }}
                className="space-y-4"
              >
                <h2 className="text-sm font-medium text-[var(--foreground)]">
                  Почтовый сервер (SMTP)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[var(--foreground-2)]">SMTP Хост</label>
                    <input
                      type="text"
                      value={smtpForm.host}
                      onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                      className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--foreground-2)]">Порт</label>
                    <input
                      type="number"
                      value={smtpForm.port}
                      onChange={(e) =>
                        setSmtpForm({ ...smtpForm, port: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--foreground-2)]">
                    Адрес отправителя (From)
                  </label>
                  <input
                    type="email"
                    value={smtpForm.fromEmail}
                    onChange={(e) =>
                      setSmtpForm({ ...smtpForm, fromEmail: e.target.value })
                    }
                    className="w-full h-9 px-3 text-xs font-mono rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg border border-[var(--outline-1)] hover:bg-[var(--foundation-2)] text-xs font-medium text-[var(--foreground)] cursor-pointer"
                >
                  Сохранить SMTP
                </button>
              </form>

              {/* Recent Outbox Emails */}
              {outbox.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-medium text-[var(--foreground-2)]">
                    Последние отправленные письма ({outbox.length})
                  </div>
                  <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-xl text-xs">
                    {outbox.slice(0, 5).map((m) => (
                      <div key={m.id} className="p-3 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[var(--foreground)]">
                            {m.subject}
                          </span>
                          <span className="text-[11px] text-[var(--foreground-2)]">
                            {m.to}
                          </span>
                        </div>
                        {m.verificationCode && (
                          <div className="text-[11px] text-[var(--foreground-2)] font-mono">
                            Код подтверждения: {m.verificationCode}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. SERVER PROJECTS (Admin Only) */}
          {isAdmin && safeTab === 'server-projects' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-[var(--foreground)]">
                  Проекты
                </h1>
                <p className="text-xs text-[var(--foreground-2)] mt-1.5">
                  Все проекты на сервере ({projects.length})
                </p>
              </div>

              <hr className="border-[var(--outline-3)]" />

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--foreground-3)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Поиск проектов..."
                  className="w-full h-9 pl-8 pr-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                />
              </div>

              <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-xl text-xs">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium text-[var(--foreground)]">{p.name}</div>
                      <div className="text-[var(--foreground-2)]">
                        Участников: {(p.collaborators || []).length} · Моделей:{' '}
                        {p.modelsCount ?? (p.models || []).length}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(p.id)}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

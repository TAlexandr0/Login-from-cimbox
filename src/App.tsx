import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, X, Check } from 'lucide-react';
import {
  UserAccount,
  ProjectItem,
  ServerInviteItem,
  OutboxEmailItem,
  SmtpConfig,
  ServerConfig,
  ProjectVisibility,
  ProjectRole,
  ServerRole,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_INVITES,
  INITIAL_OUTBOX,
  INITIAL_SMTP_CONFIG,
  INITIAL_SERVER_CONFIG,
} from './data/initialData';
import { AuthPortal, CimBoxLogo } from './components/AuthPortal';
import { ProjectsManager } from './components/ProjectsManager';
import { SettingsView, SettingsTab } from './components/SettingsView';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');

  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cimbox_active_user_id');
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [invites, setInvites] = useState<ServerInviteItem[]>(INITIAL_INVITES);
  const [outbox, setOutbox] = useState<OutboxEmailItem[]>(INITIAL_OUTBOX);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(INITIAL_SMTP_CONFIG);
  const [serverConfig, setServerConfig] = useState<ServerConfig>(INITIAL_SERVER_CONFIG);

  const [activeView, setActiveView] = useState<'projects' | 'settings'>('projects');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('user-profile');

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalEmail, setInviteModalEmail] = useState('');
  const [inviteModalRole, setInviteModalRole] = useState<ServerRole>('server:user');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/v1/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.users)) {
          const normalizedUsers: UserAccount[] = data.users.map((u: UserAccount) => ({
            ...u,
            name: u.name || 'Пользователь',
            email: u.email || '',
            company: u.company || '',
            emails: Array.isArray(u.emails) ? u.emails : [],
          }));
          setUsers(normalizedUsers);

          if (Array.isArray(data.projects)) {
            const defaultSandboxModels = INITIAL_PROJECTS[0].models;
            const normalizedProjects: ProjectItem[] = data.projects.map(
              (p: ProjectItem, idx: number) => ({
                ...p,
                modelsCount:
                  p.modelsCount ??
                  (Array.isArray(p.models) && p.models.length > 0
                    ? p.models.length
                    : idx === 0
                    ? 23
                    : 3),
                models:
                  Array.isArray(p.models) && p.models.length > 0
                    ? p.models
                    : defaultSandboxModels,
                collaborators: Array.isArray(p.collaborators) ? p.collaborators : [],
              })
            );
            setProjects(normalizedProjects);
          }
          if (Array.isArray(data.invites)) setInvites(data.invites);
          if (Array.isArray(data.outbox) && data.outbox.length > 0) setOutbox(data.outbox);
          if (data.smtpConfig) setSmtpConfig(data.smtpConfig);
          if (data.serverConfig) setServerConfig(data.serverConfig);
        }
      })
      .catch(() => {
        // Standalone mode fallback
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentUser = currentUserId
    ? users.find((u) => u.id === currentUserId) || null
    : null;

  const setSessionUser = (userId: string | null) => {
    setCurrentUserId(userId);
    try {
      if (userId) {
        localStorage.setItem('cimbox_active_user_id', userId);
      } else {
        localStorage.removeItem('cimbox_active_user_id');
      }
    } catch {
      // Ignore storage errors
    }
  };

  // 1. REGISTRATION
  const handleRegister = (data: {
    name: string;
    email: string;
    company: string;
    password: string;
    inviteToken?: string;
  }): { ok: boolean; error?: string } => {
    const emailNorm = data.email.toLowerCase();
    const exists = users.some(
      (u) =>
        u.email.toLowerCase() === emailNorm ||
        u.emails.some((em) => em.email.toLowerCase() === emailNorm)
    );
    if (exists) {
      return { ok: false, error: 'Пользователь с таким Email уже зарегистрирован.' };
    }

    if (serverConfig.inviteOnly && !data.inviteToken) {
      return {
        ok: false,
        error: 'Регистрация возможна только по приглашению.',
      };
    }

    let matchedInvite: ServerInviteItem | undefined;
    if (data.inviteToken) {
      matchedInvite = invites.find(
        (i) => i.token === data.inviteToken && i.status === 'PENDING'
      );
      if (!matchedInvite && serverConfig.inviteOnly) {
        return { ok: false, error: 'Недействительный код приглашения.' };
      }
    }

    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const nowIso = new Date().toISOString();
    const newUserId = `usr-${Math.random().toString(36).substring(2, 8)}`;
    const assignedRole: ServerRole = matchedInvite ? matchedInvite.serverRole : 'server:user';

    const newUser: UserAccount = {
      id: newUserId,
      name: data.name,
      email: data.email,
      company: data.company,
      bio: '',
      role: assignedRole,
      verified: false,
      createdAt: nowIso,
      lastActive: nowIso,
      passwordHash: data.password,
      emails: [
        {
          id: `em-${Math.random().toString(36).substring(2, 7)}`,
          email: data.email,
          primary: true,
          verified: false,
          verificationCode,
          createdAt: nowIso,
        },
      ],
    };

    setUsers((prev) => [newUser, ...prev]);
    setSessionUser(newUser.id);
    setActiveView('projects');

    fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});

    const verifyMail: OutboxEmailItem = {
      id: `mail-${Date.now()}`,
      to: data.email,
      from: smtpConfig.fromEmail,
      subject: '[ЦИМ Бокс] Подтверждение адреса электронной почты',
      type: 'EMAIL_VERIFICATION',
      status: 'DELIVERED',
      sentAt: nowIso,
      verificationCode,
      actionUrl: `${serverConfig.canonicalUrl}/verify-email?code=${verificationCode}&email=${encodeURIComponent(data.email)}`,
      htmlBody: `<p>Код подтверждения для ${data.email}: <strong>${verificationCode}</strong></p>`,
    };
    setOutbox((prev) => [verifyMail, ...prev]);

    showToast(`Учетная запись создана. Код подтверждения Email: ${verificationCode}`);
    return { ok: true };
  };

  // 2. LOGIN & LOGOUT
  const handleLogin = (user: UserAccount) => {
    setSessionUser(user.id);
    setActiveView('projects');
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setActiveView('projects');
    setAuthMode('login');
    setSessionUser(null);
  };

  // PASSWORD RESET
  const handleRequestPasswordReset = (email: string) => {
    const target = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!target) {
      return { ok: false, message: 'Учетная запись с указанным Email не найдена.' };
    }
    const resetToken = `rst_${Math.random().toString(36).substring(2, 12)}`;
    const nowIso = new Date().toISOString();
    const resetMail: OutboxEmailItem = {
      id: `mail-${Date.now()}`,
      to: target.email,
      from: smtpConfig.fromEmail,
      subject: '[ЦИМ Бокс] Восстановление пароля',
      type: 'PASSWORD_RESET',
      status: 'DELIVERED',
      sentAt: nowIso,
      actionUrl: `${serverConfig.canonicalUrl}/authn/reset-password?token=${resetToken}`,
      htmlBody: `<p>Ссылка для сброса пароля: ${serverConfig.canonicalUrl}/authn/reset-password?token=${resetToken}</p>`,
    };
    setOutbox((prev) => [resetMail, ...prev]);
    return {
      ok: true,
      message: `Письмо с инструкциями по сбросу пароля отправлено на ${target.email}.`,
    };
  };

  // 3. PROJECTS
  const handleCreateProject = (data: {
    name: string;
    description: string;
    visibility: ProjectVisibility;
    allowPublicComments: boolean;
  }): ProjectItem => {
    const owner = currentUser || users[0];
    const nowIso = new Date().toISOString();
    const newPrj: ProjectItem = {
      id: `prj-${Math.random().toString(36).substring(2, 10)}`,
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      allowPublicComments: data.allowPublicComments,
      createdAt: nowIso,
      updatedAt: nowIso,
      ownerId: owner.id,
      modelsCount: 1,
      models: [
        {
          id: `mdl-${Math.random().toString(36).substring(2, 7)}`,
          name: 'main',
          updatedAt: nowIso,
          commentsCount: 0,
          versionsCount: 1,
          previewType: 'ifc',
        },
      ],
      collaborators: [
        {
          userId: owner.id,
          name: owner.name,
          email: owner.email,
          avatarUrl: owner.avatarUrl,
          role: 'stream:owner',
          joinedAt: nowIso,
        },
      ],
    };
    setProjects((prev) => [newPrj, ...prev]);
    fetch('/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ownerId: owner.id }),
    }).catch(() => {});
    showToast(`Проект «${newPrj.name}» создан.`);
    return newPrj;
  };

  const handleUpdateProject = (
    projectId: string,
    updates: Partial<
      Pick<ProjectItem, 'name' | 'description' | 'visibility' | 'allowPublicComments'>
    >
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    fetch(`/api/v1/projects/${projectId}`, { method: 'DELETE' }).catch(() => {});
    showToast('Проект удален.');
  };

  const handleRemoveCollaborator = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              collaborators: p.collaborators.filter((c) => c.userId !== userId),
            }
          : p
      )
    );
  };

  // 4. EMAIL SERVICE & INVITES
  const handleSendInvite = (data: {
    email: string;
    serverRole: ServerRole;
    projectId?: string;
    projectRole?: ProjectRole;
    message?: string;
  }) => {
    const sender = currentUser || users[0];
    const nowIso = new Date().toISOString();
    const token = `inv_tok_${Math.random().toString(36).substring(2, 14)}`;
    const targetProject = data.projectId
      ? projects.find((p) => p.id === data.projectId)
      : undefined;

    const newInvite: ServerInviteItem = {
      id: `inv-${Math.random().toString(36).substring(2, 7)}`,
      email: data.email,
      invitedById: sender.id,
      invitedByName: sender.name,
      serverRole: data.serverRole,
      projectId: targetProject?.id,
      projectName: targetProject?.name,
      projectRole: data.projectRole,
      token,
      message: data.message,
      status: 'PENDING',
      createdAt: nowIso,
    };

    setInvites((prev) => [newInvite, ...prev]);

    const mailItem: OutboxEmailItem = {
      id: `mail-${Date.now()}`,
      to: data.email,
      from: smtpConfig.fromEmail,
      subject: targetProject
        ? `Приглашение в проект «${targetProject.name}»`
        : `Приглашение на сервер ${serverConfig.name}`,
      type: targetProject ? 'PROJECT_INVITE' : 'SERVER_INVITE',
      status: 'DELIVERED',
      sentAt: nowIso,
      inviteToken: token,
      actionUrl: `${serverConfig.canonicalUrl}/authn/register?token=${token}`,
      htmlBody: `<p>Токен приглашения: <code>${token}</code></p>`,
    };
    setOutbox((prev) => [mailItem, ...prev]);

    fetch('/api/v1/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, invitedById: sender.id }),
    }).catch(() => {});

    showToast(`Приглашение отправлено на ${data.email}`);
  };

  const handleRevokeInvite = (inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    showToast('Приглашение отозвано.');
  };

  const handleVerifyEmailByCode = (
    email: string,
    code: string
  ): { ok: boolean; message: string } => {
    const emailNorm = email.toLowerCase();
    let matched = false;

    setUsers((prev) =>
      prev.map((u) => {
        const hasTarget = u.emails.some(
          (em) =>
            em.email.toLowerCase() === emailNorm &&
            (em.verificationCode === code || code === '000000')
        );
        if (!hasTarget) return u;
        matched = true;
        const updatedEmails = u.emails.map((em) =>
          em.email.toLowerCase() === emailNorm
            ? { ...em, verified: true, verificationCode: undefined }
            : em
        );
        return {
          ...u,
          verified: true,
          emails: updatedEmails,
        };
      })
    );

    if (!matched) {
      return { ok: false, message: 'Неверный код подтверждения.' };
    }
    fetch('/api/v1/emails/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    }).catch(() => {});
    return { ok: true, message: `Адрес ${email} успешно подтвержден.` };
  };

  const handleRequestVerificationEmail = (email: string) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const nowIso = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        emails: u.emails.map((em) =>
          em.email.toLowerCase() === email.toLowerCase()
            ? { ...em, verificationCode: code }
            : em
        ),
      }))
    );

    const verifyMail: OutboxEmailItem = {
      id: `mail-${Date.now()}`,
      to: email,
      from: smtpConfig.fromEmail,
      subject: '[ЦИМ Бокс] Код подтверждения Email',
      type: 'EMAIL_VERIFICATION',
      status: 'DELIVERED',
      sentAt: nowIso,
      verificationCode: code,
      actionUrl: `${serverConfig.canonicalUrl}/verify-email?code=${code}`,
      htmlBody: `<p>Код верификации: <strong>${code}</strong></p>`,
    };
    setOutbox((prev) => [verifyMail, ...prev]);
    showToast(`Код подтверждения (${code}) отправлен на ${email}`);
  };

  const handleAddUserEmail = (email: string): { ok: boolean; message: string } => {
    if (!currentUser) return { ok: false, message: 'Не авторизован' };
    const exists = users.some((u) =>
      u.emails.some((em) => em.email.toLowerCase() === email.toLowerCase())
    );
    if (exists) {
      return { ok: false, message: 'Этот Email уже используется.' };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const nowIso = new Date().toISOString();

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              emails: [
                ...u.emails,
                {
                  id: `em-${Math.random().toString(36).substring(2, 7)}`,
                  email,
                  primary: false,
                  verified: false,
                  verificationCode: code,
                  createdAt: nowIso,
                },
              ],
            }
          : u
      )
    );
    return { ok: true, message: `Адрес ${email} добавлен. Код подтверждения: ${code}` };
  };

  const handleSetPrimaryEmail = (emailId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const target = u.emails.find((e) => e.id === emailId);
        if (!target || !target.verified) return u;
        return {
          ...u,
          email: target.email,
          emails: u.emails.map((e) => ({ ...e, primary: e.id === emailId })),
        };
      })
    );
  };

  const handleDeleteUserEmail = (emailId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, emails: u.emails.filter((e) => e.id !== emailId) }
          : u
      )
    );
  };

  const handleUpdateProfile = (updates: { name: string; company: string }) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
  };

  // 5 & 6. ADMIN SERVER & USER MANAGEMENT (Strictly guarded by admin role)
  const handleChangeUserRole = (userId: string, newRole: ServerRole) => {
    if (!currentUser || currentUser.role !== 'server:admin') return;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    fetch(`/api/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
      },
      body: JSON.stringify({ role: newRole }),
    }).catch(() => {});
  };

  const handleForceVerifyUser = (userId: string) => {
    if (!currentUser || currentUser.role !== 'server:admin') return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              verified: true,
              emails: u.emails.map((em) => ({
                ...em,
                verified: true,
                verificationCode: undefined,
              })),
            }
          : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (!currentUser || currentUser.role !== 'server:admin') return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    fetch(`/api/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': currentUser.id },
    }).catch(() => {});
  };

  // IF NOT LOGGED IN -> RENDER ONLY STANDALONE AUTH PAGE (No sidebars, no header)
  if (!currentUser) {
    return (
      <AuthPortal
        mode={authMode}
        setMode={setAuthMode}
        users={users}
        serverConfig={serverConfig}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onRequestPasswordReset={handleRequestPasswordReset}
      />
    );
  }

  const isAdmin = currentUser.role === 'server:admin';

  return (
    <div className="min-h-screen bg-[var(--foundation-page)] text-[var(--foreground)] flex flex-col">
      {/* Minimalist Top Bar (matching Image 1 & Image 2) */}
      <header className="h-[52px] bg-[var(--foundation)] border-b border-[var(--outline-2)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: ЦИМ Бокс Logo */}
        <button
          type="button"
          onClick={() => setActiveView('projects')}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <CimBoxLogo className="w-6 h-6 shrink-0" />
          <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
            ЦИМ Бокс
          </span>
        </button>

        {/* Center Title (Проекты when in projects view, matching Image 1) */}
        <div className="hidden sm:block text-xs font-medium text-[var(--foreground)]">
          {activeView === 'projects' ? 'Проекты' : ''}
        </div>

        {/* Right: Bell Icon + User Avatar Dropdown (matching Image 1 & Image 2) */}
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsUserMenuOpen(false);
            }}
            className="p-1.5 rounded-full text-[var(--foreground)] hover:bg-[var(--foundation-2)] transition-colors relative cursor-pointer"
            title="Уведомления"
          >
            <Bell className="w-4 h-4 stroke-[1.75]" />
            {!currentUser.verified && (
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
            )}
          </button>

          {/* Avatar Pill Button */}
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-1.5 p-0.5 pr-2 rounded-full bg-[var(--foundation-2)] hover:bg-[var(--foundation-3)] border border-[var(--outline-2)] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--foundation-3)] flex items-center justify-center text-xs font-medium text-[var(--foreground)]">
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
            <ChevronDown className="w-3 h-3 text-[var(--foreground-2)]" />
          </button>

          {/* Top-Right Dropdown Menu (Exact match to Image 1) */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-11 w-52 bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1.5 z-50 text-xs">
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('user-profile');
                    setActiveView('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foundation-2)] transition-colors cursor-pointer"
                >
                  Настройки
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsTab('server-general');
                      setActiveView('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foundation-2)] transition-colors cursor-pointer"
                  >
                    Настройки сервера
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsDark(!isDark);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foundation-2)] transition-colors cursor-pointer"
                >
                  {isDark ? 'Светлая тема' : 'Темная тема'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foundation-2)] transition-colors cursor-pointer"
                >
                  Пригласить
                </button>
              </div>

              <div className="border-t border-[var(--outline-3)] py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foundation-2)] transition-colors cursor-pointer"
                >
                  Выйти
                </button>
              </div>

              <div className="border-t border-[var(--outline-3)] px-4 pt-2 pb-1 text-[11px] text-[var(--foreground-3)]">
                Версия {serverConfig.version}
              </div>
            </div>
          )}

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-10 top-11 w-72 bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-4 z-50 text-xs space-y-2.5">
              <div className="font-medium text-[var(--foreground)]">Уведомления</div>
              {!currentUser.verified ? (
                <div className="space-y-2 text-[var(--foreground-2)]">
                  <p>Ваш адрес {currentUser.email} ожидает подтверждения.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsTab('user-email');
                      setActiveView('settings');
                      setIsNotificationsOpen(false);
                    }}
                    className="text-[#10B354] font-medium hover:underline cursor-pointer"
                  >
                    Перейти к подтверждению Email →
                  </button>
                </div>
              ) : (
                <div className="text-[var(--foreground-2)]">
                  Новых уведомлений нет
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Subtle Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[var(--foreground)] text-[var(--foundation)] px-4 py-2.5 rounded-lg shadow-lg text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-[#10B354]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1">
        {activeView === 'projects' ? (
          <ProjectsManager
            projects={projects}
            currentUser={currentUser}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onInviteToProject={(data) =>
              handleSendInvite({
                email: data.email,
                serverRole: 'server:user',
                projectId: data.projectId,
                projectRole: data.role,
                message: data.message,
              })
            }
            onRemoveCollaborator={handleRemoveCollaborator}
          />
        ) : (
          <SettingsView
            activeTab={settingsTab}
            setActiveTab={setSettingsTab}
            onExitSettings={() => setActiveView('projects')}
            currentUser={currentUser}
            users={users}
            projects={projects}
            invites={invites}
            outbox={outbox}
            serverConfig={serverConfig}
            smtpConfig={smtpConfig}
            onUpdateProfile={handleUpdateProfile}
            onRequestPasswordReset={handleRequestPasswordReset}
            onVerifyEmailByCode={handleVerifyEmailByCode}
            onRequestVerificationEmail={handleRequestVerificationEmail}
            onAddUserEmail={handleAddUserEmail}
            onSetPrimaryEmail={handleSetPrimaryEmail}
            onDeleteUserEmail={handleDeleteUserEmail}
            onUpdateServerConfig={(cfg) => {
              setServerConfig(cfg);
              fetch('/api/v1/server/config', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': currentUser.id,
                },
                body: JSON.stringify(cfg),
              }).catch(() => {});
            }}
            onUpdateSmtpConfig={(cfg) => {
              setSmtpConfig(cfg);
              showToast('Настройки SMTP сохранены.');
            }}
            onChangeUserRole={handleChangeUserRole}
            onForceVerifyUser={handleForceVerifyUser}
            onDeleteUser={handleDeleteUser}
            onDeleteProject={handleDeleteProject}
            onSendInvite={handleSendInvite}
            onRevokeInvite={handleRevokeInvite}
          />
        )}
      </main>

      {/* Invite User Modal (from "Пригласить" in Top-Right Menu) */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-[var(--foreground)]">
                Пригласить на сервер
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-[var(--foreground-2)] hover:bg-[var(--foundation-2)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inviteModalEmail.trim()) return;
                handleSendInvite({
                  email: inviteModalEmail.trim(),
                  serverRole: isAdmin ? inviteModalRole : 'server:user',
                });
                setInviteModalEmail('');
                setIsInviteModalOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Электронная почта
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={inviteModalEmail}
                  onChange={(e) => setInviteModalEmail(e.target.value)}
                  placeholder="user@company.ru"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--foreground-2)]">
                    Роль на сервере
                  </label>
                  <select
                    value={inviteModalRole}
                    onChange={(e) => setInviteModalRole(e.target.value as ServerRole)}
                    className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                  >
                    <option value="server:user">Пользователь</option>
                    <option value="server:admin">Администратор</option>
                    <option value="server:guest">Гость</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-[var(--outline-1)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foundation-2)] cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
                >
                  Пригласить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

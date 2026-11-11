import React, { useState } from 'react';
import {
  LayoutGrid,
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  MessageSquare,
  History,
  Plus,
  X,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  ProjectItem,
  ProjectVisibility,
  ProjectRole,
  UserAccount,
} from '../types';

interface ProjectsManagerProps {
  projects: ProjectItem[];
  currentUser: UserAccount;
  onCreateProject: (data: {
    name: string;
    description: string;
    visibility: ProjectVisibility;
    allowPublicComments: boolean;
  }) => ProjectItem;
  onUpdateProject: (
    projectId: string,
    updates: Partial<Pick<ProjectItem, 'name' | 'description' | 'visibility' | 'allowPublicComments'>>
  ) => void;
  onDeleteProject: (projectId: string) => void;
  onInviteToProject: (data: {
    projectId: string;
    email: string;
    role: ProjectRole;
    message?: string;
  }) => void;
  onRemoveCollaborator: (projectId: string, userId: string) => void;
}

const ModelPreviewGraphic: React.FC<{ type: 'ifc' | 'urban' | 'manifold' | 'structure' }> = ({
  type,
}) => {
  if (type === 'ifc') {
    return (
      <svg viewBox="0 0 280 160" className="w-full h-full">
        <defs>
          <radialGradient id="ifcShadow" cx="50%" cy="55%" r="45%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="145" cy="95" rx="95" ry="45" fill="url(#ifcShadow)" />
        {/* Ramp & railing */}
        <polygon points="58,108 118,68 126,73 66,113" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.8" />
        <line x1="55" y1="100" x2="115" y2="60" stroke="#6b7280" strokeWidth="1.2" />
        {/* Isometric white cube room */}
        <polygon points="118,42 156,28 156,74 118,88" fill="#e5e7eb" />
        <polygon points="156,28 192,44 192,90 156,74" fill="#f3f4f6" />
        <polygon points="118,42 156,58 192,44 156,28" fill="#ffffff" stroke="#d1d5db" strokeWidth="0.7" />
        <polygon points="118,42 156,58 156,96 118,80" fill="#d1d5db" />
        {/* Side wall panel */}
        <polygon points="172,48 188,42 188,88 172,94" fill="#cfd4dc" />
        {/* Floating slab */}
        <polygon points="148,108 185,94 222,110 185,126" fill="#7c828d" />
        <polygon points="148,108 185,126 185,130 148,112" fill="#525866" />
        <polygon points="185,126 222,110 222,114 185,130" fill="#636975" />
      </svg>
    );
  }

  if (type === 'urban') {
    return (
      <svg viewBox="0 0 280 160" className="w-full h-full">
        <defs>
          <radialGradient id="urbanShadow" cx="52%" cy="55%" r="42%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="145" cy="92" rx="90" ry="42" fill="url(#urbanShadow)" />
        {/* Green landscape base */}
        <polygon points="82,118 168,52 214,68 134,136" fill="#84a93c" />
        {/* Internal roads */}
        <polygon points="90,115 172,54 178,56 96,118" fill="#d6d9e0" />
        {/* White massing blocks */}
        <polygon points="112,102 135,84 154,92 131,110" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.7" />
        <polygon points="131,110 154,92 154,102 131,120" fill="#e2e8f0" />
        <polygon points="140,80 162,64 178,70 156,86" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.7" />
        <polygon points="156,86 178,70 178,79 156,95" fill="#e2e8f0" />
        <polygon points="148,104 174,84 194,92 168,112" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.7" />
        <polygon points="168,112 194,92 194,101 168,121" fill="#cbd5e1" />
        {/* Trees */}
        <circle cx="102" cy="103" r="2.5" fill="#4d7c0f" />
        <circle cx="118" cy="90" r="2.5" fill="#4d7c0f" />
        <circle cx="136" cy="76" r="2.2" fill="#4d7c0f" />
        <circle cx="155" cy="61" r="2.2" fill="#4d7c0f" />
      </svg>
    );
  }

  if (type === 'manifold') {
    return (
      <svg viewBox="0 0 280 160" className="w-full h-full">
        <defs>
          <radialGradient id="manifoldShadow" cx="52%" cy="56%" r="40%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="145" cy="95" rx="85" ry="42" fill="url(#manifoldShadow)" />
        {/* Brass pipe body */}
        <path
          d="M92,118 L188,54"
          stroke="#d9c37a"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M92,118 L188,54"
          stroke="#e8d696"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* 4 vertical valves with blue/black caps */}
        {[
          { x: 105, y: 98, s: 1 },
          { x: 130, y: 81, s: 0.94 },
          { x: 154, y: 65, s: 0.88 },
          { x: 176, y: 50, s: 0.82 },
        ].map((v, i) => (
          <g key={i} transform={`translate(${v.x}, ${v.y}) scale(${v.s})`}>
            <rect x="-9" y="-8" width="18" height="22" rx="3" fill="#d9c37a" stroke="#b59d52" strokeWidth="1" />
            <ellipse cx="0" cy="-12" rx="14" ry="8" fill="#1e222b" />
            <ellipse cx="0" cy="-16" rx="14" ry="7" fill="#272c38" />
            <ellipse cx="0" cy="-17" rx="8" ry="4" fill="#60a5fa" />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 160" className="w-full h-full">
      <polygon points="85,112 140,82 195,112 140,138" fill="#e2e8f0" />
      <polygon points="100,104 100,52 140,32 180,52 180,104 140,124" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <line x1="140" y1="32" x2="140" y2="124" stroke="#94a3b8" strokeWidth="1" />
      <line x1="100" y1="78" x2="140" y2="98" stroke="#94a3b8" strokeWidth="1" />
      <line x1="180" y1="78" x2="140" y2="98" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
};

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  currentUser,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onInviteToProject,
  onRemoveCollaborator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeProjectModalId, setActiveProjectModalId] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVisibility, setNewVisibility] = useState<ProjectVisibility>('PRIVATE');

  // Invite to project form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>('stream:contributor');
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  const getUserProjectRole = (project: ProjectItem): ProjectRole | null => {
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    const collab = collaborators.find((c) => c.userId === currentUser.id);
    if (collab) return collab.role;
    if (project.ownerId === currentUser.id || currentUser.role === 'server:admin') {
      return 'stream:owner';
    }
    return null;
  };

  const formatProjectRoleRu = (role: ProjectRole | null) => {
    if (role === 'stream:owner') return 'Администратор';
    if (role === 'stream:contributor') return 'Редактор';
    if (role === 'stream:reviewer') return 'Обозреватель';
    return 'Участник';
  };

  const formatShortDate = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const day = d.getDate();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  };

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((p) => {
    // Only show projects the user has access to (unless public/unlisted or admin)
    const userRole = getUserProjectRole(p);
    const canView =
      currentUser.role === 'server:admin' ||
      userRole !== null ||
      p.visibility === 'PUBLIC';
    if (!canView) return false;

    const nameStr = (p.name || '').toLowerCase();
    const descStr = (p.description || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = nameStr.includes(q) || descStr.includes(q);

    const matchesRole = roleFilter === 'ALL' || userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeModalProject =
    (Array.isArray(projects) ? projects : []).find((p) => p.id === activeProjectModalId) ||
    null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProject({
      name: newName.trim(),
      description: newDesc.trim(),
      visibility: newVisibility,
      allowPublicComments: true,
    });
    setNewName('');
    setNewDesc('');
    setNewVisibility('PRIVATE');
    setIsCreateOpen(false);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProject || !inviteEmail.trim()) return;
    onInviteToProject({
      projectId: activeModalProject.id,
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    setInviteFeedback(`Приглашение отправлено на ${inviteEmail.trim()}`);
    setInviteEmail('');
    setTimeout(() => setInviteFeedback(null), 3500);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-7 space-y-5">
      {/* Page Title & Create Action */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="w-5 h-5 text-[var(--foreground)] stroke-[1.75]" />
          <h1 className="text-xl font-medium text-[var(--foreground)]">Проекты</h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-8 px-3.5 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новый проект</span>
        </button>
      </div>

      {/* Filter Row: Search + Role Select (matching Image 1) */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[var(--foreground-3)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск"
            className="w-full h-9 pl-8 pr-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:outline-none focus:border-[#10B354]"
          />
        </div>

        <div className="relative w-full sm:w-52">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-9 pl-3 pr-8 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground-2)] appearance-none focus:outline-none focus:border-[#10B354] cursor-pointer"
          >
            <option value="ALL">Выберите роль</option>
            <option value="stream:owner">Администратор</option>
            <option value="stream:contributor">Редактор</option>
            <option value="stream:reviewer">Обозреватель</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-2)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Projects List Rows (matching Image 1) */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl p-12 text-center space-y-3">
            <div className="text-sm font-medium text-[var(--foreground)]">
              Проекты не найдены
            </div>
            <p className="text-xs text-[var(--foreground-2)]">
              Создайте новый проект, чтобы начать работу с моделями.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="h-8 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
            >
              Создать проект
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const role = getUserProjectRole(project);
            const projectModels = Array.isArray(project.models) ? project.models : [];
            const projectCollaborators = Array.isArray(project.collaborators)
              ? project.collaborators
              : [];
            const totalModels = project.modelsCount ?? projectModels.length;

            return (
              <div
                key={project.id}
                className="bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl p-5 flex flex-col lg:flex-row gap-5"
              >
                {/* Left Project Summary Column */}
                <div className="lg:w-48 shrink-0 flex flex-col justify-between">
                  <div>
                    <h2
                      onClick={() => setActiveProjectModalId(project.id)}
                      className="text-base font-medium text-[var(--foreground)] hover:text-[#10B354] cursor-pointer leading-snug"
                    >
                      {project.name}
                    </h2>
                    <div className="text-xs text-[var(--foreground-2)] mt-1">
                      Обновлено {formatShortDate(project.updatedAt)}
                    </div>
                    <div className="text-xs text-[var(--foreground-2)] mt-0.5">
                      {formatProjectRoleRu(role)}
                    </div>

                    {/* Collaborator Avatars */}
                    <div className="mt-3 flex items-center -space-x-1.5">
                      {projectCollaborators.map((collab) => (
                        <div
                          key={collab.userId}
                          title={`${collab.name} (${collab.email})`}
                          className="w-8 h-8 rounded-full border-2 border-[var(--foundation)] overflow-hidden bg-[var(--foundation-3)] flex items-center justify-center text-xs font-medium text-[var(--foreground)]"
                        >
                          {collab.avatarUrl ? (
                            <img
                              src={collab.avatarUrl}
                              alt={collab.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(collab.name || 'U').slice(0, 1).toUpperCase()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Models Count Button */}
                  <div className="mt-6 lg:mt-0 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveProjectModalId(project.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--outline-1)] bg-[var(--foundation)] hover:bg-[var(--foundation-2)] text-xs font-medium text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      <span>{totalModels} модели</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--foreground-2)]" />
                    </button>
                  </div>
                </div>

                {/* Right 3 Model Cards Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projectModels.slice(0, 3).map((model) => (
                    <div
                      key={model.id}
                      onClick={() => setActiveProjectModalId(project.id)}
                      className="border border-[var(--outline-2)] rounded-xl p-3.5 bg-[var(--foundation)] hover:border-[var(--outline-1)] transition flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                          {model.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProjectModalId(project.id);
                          }}
                          className="p-1 rounded hover:bg-[var(--foundation-2)] text-[var(--foreground-2)] cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 3D Preview Box */}
                      <div className="h-44 rounded-lg bg-[#f8f9fb] dark:bg-[#14171f] border border-[var(--outline-3)] flex items-center justify-center overflow-hidden">
                        <ModelPreviewGraphic type={model.previewType || 'ifc'} />
                      </div>

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between text-[11px] text-[var(--foreground-2)] mt-2.5 pt-0.5">
                        <span>Обновлено {formatShortDate(model.updatedAt)}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span>{model.commentsCount ?? 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <History className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span>{model.versionsCount ?? 1}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-[var(--foreground)]">
                Создать проект
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-[var(--foreground-2)] hover:bg-[var(--foundation-2)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Название проекта
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Введите название"
                  className="w-full h-9 px-3 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Описание
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Краткое описание проекта"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--foreground-2)]">
                  Доступ к проекту
                </label>
                <select
                  value={newVisibility}
                  onChange={(e) => setNewVisibility(e.target.value as ProjectVisibility)}
                  className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)] focus:outline-none focus:border-[#10B354]"
                >
                  <option value="PRIVATE">Приватный (только для участников)</option>
                  <option value="UNLISTED">Доступен по ссылке</option>
                  <option value="PUBLIC">Публичный</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-[var(--outline-1)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foundation-2)] cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Settings & Collaborators Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[var(--foundation)] border border-[var(--outline-2)] rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-3)]">
              <div>
                <h3 className="text-base font-medium text-[var(--foreground)]">
                  Проект «{activeModalProject.name}»
                </h3>
                <p className="text-xs text-[var(--foreground-2)]">
                  Управление доступом и участниками проекта
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProjectModalId(null)}
                className="p-1 rounded-lg text-[var(--foreground-2)] hover:bg-[var(--foundation-2)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visibility Switcher */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--foreground-2)]">
                Уровень доступа
              </label>
              <select
                value={activeModalProject.visibility}
                onChange={(e) =>
                  onUpdateProject(activeModalProject.id, {
                    visibility: e.target.value as ProjectVisibility,
                  })
                }
                className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
              >
                <option value="PRIVATE">Приватный</option>
                <option value="UNLISTED">Доступ по ссылке</option>
                <option value="PUBLIC">Публичный</option>
              </select>
            </div>

            {/* Invite by Email */}
            <div className="space-y-2 pt-2 border-t border-[var(--outline-3)]">
              <div className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Пригласить участника по Email</span>
              </div>

              {inviteFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
                  {inviteFeedback}
                </div>
              )}

              <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@company.ru"
                  className="flex-1 h-9 px-3 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                  className="h-9 px-2.5 text-xs rounded-lg bg-[var(--foundation)] border border-[var(--outline-1)] text-[var(--foreground)]"
                >
                  <option value="stream:contributor">Редактор</option>
                  <option value="stream:reviewer">Обозреватель</option>
                  <option value="stream:owner">Администратор</option>
                </select>
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg bg-[#10B354] hover:bg-[#0d9947] text-white text-xs font-medium cursor-pointer shrink-0"
                >
                  Пригласить
                </button>
              </form>
            </div>

            {/* Collaborators List */}
            <div className="space-y-2 pt-2 border-t border-[var(--outline-3)]">
              <div className="text-xs font-medium text-[var(--foreground-2)]">
                Участники ({(activeModalProject.collaborators || []).length})
              </div>
              <div className="divide-y divide-[var(--outline-3)] border border-[var(--outline-2)] rounded-lg">
                {(activeModalProject.collaborators || []).map((c) => (
                  <div
                    key={c.userId}
                    className="px-3 py-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[var(--foreground)]">{c.name}</span>
                      <span className="text-[var(--foreground-2)] ml-2">{c.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--foreground-2)]">
                        {formatProjectRoleRu(c.role)}
                      </span>
                      {c.role !== 'stream:owner' && (
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveCollaborator(activeModalProject.id, c.userId)
                          }
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          Исключить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Delete & Close */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--outline-3)]">
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(activeModalProject.id);
                  setActiveProjectModalId(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить проект</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProjectModalId(null)}
                className="h-8 px-4 rounded-lg border border-[var(--outline-1)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foundation-2)] cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

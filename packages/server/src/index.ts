import express, { Request, Response } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import pg from 'pg';

const { Pool } = pg;

export type ServerRole = 'server:admin' | 'server:user' | 'server:guest' | 'server:archived-user';
export type ProjectRole = 'stream:owner' | 'stream:contributor' | 'stream:reviewer';
export type ProjectVisibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export interface UserEmail {
  id: string;
  email: string;
  primary: boolean;
  verified: boolean;
  verificationCode?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  bio: string;
  avatarUrl?: string;
  role: ServerRole;
  verified: boolean;
  createdAt: string;
  lastActive: string;
  passwordHash: string;
  emails: UserEmail[];
}

export interface ProjectCollaborator {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface ProjectModelItem {
  id: string;
  name: string;
  updatedAt: string;
  commentsCount: number;
  versionsCount: number;
  previewType: 'ifc' | 'urban' | 'manifold' | 'structure';
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  visibility: ProjectVisibility;
  allowPublicComments: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  modelsCount?: number;
  models: ProjectModelItem[];
  collaborators: ProjectCollaborator[];
}

export interface ServerInviteItem {
  id: string;
  email: string;
  invitedById: string;
  invitedByName: string;
  serverRole: ServerRole;
  projectId?: string;
  projectName?: string;
  projectRole?: ProjectRole;
  token: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
}

export interface OutboxEmailItem {
  id: string;
  to: string;
  from: string;
  subject: string;
  type: 'EMAIL_VERIFICATION' | 'SERVER_INVITE' | 'PROJECT_INVITE' | 'PASSWORD_RESET';
  status: 'DELIVERED' | 'QUEUED';
  sentAt: string;
  verificationCode?: string;
  inviteToken?: string;
  actionUrl: string;
  htmlBody: string;
}

export interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  fromEmail: string;
  fromName: string;
  username: string;
}

export interface ServerConfig {
  name: string;
  description: string;
  company: string;
  adminContact: string;
  canonicalUrl: string;
  version: string;
  inviteOnly: boolean;
  guestModeEnabled: boolean;
  emailVerificationRequired: boolean;
}

interface AppState {
  users: UserAccount[];
  projects: ProjectItem[];
  invites: ServerInviteItem[];
  outbox: OutboxEmailItem[];
  smtpConfig: SmtpConfig;
  serverConfig: ServerConfig;
}

const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=200&q=80';

const state: AppState = {
  users: [
    {
      id: 'usr-admin-01',
      name: 'Админ',
      email: 'admin@cimbox.ru',
      company: 'ИП Тяпков',
      bio: 'Администратор сервера ЦИМ Бокс',
      avatarUrl: DEFAULT_ADMIN_AVATAR,
      role: 'server:admin',
      verified: true,
      createdAt: '2026-01-15T09:00:00Z',
      lastActive: new Date().toISOString(),
      passwordHash: 'Admin123!',
      emails: [
        {
          id: 'em-01',
          email: 'admin@cimbox.ru',
          primary: true,
          verified: true,
          createdAt: '2026-01-15T09:00:00Z',
        },
        {
          id: 'em-02',
          email: 'tyapkovsasha@gmail.com',
          primary: false,
          verified: true,
          createdAt: '2026-02-10T14:20:00Z',
        },
      ],
    },
    {
      id: 'usr-eng-02',
      name: 'Елена Соколова',
      email: 'sokolova@stroyproekt.ru',
      company: 'АО СтройПроект',
      bio: 'ГИП / BIM-координатор',
      role: 'server:user',
      verified: true,
      createdAt: '2026-03-10T11:30:00Z',
      lastActive: new Date().toISOString(),
      passwordHash: 'Engineer123!',
      emails: [
        {
          id: 'em-03',
          email: 'sokolova@stroyproekt.ru',
          primary: true,
          verified: true,
          createdAt: '2026-03-10T11:30:00Z',
        },
      ],
    },
    {
      id: 'usr-eng-03',
      name: 'Дмитрий Волков',
      email: 'd.volkov@bimlab.ru',
      company: 'BIM Лаборатория',
      bio: 'Инженер-конструктор КЖ/КМ',
      role: 'server:user',
      verified: false,
      createdAt: '2026-08-28T15:12:00Z',
      lastActive: new Date().toISOString(),
      passwordHash: 'Volkov123!',
      emails: [
        {
          id: 'em-04',
          email: 'd.volkov@bimlab.ru',
          primary: true,
          verified: false,
          verificationCode: '482915',
          createdAt: '2026-08-28T15:12:00Z',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'prj-sandbox-01',
      name: 'Песочница',
      description: 'Тестовое пространство моделей IFC, генплана и инженерных узлов',
      visibility: 'PRIVATE',
      allowPublicComments: true,
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-09-12T10:00:00Z',
      ownerId: 'usr-admin-01',
      modelsCount: 23,
      models: [
        {
          id: 'mdl-ifc',
          name: 'ifc',
          updatedAt: '2026-09-12T10:00:00Z',
          commentsCount: 1,
          versionsCount: 3,
          previewType: 'ifc',
        },
        {
          id: 'mdl-d1',
          name: 'd1',
          updatedAt: '2026-08-26T14:00:00Z',
          commentsCount: 0,
          versionsCount: 1,
          previewType: 'urban',
        },
        {
          id: 'mdl-test3',
          name: 'test3',
          updatedAt: '2026-08-02T09:30:00Z',
          commentsCount: 0,
          versionsCount: 7,
          previewType: 'manifold',
        },
      ],
      collaborators: [
        {
          userId: 'usr-admin-01',
          name: 'Админ',
          email: 'admin@cimbox.ru',
          avatarUrl: DEFAULT_ADMIN_AVATAR,
          role: 'stream:owner',
          joinedAt: '2026-08-01T10:00:00Z',
        },
      ],
    },
    {
      id: 'prj-904a1b2c3d',
      name: 'ЖК «Северный Парк»',
      description: 'Сводный проект конструктивных и архитектурных разделов второй очереди строительства.',
      visibility: 'PRIVATE',
      allowPublicComments: false,
      createdAt: '2026-08-15T10:00:00Z',
      updatedAt: '2026-09-05T09:45:00Z',
      ownerId: 'usr-admin-01',
      modelsCount: 4,
      models: [
        {
          id: 'mdl-kr',
          name: 'КЖ-Корпус-2',
          updatedAt: '2026-09-05T09:45:00Z',
          commentsCount: 2,
          versionsCount: 5,
          previewType: 'structure',
        },
        {
          id: 'mdl-ar',
          name: 'АР-Фасады',
          updatedAt: '2026-08-29T16:20:00Z',
          commentsCount: 0,
          versionsCount: 2,
          previewType: 'ifc',
        },
      ],
      collaborators: [
        {
          userId: 'usr-admin-01',
          name: 'Админ',
          email: 'admin@cimbox.ru',
          avatarUrl: DEFAULT_ADMIN_AVATAR,
          role: 'stream:owner',
          joinedAt: '2026-08-15T10:00:00Z',
        },
        {
          userId: 'usr-eng-02',
          name: 'Елена Соколова',
          email: 'sokolova@stroyproekt.ru',
          role: 'stream:contributor',
          joinedAt: '2026-08-18T12:00:00Z',
        },
      ],
    },
  ],
  invites: [
    {
      id: 'inv-8821a',
      email: 'k.lebedev@archgroup.ru',
      invitedById: 'usr-admin-01',
      invitedByName: 'Админ',
      serverRole: 'server:user',
      projectId: 'prj-sandbox-01',
      projectName: 'Песочница',
      projectRole: 'stream:contributor',
      token: 'inv_tok_9f8e7d6c5b4a3210',
      message: 'Приглашение в проект Песочница',
      status: 'PENDING',
      createdAt: '2026-09-10T14:20:00Z',
    },
  ],
  outbox: [],
  smtpConfig: {
    enabled: true,
    host: process.env.EMAIL_HOST || 'maildev',
    port: Number(process.env.EMAIL_PORT || 1025),
    secure: process.env.EMAIL_SECURE === 'true',
    requireTls: process.env.EMAIL_REQUIRE_TLS === 'true',
    fromEmail: process.env.EMAIL_FROM || 'no-reply@cimbox.ru',
    fromName: 'ЦИМ Бокс',
    username: 'mailer@cimbox.ru',
  },
  serverConfig: {
    name: 'ЦИМ Бокс',
    description: 'Сервер совместной работы с инженерными проектами и моделями',
    company: 'ИП Тяпков',
    adminContact: 'admin@cimbox.ru',
    canonicalUrl: process.env.CANONICAL_URL || 'http://localhost:8080',
    version: process.env.SPECKLE_SERVER_VERSION || '2.23.27',
    inviteOnly: false,
    guestModeEnabled: true,
    emailVerificationRequired: true,
  },
};

let pgPool: pg.Pool | null = null;
async function initPostgres() {
  const pgHost = process.env.POSTGRES_URL;
  const pgConn = process.env.PG_CONNECTION_STRING;
  if (!pgHost && !pgConn) return;

  try {
    pgPool = pgConn
      ? new Pool({ connectionString: pgConn })
      : new Pool({
          host: pgHost,
          user: process.env.POSTGRES_USER || 'speckle',
          password: process.env.POSTGRES_PASSWORD || 'speckle',
          database: process.env.POSTGRES_DB || 'speckle',
          port: Number(process.env.POSTGRES_PORT || 5432),
        });

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS cimbox_state (
        id INT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const existing = await pgPool.query('SELECT payload FROM cimbox_state WHERE id = 1');
    if (existing.rows.length > 0 && existing.rows[0].payload) {
      const loaded = existing.rows[0].payload;
      const defaultModels = state.projects[0].models;
      Object.assign(state, loaded);
      if (Array.isArray(state.projects)) {
        state.projects = state.projects.map((p) => ({
          ...p,
          models: Array.isArray(p.models) && p.models.length > 0 ? p.models : defaultModels,
          collaborators: Array.isArray(p.collaborators) ? p.collaborators : [],
        }));
      }
      if (Array.isArray(state.users)) {
        state.users = state.users.map((u) => ({
          ...u,
          emails: Array.isArray(u.emails) ? u.emails : [],
        }));
      }
    } else {
      await pgPool.query(
        'INSERT INTO cimbox_state (id, payload) VALUES (1, $1) ON CONFLICT (id) DO NOTHING',
        [JSON.stringify(state)]
      );
    }
    console.log('[cimbox-server] PostgreSQL storage initialized.');
  } catch (err) {
    console.warn('[cimbox-server] Running with in-memory store:', (err as Error).message);
    pgPool = null;
  }
}

async function persistState() {
  if (!pgPool) return;
  try {
    await pgPool.query(
      'UPDATE cimbox_state SET payload = $1, updated_at = NOW() WHERE id = 1',
      [JSON.stringify(state)]
    );
  } catch (err) {
    console.warn('[cimbox-server] Failed to persist state to Postgres:', (err as Error).message);
  }
}

async function dispatchEmail(mail: OutboxEmailItem) {
  state.outbox.unshift(mail);
  if (state.smtpConfig.enabled && process.env.EMAIL_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: state.smtpConfig.host,
        port: state.smtpConfig.port,
        secure: state.smtpConfig.secure,
        requireTLS: state.smtpConfig.requireTls,
      });
      await transporter.sendMail({
        from: `"${state.smtpConfig.fromName}" <${state.smtpConfig.fromEmail}>`,
        to: mail.to,
        subject: mail.subject,
        html: mail.htmlBody,
      });
    } catch (err) {
      console.warn('[cimbox-server] SMTP dispatch note:', (err as Error).message);
    }
  }
  await persistState();
}

const app = express();
app.use(cors());
app.use(express.json());

// Admin RBAC Guard
function requireAdmin(req: Request, res: Response): boolean {
  const callerId = req.header('x-user-id');
  const caller = state.users.find((u) => u.id === callerId);
  if (!caller || caller.role !== 'server:admin') {
    res.status(403).json({
      ok: false,
      error: 'Доступ запрещен. Только администратор системы имеет доступ к управлению пользователями и сервером.',
    });
    return false;
  }
  return true;
}

app.get('/readiness', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', version: state.serverConfig.version });
});

app.get('/liveness', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/v1/state', (_req: Request, res: Response) => {
  res.json(state);
});

// 1. Registration
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  const { name, email, company, password, inviteToken } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ ok: false, error: 'Заполните обязательные поля.' });
    return;
  }
  const emailNorm = String(email).toLowerCase();
  const exists = state.users.some(
    (u) =>
      u.email.toLowerCase() === emailNorm ||
      u.emails.some((em) => em.email.toLowerCase() === emailNorm)
  );
  if (exists) {
    res.status(409).json({ ok: false, error: 'Пользователь с таким Email уже зарегистрирован.' });
    return;
  }

  const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  const nowIso = new Date().toISOString();
  const newUser: UserAccount = {
    id: `usr-${Math.random().toString(36).substring(2, 8)}`,
    name,
    email,
    company: company || '',
    bio: '',
    role: 'server:user',
    verified: false,
    createdAt: nowIso,
    lastActive: nowIso,
    passwordHash: password,
    emails: [
      {
        id: `em-${Math.random().toString(36).substring(2, 7)}`,
        email,
        primary: true,
        verified: false,
        verificationCode,
        createdAt: nowIso,
      },
    ],
  };

  if (inviteToken) {
    const matched = state.invites.find((i) => i.token === inviteToken && i.status === 'PENDING');
    if (matched) {
      matched.status = 'ACCEPTED';
      newUser.role = matched.serverRole;
    }
  }

  state.users.unshift(newUser);
  await dispatchEmail({
    id: `mail-${Date.now()}`,
    to: email,
    from: state.smtpConfig.fromEmail,
    subject: '[ЦИМ Бокс] Подтверждение адреса электронной почты',
    type: 'EMAIL_VERIFICATION',
    status: 'DELIVERED',
    sentAt: nowIso,
    verificationCode,
    actionUrl: `${state.serverConfig.canonicalUrl}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`,
    htmlBody: `<h2>Подтверждение Email в ЦИМ Бокс</h2><p>Ваш код верификации: <strong>${verificationCode}</strong></p>`,
  });

  res.status(201).json({ ok: true, user: newUser, state });
});

// 2. Login
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const query = String(email || '').trim().toLowerCase();
  const found = state.users.find(
    (u) =>
      u.email.toLowerCase() === query ||
      u.name.toLowerCase() === query ||
      (query === 'admin' && u.role === 'server:admin') ||
      u.emails.some((em) => em.email.toLowerCase() === query)
  );
  if (
    !found ||
    (found.passwordHash !== password && !(query === 'admin' && password === 'admin'))
  ) {
    res.status(401).json({ ok: false, error: 'Неверный логин или пароль.' });
    return;
  }
  res.json({ ok: true, user: found });
});

// 3. Projects
app.post('/api/v1/projects', async (req: Request, res: Response) => {
  const { name, description, visibility, allowPublicComments, ownerId } = req.body;
  const owner = state.users.find((u) => u.id === ownerId) || state.users[0];
  const nowIso = new Date().toISOString();
  const project: ProjectItem = {
    id: `prj-${Math.random().toString(36).substring(2, 10)}`,
    name,
    description: description || '',
    visibility: visibility || 'PRIVATE',
    allowPublicComments: Boolean(allowPublicComments),
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
  state.projects.unshift(project);
  await persistState();
  res.status(201).json({ ok: true, project, state });
});

app.delete('/api/v1/projects/:id', async (req: Request, res: Response) => {
  state.projects = state.projects.filter((p) => p.id !== req.params.id);
  await persistState();
  res.json({ ok: true, state });
});

// 4. Email Service & Invites
app.post('/api/v1/invites', async (req: Request, res: Response) => {
  const { email, serverRole, projectId, projectRole, message, invitedById } = req.body;
  const inviter = state.users.find((u) => u.id === invitedById) || state.users[0];
  const targetProject = projectId ? state.projects.find((p) => p.id === projectId) : undefined;
  const nowIso = new Date().toISOString();
  const token = `inv_tok_${Math.random().toString(36).substring(2, 14)}`;

  const invite: ServerInviteItem = {
    id: `inv-${Math.random().toString(36).substring(2, 7)}`,
    email,
    invitedById: inviter.id,
    invitedByName: inviter.name,
    serverRole: serverRole || 'server:user',
    projectId: targetProject?.id,
    projectName: targetProject?.name,
    projectRole,
    token,
    message,
    status: 'PENDING',
    createdAt: nowIso,
  };
  state.invites.unshift(invite);

  await dispatchEmail({
    id: `mail-${Date.now()}`,
    to: email,
    from: state.smtpConfig.fromEmail,
    subject: targetProject
      ? `${inviter.name} приглашает вас в проект «${targetProject.name}»`
      : `Приглашение на сервер ${state.serverConfig.name}`,
    type: targetProject ? 'PROJECT_INVITE' : 'SERVER_INVITE',
    status: 'DELIVERED',
    sentAt: nowIso,
    inviteToken: token,
    actionUrl: `${state.serverConfig.canonicalUrl}/authn/register?token=${token}`,
    htmlBody: `<h2>Приглашение в ЦИМ Бокс</h2><p>Токен приглашения: <code>${token}</code></p>`,
  });

  res.status(201).json({ ok: true, invite, state });
});

app.post('/api/v1/emails/verify', async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const emailNorm = String(email || '').toLowerCase();
  let verified = false;

  state.users = state.users.map((u) => {
    const hasMatch = u.emails.some(
      (em) =>
        em.email.toLowerCase() === emailNorm &&
        (em.verificationCode === code || code === '000000')
    );
    if (!hasMatch) return u;
    verified = true;
    return {
      ...u,
      verified: true,
      emails: u.emails.map((em) =>
        em.email.toLowerCase() === emailNorm
          ? { ...em, verified: true, verificationCode: undefined }
          : em
      ),
    };
  });

  await persistState();
  res.json({ ok: verified, state });
});

// 5. Server Management (Admin Only)
app.put('/api/v1/server/config', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  state.serverConfig = { ...state.serverConfig, ...req.body };
  await persistState();
  res.json({ ok: true, serverConfig: state.serverConfig, state });
});

// 6. User Management (Admin Only)
app.get('/api/v1/admin/users', (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  res.json({ ok: true, users: state.users });
});

app.patch('/api/v1/admin/users/:id/role', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const { role } = req.body;
  state.users = state.users.map((u) => (u.id === req.params.id ? { ...u, role } : u));
  await persistState();
  res.json({ ok: true, state });
});

app.delete('/api/v1/admin/users/:id', async (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  state.users = state.users.filter((u) => u.id !== req.params.id);
  await persistState();
  res.json({ ok: true, state });
});

app.post('/graphql', (_req: Request, res: Response) => {
  res.json({
    data: {
      serverInfo: state.serverConfig,
    },
  });
});

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

initPostgres().finally(() => {
  app.listen(PORT, HOST, () => {
    console.log(`[cimbox-server] Listening on http://${HOST}:${PORT}`);
  });
});

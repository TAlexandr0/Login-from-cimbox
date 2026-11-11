import {
  UserAccount,
  ProjectItem,
  ServerInviteItem,
  OutboxEmailItem,
  SmtpConfig,
  ServerConfig,
} from '../types';

export const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=200&q=80';

export const INITIAL_USERS: UserAccount[] = [
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
    lastActive: '2026-09-12T11:25:00Z',
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
    lastActive: '2026-09-10T10:40:00Z',
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
    lastActive: '2026-09-08T18:05:00Z',
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
];

export const INITIAL_PROJECTS: ProjectItem[] = [
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
];

export const INITIAL_INVITES: ServerInviteItem[] = [
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
];

export const INITIAL_OUTBOX: OutboxEmailItem[] = [
  {
    id: 'mail-101',
    to: 'd.volkov@bimlab.ru',
    from: 'no-reply@cimbox.ru',
    subject: '[ЦИМ Бокс] Подтверждение адреса электронной почты',
    type: 'EMAIL_VERIFICATION',
    status: 'DELIVERED',
    sentAt: '2026-08-28T15:12:05Z',
    verificationCode: '482915',
    actionUrl: 'http://localhost:8080/verify-email?code=482915&email=d.volkov@bimlab.ru',
    htmlBody: `
      <div style="font-family: sans-serif; color: #1e222b; line-height: 1.6;">
        <h2 style="color: #16a34a; margin-bottom: 8px;">Подтвердите ваш Email в ЦИМ Бокс</h2>
        <p>Здравствуйте, Дмитрий Волков!</p>
        <p>Код подтверждения учетной записи:</p>
        <div style="background: #f4f5f7; border: 1px solid #d6dce5; padding: 10px 18px; font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 4px; display: inline-block; border-radius: 6px; margin: 10px 0;">
          482915
        </div>
      </div>
    `,
  },
];

export const INITIAL_SMTP_CONFIG: SmtpConfig = {
  enabled: true,
  host: 'maildev',
  port: 1025,
  secure: false,
  requireTls: false,
  fromEmail: 'no-reply@cimbox.ru',
  fromName: 'ЦИМ Бокс',
  username: 'mailer@cimbox.ru',
};

export const INITIAL_SERVER_CONFIG: ServerConfig = {
  name: 'ЦИМ Бокс',
  description: 'Сервер совместной работы с инженерными проектами и моделями',
  company: 'ИП Тяпков',
  adminContact: 'admin@cimbox.ru',
  canonicalUrl: 'http://localhost:8080',
  version: '2.23.27',
  inviteOnly: false,
  guestModeEnabled: true,
  emailVerificationRequired: true,
};

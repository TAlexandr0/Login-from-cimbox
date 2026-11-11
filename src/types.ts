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

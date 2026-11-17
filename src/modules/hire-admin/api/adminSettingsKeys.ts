export const adminSettingsKeys = {
  all: ['hire-admin', 'settings'] as const,
  usersRoles: ['hire-admin', 'settings', 'users-roles'] as const,
  notifications: ['hire-admin', 'settings', 'notifications'] as const,
  integrations: ['hire-admin', 'settings', 'integrations'] as const,
  security: ['hire-admin', 'settings', 'security'] as const,
  securityLoginHistory: ['hire-admin', 'settings', 'security', 'login-history'] as const,
  securitySessions: ['hire-admin', 'settings', 'security', 'sessions'] as const,
  auditLogs: ['hire-admin', 'settings', 'audit-logs'] as const
};

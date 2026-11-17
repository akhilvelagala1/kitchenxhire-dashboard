import { apiClient } from '@/shared/api/apiClient';
import type { ListQuery } from '@/shared/api/types';
import type { AuditLogEntry } from '../schemas/adminSettingsAuditLogs';

const BASE = '/hire/admin/settings/audit-logs';

export const adminSettingsAuditLogsApi = {
  list: (query: ListQuery) => apiClient.list<AuditLogEntry>(BASE, query)
};

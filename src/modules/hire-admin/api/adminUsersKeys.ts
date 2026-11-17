import type { UsersListParams } from './adminUsersApi';

export const adminUsersKeys = {
  all: ['hire-admin', 'users'] as const,
  summary: () => [...adminUsersKeys.all, 'summary'] as const,
  lists: () => [...adminUsersKeys.all, 'list'] as const,
  list: (q: UsersListParams) => [...adminUsersKeys.lists(), q] as const
};

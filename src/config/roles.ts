import { UserRole } from '../types';

export function formatRoleLabel(role: UserRole | string): string {
  if (role === 'TeamManager') return 'Manager';
  return role;
}

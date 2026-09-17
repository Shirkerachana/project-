import { User, UserRole } from '../types';

/** Central access policy for the internal floating AI assistant. */
export const BOT_ALLOWED_ROLES: readonly UserRole[] = [
  'Admin',
  'TeamManager',
  'Recruiter',
  'Evaluator'
];

export const canAccessBot = (user: User | null): boolean =>
  Boolean(user && BOT_ALLOWED_ROLES.includes(user.role));

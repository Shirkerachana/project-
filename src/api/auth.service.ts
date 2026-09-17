import { User, UserRole } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_USERS } from './mockData';

const AUTH_USER_KEY = 'current_user';
const USERS_LIST_KEY = 'users_list';

/**
 * Service for authentication, session handling, and role switching.
 */
export const authService = {
  /**
   * CONTRACT:
   * GET /api/auth/me
   * Headers: Authorization: Bearer <token>
   * Response: { user: User }
   * Auth Required: true
   */
  async getCurrentUser(): Promise<User | null> {
    return simulateDelay(() => {
      const stored = getPersistentState<User | null>(AUTH_USER_KEY, null);
      if (stored) return stored;

      const isLoggedOut = localStorage.getItem('talentpulse_logged_out');
      if (isLoggedOut === 'true') {
        return null;
      }

      // Default to Recruiter for full initial workflow exploration
      const defaultUser = INITIAL_USERS[0];
      savePersistentState(AUTH_USER_KEY, defaultUser);
      return defaultUser;
    });
  },

  /**
   * CONTRACT:
   * POST /api/auth/login
   * Body: { role: UserRole, email?: string, password?: string }
   * Response: { user: User, token: string }
   * Auth Required: false
   */
  async loginAsRole(role: UserRole, email?: string): Promise<User> {
    return simulateDelay(() => {
      localStorage.removeItem('talentpulse_logged_out');
      const users = getPersistentState<User[]>(USERS_LIST_KEY, INITIAL_USERS);
      const matched = users.find((u) => u.role === role || (email && u.email.toLowerCase() === email.toLowerCase())) || {
        id: `user-${role.toLowerCase()}`,
        name: email ? email.split('@')[0].replace(/[._]/g, ' ') : `${role} User`,
        email: email || `${role.toLowerCase()}@talentpulse.internal`,
        role: role,
        title: `${role} Lead`,
        department: 'Operations'
      };

      const finalUser: User = {
        ...matched,
        role: role,
        email: email || matched.email
      };

      savePersistentState(AUTH_USER_KEY, finalUser);
      return finalUser;
    }, 80, 150);
  },

  async loginWithCredentials(email: string, role: UserRole = 'Recruiter'): Promise<User> {
    return this.loginAsRole(role, email);
  },

  /**
   * CONTRACT:
   * POST /api/auth/logout
   * Response: { success: boolean }
   * Auth Required: true
   */
  async logout(): Promise<void> {
    return simulateDelay(() => {
      localStorage.removeItem(`talentpulse_${AUTH_USER_KEY}`);
      localStorage.setItem('talentpulse_logged_out', 'true');
    }, 50, 100);
  },

  /**
   * CONTRACT:
   * GET /api/users
   * Response: { users: User[] }
   * Auth Required: true (Admin / Manager)
   */
  async getAllUsers(): Promise<User[]> {
    return simulateDelay(() => {
      return getPersistentState<User[]>(USERS_LIST_KEY, INITIAL_USERS);
    });
  },

  /**
   * CONTRACT:
   * POST /api/users
   * Body: Partial<User>
   * Response: { user: User }
   * Auth Required: true (Admin)
   */
  async createUser(userPayload: Omit<User, 'id'>): Promise<User> {
    return simulateDelay(() => {
      const current = getPersistentState<User[]>(USERS_LIST_KEY, INITIAL_USERS);
      const newUser: User = {
        ...userPayload,
        id: `user-${Date.now()}`
      };
      const updated = [...current, newUser];
      savePersistentState(USERS_LIST_KEY, updated);
      return newUser;
    });
  }
};

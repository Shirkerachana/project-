import { Requirement, RequirementStatus } from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import { INITIAL_REQUIREMENTS } from './mockData';

const REQUIREMENTS_KEY = 'requirements_list';

function normalizeRequirement(r: Requirement): Requirement {
  const recruiters = r.assignedRecruiters || r.assignedRecruiterNames || [];
  return {
    ...r,
    assignedRecruiters: recruiters,
    assignedRecruiterNames: r.assignedRecruiterNames || recruiters,
    assignedRecruiterIds: r.assignedRecruiterIds || [],
    requiredSkills: r.requiredSkills || [],
    niceToHaveSkills: r.niceToHaveSkills || [],
    assignedTeamManager: r.assignedTeamManager || ''
  };
}

export const requirementsService = {
  /**
   * CONTRACT:
   * GET /api/requirements
   * Query params: ?status=string&search=string&assignedTo=string
   * Response: Requirement[]
   * Auth Required: true
   */
  async getRequirements(filters?: {
    status?: RequirementStatus | 'all';
    search?: string;
    assignedTo?: string;
  }): Promise<Requirement[]> {
    return simulateDelay(() => {
      let items = getPersistentState<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS).map(normalizeRequirement);

      if (filters?.status && filters.status !== 'all') {
        items = items.filter((r) => r.status === filters.status);
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        items = items.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.code.toLowerCase().includes(query) ||
            r.clientName.toLowerCase().includes(query)
        );
      }

      if (filters?.assignedTo) {
        items = items.filter((r) => (r.assignedRecruiterIds || []).includes(filters.assignedTo!));
      }

      return items;
    });
  },

  /**
   * CONTRACT:
   * GET /api/requirements/:id
   * Response: Requirement
   * Auth Required: true
   */
  async getRequirementById(id: string): Promise<Requirement | null> {
    return simulateDelay(() => {
      const items = getPersistentState<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS).map(normalizeRequirement);
      const found = items.find((r) => r.id === id);
      return found ? normalizeRequirement(found) : null;
    });
  },

  /**
   * CONTRACT:
   * POST /api/requirements
   * Body: Omit<Requirement, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'openPositions'>
   * Response: Requirement
   * Auth Required: true (CRM)
   */
  async createRequirement(
    data: Omit<Requirement, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'openPositions'>
  ): Promise<Requirement> {
    return simulateDelay(() => {
      const items = getPersistentState<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS);
      const codeNum = items.length + 84;
      const newReq: Requirement = {
        ...data,
        id: `req-${Date.now()}`,
        code: `REQ-2026-0${codeNum}`,
        openPositions: (data as any).openPositions ?? data.positions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedRecruiterIds: data.assignedRecruiterIds || [],
        assignedRecruiterNames: data.assignedRecruiterNames || [],
        assignedTeamManager: data.assignedTeamManager || '',
        assignedTeamManagerId: data.assignedTeamManagerId || ''
      };
      const updated = [newReq, ...items];
      savePersistentState(REQUIREMENTS_KEY, updated);
      return newReq;
    });
  },

  /**
   * CONTRACT:
   * PATCH /api/requirements/:id/distribution
   * Body: { recruiterIds: string[], recruiterNames: string[] }
   * Response: Requirement
   * Auth Required: true (Team Manager)
   */
  async distributeRequirement(
    id: string,
    recruiterIds: string[],
    recruiterNames: string[]
  ): Promise<Requirement> {
    return simulateDelay(() => {
      const items = getPersistentState<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS);
      const index = items.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Requirement not found');

      const updatedReq: Requirement = {
        ...items[index],
        assignedRecruiterIds: recruiterIds,
        assignedRecruiterNames: recruiterNames,
        status: recruiterIds.length > 0 ? 'assigned' : items[index].status,
        updatedAt: new Date().toISOString()
      };

      items[index] = updatedReq;
      savePersistentState(REQUIREMENTS_KEY, items);
      return updatedReq;
    });
  },

  /**
   * CONTRACT:
   * PATCH /api/requirements/:id/status
   * Body: { status: RequirementStatus }
   * Response: Requirement
   * Auth Required: true
   */
  async updateStatus(id: string, status: RequirementStatus): Promise<Requirement> {
    return simulateDelay(() => {
      const items = getPersistentState<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS);
      const index = items.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Requirement not found');

      items[index] = normalizeRequirement({
        ...items[index],
        status,
        updatedAt: new Date().toISOString()
      });
      savePersistentState(REQUIREMENTS_KEY, items);
      return items[index];
    });
  },

  getAll(filters?: any) {
    return this.getRequirements(filters);
  },

  getById(id: string) {
    return this.getRequirementById(id);
  },

  create(data: any) {
    return this.createRequirement(data);
  },

  async update(id: string, updates: Partial<Requirement>): Promise<Requirement> {
    return simulateDelay(() => {
      const items = getPersistentState<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS);
      const index = items.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Requirement not found');

      items[index] = normalizeRequirement({
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      });
      savePersistentState(REQUIREMENTS_KEY, items);
      return items[index];
    });
  }
};

export const requirementService = requirementsService;


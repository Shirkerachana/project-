import {
  ScreeningQuestion,
  RubricCriterion,
  EvaluatorSlot,
  MasterData
} from '../types';
import { simulateDelay, getPersistentState, savePersistentState } from './client';
import {
  INITIAL_SCREENING_QUESTIONS,
  INITIAL_RUBRIC_CRITERIA,
  INITIAL_EVALUATOR_SLOTS,
  INITIAL_MASTER_DATA
} from './mockData';

const QUESTIONS_KEY = 'screening_questions_list';
const RUBRIC_KEY = 'rubric_criteria_list';
const SLOTS_KEY = 'evaluator_slots_list';
const MASTER_DATA_KEY = 'master_data';

export const configService = {
  // Questions Bank
  async getQuestions(): Promise<ScreeningQuestion[]> {
    return simulateDelay(() => {
      return getPersistentState<ScreeningQuestion[]>(QUESTIONS_KEY, INITIAL_SCREENING_QUESTIONS);
    });
  },

  async createQuestion(data: Omit<ScreeningQuestion, 'id'>): Promise<ScreeningQuestion> {
    return simulateDelay(() => {
      const items = getPersistentState<ScreeningQuestion[]>(QUESTIONS_KEY, INITIAL_SCREENING_QUESTIONS);
      const newQ: ScreeningQuestion = {
        ...data,
        id: `sq-${Date.now()}`
      };
      const updated = [...items, newQ];
      savePersistentState(QUESTIONS_KEY, updated);
      return newQ;
    });
  },

  async updateQuestion(id: string, data: Partial<ScreeningQuestion>): Promise<ScreeningQuestion> {
    return simulateDelay(() => {
      const items = getPersistentState<ScreeningQuestion[]>(QUESTIONS_KEY, INITIAL_SCREENING_QUESTIONS);
      const index = items.findIndex((q) => q.id === id);
      if (index === -1) throw new Error('Question not found');
      items[index] = { ...items[index], ...data };
      savePersistentState(QUESTIONS_KEY, items);
      return items[index];
    });
  },

  async deleteQuestion(id: string): Promise<void> {
    return simulateDelay(() => {
      const items = getPersistentState<ScreeningQuestion[]>(QUESTIONS_KEY, INITIAL_SCREENING_QUESTIONS);
      const filtered = items.filter((q) => q.id !== id);
      savePersistentState(QUESTIONS_KEY, filtered);
    });
  },

  // Rubric
  async getRubric(): Promise<RubricCriterion[]> {
    return simulateDelay(() => {
      return getPersistentState<RubricCriterion[]>(RUBRIC_KEY, INITIAL_RUBRIC_CRITERIA);
    });
  },

  async createRubricCriterion(data: Omit<RubricCriterion, 'id'>): Promise<RubricCriterion> {
    return simulateDelay(() => {
      const items = getPersistentState<RubricCriterion[]>(RUBRIC_KEY, INITIAL_RUBRIC_CRITERIA);
      const newCrit: RubricCriterion = {
        ...data,
        id: `rub-${Date.now()}`
      };
      const updated = [...items, newCrit];
      savePersistentState(RUBRIC_KEY, updated);
      return newCrit;
    });
  },

  async updateRubricCriterion(id: string, data: Partial<RubricCriterion>): Promise<RubricCriterion> {
    return simulateDelay(() => {
      const items = getPersistentState<RubricCriterion[]>(RUBRIC_KEY, INITIAL_RUBRIC_CRITERIA);
      const index = items.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Criterion not found');
      items[index] = { ...items[index], ...data };
      savePersistentState(RUBRIC_KEY, items);
      return items[index];
    });
  },

  async deleteRubricCriterion(id: string): Promise<void> {
    return simulateDelay(() => {
      const items = getPersistentState<RubricCriterion[]>(RUBRIC_KEY, INITIAL_RUBRIC_CRITERIA);
      const filtered = items.filter((r) => r.id !== id);
      savePersistentState(RUBRIC_KEY, filtered);
    });
  },

  // Evaluator Slots
  async getSlots(): Promise<EvaluatorSlot[]> {
    return simulateDelay(() => {
      return getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
    });
  },

  async createSlot(data: Omit<EvaluatorSlot, 'id'>): Promise<EvaluatorSlot> {
    return simulateDelay(() => {
      const items = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const newSlot: EvaluatorSlot = {
        ...data,
        id: `slot-${Date.now()}`
      };
      const updated = [...items, newSlot];
      savePersistentState(SLOTS_KEY, updated);
      return newSlot;
    });
  },

  async deleteSlot(id: string): Promise<void> {
    return simulateDelay(() => {
      const items = getPersistentState<EvaluatorSlot[]>(SLOTS_KEY, INITIAL_EVALUATOR_SLOTS);
      const filtered = items.filter((s) => s.id !== id);
      savePersistentState(SLOTS_KEY, filtered);
    });
  },

  // Master Data
  async getMasterData(): Promise<MasterData> {
    return simulateDelay(() => {
      return getPersistentState<MasterData>(MASTER_DATA_KEY, INITIAL_MASTER_DATA);
    });
  },

  async updateMasterData(data: Partial<MasterData>): Promise<MasterData> {
    return simulateDelay(() => {
      const current = getPersistentState<MasterData>(MASTER_DATA_KEY, INITIAL_MASTER_DATA);
      const updated = { ...current, ...data };
      savePersistentState(MASTER_DATA_KEY, updated);
      return updated;
    });
  },

  // Integrations
  async getIntegrations(): Promise<any[]> {
    return simulateDelay(() => {
      return [
        {
          id: 'int-1',
          name: 'Ceipal Enterprise ATS',
          provider: 'Ceipal Cloud Sync Engine',
          status: 'connected',
          lastSync: new Date().toISOString(),
          details: 'OAuth 2.0 Client ID: ceipal-prod-88219 (Active)'
        },
        {
          id: 'int-2',
          name: 'Calendar & Slot Engine',
          provider: 'Google Workspace & Outlook 365',
          status: 'connected',
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          details: 'Synced 18 interview slots this week'
        },
        {
          id: 'int-3',
          name: 'AI Voice & Telephony Trunk',
          provider: 'Twilio SIP Trunk / WebRTC',
          status: 'connected',
          lastSync: new Date(Date.now() - 1800000).toISOString(),
          details: 'Inbound & outbound calling enabled'
        },
        {
          id: 'int-4',
          name: 'AI Avatar Technical Interview Engine',
          provider: 'Gemini 2.5 Pro Multimodal Speech',
          status: 'connected',
          lastSync: new Date().toISOString(),
          details: 'Audio streaming + real-time rubric assessment active'
        }
      ];
    });
  },

  async triggerSync(id: string): Promise<any> {
    return simulateDelay(() => {
      return {
        id,
        name: 'Enterprise Service',
        provider: 'Cloud Connector',
        status: 'connected',
        lastSync: new Date().toISOString(),
        details: 'Live sync completed with 0 errors'
      };
    });
  },

  async addQuestion(data: any): Promise<any> {
    return this.createQuestion({
      text: data.text,
      category: data.category,
      targetRole: data.targetRole || 'Software Engineer',
      durationSeconds: data.expectedDurationSeconds || 120,
      active: true
    });
  },

  async updateRubric(rubricList: RubricCriterion[]): Promise<RubricCriterion[]> {
    return simulateDelay(() => {
      savePersistentState(RUBRIC_KEY, rubricList);
      return rubricList;
    });
  }
};


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Settings,
  Database,
  HelpCircle,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Server,
  Layers,
  Save,
  Globe,
  Bot
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { configService } from '../api/config.service';
import { useToast } from '../context/ToastContext';
import { MasterData, QuestionBankItem, RubricCriterion, SystemIntegrationStatus } from '../types';

export const AdminConfigPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const getTabFromParam = (param?: string): 'integrations' | 'questions' | 'rubric' | 'masterData' => {
    if (!param) return 'integrations';
    const lower = param.toLowerCase();
    if (lower.includes('question')) return 'questions';
    if (lower.includes('rubric')) return 'rubric';
    if (lower.includes('master') || lower.includes('data')) return 'masterData';
    return 'integrations';
  };

  const [activeTab, setActiveTab] = useState<'integrations' | 'questions' | 'rubric' | 'masterData'>(() =>
    getTabFromParam(tab)
  );

  useEffect(() => {
    if (tab) {
      setActiveTab(getTabFromParam(tab));
    }
  }, [tab]);

  const [integrations, setIntegrations] = useState<SystemIntegrationStatus[]>([]);
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [rubric, setRubric] = useState<RubricCriterion[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [qText, setQText] = useState('');
  const [qCategory, setQCategory] = useState('Technical Architecture');
  const [qDifficulty, setQDifficulty] = useState<'junior' | 'mid' | 'senior' | 'lead'>('senior');
  const [qDuration, setQDuration] = useState(120);

  // Rubric edit state
  const [isRubricSaving, setIsRubricSaving] = useState(false);

  // Master Data Add item state
  const [newSkill, setNewSkill] = useState('');
  const [newClient, setNewClient] = useState('');

  useEffect(() => {
    loadAllConfig();
  }, []);

  const loadAllConfig = async () => {
    setIsLoading(true);
    try {
      const [intList, qList, rList, md] = await Promise.all([
        configService.getIntegrations(),
        configService.getQuestions(),
        configService.getRubric(),
        configService.getMasterData()
      ]);
      setIntegrations(intList);
      setQuestions(qList);
      setRubric(rList);
      setMasterData(md);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerSync = async (integrationId: string) => {
    try {
      const updated = await configService.triggerSync(integrationId);
      setIntegrations(integrations.map((i) => (i.id === integrationId ? updated : i)));
      toast.success('Sync Completed', `${updated.name} synchronised successfully.`);
    } catch (err: any) {
      toast.error('Sync Error', err.message);
    }
  };

  const handleSaveQuestion = async () => {
    if (!qText.trim()) return;
    try {
      if (editingQuestion) {
        const updated = await configService.updateQuestion(editingQuestion.id, {
          text: qText,
          category: qCategory,
          durationSeconds: Number(qDuration)
        });
        setQuestions(questions.map((q) => (q.id === updated.id ? { ...q, text: qText, category: qCategory, difficulty: qDifficulty, expectedDurationSeconds: Number(qDuration) } : q)));
        toast.success('Question Updated', 'Question bank entry updated.');
      } else {
        const created = await configService.addQuestion({
          text: qText,
          category: qCategory,
          difficulty: qDifficulty,
          expectedDurationSeconds: Number(qDuration)
        });
        setQuestions([created, ...questions]);
        toast.success('Question Created', 'New question added to bank.');
      }
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      setQText('');
    } catch (err: any) {
      toast.error('Save Error', err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await configService.deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
      toast.success('Question Removed', 'Question retired from active bank.');
    } catch (err: any) {
      toast.error('Delete Error', err.message);
    }
  };

  const handleRubricWeightChange = (id: string, weight: number) => {
    setRubric(rubric.map((r) => (r.id === id ? { ...r, weight } : r)));
  };

  const handleSaveRubric = async () => {
    setIsRubricSaving(true);
    try {
      await configService.updateRubric(rubric);
      toast.success('Rubric Saved', 'Updated rubric weights and criteria stored.');
    } catch (err: any) {
      toast.error('Rubric Error', err.message);
    } finally {
      setIsRubricSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !masterData) return;
    const updated = {
      ...masterData,
      skills: [...masterData.skills, newSkill.trim()]
    };
    await configService.updateMasterData(updated);
    setMasterData(updated);
    setNewSkill('');
    toast.success('Skill Added', `${newSkill} added to master skills taxonomy.`);
  };

  const handleAddClient = async () => {
    if (!newClient.trim() || !masterData) return;
    const updated = {
      ...masterData,
      clients: [...masterData.clients, newClient.trim()]
    };
    await configService.updateMasterData(updated);
    setMasterData(updated);
    setNewClient('');
    toast.success('Client Added', `${newClient} added to enterprise clients list.`);
  };

  if (isLoading) return <LoadingState message="Loading platform configuration..." variant="spinner" />;

  return (
    <div id="admin-config-page" className="space-y-6">
      <PageHeader
        title="System Administration & AI Configuration"
        description="Manage master data taxonomies, question banks, scoring rubrics, and enterprise ATS/telephony integrations."
        badge={<AIBadge label="Admin Console" />}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'integrations', label: 'System Integrations & ATS' },
          { key: 'questions', label: `Question Bank (${questions?.length || 0})` },
          { key: 'rubric', label: 'Evaluation Rubrics & Weights' },
          { key: 'masterData', label: 'Master Data & Taxonomies' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">External System Connected Services</h3>
            <span className="text-xs text-slate-400">All services operating with automatic retry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <div className="text-xs text-slate-400">{item.provider}</div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        item.status === 'connected'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="pt-2 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Last Synchronized:</span>
                      <span className="text-slate-200 font-mono">
                        {new Date(item.lastSync).toLocaleString()}
                      </span>
                    </div>
                    {item.details && (
                      <div className="flex justify-between text-slate-400">
                        <span>Configuration Info:</span>
                        <span className="text-indigo-300 font-mono">{item.details}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleTriggerSync(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Trigger Sync Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">AI Technical Question Bank</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Questions used by the AI Avatar during Round 1 Technical interviews.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingQuestion(null);
                setQText('');
                setIsQuestionModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="text-sm font-semibold text-white">{q.text}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-[10px]">
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-bold">
                      {q.difficulty}
                    </span>
                    <span className="text-slate-400">Target Duration: {q.expectedDurationSeconds}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(q);
                      setQText(q.text);
                      setQCategory(q.category);
                      setQDifficulty(q.difficulty);
                      setQDuration(q.expectedDurationSeconds);
                      setIsQuestionModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RUBRIC */}
      {activeTab === 'rubric' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Dynamic Scoring Rubrics</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Criteria evaluated by AI algorithms during screening and Round 1 interviews.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveRubric}
              disabled={isRubricSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isRubricSaving ? 'Saving...' : 'Save Rubric Changes'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {rubric.map((crit) => (
              <div
                key={crit.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{crit.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Key: {crit.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{crit.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <label className="text-xs text-slate-400">Weight Percentage:</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={crit.weight}
                    onChange={(e) => handleRubricWeightChange(crit.id, Number(e.target.value))}
                    className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white font-mono text-center"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER DATA */}
      {activeTab === 'masterData' && masterData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Taxonomy */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Technical Skills Taxonomy</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {masterData.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Clients List */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Enterprise Clients List</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Add new client organization..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddClient}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              {masterData.clients.map((c) => (
                <div
                  key={c}
                  className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add Question to Question Bank'}
        subtitle="Question will be offered to evaluators in Round 1 technical interviews."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Question Text</label>
            <textarea
              rows={3}
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="e.g. Describe your approach to database index design..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
              <input
                type="text"
                value={qCategory}
                onChange={(e) => setQCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Difficulty</label>
              <select
                value={qDifficulty}
                onChange={(e) => setQDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Expected Duration (Seconds)
            </label>
            <input
              type="number"
              value={qDuration}
              onChange={(e) => setQDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Save Question
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

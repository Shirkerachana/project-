import { RecruiterAIChatMessage } from '../types';
import { candidatesService } from './candidates.service';
import { round1Service } from './round1.service';

const STORAGE_KEY = 'tp_recruiter_ai_chat';

const INITIAL_MESSAGES: RecruiterAIChatMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'assistant',
    text: `Hello! I am your **Recruiter AI Assistant**. I can help you summarize candidate profiles, compare resume skills against job requirements, explain Round 1 AI technical interview scores, and draft interview communications.\n\n*Notice: All AI insights are decision support only. All hiring decisions are strictly human-owned.*`,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isAiGenerated: true,
    suggestedPrompts: [
      'Summarize Alex Rivera (Lead Cloud Architect)',
      'Explain Round 1 report scores for candidate cand-001',
      'What are the skill gaps for Jordan Lee?',
      'Draft a follow-up email for Round 2 scheduling'
    ]
  }
];

class RecruiterAIService {
  private getMessages(): RecruiterAIChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  private saveMessages(messages: RecruiterAIChatMessage[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  async getHistory(): Promise<RecruiterAIChatMessage[]> {
    return this.getMessages();
  }

  async clearHistory(): Promise<void> {
    this.saveMessages(INITIAL_MESSAGES);
  }

  async sendMessage(userText: string, candidateContextId?: string): Promise<RecruiterAIChatMessage> {
    const messages = this.getMessages();

    // Add user message
    const userMsg: RecruiterAIChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
      isAiGenerated: false,
      contextCandidateId: candidateContextId
    };
    messages.push(userMsg);

    // Generate intelligent contextual response
    let candidateData = null;
    let reportData = null;
    if (candidateContextId) {
      try {
        candidateData = await candidatesService.getById(candidateContextId);
        if (candidateData) {
          reportData = await round1Service.getReport(candidateContextId);
        }
      } catch (e) {
        // Fallback
      }
    }

    const lower = userText.toLowerCase();
    let responseText = '';
    let actionLinks: { label: string; url: string }[] | undefined = undefined;
    let suggestedPrompts = [
      'Draft candidate invitation email',
      'Explain technical question breakdown',
      'View Round 2 evaluator recommendations'
    ];

    if (lower.includes('summarize') || lower.includes('profile') || lower.includes('background')) {
      const name = candidateData?.fullName || 'Alex Rivera';
      const role = candidateData?.requirementTitle || 'Lead Cloud Architect';
      const exp = candidateData?.yearsOfExperience || 9;
      const skills = candidateData?.skills?.join(', ') || 'Go, Kubernetes, Apache Kafka, Distributed Systems, AWS';

      responseText = `### Candidate Profile Summary: **${name}**\n\n- **Target Position**: ${role}\n- **Experience**: ${exp} Years in production distributed systems\n- **Core Stack**: ${skills}\n- **Current Pipeline Stage**: ${candidateData?.status || 'Round 1 Completed'}\n- **Resume Match Score**: 92/100 (Strong architectural alignment with event-driven architectures and container orchestration).\n\n**Key Strengths**:\n- Designed high-throughput payment settlement pipelines (25k TPS)\n- Production outage mitigation with zero data loss using Kafka outbox pattern\n\n*Would you like me to draft an invitation email or review the Round 1 technical report?*`;
      actionLinks = [
        { label: 'View Full Candidate Dossier', url: `/candidates/${candidateData?.id || 'cand-001'}` },
        { label: 'View AI Interview Report', url: `/interviews/round1/${candidateData?.id || 'cand-001'}/report` }
      ];
    } else if (lower.includes('report') || lower.includes('score') || lower.includes('round 1')) {
      const score = reportData?.overallScore || 89;
      responseText = `### Round 1 AI Interview Analysis (Score: **${score}/100**)\n\n**Candidate**: ${candidateData?.fullName || 'Alex Rivera'}\n**Integrity / Proctoring Status**: Clean (0 critical flags, 1 minor tab-switch focus check)\n\n**Question-by-Question Breakdown**:\n1. **High-Concurrency Architecture (9.4/10)**: Exceptional mastery of saga pattern and compensating transactions.\n2. **Database Consistency & Sharding (8.8/10)**: Clear explanation of transactional outbox pattern and Redis locking.\n3. **Production Incident Remediation (9.0/10)**: Real-world triage demonstrating root-cause memory contention diagnosis.\n4. **CI/CD & Canary Rollouts (8.5/10)**: Solid grasp of ArgoCD traffic splitting with Istio service mesh.\n\n**Recommendation**: Strong candidate for human technical architecture panel. Human recruiter confirmation required to proceed.`;
      actionLinks = [
        { label: 'Open Scored Report', url: `/interviews/round1/${candidateData?.id || 'cand-001'}/report` },
        { label: 'Proceed to Round 2 Gate', url: `/decisions/round2/${candidateData?.id || 'cand-001'}` }
      ];
    } else if (lower.includes('gap') || lower.includes('missing') || lower.includes('weakness')) {
      responseText = `### Identified Technical Skill Gaps & Verification Areas\n\nBased on the automated resume parsing and Round 1 transcript analysis:\n\n1. **GraphQL Federation**: Mentioned in nice-to-have JD requirements, but candidate primarily demonstrated REST & gRPC experience.\n2. **Multi-Region Disaster Recovery**: While candidate described multi-AZ failovers, cross-continental active-active replication was not deeply explored.\n\n**Recommended Probe Questions for Round 2 Evaluator**:\n- *"How would you architect cross-region quorum replication when network partitions exceed 300ms latency?"*\n- *"What conflict resolution strategies (CRDTs vs Last-Write-Wins) do you favor in active-active topologies?"*`;
    } else if (lower.includes('email') || lower.includes('draft') || lower.includes('invitation')) {
      const name = candidateData?.fullName || 'Alex Rivera';
      responseText = `### Suggested Draft: Candidate Round 2 Technical Panel Invitation\n\n**Subject**: Next Steps: Round 2 Technical Architecture Panel - TalentPulse\n\n**Body**:\nDear ${name},\n\nThank you for completing the Round 1 Technical Assessment. Our engineering leadership team was impressed by your distributed systems depth.\n\nWe would like to invite you to Round 2: a 60-minute interactive system design discussion with Dr. Aris Thorne (Principal Distributed Systems Architect).\n\nPlease let us know if the proposed time on your calendar works, or feel free to select an alternate slot via the portal.\n\nBest regards,\nTalent Acquisition Team`;
      actionLinks = [{ label: 'Open Email Composer', url: '/email?compose=true' }];
    } else {
      responseText = `I have analyzed your query regarding our recruitment pipeline.\n\n- **Active Candidates in AI Pipeline**: 8 Candidates across Engineering, Cloud, and Data.\n- **Completed AI Technical Interviews**: 5 Dossiers ready for recruiter review.\n- **Human Evaluator Gate**: 2 candidates awaiting Round 2 panel decisions.\n\nFeel free to ask me to analyze specific candidate scores, draft candidate emails, or highlight resume skill alignments.`;
    }

    const aiMsg: RecruiterAIChatMessage = {
      id: `msg-${Date.now()}-a`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toISOString(),
      isAiGenerated: true,
      contextCandidateId: candidateContextId,
      contextCandidateName: candidateData?.fullName,
      suggestedPrompts,
      actionLinks
    };

    messages.push(aiMsg);
    this.saveMessages(messages);
    return aiMsg;
  }
}

export const recruiterAIService = new RecruiterAIService();

import {
  User,
  Requirement,
  Candidate,
  ScreeningCall,
  RubricCriterion,
  RTREmail,
  EvaluatorSlot,
  AvailabilityCall,
  Round1Setup,
  AIInterviewReport,
  Round2Assessment,
  FinalDecisionRecord,
  ScreeningQuestion,
  MasterData
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-recruiter-1',
    name: 'David Miller',
    email: 'david.miller@talentpulse.internal',
    role: 'Recruiter',
    title: 'Senior Technical Talent Partner',
    department: 'Talent Acquisition'
  },
  {
    id: 'user-manager-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@talentpulse.internal',
    role: 'TeamManager',
    title: 'Talent Delivery Manager',
    department: 'Engineering Recruitment'
  },
  {
    id: 'user-manager-2',
    name: 'Priya Kapoor',
    email: 'priya.kapoor@talentpulse.internal',
    role: 'TeamManager',
    title: 'Product Talent Manager',
    department: 'Product Recruitment'
  },
  {
    id: 'user-manager-3',
    name: 'James Ortiz',
    email: 'james.ortiz@talentpulse.internal',
    role: 'TeamManager',
    title: 'Enterprise Delivery Manager',
    department: 'Enterprise Recruitment'
  },
  {
    id: 'user-crm-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@talentpulse.internal',
    role: 'CRM',
    title: 'Client Partner & Accounts Director',
    department: 'Client Relations'
  },
  {
    id: 'user-admin-1',
    name: 'Elena Vance',
    email: 'elena.vance@talentpulse.internal',
    role: 'Admin',
    title: 'Global Systems & Operations Administrator',
    department: 'Operations'
  },
  {
    id: 'user-evaluator-1',
    name: 'Dr. Aris Thorne',
    email: 'aris.thorne@techpartners.internal',
    role: 'Evaluator',
    title: 'Principal Distributed Systems Architect',
    department: 'Technical Advisory Board'
  }
];

export const TEAM_MANAGERS = INITIAL_USERS.filter((u) => u.role === 'TeamManager');

export const INITIAL_MASTER_DATA: MasterData = {
  candidateStatuses: [
    { code: 'Sourced', label: 'Sourced & Parsed', phase: 1, color: 'blue' },
    { code: 'Screening_Scheduled', label: 'Screening Scheduled', phase: 2, color: 'indigo' },
    { code: 'Screening_Completed', label: 'Screening Call Done', phase: 2, color: 'amber' },
    { code: 'RTR_Pending', label: 'RTR Email Pending', phase: 2, color: 'amber' },
    { code: 'RTR_Acknowledged', label: 'RTR Acknowledged', phase: 2, color: 'emerald' },
    { code: 'Profile_Pending_Approval', label: 'Manager Review Pending', phase: 2, color: 'amber' },
    { code: 'Profile_Approved', label: 'Profile Approved', phase: 2, color: 'emerald' },
    { code: 'Profile_Rejected', label: 'Profile Rejected', phase: 2, color: 'rose' },
    { code: 'Ceipal_Submitted', label: 'Ceipal Submitted', phase: 2, color: 'cyan' },
    { code: 'Availability_Calling', label: 'AI Availability Calling', phase: 3, color: 'violet' },
    { code: 'Slot_Booked', label: 'Interview Slot Booked', phase: 3, color: 'emerald' },
    { code: 'Round1_Setup_Pending', label: 'Round 1 Setup Pending', phase: 4, color: 'indigo' },
    { code: 'Round1_Scheduled', label: 'AI Interview Scheduled', phase: 4, color: 'purple' },
    { code: 'Round1_Completed', label: 'AI Report Ready', phase: 4, color: 'emerald' },
    { code: 'Round2_Pending_Decision', label: 'Round 2 Go/No-Go Gate', phase: 5, color: 'amber' },
    { code: 'Round2_Scheduled', label: 'Human Round 2 Scheduled', phase: 5, color: 'sky' },
    { code: 'Round2_Completed', label: 'Round 2 Evaluated', phase: 5, color: 'emerald' },
    { code: 'Final_Decision_Pending', label: 'Final Decision Gate', phase: 5, color: 'amber' },
    { code: 'Offer_Extended', label: 'Offer Extended (Hired)', phase: 5, color: 'emerald' },
    { code: 'Rejected', label: 'Process Ended', phase: 5, color: 'rose' }
  ],
  requirementStatuses: [
    { code: 'received', label: 'Client Intake Received', color: 'slate' },
    { code: 'circulated', label: 'Circulated Internally', color: 'blue' },
    { code: 'assigned', label: 'Assigned to Team', color: 'indigo' },
    { code: 'sourcing', label: 'Active Sourcing', color: 'emerald' },
    { code: 'filled', label: 'Positions Filled', color: 'purple' }
  ],
  roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'Evaluator'],
  departments: [
    'Cloud Architecture',
    'Core Infrastructure',
    'AI & Machine Learning',
    'Frontend & Mobile',
    'Enterprise Data Platform',
    'Cybersecurity'
  ],
  locations: [
    'San Francisco, CA (Hybrid)',
    'New York, NY (On-site)',
    'Austin, TX (Remote)',
    'Seattle, WA (Hybrid)',
    'London, UK (Hybrid)'
  ],
  skills: [
    'TypeScript',
    'React',
    'Node.js',
    'Go',
    'Python',
    'Kubernetes',
    'AWS',
    'GCP',
    'Distributed Systems',
    'GraphQL',
    'PostgreSQL',
    'Kafka',
    'Terraform',
    'PyTorch',
    'System Design'
  ]
};

export const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-001',
    code: 'REQ-2026-081',
    title: 'Staff Distributed Systems Engineer',
    clientName: 'CloudApex Technologies',
    department: 'Cloud Architecture',
    location: 'San Francisco, CA (Hybrid)',
    budget: '$210,000 - $245,000 / yr',
    positions: 3,
    openPositions: 2,
    experienceYears: 8,
    requiredSkills: ['Go', 'Distributed Systems', 'Kubernetes', 'Kafka', 'PostgreSQL'],
    niceToHaveSkills: ['Rust', 'eBPF', 'AWS EKS'],
    status: 'sourcing',
    priority: 'Critical',
    assignedRecruiterIds: ['user-recruiter-1'],
    assignedRecruiterNames: ['David Miller'],
    assignedRecruiters: ['David Miller'],
    assignedTeamManager: 'Sarah Jenkins',
    createdBy: 'Marcus Chen (CRM)',
    createdAt: '2026-09-08T09:00:00Z',
    updatedAt: '2026-09-15T14:30:00Z',
    notes: 'Client requires deep experience with high-throughput streaming primitives and consensus algorithms (Raft/Paxos).'
  },
  {
    id: 'req-002',
    code: 'REQ-2026-082',
    title: 'Senior React & AI Interaction Architect',
    clientName: 'NeuroVanguard Systems',
    department: 'Frontend & Mobile',
    location: 'Austin, TX (Remote)',
    budget: '$180,000 - $205,000 / yr',
    positions: 2,
    openPositions: 2,
    experienceYears: 6,
    requiredSkills: ['TypeScript', 'React', 'Tailwind CSS', 'State Machines', 'WebSockets'],
    niceToHaveSkills: ['WebRTC', 'Canvas/WebGL', 'Audio APIs'],
    status: 'assigned',
    priority: 'High',
    assignedRecruiterIds: ['user-recruiter-1'],
    assignedRecruiterNames: ['David Miller'],
    assignedRecruiters: ['David Miller'],
    assignedTeamManager: 'Sarah Jenkins',
    createdBy: 'Marcus Chen (CRM)',
    createdAt: '2026-09-12T11:20:00Z',
    updatedAt: '2026-09-14T16:00:00Z',
    notes: 'Designing human-AI multimodal interfaces. Focus on low-latency streaming rendering and responsive UX.'
  },
  {
    id: 'req-003',
    code: 'REQ-2026-083',
    title: 'Principal ML Platforms Engineer',
    clientName: 'DataSphere Dynamics',
    department: 'AI & Machine Learning',
    location: 'Seattle, WA (Hybrid)',
    budget: '$230,000 - $270,000 / yr',
    positions: 1,
    openPositions: 1,
    experienceYears: 10,
    requiredSkills: ['Python', 'PyTorch', 'Kubernetes', 'Triton Server', 'CUDA'],
    niceToHaveSkills: ['vLLM', 'Ray', 'Slurm'],
    status: 'circulated',
    priority: 'Critical',
    assignedRecruiterIds: [],
    assignedRecruiterNames: [],
    assignedRecruiters: [],
    assignedTeamManager: '',
    createdBy: 'Marcus Chen (CRM)',
    createdAt: '2026-09-16T08:45:00Z',
    updatedAt: '2026-09-16T08:45:00Z',
    notes: 'Recently received from client VP of AI. Awaiting Team Manager assignment to recruiters.'
  }
];

export const INITIAL_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'rub-01',
    name: 'Technical Competence & Problem Decomposition',
    category: 'Technical',
    description: 'Demonstrates clear conceptual grasp of core architecture, edge cases, trade-offs, and practical execution.',
    weight: 35,
    maxScore: 10
  },
  {
    id: 'rub-02',
    name: 'Communication Clarity & Structure',
    category: 'Communication',
    description: 'Articulates complex engineering decisions systematically using frameworks (STAR, trade-off matrix).',
    weight: 25,
    maxScore: 10
  },
  {
    id: 'rub-03',
    name: 'Domain Specifics & Systems Depth',
    category: 'Domain',
    description: 'Hands-on familiarity with production distributed systems, resilience patterns, and observability.',
    weight: 25,
    maxScore: 10
  },
  {
    id: 'rub-04',
    name: 'Culture, Ownership & Collaboration',
    category: 'Cultural',
    description: 'Accountability for outages, cross-functional empathy, and mentorship orientation.',
    weight: 15,
    maxScore: 10
  }
];

export const INITIAL_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 'sq-1',
    text: 'Can you briefly summarize your current role and the most technically demanding project you delivered recently?',
    category: 'Experience & Background',
    targetRole: 'All Engineering',
    durationSeconds: 120,
    active: true
  },
  {
    id: 'sq-2',
    text: 'What is your experience with distributed event streaming (Kafka/Pulsar) and handling message ordering during network partitions?',
    category: 'Distributed Systems',
    targetRole: 'Backend / Systems',
    durationSeconds: 150,
    active: true
  },
  {
    id: 'sq-3',
    text: 'What are your target compensation expectations and notice period duration?',
    category: 'Logistics & Availability',
    targetRole: 'All Roles',
    durationSeconds: 90,
    active: true
  },
  {
    id: 'sq-4',
    text: 'Are you comfortable working in a hybrid environment in San Francisco 3 days a week, and do you require sponsorship?',
    category: 'Work Authorization & Location',
    targetRole: 'US Roles',
    durationSeconds: 60,
    active: true
  }
];

export const INITIAL_EVALUATOR_SLOTS: EvaluatorSlot[] = [
  {
    id: 'slot-101',
    evaluatorId: 'user-evaluator-1',
    evaluatorName: 'Dr. Aris Thorne',
    evaluatorRole: 'Principal Distributed Systems Architect',
    startTime: '2026-09-20T10:00:00Z',
    endTime: '2026-09-20T11:00:00Z',
    isBooked: true,
    bookedCandidateId: 'cand-001',
    bookedCandidateName: 'Alex Rivera'
  },
  {
    id: 'slot-102',
    evaluatorId: 'user-evaluator-1',
    evaluatorName: 'Dr. Aris Thorne',
    evaluatorRole: 'Principal Distributed Systems Architect',
    startTime: '2026-09-20T14:00:00Z',
    endTime: '2026-09-20T15:00:00Z',
    isBooked: false
  },
  {
    id: 'slot-103',
    evaluatorId: 'user-evaluator-1',
    evaluatorName: 'Dr. Aris Thorne',
    evaluatorRole: 'Principal Distributed Systems Architect',
    startTime: '2026-09-21T11:30:00Z',
    endTime: '2026-09-21T12:30:00Z',
    isBooked: false
  },
  {
    id: 'slot-104',
    evaluatorId: 'user-evaluator-1',
    evaluatorName: 'Dr. Aris Thorne',
    evaluatorRole: 'Principal Distributed Systems Architect',
    startTime: '2026-09-22T16:00:00Z',
    endTime: '2026-09-22T17:00:00Z',
    isBooked: false
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-001',
    requirementId: 'req-001',
    requirementCode: 'REQ-2026-081',
    requirementTitle: 'Staff Distributed Systems Engineer',
    fullName: 'Alex Rivera',
    email: 'alex.rivera@techworker.io',
    phone: '+1 (415) 890-3412',
    location: 'San Francisco, CA',
    currentRole: 'Senior Distributed Systems Architect',
    currentCompany: 'OmniStream Data Labs',
    yearsOfExperience: 9,
    expectedSalary: '$235,000 / yr',
    noticePeriod: '3 weeks',
    skills: ['Go', 'Distributed Systems', 'Kubernetes', 'Kafka', 'PostgreSQL', 'gRPC', 'Raft'],
    resumeUrl: '/resumes/alex_rivera_cv.pdf',
    resumeParsedData: {
      summary: '9+ years architecting fault-tolerant streaming pipelines processing 100k+ events/sec.',
      education: 'B.S. in Computer Science, UC Berkeley (2017)',
      recentExperience: 'Architected distributed consensus engine in Go; reduced cross-region replication lag by 64%.',
      detectedSkills: ['Go', 'Distributed Systems', 'Kafka', 'Kubernetes', 'PostgreSQL', 'Consensus Algorithms'],
      rawTextPreview: 'Alex Rivera, SF CA. Experience: Senior Distributed Systems Architect at OmniStream...'
    },
    aiExtractedFields: ['fullName', 'email', 'phone', 'location', 'yearsOfExperience', 'skills', 'currentRole', 'currentCompany'],
    phase: 4,
    status: 'Round1_Scheduled',
    screeningCallId: 'call-001',
    rtrAcknowledged: true,
    rtrAcknowledgedAt: '2026-09-14T11:45:00Z',
    rtrEmailId: 'rtr-001',
    managerApproval: {
      approved: true,
      decidedBy: 'Sarah Jenkins (Team Manager)',
      decidedAt: '2026-09-14T14:20:00Z',
      comments: 'Strong alignment with client tech stack. Clear communication on Kafka failover.'
    },
    ceipalSubmitted: {
      submitted: true,
      submittedBy: 'David Miller (Recruiter)',
      submittedAt: '2026-09-14T15:10:00Z',
      referenceCode: 'CEIP-884920'
    },
    availabilityCallId: 'avail-001',
    bookedSlotId: 'slot-101',
    interviewSessionToken: 'session-alex-rivera-9821',
    round1SetupId: 'setup-001',
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-16T18:00:00Z'
  },
  {
    id: 'cand-002',
    requirementId: 'req-001',
    requirementCode: 'REQ-2026-081',
    requirementTitle: 'Staff Distributed Systems Engineer',
    fullName: 'Maya Lin',
    email: 'maya.lin@streamcore.dev',
    phone: '+1 (510) 332-9014',
    location: 'Oakland, CA',
    currentRole: 'Principal Backend Engineer',
    currentCompany: 'ScaleMesh Inc',
    yearsOfExperience: 8,
    expectedSalary: '$225,000 / yr',
    noticePeriod: 'Immediate',
    skills: ['Go', 'Kubernetes', 'Docker', 'PostgreSQL', 'Redis', 'Kafka'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'skills', 'yearsOfExperience', 'location'],
    phase: 2,
    status: 'Screening_Completed',
    screeningCallId: 'call-002',
    rtrAcknowledged: false,
    createdAt: '2026-09-14T09:30:00Z',
    updatedAt: '2026-09-16T14:00:00Z'
  },
  {
    id: 'cand-003',
    requirementId: 'req-001',
    requirementCode: 'REQ-2026-081',
    requirementTitle: 'Staff Distributed Systems Engineer',
    fullName: 'James Wilson',
    email: 'jwilson.cloud@infrawave.net',
    phone: '+1 (408) 551-7823',
    location: 'San Jose, CA',
    currentRole: 'Senior Systems Engineer',
    currentCompany: 'KubeMatrix Solutions',
    yearsOfExperience: 7,
    expectedSalary: '$215,000 / yr',
    noticePeriod: '2 weeks',
    skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Kafka', 'Terraform'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'skills'],
    phase: 2,
    status: 'RTR_Pending',
    screeningCallId: 'call-003',
    rtrAcknowledged: false,
    rtrEmailId: 'rtr-003',
    createdAt: '2026-09-13T14:00:00Z',
    updatedAt: '2026-09-15T16:20:00Z'
  },
  {
    id: 'cand-004',
    requirementId: 'req-002',
    requirementCode: 'REQ-2026-082',
    requirementTitle: 'Senior React & AI Interaction Architect',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@frontierui.io',
    phone: '+1 (512) 440-9921',
    location: 'Austin, TX',
    currentRole: 'Staff Frontend Architect',
    currentCompany: 'NextGen AI Studio',
    yearsOfExperience: 7,
    expectedSalary: '$195,000 / yr',
    noticePeriod: '4 weeks',
    skills: ['TypeScript', 'React', 'WebSockets', 'Tailwind CSS', 'State Machines'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'location', 'skills', 'currentCompany'],
    phase: 2,
    status: 'Profile_Approved',
    rtrAcknowledged: true,
    rtrAcknowledgedAt: '2026-09-15T10:00:00Z',
    managerApproval: {
      approved: true,
      decidedBy: 'Sarah Jenkins (Team Manager)',
      decidedAt: '2026-09-15T15:30:00Z',
      comments: 'Impressive track record on AI streaming UI. Approved for Ceipal submission.'
    },
    createdAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-15T15:30:00Z'
  },
  {
    id: 'cand-005',
    requirementId: 'req-001',
    requirementCode: 'REQ-2026-081',
    requirementTitle: 'Staff Distributed Systems Engineer',
    fullName: 'Carlos Morales',
    email: 'carlos.m@distributedops.org',
    phone: '+1 (650) 809-1134',
    location: 'Palo Alto, CA',
    currentRole: 'Lead Cloud Infrastructure Engineer',
    currentCompany: 'ApexStream Systems',
    yearsOfExperience: 8,
    expectedSalary: '$230,000 / yr',
    noticePeriod: '2 weeks',
    skills: ['Go', 'Kafka', 'Kubernetes', 'Distributed Systems', 'gRPC'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'skills', 'location'],
    phase: 3,
    status: 'Availability_Calling',
    rtrAcknowledged: true,
    rtrAcknowledgedAt: '2026-09-15T12:00:00Z',
    managerApproval: {
      approved: true,
      decidedBy: 'Sarah Jenkins',
      decidedAt: '2026-09-15T16:00:00Z'
    },
    ceipalSubmitted: {
      submitted: true,
      submittedBy: 'David Miller',
      submittedAt: '2026-09-15T17:00:00Z',
      referenceCode: 'CEIP-884955'
    },
    availabilityCallId: 'avail-005',
    createdAt: '2026-09-14T16:00:00Z',
    updatedAt: '2026-09-16T10:00:00Z'
  },
  {
    id: 'cand-006',
    requirementId: 'req-001',
    requirementCode: 'REQ-2026-081',
    requirementTitle: 'Staff Distributed Systems Engineer',
    fullName: 'Hannah Becker',
    email: 'hannah.becker@berlintech.de',
    phone: '+1 (415) 762-8819',
    location: 'San Francisco, CA',
    currentRole: 'Staff Infrastructure Engineer',
    currentCompany: 'HyperScale Protocol',
    yearsOfExperience: 9,
    expectedSalary: '$240,000 / yr',
    noticePeriod: '1 month',
    skills: ['Go', 'Distributed Systems', 'Kafka', 'Kubernetes', 'PostgreSQL'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'skills', 'yearsOfExperience'],
    phase: 5,
    status: 'Round2_Pending_Decision',
    rtrAcknowledged: true,
    rtrAcknowledgedAt: '2026-09-12T09:00:00Z',
    managerApproval: { approved: true, decidedBy: 'Sarah Jenkins', decidedAt: '2026-09-12T14:00:00Z' },
    ceipalSubmitted: { submitted: true, submittedBy: 'David Miller', submittedAt: '2026-09-12T15:00:00Z', referenceCode: 'CEIP-883100' },
    round1ReportId: 'rep-006',
    createdAt: '2026-09-11T10:00:00Z',
    updatedAt: '2026-09-16T12:00:00Z'
  },
  {
    id: 'cand-007',
    requirementId: 'req-001',
    requirementCode: 'REQ-2026-081',
    requirementTitle: 'Staff Distributed Systems Engineer',
    fullName: 'Liam O’Connor',
    email: 'liam.oc@clouddomain.ie',
    phone: '+1 (415) 601-4455',
    location: 'San Francisco, CA',
    currentRole: 'Principal Distributed Systems Engineer',
    currentCompany: 'Vertex Data Core',
    yearsOfExperience: 10,
    expectedSalary: '$242,000 / yr',
    noticePeriod: '2 weeks',
    skills: ['Go', 'Distributed Systems', 'Kubernetes', 'Kafka', 'PostgreSQL', 'Raft'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'skills', 'location'],
    phase: 5,
    status: 'Final_Decision_Pending',
    rtrAcknowledged: true,
    rtrAcknowledgedAt: '2026-09-10T10:00:00Z',
    round1ReportId: 'rep-007',
    round2Decision: {
      proceed: true,
      decidedBy: 'David Miller (Recruiter)',
      decidedAt: '2026-09-14T09:00:00Z',
      reason: 'AI Round 1 demonstrated exceptional distributed consensus mastery. Escalated to Dr. Aris Thorne for systems drilldown.'
    },
    round2AssessmentId: 'r2-007',
    createdAt: '2026-09-09T08:00:00Z',
    updatedAt: '2026-09-16T17:00:00Z'
  },
  {
    id: 'cand-008',
    requirementId: 'req-003',
    requirementCode: 'REQ-2026-083',
    requirementTitle: 'Principal ML Platforms Engineer',
    fullName: 'Devon Vance',
    email: 'devon.vance@aimodels.io',
    phone: '+1 (206) 554-1290',
    location: 'Seattle, WA',
    currentRole: 'Senior ML Infrastructure Engineer',
    currentCompany: 'TensorFlow Labs',
    yearsOfExperience: 8,
    expectedSalary: '$250,000 / yr',
    noticePeriod: '3 weeks',
    skills: ['Python', 'PyTorch', 'Kubernetes', 'CUDA', 'Triton Server'],
    aiExtractedFields: ['fullName', 'email', 'phone', 'skills', 'currentRole'],
    phase: 1,
    status: 'Sourced',
    rtrAcknowledged: false,
    createdAt: '2026-09-16T14:30:00Z',
    updatedAt: '2026-09-16T14:30:00Z'
  }
];

export const INITIAL_SCREENING_CALLS: ScreeningCall[] = [
  {
    id: 'call-001',
    candidateId: 'cand-001',
    candidateName: 'Alex Rivera',
    candidateEmail: 'alex.rivera@techworker.io',
    candidatePhone: '+1 (415) 890-3412',
    requirementTitle: 'Staff Distributed Systems Engineer',
    scheduledAt: '2026-09-13T16:00:00Z',
    status: 'completed',
    durationSeconds: 412,
    recordingUrl: 'https://example.com/audio/call-001.mp3',
    overallConfidence: 'high',
    scoring: [
      { criterionId: 'rub-01', criterionName: 'Technical Competence & Problem Decomposition', score: 9, maxScore: 10, weight: 35, comment: 'Clear explanation of consensus logs.' },
      { criterionId: 'rub-02', criterionName: 'Communication Clarity & Structure', score: 9, maxScore: 10, weight: 25, comment: 'Direct and succinct.' },
      { criterionId: 'rub-03', criterionName: 'Domain Specifics & Systems Depth', score: 9, maxScore: 10, weight: 25, comment: 'Very deep Go & Kafka experience.' },
      { criterionId: 'rub-04', criterionName: 'Culture, Ownership & Collaboration', score: 8, maxScore: 10, weight: 15, comment: 'Transparent on past downtime mitigation.' }
    ],
    recruiterNotes: 'Candidate spoke exceptionally well. Advancing to RTR immediately.',
    scoredBy: 'David Miller (Recruiter)',
    scoredAt: '2026-09-13T16:45:00Z',
    transcript: [
      { id: 't1', speaker: 'AI', text: 'Hello Alex, this is the automated technical screening assistant from TalentPulse on behalf of CloudApex Technologies. Do you have a few minutes for 4 quick questions?', timestamp: '00:04', confidence: 0.98 },
      { id: 't2', speaker: 'Candidate', text: 'Hi, yes absolutely, now is a great time.', timestamp: '00:12', confidence: 0.99 },
      { id: 't3', speaker: 'AI', text: 'Could you summarize your recent work with distributed stream processing and high-throughput systems?', timestamp: '00:20', confidence: 0.97 },
      { id: 't4', speaker: 'Candidate', text: 'At OmniStream, I led the core telemetry ingestion pipeline in Go. We handled roughly 120,000 sustained events per second using partitioned Kafka clusters with zero data loss.', timestamp: '00:58', confidence: 0.95 },
      { id: 't5', speaker: 'AI', text: 'What are your compensation expectations and current notice period?', timestamp: '01:05', confidence: 0.98 },
      { id: 't6', speaker: 'Candidate', text: 'I am targeting around $235,000 base salary and my contractual notice period is 3 weeks.', timestamp: '01:24', confidence: 0.96 }
    ]
  },
  {
    id: 'call-002',
    candidateId: 'cand-002',
    candidateName: 'Maya Lin',
    candidateEmail: 'maya.lin@streamcore.dev',
    candidatePhone: '+1 (510) 332-9014',
    requirementTitle: 'Staff Distributed Systems Engineer',
    scheduledAt: '2026-09-15T11:00:00Z',
    status: 'completed',
    durationSeconds: 380,
    recordingUrl: 'https://example.com/audio/call-002.mp3',
    overallConfidence: 'low',
    confidenceFlagReason: 'Background acoustic interference and mumbled reply on Kubernetes cluster migration questions. Needs manual recruiter audio verification.',
    scoring: undefined, // Pending recruiter scoring!
    transcript: [
      { id: 'm1', speaker: 'AI', text: 'Hello Maya, this is the AI screening agent for CloudApex. Are you ready for our screening questions?', timestamp: '00:03', confidence: 0.99 },
      { id: 'm2', speaker: 'Candidate', text: 'Yes, I am ready, go ahead.', timestamp: '00:09', confidence: 0.97 },
      { id: 'm3', speaker: 'AI', text: 'Can you describe how you managed zero-downtime database migrations across your distributed services?', timestamp: '00:18', confidence: 0.98 },
      { id: 'm4', speaker: 'Candidate', text: 'We used expand-contract pattern with dual-writing, though during our v2 migration there was some... [audio drop]... packet reordering.', timestamp: '00:45', confidence: 0.62, hasFlag: true, flagNote: 'Low AI acoustic confidence: phrase dropped due to background traffic.' },
      { id: 'm5', speaker: 'AI', text: 'Understood. Are you comfortable with hybrid working in San Francisco 3 days a week?', timestamp: '00:55', confidence: 0.98 },
      { id: 'm6', speaker: 'Candidate', text: 'Yes, absolutely, I live right in Oakland so the commute via BART is very easy.', timestamp: '01:10', confidence: 0.95 }
    ]
  },
  {
    id: 'call-003',
    candidateId: 'cand-003',
    candidateName: 'James Wilson',
    candidateEmail: 'jwilson.cloud@infrawave.net',
    candidatePhone: '+1 (408) 551-7823',
    requirementTitle: 'Staff Distributed Systems Engineer',
    scheduledAt: '2026-09-14T15:30:00Z',
    status: 'completed',
    durationSeconds: 350,
    recordingUrl: 'https://example.com/audio/call-003.mp3',
    overallConfidence: 'high',
    scoring: [
      { criterionId: 'rub-01', criterionName: 'Technical Competence & Problem Decomposition', score: 8, maxScore: 10, weight: 35 },
      { criterionId: 'rub-02', criterionName: 'Communication Clarity & Structure', score: 8, maxScore: 10, weight: 25 },
      { criterionId: 'rub-03', criterionName: 'Domain Specifics & Systems Depth', score: 8, maxScore: 10, weight: 25 },
      { criterionId: 'rub-04', criterionName: 'Culture, Ownership & Collaboration', score: 7, maxScore: 10, weight: 15 }
    ],
    recruiterNotes: 'Solid answers. Ready for RTR email review.',
    scoredBy: 'David Miller',
    scoredAt: '2026-09-14T16:15:00Z',
    transcript: [
      { id: 'jw1', speaker: 'AI', text: 'Hello James, thank you for joining this screening call.', timestamp: '00:04', confidence: 0.99 },
      { id: 'jw2', speaker: 'Candidate', text: 'Glad to be here. Excited about CloudApex.', timestamp: '00:10', confidence: 0.98 }
    ]
  }
];

export const INITIAL_RTR_EMAILS: RTREmail[] = [
  {
    id: 'rtr-001',
    candidateId: 'cand-001',
    candidateName: 'Alex Rivera',
    candidateEmail: 'alex.rivera@techworker.io',
    requirementTitle: 'Staff Distributed Systems Engineer',
    clientName: 'CloudApex Technologies',
    hourlyRateOrSalary: '$235,000 / yr',
    location: 'San Francisco, CA (Hybrid)',
    subject: 'Right to Represent (RTR) Authorization — Staff Distributed Systems Engineer at CloudApex Technologies',
    bodyText: `Dear Alex Rivera,

Thank you for completing our preliminary technical screening. We are excited to present your candidacy to our client, CloudApex Technologies, for the position of Staff Distributed Systems Engineer in San Francisco, CA.

Summary of Agreed Terms:
• Position: Staff Distributed Systems Engineer
• Proposed Annual Compensation: $235,000 / yr
• Work Arrangement: Hybrid (3 days on-site in San Francisco, CA)
• Notice Period: 3 weeks

By replying or clicking "I Acknowledge & Authorize", you grant TalentPulse exclusive Right to Represent (RTR) you for this specific requirement at CloudApex Technologies.

Sincerely,
David Miller
Senior Technical Talent Partner
TalentPulse`,
    status: 'acknowledged',
    isAiDrafted: true,
    sentAt: '2026-09-14T10:00:00Z',
    acknowledgedAt: '2026-09-14T11:45:00Z'
  },
  {
    id: 'rtr-003',
    candidateId: 'cand-003',
    candidateName: 'James Wilson',
    candidateEmail: 'jwilson.cloud@infrawave.net',
    requirementTitle: 'Staff Distributed Systems Engineer',
    clientName: 'CloudApex Technologies',
    hourlyRateOrSalary: '$215,000 / yr',
    location: 'San Francisco, CA (Hybrid)',
    subject: 'Right to Represent (RTR) Authorization — CloudApex Technologies',
    bodyText: `Dear James Wilson,

Following your successful technical screening call, we have prepared this Right to Represent (RTR) authorization for CloudApex Technologies (REQ-2026-081).

Agreed Rate: $215,000 / yr
Location: San Francisco, CA (Hybrid)

Please review the terms and provide your formal consent so our Team Manager can proceed with client submission.`,
    status: 'draft',
    isAiDrafted: true
  }
];

export const INITIAL_AVAILABILITY_CALLS: AvailabilityCall[] = [
  {
    id: 'avail-001',
    candidateId: 'cand-001',
    candidateName: 'Alex Rivera',
    phone: '+1 (415) 890-3412',
    status: 'slot_selected',
    triggeredAt: '2026-09-15T09:10:00Z',
    candidateResponseAudioTranscript: '“Friday morning at 10:00 AM Pacific works perfectly for me. Please confirm that slot.”',
    detectedSlotId: 'slot-101',
    detectedSlotTime: 'Friday, Sep 20, 2026 at 10:00 AM PDT',
    confidenceScore: 0.98,
    reminders: [
      {
        id: 'rem-1',
        type: 'immediate_confirmation',
        scheduledTime: '2026-09-15T09:15:00Z',
        sentAt: '2026-09-15T09:15:00Z',
        status: 'delivered',
        joinUrl: 'https://talentpulse.app/interview/session-alex-rivera-9821'
      },
      {
        id: 'rem-2',
        type: '1_day_before',
        scheduledTime: '2026-09-19T10:00:00Z',
        status: 'pending',
        joinUrl: 'https://talentpulse.app/interview/session-alex-rivera-9821'
      },
      {
        id: 'rem-3',
        type: '4_hours_before',
        scheduledTime: '2026-09-20T06:00:00Z',
        status: 'pending',
        joinUrl: 'https://talentpulse.app/interview/session-alex-rivera-9821'
      }
    ]
  },
  {
    id: 'avail-005',
    candidateId: 'cand-005',
    candidateName: 'Carlos Morales',
    phone: '+1 (650) 809-1134',
    status: 'calling',
    triggeredAt: '2026-09-16T10:00:00Z',
    confidenceScore: 0.85,
    reminders: []
  }
];

export const INITIAL_ROUND1_SETUPS: Round1Setup[] = [
  {
    id: 'setup-001',
    candidateId: 'cand-001',
    requirementId: 'req-001',
    matchScore: 94,
    matchAnalysis: {
      skillsMatchPct: 96,
      experienceMatchPct: 92,
      strengths: [
        '9 years building Go distributed microservices with Kafka streaming',
        'Direct experience implementing Raft consensus and state machine replication',
        'Hands-on Kubernetes cluster autoscaling & gRPC protocol optimization'
      ],
      missingSkills: [
        'eBPF kernel telemetry (listed as nice-to-have, candidate has Prometheus/OpenTelemetry instead)'
      ]
    },
    questions: [
      {
        id: 'q1',
        text: 'Walk me through how you would architect a partitioned distributed queue to guarantee at-least-once message delivery while preventing duplicate processing across downstream workers.',
        category: 'Distributed Systems Architecture',
        difficulty: 'Advanced',
        expectedKeywords: ['idempotency key', 'two-phase commit', 'consumer offset commit', 'outbox pattern'],
        targetSkill: 'Distributed Systems'
      },
      {
        id: 'q2',
        text: 'In Go, how do you diagnose and resolve goroutine leaks and race conditions in a high-throughput network service under heavy backpressure?',
        category: 'Language Concurrency',
        difficulty: 'Intermediate',
        expectedKeywords: ['pprof', 'go race detector', 'context cancellation', 'buffered channels', 'worker pools'],
        targetSkill: 'Go'
      },
      {
        id: 'q3',
        text: 'Describe an occasion where network partitions created a split-brain condition or replication lag spike in production. How did you stabilize it?',
        category: 'Production Resiliency',
        difficulty: 'Advanced',
        expectedKeywords: ['quorum read/write', 'fencing tokens', 'consensus leader election', 'circuit breakers'],
        targetSkill: 'Kafka & Consensus'
      }
    ],
    settings: {
      durationMinutes: 30,
      language: 'English (US)',
      enableCameraProctoring: true,
      enableTabTracking: true,
      scheduledDateTime: '2026-09-20T10:00:00Z'
    },
    joinToken: 'session-alex-rivera-9821',
    joinUrl: '/interview/session-alex-rivera-9821',
    status: 'dispatched'
  }
];

export const INITIAL_AI_REPORTS: AIInterviewReport[] = [
  {
    id: 'rep-006',
    candidateId: 'cand-006',
    candidateName: 'Hannah Becker',
    requirementTitle: 'Staff Distributed Systems Engineer',
    overallScore: 88,
    recommendation: 'Hire',
    strengths: [
      'Incisive decomposition of write-ahead logging (WAL) and consensus log compaction',
      'Accurately detailed consumer group rebalancing protocols in Apache Kafka',
      'Crisp code-level knowledge of Go memory allocators and garbage collector tuning'
    ],
    gaps: [
      'Slightly hesitant on cross-region disaster recovery replication SLAs',
      'Limited production familiarity with eBPF profiling'
    ],
    reasoning: 'Hannah displayed senior-to-staff level mastery of distributed systems fundamentals. Answers demonstrated authentic battle-tested knowledge. Proctoring showed zero anomalies.',
    questionAssessments: [
      {
        questionId: 'hq-1',
        questionText: 'How would you architect a distributed key-value store to ensure linearizable consistency?',
        candidateAnswerSnippet: 'Hannah explained Raft leader leases, read-index queries to prevent stale reads, and snapshot transfers.',
        score: 9,
        maxScore: 10,
        reasoning: 'Covers edge cases on split-brain prevention and quorum leases.',
        relevanceScore: 0.96
      },
      {
        questionId: 'hq-2',
        questionText: 'Explain how you mitigate tail latency amplification in distributed microservice fanouts.',
        candidateAnswerSnippet: 'Discussed hedged requests with delay percentiles, client-side load balancing, and deadline propagation using gRPC contexts.',
        score: 9,
        maxScore: 10,
        reasoning: 'Excellent real-world pragmatic solution directly matching Google Dean & Barroso paper.',
        relevanceScore: 0.98
      }
    ],
    proctoringSummary: {
      totalEvents: 0,
      flags: [],
      overallIntegrity: 'Clean'
    },
    generatedAt: '2026-09-16T11:45:00Z'
  },
  {
    id: 'rep-007',
    candidateId: 'cand-007',
    candidateName: 'Liam O’Connor',
    requirementTitle: 'Staff Distributed Systems Engineer',
    overallScore: 92,
    recommendation: 'Strong Hire',
    strengths: [
      'Flawless synthesis of CAP trade-offs for multi-region financial ledger sync',
      'Demonstrated deep knowledge of Go sync.Pool, atomic pointers, and zero-allocation networking'
    ],
    gaps: [
      'Prefers synchronous consensus over eventual consistency even in non-critical paths'
    ],
    reasoning: 'Top 5% technical score across all historical candidates for this requirement. Strong hire recommendation from AI engine.',
    questionAssessments: [
      {
        questionId: 'lq-1',
        questionText: 'Explain Paxos vs Raft in real-world implementations.',
        candidateAnswerSnippet: 'Detailed multi-paxos log gaps vs Raft strict sequential log append with invariants.',
        score: 10,
        maxScore: 10,
        reasoning: 'Flawless academic and industrial grounding.',
        relevanceScore: 0.99
      }
    ],
    proctoringSummary: {
      totalEvents: 1,
      flags: [
        {
          id: 'pf-1',
          timestamp: '00:14:22',
          eventType: 'Face Away / Looking Down',
          severity: 'low',
          description: 'Candidate looked down at desk notepad for 4 seconds while sketching architectural diagram.'
        }
      ],
      overallIntegrity: 'Minor Flags'
    },
    generatedAt: '2026-09-13T16:00:00Z'
  }
];

export const INITIAL_ROUND2_ASSESSMENTS: Round2Assessment[] = [
  {
    id: 'r2-007',
    candidateId: 'cand-007',
    evaluatorId: 'user-evaluator-1',
    evaluatorName: 'Dr. Aris Thorne',
    scheduledAt: '2026-09-16T14:00:00Z',
    completedAt: '2026-09-16T15:05:00Z',
    technicalCompetencyScore: 5,
    systemDesignScore: 5,
    communicationScore: 4,
    culturalFitScore: 5,
    overallRecommendation: 'Strong Hire',
    detailedFeedback: 'Liam is exceptional. We drilled into live Raft log truncation under partial network splits, and his intuition was instant. He also demonstrated great mentoring empathy when discussing junior engineer onboarding. I strongly recommend extending an offer immediately.',
    status: 'completed'
  }
];

export const INITIAL_FINAL_DECISIONS: FinalDecisionRecord[] = [];

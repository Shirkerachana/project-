import {
  LayoutDashboard,
  FileText,
  Users,
  UserPlus,
  PhoneCall,
  CalendarCheck,
  Bot,
  UserCheck,
  Award,
  Sliders,
  HelpCircle,
  FileCheck2,
  Settings,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'Evaluator', 'HR']
  },
  // Phase 1: Requirements & Sourcing
  {
    name: 'Job Requirements',
    href: '/requirements',
    icon: FileText,
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'HR']
  },
  {
    name: 'Candidates',
    href: '/candidates',
    icon: Users,
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'Evaluator', 'HR']
  },
  {
    name: 'Add Candidate (AI)',
    href: '/candidates/new',
    icon: UserPlus,
    roles: ['Recruiter', 'TeamManager', 'Admin']
  },
  // Phase 2: AI Screening & Approvals
  {
    name: 'Screening Calls',
    href: '/screening/calls',
    icon: PhoneCall,
    roles: ['Recruiter', 'TeamManager', 'Admin'],
    badge: 'AI'
  },
  {
    name: 'Profile Approvals',
    href: '/approvals',
    icon: UserCheck,
    roles: ['TeamManager', 'Admin', 'Recruiter']
  },
  // Phase 3: Scheduling
  {
    name: 'AI Scheduling',
    href: '/scheduling',
    icon: CalendarCheck,
    roles: ['Recruiter', 'Admin']
  },
  // Phase 4: Round 1 AI Interview
  {
    name: 'Round 1 AI Interview',
    href: '/interviews/round1/cand-001/setup',
    icon: Bot,
    roles: ['Recruiter', 'Admin', 'TeamManager'],
    badge: 'Avatar'
  },
  // Phase 5: Round 2 & Decisions
  {
    name: 'Round 2 Evaluation',
    href: '/decisions/round2/cand-007',
    icon: FileCheck2,
    roles: ['Evaluator', 'Recruiter', 'Admin', 'TeamManager']
  },
  {
    name: 'Hiring Decision',
    href: '/decisions/final/cand-007',
    icon: Award,
    roles: ['HR', 'Recruiter', 'Admin']
  },
  // Admin Configuration
  {
    name: 'Admin & Integrations',
    href: '/admin/config',
    icon: Settings,
    roles: ['Admin']
  }
];

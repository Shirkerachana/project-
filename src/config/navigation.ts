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
  Mail,
  Video,
  Calendar,
  ClipboardList,
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
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'Evaluator']
  },
  // Phase 1: Requirements & Sourcing
  {
    name: 'Job Requirements',
    href: '/requirements',
    icon: FileText,
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter']
  },
  {
    name: 'Candidates',
    href: '/candidates',
    icon: Users,
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'Evaluator']
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
  // Interview module: all AI and human interview rounds live in one workspace.
  {
    name: 'Interview',
    href: '/interview',
    icon: Bot,
    roles: ['Recruiter', 'Evaluator', 'TeamManager', 'Admin'],
    badge: 'Rounds'
  },
  // Communication & Productivity Suite
  {
    name: 'Email',
    href: '/email',
    icon: Mail,
    roles: ['Recruiter', 'TeamManager', 'Evaluator', 'Admin', 'CRM']
  },
  {
    name: 'Meetings',
    href: '/meetings',
    icon: Video,
    roles: ['Recruiter', 'TeamManager', 'Evaluator', 'Admin', 'CRM']
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    roles: ['Recruiter', 'TeamManager', 'Evaluator', 'Admin', 'CRM']
  },
  // Audit Trail
  {
    name: 'Audit Log',
    href: '/audit-log',
    icon: ClipboardList,
    roles: ['Admin', 'Recruiter', 'TeamManager', 'Evaluator', 'CRM']
  },
  // Admin Configuration
  {
    name: 'Admin & Integrations',
    href: '/admin/config',
    icon: Sliders,
    roles: ['Admin']
  },
  // System Settings
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['Admin', 'CRM', 'TeamManager', 'Recruiter', 'Evaluator']
  }
];

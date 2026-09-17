/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './layouts/AppShell';

// Core Workflow Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequirementsListPage } from './pages/RequirementsListPage';
import { RequirementIntakePage } from './pages/RequirementIntakePage';
import { RequirementDetailPage } from './pages/RequirementDetailPage';
import { CandidatesListPage } from './pages/CandidatesListPage';
import { CandidateAddPage } from './pages/CandidateAddPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { ScreeningCallsQueuePage } from './pages/ScreeningCallsQueuePage';
import { ScreeningCallDetailPage } from './pages/ScreeningCallDetailPage';
import { RTREmailReviewPage } from './pages/RTREmailReviewPage';
import { ApprovalsQueuePage } from './pages/ApprovalsQueuePage';
import { SchedulingPage } from './pages/SchedulingPage';
import { Round1SetupPage } from './pages/Round1SetupPage';
import { CandidateInterviewPage } from './pages/CandidateInterviewPage';
import { Round1ReportPage } from './pages/Round1ReportPage';
import { Round2DecisionPage } from './pages/Round2DecisionPage';
import { FinalHiringDecisionPage } from './pages/FinalHiringDecisionPage';
import { AdminConfigPage } from './pages/AdminConfigPage';

// Productivity, Communication & AI Suite
import { EmailPage } from './pages/EmailPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AIInterviewWorkflowPage } from './pages/AIInterviewWorkflowPage';
import { RecruiterAIPage } from './pages/RecruiterAIPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Initializing TalentPulse...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Candidate-Facing Avatar Interview Experience (No internal sidebar, independent shell) */}
              <Route
                path="/interviews/round1/:candidateId/live"
                element={<CandidateInterviewPage />}
              />
              <Route
                path="/interview/:sessionId"
                element={<CandidateInterviewPage />}
              />
              <Route
                path="/meetings/:id"
                element={<CandidateInterviewPage />}
              />

              {/* Authenticated Application Shell Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Phase 1: Requirements & Sourcing */}
              <Route
                path="/requirements"
                element={
                  <ProtectedRoute>
                    <RequirementsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requirements/new"
                element={
                  <ProtectedRoute>
                    <RequirementIntakePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requirements/:id"
                element={
                  <ProtectedRoute>
                    <RequirementDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requirements/:id/edit"
                element={
                  <ProtectedRoute>
                    <RequirementIntakePage />
                  </ProtectedRoute>
                }
              />

              {/* Candidates */}
              <Route
                path="/candidates"
                element={
                  <ProtectedRoute>
                    <CandidatesListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates/new"
                element={
                  <ProtectedRoute>
                    <CandidateAddPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates/add"
                element={
                  <ProtectedRoute>
                    <CandidateAddPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates/:id"
                element={
                  <ProtectedRoute>
                    <CandidateProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Phase 2: AI Voice Screening, Transcripts & RTR Gating */}
              <Route
                path="/screening/calls"
                element={
                  <ProtectedRoute>
                    <ScreeningCallsQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screening/queue"
                element={
                  <ProtectedRoute>
                    <ScreeningCallsQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screening/calls/:id"
                element={
                  <ProtectedRoute>
                    <ScreeningCallDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screening/:id"
                element={
                  <ProtectedRoute>
                    <ScreeningCallDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screening/calls/:id/rtr"
                element={
                  <ProtectedRoute>
                    <RTREmailReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rtr/:id"
                element={
                  <ProtectedRoute>
                    <RTREmailReviewPage />
                  </ProtectedRoute>
                }
              />

              {/* Human Control Point #1: Team Manager Approvals & Ceipal Gating */}
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute>
                    <ApprovalsQueuePage />
                  </ProtectedRoute>
                }
              />

              {/* Phase 3: AI Availability Calling & Booking */}
              <Route
                path="/scheduling"
                element={
                  <ProtectedRoute>
                    <SchedulingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scheduling/queue"
                element={
                  <ProtectedRoute>
                    <SchedulingPage />
                  </ProtectedRoute>
                }
              />

              {/* Phase 4: AI Avatar Technical Interview Workflow */}
              <Route
                path="/ai-interview"
                element={
                  <ProtectedRoute>
                    <AIInterviewWorkflowPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/round1/:candidateId/setup"
                element={
                  <ProtectedRoute>
                    <Round1SetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/round1/:candidateId/report"
                element={
                  <ProtectedRoute>
                    <Round1ReportPage />
                  </ProtectedRoute>
                }
              />

              {/* Phase 5: Human Control Points #2 & #3 (Round 2 Go/No-Go and Final Decision) */}
              <Route
                path="/decisions/round2/:candidateId"
                element={
                  <ProtectedRoute>
                    <Round2DecisionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/round2/:candidateId"
                element={
                  <ProtectedRoute>
                    <Round2DecisionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/round2/:candidateId/decision"
                element={
                  <ProtectedRoute>
                    <Round2DecisionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interviews/round2/:candidateId/evaluate"
                element={
                  <ProtectedRoute>
                    <Round2DecisionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/decisions/final/:candidateId"
                element={
                  <ProtectedRoute>
                    <FinalHiringDecisionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/decisions/:candidateId"
                element={
                  <ProtectedRoute>
                    <FinalHiringDecisionPage />
                  </ProtectedRoute>
                }
              />

              {/* Communication & Productivity Suite */}
              <Route
                path="/email"
                element={
                  <ProtectedRoute>
                    <EmailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meetings"
                element={
                  <ProtectedRoute>
                    <MeetingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter AI Copilot */}
              <Route
                path="/recruiter-ai"
                element={
                  <ProtectedRoute>
                    <RecruiterAIPage />
                  </ProtectedRoute>
                }
              />

              {/* System Audit Log */}
              <Route
                path="/audit-log"
                element={
                  <ProtectedRoute>
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />

              {/* System Settings & User Preferences */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/:tab"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* System Configuration & Master Data */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminConfigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/config"
                element={
                  <ProtectedRoute>
                    <AdminConfigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/:tab"
                element={
                  <ProtectedRoute>
                    <AdminConfigPage />
                  </ProtectedRoute>
                }
              />

              {/* Default Catch-All */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

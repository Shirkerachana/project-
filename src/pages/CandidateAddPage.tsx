import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Plus,
  Loader2,
  PhoneCall
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { candidatesService } from '../api/candidates.service';
import { requirementsService } from '../api/requirements.service';
import { Requirement } from '../types';

export const CandidateAddPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Candidate Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [notes, setNotes] = useState('');
  const [aiExtractedFields, setAiExtractedFields] = useState<string[]>([]);

  useEffect(() => {
    requirementsService.getAll().then((reqs) => {
      setRequirements(reqs);
      if (reqs.length > 0) {
        setSelectedRequirementId(reqs[0].id);
      }
    });
  }, []);

  // Resume Upload & Simulated AI Parsing
  const handleSimulateResumeUpload = async (file?: File) => {
    const fileName = file ? file.name : 'Jordan_Vance_Staff_Resume.pdf';
    setUploadedFileName(fileName);
    setIsParsingResume(true);

    try {
      // Simulate real AI resume parsing step
      const parsedData = await candidatesService.parseResume(fileName);

      setFullName(parsedData.fullName);
      setEmail(parsedData.email);
      setPhone(parsedData.phone);
      setLocation(parsedData.location);
      setCurrentCompany(parsedData.currentCompany);
      setExperienceYears(parsedData.experienceYears);
      setSkills(parsedData.skills);
      setNotes(parsedData.summary);
      setAiExtractedFields([
        'fullName',
        'email',
        'phone',
        'location',
        'currentCompany',
        'experienceYears',
        'skills'
      ]);
      setResumeUploaded(true);
      toast.success(
        'AI Resume Parsing Complete',
        `Extracted candidate contact details and ${parsedData.skills.length} technical skills. All fields are editable.`
      );
    } catch (err: any) {
      toast.error('Resume Parsing Error', err.message);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Validation Error', 'Candidate full name and email are mandatory.');
      return;
    }

    const linkedReq = requirements.find((r) => r.id === selectedRequirementId);

    setIsSubmitting(true);
    try {
      const newCand = await candidatesService.create({
        fullName,
        email,
        phone,
        location,
        currentCompany,
        experienceYears: Number(experienceYears),
        skills,
        requirementId: selectedRequirementId,
        requirementTitle: linkedReq?.title || 'Senior Software Engineer',
        recruiterName: user?.name || 'David Miller (Recruiter)',
        resumeUrl: `/uploads/${uploadedFileName || 'resume.pdf'}`,
        aiExtractedFields
      });

      toast.success('Candidate Added to Pipeline', `${newCand.fullName} created under ${newCand.requirementTitle}.`);
      navigate(`/candidates/${newCand.id}`);
    } catch (err: any) {
      toast.error('Save Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldAIExtracted = (fieldKey: string) => aiExtractedFields.includes(fieldKey);

  return (
    <div id="candidate-add-page" className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add Sourced Candidate (AI Resume Extraction)"
        description="Phase 1: Upload resume document. AI automatically parses structured attributes with explicit field-level markers."
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: 'New Candidate' }
        ]}
      />

      {/* Upload Zone */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 transition-all text-center">
        {isParsingResume ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <Sparkles className="w-4 h-4 text-indigo-300 absolute -top-1 -right-1 animate-ping" />
            </div>
            <div className="text-base font-bold text-white">AI Analyzing & Parsing Resume...</div>
            <p className="text-xs text-slate-400 max-w-sm">
              Extracting candidate contact coordinates, current employer, years of experience, and skill taxonomy.
            </p>
          </div>
        ) : resumeUploaded ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{uploadedFileName}</span>
                  <AIBadge label="AI Parsed" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Extracted 7 core attributes &bull; Ready for review and submission
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSimulateResumeUpload()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Re-parse Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Drop candidate resume (PDF, DOCX) here</h3>
              <p className="text-xs text-slate-400 mt-1">
                AI will inspect and autofill all candidate profile properties instantly.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleSimulateResumeUpload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upload & Parse Sample Resume</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Structured Candidate Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Candidate Profile Attributes</h2>
            {aiExtractedFields.length > 0 && (
              <span className="text-xs text-indigo-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Highlighted fields were extracted by AI</span>
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Link to Target Job Requirement <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedRequirementId}
              onChange={(e) => setSelectedRequirementId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.title} &bull; {req.clientName} ({req.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                {isFieldAIExtracted('fullName') && <AIBadge label="Extracted" size="sm" />}
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Vance"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isFieldAIExtracted('fullName') ? 'border-indigo-500/50' : 'border-slate-800'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                {isFieldAIExtracted('email') && <AIBadge label="Extracted" size="sm" />}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@domain.com"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isFieldAIExtracted('email') ? 'border-indigo-500/50' : 'border-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                {isFieldAIExtracted('phone') && <AIBadge label="Extracted" size="sm" />}
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isFieldAIExtracted('phone') ? 'border-indigo-500/50' : 'border-slate-800'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Location</label>
                {isFieldAIExtracted('location') && <AIBadge label="Extracted" size="sm" />}
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isFieldAIExtracted('location') ? 'border-indigo-500/50' : 'border-slate-800'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Experience (Years)</label>
                {isFieldAIExtracted('experienceYears') && <AIBadge label="Extracted" size="sm" />}
              </div>
              <input
                type="number"
                min={0}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isFieldAIExtracted('experienceYears') ? 'border-indigo-500/50' : 'border-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Current / Most Recent Employer</label>
              {isFieldAIExtracted('currentCompany') && <AIBadge label="Extracted" size="sm" />}
            </div>
            <input
              type="text"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              placeholder="e.g. Stripe, AWS, FinTech Labs"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isFieldAIExtracted('currentCompany') ? 'border-indigo-500/50' : 'border-slate-800'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Technical Skills</label>
              {isFieldAIExtracted('skills') && <AIBadge label="Extracted" size="sm" />}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-300 font-medium"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type additional skill and hit enter..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Recruiter Sourcing Notes / Background
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Candidate background, notice period, compensation expectations..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/candidates')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Candidate...' : 'Save Candidate & Proceed to Pipeline'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AIBadge } from '../components/common/AIBadge';
import { DynamicFieldsEditor, DynamicField } from '../components/common/DynamicFieldsEditor';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { candidatesService } from '../api/candidates.service';
import { requirementsService } from '../api/requirements.service';
import { Requirement } from '../types';

const defaultProfileFields = (): DynamicField[] => [
  { id: 'fullName', label: 'Full Name', value: '', type: 'text', required: true, removable: false },
  { id: 'email', label: 'Email Address', value: '', type: 'email', required: true, removable: false },
  { id: 'phone', label: 'Phone Number', value: '', type: 'text', removable: true },
  { id: 'location', label: 'Location', value: '', type: 'text', removable: true },
  { id: 'experienceYears', label: 'Experience (Years)', value: '5', type: 'text', removable: true },
  { id: 'currentCompany', label: 'Current / Most Recent Employer', value: '', type: 'text', removable: true },
  { id: 'notes', label: 'Recruiter Sourcing Notes / Background', value: '', type: 'textarea', removable: true }
];

interface CandidateAddFormProps {
  onSaved?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export const CandidateAddForm: React.FC<CandidateAddFormProps> = ({ onSaved, onCancel, compact }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [aiExtractedFields, setAiExtractedFields] = useState<string[]>([]);
  const [profileFields, setProfileFields] = useState<DynamicField[]>(defaultProfileFields());

  useEffect(() => {
    requirementsService.getAll().then((reqs) => {
      setRequirements(reqs);
      if (reqs.length > 0) {
        setSelectedRequirementId(reqs[0].id);
      }
    });
  }, []);

  const setFieldValue = (id: string, value: string) => {
    setProfileFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const getFieldValue = (id: string) => profileFields.find((f) => f.id === id)?.value || '';

  const handleSimulateResumeUpload = async (file?: File) => {
    const fileName = file ? file.name : 'Jordan_Vance_Staff_Resume.pdf';
    setUploadedFileName(fileName);
    setIsParsingResume(true);

    try {
      const parsedData = await candidatesService.parseResume(fileName);
      setProfileFields((prev) =>
        prev.map((field) => {
          if (field.id === 'fullName') return { ...field, value: parsedData.fullName };
          if (field.id === 'email') return { ...field, value: parsedData.email };
          if (field.id === 'phone') return { ...field, value: parsedData.phone };
          if (field.id === 'location') return { ...field, value: parsedData.location };
          if (field.id === 'currentCompany') return { ...field, value: parsedData.currentCompany };
          if (field.id === 'experienceYears') return { ...field, value: String(parsedData.experienceYears) };
          if (field.id === 'notes') return { ...field, value: parsedData.summary };
          return field;
        })
      );
      setSkills(parsedData.skills);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = getFieldValue('fullName');
    const email = getFieldValue('email');
    if (!fullName.trim() || !email.trim()) {
      toast.error('Validation Error', 'Candidate full name and email are mandatory.');
      return;
    }

    const linkedReq = requirements.find((r) => r.id === selectedRequirementId);
    const customFields = profileFields
      .filter((f) => !['fullName', 'email', 'phone', 'location', 'experienceYears', 'currentCompany', 'notes'].includes(f.id))
      .map((f) => ({ id: f.id, label: f.label, value: f.value }));

    setIsSubmitting(true);
    try {
      const newCand = await candidatesService.create({
        fullName,
        email,
        phone: getFieldValue('phone'),
        location: getFieldValue('location'),
        currentCompany: getFieldValue('currentCompany'),
        experienceYears: Number(getFieldValue('experienceYears') || 0),
        yearsOfExperience: Number(getFieldValue('experienceYears') || 0),
        skills,
        customFields,
        requirementId: selectedRequirementId,
        requirementTitle: linkedReq?.title || 'Senior Software Engineer',
        recruiterName: user?.name || 'David Miller (Recruiter)',
        resumeUrl: `/uploads/${uploadedFileName || 'resume.pdf'}`,
        aiExtractedFields,
        rtrAcknowledged: false,
        phase: 1,
        status: 'Sourced',
        expectedSalary: '',
        noticePeriod: '',
        currentRole: ''
      });

      toast.success('Candidate Added to Pipeline', `${newCand.fullName} created under ${newCand.requirementTitle}.`);
      if (onSaved) {
        onSaved();
      } else {
        navigate(`/candidates/${newCand.id}`);
      }
    } catch (err: any) {
      toast.error('Save Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={compact ? 'space-y-5' : 'space-y-6'}>
      <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 transition-all text-center">
        {isParsingResume ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
            <div className="text-base font-bold text-white">AI Analyzing & Parsing Resume...</div>
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
                <div className="text-xs text-slate-400 mt-0.5">Extracted attributes are editable below</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSimulateResumeUpload()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
              <p className="text-xs text-slate-400 mt-1">AI will inspect and autofill candidate profile properties instantly.</p>
            </div>
            <button
              type="button"
              onClick={() => handleSimulateResumeUpload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload & Parse Sample Resume</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Candidate Profile Attributes</h2>
            {aiExtractedFields.length > 0 && (
              <span className="text-xs text-indigo-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Highlighted fields were extracted by AI
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
                  {req.title} • {req.clientName} ({req.location})
                </option>
              ))}
            </select>
          </div>

          <DynamicFieldsEditor fields={profileFields} onChange={setProfileFields} addLabel="Add Attribute" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Technical Skills</label>
              {aiExtractedFields.includes('skills') && <AIBadge label="Extracted" size="sm" />}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-300 font-medium"
                >
                  <span>{sk}</span>
                  <button type="button" onClick={() => setSkills(skills.filter((s) => s !== sk))} className="hover:text-white">
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : navigate('/candidates'))}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Candidate...' : 'Save Candidate'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export const CandidateAddPage: React.FC = () => {
  return (
    <div id="candidate-add-page" className="space-y-6">
      <PageHeader
        title="Add Candidate"
        description="Upload a resume or fill candidate attributes. Fields can be added or removed as needed."
        breadcrumbs={[
          { label: 'Candidates', href: '/candidates' },
          { label: 'New Candidate' }
        ]}
      />
      <CandidateAddForm />
    </div>
  );
};

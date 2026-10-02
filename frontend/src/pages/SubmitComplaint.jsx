import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AnalysisDialog from '../components/AnalysisDialog';
import SubmissionCelebration from '../components/SubmissionCelebration';
import { citizenProfile } from '../services/citizenAccounts';
import { apiService } from '../services/api';
import {
  Sparkles,
  Send,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Upload,
  Copy,
  Check,
  Droplets,
  Zap,
  Construction,
  Trash2,
  Building2,
  ArrowRight,
  X,
  FileText,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function SubmitComplaint() {
  const routeLocation = useLocation();
  const isLocal = sessionStorage.getItem('project_mode') === 'local';

  const profile = citizenProfile();
  const [celebrate, setCelebrate] = useState(false);
  const finishCelebration = useCallback(() => setCelebrate(false), []);
  // Form fields
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [title, setTitle] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [department, setDepartment] = useState('Others');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Status & Validation states
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Category definitions with icons and descriptions
  const categories = [
    {
      id: 'Water',
      name: 'Water Supply',
      icon: Droplets,
      desc: 'Leakage, supply issues, contaminated water',
      color: 'blue',
    },
    {
      id: 'Electricity',
      name: 'Electricity Board',
      icon: Zap,
      desc: 'Power cuts, dangerous wiring, meter issues',
      color: 'amber',
    },
    {
      id: 'Road',
      name: 'Roads & Works',
      icon: Construction,
      desc: 'Potholes, broken roads, streetlights',
      color: 'emerald',
    },
    {
      id: 'Garbage',
      name: 'Garbage & Cleanliness',
      icon: Trash2,
      desc: 'Waste dump, uncleaned bins, sanitation',
      color: 'purple',
    },
    {
      id: 'Others',
      name: 'Others / General',
      icon: Building2,
      desc: 'Public amenities, noise, other civic issues',
      color: 'slate',
    },
  ];

  // Auto-fill department if query param exists
  useEffect(() => {
    const params = new URLSearchParams(routeLocation.search);
    const deptParam = params.get('dept');
    if (deptParam) {
      if (deptParam.includes('Water')) setDepartment('Water');
      else if (deptParam.includes('Electricity') || deptParam.includes('Power')) setDepartment('Electricity');
      else if (deptParam.includes('Road')) setDepartment('Road');
      else if (deptParam.includes('Garbage') || deptParam.includes('Waste')) setDepartment('Garbage');
      else if (['Water', 'Electricity', 'Road', 'Garbage', 'Others'].includes(deptParam)) setDepartment(deptParam);
    }
  }, [routeLocation.search]);

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxMB = 5;
      if (file.size > maxMB * 1024 * 1024) {
        setError(`Selected file exceeds ${maxMB}MB limit. Please upload a smaller image.`);
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
        setError('Invalid file type. Please select a valid photo attachment (JPG, PNG, WEBP).');
        return;
      }
      setImageFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setError('Failed to read selected image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Citizen Full Name is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }
    if (!title.trim()) {
      errors.title = 'Complaint title is required.';
    }
    if (!complaintText.trim()) {
      errors.complaintText = 'Please describe your grievance in detail.';
    } else if (complaintText.trim().length < 15) {
      errors.complaintText = 'Please provide more details (minimum 15 characters).';
    }
    if (!location.trim()) {
      errors.location = 'Location or address of the grievance is required.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError('Please resolve the highlighted validation errors before submitting.');
      return false;
    }

    setError('');
    return true;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!complaintText.trim() || complaintText.trim().length < 15) {
      setFieldErrors((prev) => ({
        ...prev,
        complaintText: 'Enter detailed description (at least 15 characters) before AI analysis.',
      }));
      setError('Please provide a detailed grievance description before analyzing with AI.');
      return;
    }

    setAnalysisOpen(true);
    setAnalyzing(true);
    setPrediction(null);
    setSuccess(null);
    setError('');

    try {
      const [response] = await Promise.all([apiService.predict(complaintText), new Promise(resolve=>setTimeout(resolve,850))]);
      if (response.status === 'success') {
        setPrediction(response.data);
        if (response.data.category) {
          const validDepts = ['Water', 'Electricity', 'Road', 'Garbage', 'Others'];
          if (validDepts.includes(response.data.category)) {
            setDepartment(response.data.category);
          }
        }
      } else {
        setError('Prediction model returned an invalid response.');
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with AI prediction server.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    // Consolidate form fields into complaint_text column to preserve existing backend schema contract
    const consolidatedText =
      `TITLE: ${title.trim()}\n` +
      `LOCATION: ${location.trim()}\n` +
      `CITIZEN: ${name.trim()} (Phone: ${phone.trim()}, Email: ${email.trim()})\n` +
      `ATTACHMENT: ${imageFile ? imageFile.name : 'None'}\n\n` +
      `DESCRIPTION:\n${complaintText.trim()}`;

    const payload = {
      complaint_text: consolidatedText,
      category: department,
    };

    if (prediction) {
      payload.priority = prediction.priority;
      payload.sentiment_score = prediction.sentiment_score;
    }

    try {
      const response = await apiService.submitComplaint(payload);
      if (response.status === 'success') {
        setSuccess(response.complaint);
        setCelebrate(true);
        if (response.token) {
          localStorage.setItem('citizen_token', response.token);
        }
        const gId = response.complaint?.grievance_id || response.complaint?.id;
        if (gId) {
          localStorage.setItem('last_grievance_id', gId);
        }

        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setTitle('');
        setComplaintText('');
        setLocation('');
        setImageFile(null);
        setImagePreview('');
        setPrediction(null);
        setFieldErrors({});

        // Scroll to top smoothly so citizen sees success card immediately
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError('Grievance submission failed. Please check your information and try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit grievance to the public database. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyGrievanceId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getPriorityBadgeClass = (pri) => {
    const mapping = {
      High: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      Medium: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      Low: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    };
    return mapping[pri] || 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
  };


  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      {/* Page Title & Breadcrumb Header */}
      <div className="mb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#31624e]">
          <ShieldCheck size={14} /> Citizen services / grievance intake
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Register a new concern
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-3xl">
          Describe the concern and its location. Review the suggested classification before submitting.
        </p>
      </div>

      {celebrate && <SubmissionCelebration local={isLocal} onDone={finishCelebration}/>}
      {/* Success Banner Card */}
      {success && (
        <div className="mb-8 rounded-xl border border-emerald-300 bg-emerald-50/80 p-6 shadow-md backdrop-blur transition-all">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-600 p-2 text-white shrink-0 shadow">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-emerald-900">
                  {isLocal ? 'Grievance saved on this device' : 'Grievance submitted'}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Status: {success.status || 'SUBMITTED'}
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                {isLocal ? 'Your record is saved in this browser. It has not been sent to a department. Keep this reference to find it again.' : 'Your grievance has been registered. Keep your reference to track progress.'}
              </p>

              {/* Grievance ID Display Card */}
              <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Tracking reference
                    </span>
                    <span className="font-mono text-xl font-extrabold text-[#31624e] tracking-wide select-all">
                      {success.grievance_id || success.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyGrievanceId(success.grievance_id || success.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
                  >
                    {copiedId ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied ID!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-slate-500" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">Suggested department</span>
                    <span className="font-bold text-slate-800">{success.department || success.category}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">Suggested priority</span>
                    <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[11px] ${getPriorityBadgeClass(success.priority)}`}>
                      {success.priority} Priority
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">Submission Date</span>
                    <span className="font-medium text-slate-700">
                      {success.timestamp ? new Date(success.timestamp).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Similar / Related Grievance Alert */}
              {success.related_grievances && success.related_grievances.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert size={16} className="text-amber-600" />
                    <span>Similar Grievance Detected</span>
                  </div>
                  {success.related_grievances.map((related) => (
                    <p key={related.related_grievance_id} className="mt-1 text-amber-800">
                      Ticket <strong className="font-mono">{related.related_grievance_id}</strong> is {related.similarity_score}% similar ({related.category} · {related.status}).
                    </p>
                  ))}
                  <p className="mt-1.5 text-[10px] text-amber-700">
                    This notice helps administrators deduplicate issues. Your grievance has been recorded normally.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={`/history?id=${encodeURIComponent(success.grievance_id || success.id)}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#31624e] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#244d3d] transition-colors"
                >
                  <span>Track Complaint Progress</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Lodge Another Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800 shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grievance Submission Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        {/* Section 2: Tell us what happened Selection */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#31624e] text-xs font-bold text-white">
                1
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                Grievance Details & Category
              </h2>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Category Selector Cards */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Select Complaint Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = department === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setDepartment(cat.id);
                        clearFieldError('department');
                      }}
                      className={`relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#31624e] bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between mb-2">
                        <div
                          className={`rounded-lg p-2 ${
                            isSelected ? 'bg-[#31624e] text-white' : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {isSelected && (
                          <span className="rounded-full bg-[#31624e] p-0.5 text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-[#31624e]' : 'text-slate-800'
                        }`}
                      >
                        {cat.name}
                      </span>
                      <span className="mt-1 text-[10px] text-slate-500 leading-tight">
                        {cat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Complaint Title <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearFieldError('title');
                  }}
                  placeholder="Summarize the issue (e.g. Severe water pipe leakage in Ward 4)"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-9 text-xs text-slate-900 outline-none transition-all ${
                    fieldErrors.title
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 bg-slate-50 focus:border-[#31624e] focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <FileText size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {fieldErrors.title && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Detailed Description Textarea */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="complaint">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-medium ${complaintText.length >= 15 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {complaintText.length} / min 15 chars
                </span>
              </div>
              <textarea
                id="complaint"
                rows={5}
                value={complaintText}
                onChange={(e) => {
                  setComplaintText(e.target.value);
                  clearFieldError('complaintText');
                }}
                placeholder="Explain the grievance clearly. Include details such as duration of issue, safety impacts, or specific landmarks..."
                className={`w-full resize-none rounded-lg border p-3 text-xs text-slate-900 outline-none transition-all ${
                  fieldErrors.complaintText
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 bg-slate-50 focus:border-[#31624e] focus:bg-white focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {fieldErrors.complaintText ? (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.complaintText}
                </p>
              ) : (
                <span className="mt-1 block text-[10px] text-slate-500">
                  Describe what happened, where it happened, and how long the issue has continued.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Citizen Contact Info */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#31624e] text-xs font-bold text-white">
              2
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              How can we reach you?
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Citizen Full Name <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError('name');
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-9 text-xs text-slate-900 outline-none transition-all ${
                    fieldErrors.name
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 bg-slate-50 focus:border-[#31624e] focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <User size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Email Address <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="rahul@example.com"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-9 text-xs text-slate-900 outline-none transition-all ${
                    fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 bg-slate-50 focus:border-[#31624e] focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="phone" className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Mobile Number <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError('phone');
                  }}
                  placeholder="9876543210"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-9 text-xs text-slate-900 outline-none transition-all ${
                    fieldErrors.phone
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 bg-slate-50 focus:border-[#31624e] focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Location & Attachments */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#31624e] text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Where is the issue?
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Grievance Location / Address <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    clearFieldError('location');
                  }}
                  placeholder="e.g. Near Community Center, Main Road, Sector 12"
                  className={`w-full rounded-lg border px-3 py-2.5 pl-9 text-xs text-slate-900 outline-none transition-all ${
                    fieldErrors.location
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 bg-slate-50 focus:border-[#31624e] focus:bg-white focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {fieldErrors.location && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {fieldErrors.location}
                </p>
              )}
            </div>

            {/* Photo Attachment (Optional) */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Photo reference (optional; filename only)
              </label>
              {!imageFile ? (
                <label className="flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:border-[#31624e] hover:bg-blue-50/50 transition-all">
                  <Upload size={14} className="text-slate-400" />
                  <span>Choose file... (JPG, PNG)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="h-7 w-7 rounded object-cover border border-slate-300" />
                    )}
                    <span className="truncate text-slate-800 font-medium">{imageFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-5 py-2.5 text-xs font-bold text-[#31624e] hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 transition-all cursor-pointer"
          >
            {analyzing ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{analyzing ? 'Analyzing Text...' : (isLocal ? 'Analyze with AI' : 'Analyze with AI')}</span>
          </button>

          <button
            type="submit"
            disabled={submitting || analyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#31624e] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#244d3d] disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Submitting Grievance...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>{isLocal ? 'Save grievance' : 'Submit grievance'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <AnalysisDialog open={analysisOpen} busy={analyzing} prediction={prediction} error={error} onClose={()=>setAnalysisOpen(false)}/>
      {prediction && <button type="button" className="zero-review-analysis" onClick={()=>setAnalysisOpen(true)}><Sparkles size={17}/>Review AI analysis<span>{prediction.category} · {prediction.priority} priority</span><ArrowRight size={16}/></button>}

    </div>
  );
}


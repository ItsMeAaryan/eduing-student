'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { uploadUserDocument, deleteUserDocument } from '@/lib/firebase/student';
import { 
  FileText, Upload, Download, Trash2, CheckCircle2, Clock, 
  Eye, Plus, Loader2, Check, X, Search, Filter, AlertCircle,
  FolderOpen, Shield, GraduationCap, PenTool, Award, Briefcase, 
  RefreshCcw, File
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'personal',
    title: 'Personal Identity',
    icon: Shield,
    documents: [
      { id: 'aadhaar_card', label: 'Aadhaar Card' },
      { id: 'passport', label: 'Passport' },
      { id: 'pan_card', label: 'PAN Card' },
      { id: 'passport_photo', label: 'Passport Photo' },
      { id: 'signature', label: 'Signature' },
      { id: 'id_proof', label: 'Default ID Proof' }, // Kept for backward compatibility
    ]
  },
  {
    id: 'academic',
    title: 'Academic',
    icon: GraduationCap,
    documents: [
      { id: '10th_marksheet', label: '10th Marksheet' },
      { id: '12th_marksheet', label: '12th Marksheet' },
      { id: 'diploma', label: 'Diploma' },
      { id: 'graduation', label: 'Graduation' },
      { id: 'transfer_certificate', label: 'Transfer Certificate' },
      { id: 'migration_certificate', label: 'Migration Certificate' },
    ]
  },
  {
    id: 'entrance',
    title: 'Entrance Exams',
    icon: PenTool,
    documents: [
      { id: 'jee', label: 'JEE' },
      { id: 'neet', label: 'NEET' },
      { id: 'cuet', label: 'CUET' },
      { id: 'cat', label: 'CAT' },
      { id: 'mat', label: 'MAT' },
      { id: 'clat', label: 'CLAT' },
      { id: 'gate', label: 'GATE' },
      { id: 'ielts', label: 'IELTS' },
      { id: 'toefl', label: 'TOEFL' },
    ]
  },
  {
    id: 'certificates',
    title: 'Certificates',
    icon: Award,
    documents: [
      { id: 'income_certificate', label: 'Income Certificate' },
      { id: 'caste_certificate', label: 'Caste Certificate' },
      { id: 'domicile_certificate', label: 'Domicile Certificate' },
      { id: 'ews_certificate', label: 'EWS Certificate' },
      { id: 'disability_certificate', label: 'Disability Certificate' },
      { id: 'ncc_certificate', label: 'NCC Certificate' },
      { id: 'sports_certificate', label: 'Sports Certificate' },
    ]
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    icon: Briefcase,
    documents: [
      { id: 'resume', label: 'Resume' },
      { id: 'sop', label: 'SOP' },
      { id: 'lor', label: 'LOR' },
      { id: 'portfolio', label: 'Portfolio' },
      { id: 'linkedin', label: 'LinkedIn' },
      { id: 'github', label: 'GitHub' },
    ]
  }
];

export default function AcademicLockerPage() {
  const { user } = useAuth();
  const { profile } = useStudentData();
  const uploadedDocs = profile?.documents || {};

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  
  // Ref for global file upload
  const globalUploadRef = useRef<HTMLInputElement>(null);
  const [globalUploadTarget, setGlobalUploadTarget] = useState<string | null>(null);

  // Statistics
  const docValues = Object.values(uploadedDocs) as any[];
  const validDocs = docValues.filter(d => !!d?.fileUrl);
  const totalDocs = validDocs.length;
  const verifiedDocs = validDocs.filter(d => d.status === 'verified').length;
  const pendingDocs = validDocs.filter(d => d.status === 'uploaded' || d.status === 'pending').length;
  
  const REQUIRED_DOCS = ['10th_marksheet', '12th_marksheet', 'id_proof', 'passport_photo'];
  const missingRequired = REQUIRED_DOCS.filter(id => !uploadedDocs[id]?.fileUrl).length;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [docId]: true }));
    try {
      // Use "any" to bypass strict docId typings in backend without modifying it
      await uploadUserDocument(user.uid, file, docId as any);
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docId]: false }));
      if (globalUploadRef.current) globalUploadRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!docToDelete || !user) return;
    try {
      await deleteUserDocument(user.uid, docToDelete);
      setDocToDelete(null);
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const handleGlobalUploadClick = (docId: string) => {
    setGlobalUploadTarget(docId);
    setTimeout(() => {
      globalUploadRef.current?.click();
    }, 50);
  };

  // Filtering
  const filteredCategories = useMemo(() => {
    return CATEGORIES.map(category => {
      const filteredDocs = category.documents.filter(doc => {
        const matchesSearch = doc.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || activeCategory === category.id;
        return matchesSearch && matchesCategory;
      });
      return { ...category, documents: filteredDocs };
    }).filter(category => category.documents.length > 0 || activeCategory === category.id);
  }, [searchQuery, activeCategory]);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col p-4 md:p-8 font-sans pb-24 text-white min-h-screen">
        
        {/* Global Hidden Input for Uploads */}
        <input 
          type="file" 
          ref={globalUploadRef}
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (globalUploadTarget) handleUpload(e, globalUploadTarget);
          }} 
        />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {docToDelete && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-[#111114] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
                <button onClick={() => setDocToDelete(null)} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={20} /></button>
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 mx-auto">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-center mb-2">Delete Document?</h3>
                <p className="text-white/40 text-center text-sm mb-8">This action cannot be undone. The document will be permanently removed from your vault.</p>
                <div className="flex gap-4">
                  <button onClick={() => setDocToDelete(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-lg shadow-red-500/20 transition-all">Delete</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <FolderOpen size={14} /> Digital Vault
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Academic Locker</h1>
            <p className="text-[15px] text-white/50 max-w-xl font-medium leading-relaxed">
              Securely store, manage and reuse your admission documents across every university application.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111114] border border-white/[0.06] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/30 focus:bg-white/[0.03] outline-none transition-all shadow-sm"
              />
            </div>
            <button className="h-[50px] px-4 bg-[#111114] border border-white/[0.06] rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all" aria-label="Filter">
              <Filter size={18} />
            </button>
            <button className="h-[50px] px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all shrink-0">
              <Plus size={16} /> <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] pointer-events-none" />
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Docs</div>
            <div className="text-2xl font-black text-white">{totalDocs}</div>
          </div>
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] pointer-events-none" />
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Verified</div>
            <div className="text-2xl font-black text-white">{verifiedDocs}</div>
          </div>
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] pointer-events-none" />
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</div>
            <div className="text-2xl font-black text-white">{pendingDocs}</div>
          </div>
          <div className="bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-[40px] pointer-events-none" />
            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Missing Core</div>
            <div className="text-2xl font-black text-white">{missingRequired}</div>
          </div>
          <div className="hidden lg:flex bg-[#111114] border border-white/[0.04] p-5 rounded-3xl flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] pointer-events-none" />
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Storage Used</div>
            <div className="text-2xl font-black text-white">{(totalDocs * 1.2).toFixed(1)} MB</div>
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1">
          
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl text-sm font-bold transition-all ${
                activeCategory === 'all' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <FolderOpen size={18} /> All Documents
            </button>
            
            <div className="h-px w-full bg-white/5 my-2" />
            
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 w-full p-4 rounded-2xl text-sm font-bold transition-all ${
                  activeCategory === cat.id ? 'bg-white/10 text-white border border-white/10' : 'bg-transparent text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <cat.icon size={18} /> {cat.title}
              </button>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 flex flex-col gap-10 min-w-0">
            {filteredCategories.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#111114] border border-white/[0.04] rounded-[40px]">
                <File size={48} className="text-white/20 mb-6" />
                <h3 className="text-xl font-black mb-2">No documents found</h3>
                <p className="text-white/40 text-sm mb-6">Try adjusting your search or filters.</p>
                <button onClick={() => setSearchQuery('')} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Clear Search</button>
              </div>
            ) : (
              filteredCategories.map(category => (
                <div key={category.id} className="flex flex-col gap-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#111114] border border-white/10 flex items-center justify-center text-white/60">
                      <category.icon size={18} />
                    </div>
                    <h2 className="text-xl font-black">{category.title}</h2>
                  </div>

                  {/* Documents Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {category.documents.map(docInfo => {
                      const serverDoc = uploadedDocs[docInfo.id];
                      const isUploading = uploadingDocs[docInfo.id];
                      const hasFile = !!serverDoc?.fileUrl;

                      return (
                        <div 
                          key={docInfo.id} 
                          className="bg-[#111114] border border-white/[0.04] hover:border-white/10 rounded-3xl p-5 flex flex-col relative overflow-hidden group transition-all"
                        >
                          {/* Top Row: Icon & Status */}
                          <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all ${
                              hasFile ? (serverDoc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400') : 'bg-white/5 text-white/40'
                            }`}>
                              {hasFile ? <FileText size={20} /> : <File size={20} />}
                            </div>
                            
                            {isUploading ? (
                              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                                <Loader2 size={10} className="animate-spin" /> Uploading
                              </div>
                            ) : hasFile ? (
                              <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                serverDoc.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {serverDoc.status === 'verified' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                {serverDoc.status === 'verified' ? 'Verified' : 'Pending'}
                              </div>
                            ) : (
                              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
                                Missing
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <h3 className="font-bold text-[15px] mb-1">{docInfo.label}</h3>
                          <p className="text-[11px] text-white/40 mb-6 font-medium">
                            {hasFile ? `Uploaded ${serverDoc.uploadedAt?.toDate ? serverDoc.uploadedAt.toDate().toLocaleDateString() : 'Recently'}` : 'Required for application'}
                          </p>

                          {/* Actions */}
                          <div className="mt-auto flex gap-2">
                            {hasFile ? (
                              <>
                                <button 
                                  onClick={() => window.open(serverDoc.fileUrl, '_blank')}
                                  className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                  <Eye size={14} /> View
                                </button>
                                <button 
                                  onClick={() => handleGlobalUploadClick(docInfo.id)}
                                  className="w-10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl flex items-center justify-center transition-all"
                                  title="Replace Document"
                                >
                                  <RefreshCcw size={14} />
                                </button>
                                <button 
                                  onClick={() => { setDocToDelete(docInfo.id); }}
                                  className="w-10 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                                  title="Delete Document"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleGlobalUploadClick(docInfo.id)}
                                disabled={isUploading}
                                className="w-full bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-400 text-white/60 border border-transparent hover:border-indigo-500/20 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                              >
                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} className="text-white/40 group-hover/btn:text-indigo-400" />}
                                {isUploading ? 'Processing...' : 'Upload File'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}

'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useStudentData } from '@/components/providers/StudentDataProvider';
import { uploadUserDocument, deleteUserDocument } from '@/lib/firebase/student';
import { 
  FileText, Upload, Download, Trash2, CheckCircle2, Clock, 
  Eye, Plus, Loader2, X, Search, AlertCircle, RefreshCcw, File, Shield, GraduationCap, PenTool, Award, Briefcase, Info, HardDrive, Image as ImageIcon
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'personal',
    title: 'Identity',
    icon: Shield,
    documents: [
      { id: 'aadhaar_card', label: 'Aadhaar Card' },
      { id: 'passport', label: 'Passport' },
      { id: 'pan_card', label: 'PAN Card' },
      { id: 'passport_photo', label: 'Passport Photo' },
      { id: 'signature', label: 'Signature' },
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
      { id: 'gate', label: 'GATE' },
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
    ]
  }
];

const REQUIRED_DOCS = ['10th_marksheet', '12th_marksheet', 'aadhaar_card', 'passport_photo'];

export default function AcademicLockerPage() {
  const { user } = useAuth();
  const { profile } = useStudentData();
  const uploadedDocs = profile?.documents || {};

  const [activeCategory, setActiveCategory] = useState<string>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ id: string, doc: any, info: any } | null>(null);
  
  const globalUploadRef = useRef<HTMLInputElement>(null);
  const [globalUploadTarget, setGlobalUploadTarget] = useState<string | null>(null);

  const docValues = Object.values(uploadedDocs) as any[];
  const validDocs = docValues.filter(d => !!d?.fileUrl);
  const totalDocs = validDocs.length;
  const verifiedDocs = validDocs.filter(d => d.status === 'verified').length;
  const pendingDocs = validDocs.filter(d => d.status === 'uploaded' || d.status === 'pending').length;
  const missingRequired = REQUIRED_DOCS.filter(id => !uploadedDocs[id]?.fileUrl).length;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert('File must be under 10MB');

    setUploadingDocs(prev => ({ ...prev, [docId]: true }));
    try {
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
      setPreviewDoc(null);
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const handleGlobalUploadClick = (docId: string) => {
    setGlobalUploadTarget(docId);
    setTimeout(() => { globalUploadRef.current?.click(); }, 50);
  };

  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory);
  const displayDocs = activeCategoryData?.documents.filter(d => d.label.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32">
        
        <input type="file" ref={globalUploadRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { if (globalUploadTarget) handleUpload(e, globalUploadTarget); }} />

        {/* HEADER */}
        <section className="pt-24 pb-12 px-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-[48px] font-medium tracking-tight mb-2">Academic Locker</h1>
              <p className="text-[16px] text-gray-400 max-w-xl">Securely manage every document required for your admission journey.</p>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#6D5DF6] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Quick Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151519] border border-white/5 rounded-full pl-12 pr-4 py-3.5 text-[14px] text-white placeholder:text-gray-500 focus:border-[#6D5DF6]/50 focus:bg-[#1A1A20] outline-none transition-all shadow-sm"
                />
              </div>
              <div className="hidden md:flex items-center gap-3 px-4 py-3.5 bg-[#151519] border border-white/5 rounded-full">
                <HardDrive size={16} className="text-gray-400" />
                <span className="text-[14px] font-medium text-gray-300">{(totalDocs * 1.2).toFixed(1)} MB</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: OVERVIEW CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <OverviewCard label="Uploaded" value={totalDocs} color="text-white" bg="bg-[#151519]" />
            <OverviewCard label="Verified" value={verifiedDocs} color="text-emerald-400" bg="bg-emerald-400/5" border="border-emerald-400/10" />
            <OverviewCard label="Pending" value={pendingDocs} color="text-amber-400" bg="bg-amber-400/5" border="border-amber-400/10" />
            <OverviewCard label="Missing" value={missingRequired} color="text-rose-400" bg="bg-rose-400/5" border="border-rose-400/10" />
          </div>
        </section>

        {/* SECTION 2: ATTENTION REQUIRED */}
        {missingRequired > 0 && (
          <section className="px-8 max-w-[1600px] mx-auto mb-12">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-rose-400 mb-1">Attention Required</h3>
                  <p className="text-[14px] text-rose-400/70">You have {missingRequired} missing core documents required for applications.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const firstMissing = REQUIRED_DOCS.find(id => !uploadedDocs[id]?.fileUrl);
                  if (firstMissing) handleGlobalUploadClick(firstMissing);
                }}
                className="px-6 py-3 bg-rose-500 text-white rounded-full text-[14px] font-medium hover:bg-rose-600 transition-colors"
              >
                Upload Missing
              </button>
            </div>
          </section>
        )}

        <section className="px-8 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* SECTION 3: CATEGORIES */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                className={`flex items-center gap-4 px-6 py-4 rounded-[20px] text-[14px] font-medium transition-all whitespace-nowrap lg:whitespace-normal ${
                  activeCategory === cat.id ? 'bg-[#151519] text-white border border-white/5' : 'bg-transparent text-gray-500 hover:text-white border border-transparent'
                }`}
              >
                <cat.icon size={18} className={activeCategory === cat.id ? 'text-[#6D5DF6]' : ''} /> {cat.title}
              </button>
            ))}
          </aside>

          {/* DOCUMENTS GRID */}
          <div className="flex-1">
            {displayDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-[#111113] border border-white/5 rounded-[32px]">
                <FileText size={48} className="text-gray-600 mb-6" />
                <h3 className="text-[20px] font-medium mb-2">No documents found</h3>
                <p className="text-[14px] text-gray-400">Try selecting a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayDocs.map(docInfo => {
                  const serverDoc = uploadedDocs[docInfo.id];
                  const isUploading = uploadingDocs[docInfo.id];
                  const hasFile = !!serverDoc?.fileUrl;

                  return (
                    <div key={docInfo.id} className="bg-[#111113] border border-white/5 rounded-[24px] overflow-hidden flex flex-col group hover:border-white/10 hover:shadow-xl transition-all relative">
                      
                      {/* Document Preview Header / Upload Zone */}
                      <div className="h-32 bg-[#151519] border-b border-white/5 relative flex items-center justify-center">
                        {hasFile ? (
                           serverDoc.fileUrl.includes('.pdf') ? (
                             <FileText size={32} className="text-gray-600" />
                           ) : (
                             <ImageIcon size={32} className="text-gray-600" />
                           )
                        ) : (
                           <div className="flex flex-col items-center gap-2">
                             <Upload size={24} className="text-gray-600" />
                             <span className="text-[12px] font-medium text-gray-500">Drag & Drop to Upload</span>
                           </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          {isUploading ? (
                            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-medium text-white flex items-center gap-1.5">
                              <Loader2 size={10} className="animate-spin" /> Uploading
                            </div>
                          ) : hasFile ? (
                            serverDoc.status === 'verified' ? (
                              <div className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                <CheckCircle2 size={10} /> Verified
                              </div>
                            ) : (
                              <div className="px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-[10px] font-medium text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                                <Clock size={10} /> Pending
                              </div>
                            )
                          ) : (
                            <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md text-[10px] font-medium text-gray-500 border border-white/5">
                              Missing
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content & Actions */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-[16px] font-medium mb-1 truncate">{docInfo.label}</h3>
                        <p className="text-[12px] text-gray-500 mb-6">
                          {hasFile ? (serverDoc.uploadedAt?.toDate ? serverDoc.uploadedAt.toDate().toLocaleDateString() : 'Recently') : 'Not uploaded yet'}
                          {hasFile && ' • 1.2 MB'}
                        </p>

                        <div className="flex items-center gap-3 mt-auto">
                          {hasFile ? (
                            <>
                              <button 
                                onClick={() => setPreviewDoc({ id: docInfo.id, doc: serverDoc, info: docInfo })}
                                className="flex-1 py-3 bg-[#151519] hover:bg-white/5 border border-white/5 rounded-[12px] text-[12px] font-medium transition-colors"
                              >
                                Preview
                              </button>
                              <button onClick={() => handleGlobalUploadClick(docInfo.id)} className="w-10 h-10 bg-[#151519] hover:bg-white/5 border border-white/5 rounded-[12px] flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="Replace">
                                <RefreshCcw size={14} />
                              </button>
                              <button onClick={() => setDocToDelete(docInfo.id)} className="w-10 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-[12px] flex items-center justify-center transition-colors" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleGlobalUploadClick(docInfo.id)}
                              disabled={isUploading}
                              className="w-full py-3 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 text-white rounded-[12px] text-[12px] font-medium transition-colors"
                            >
                              {isUploading ? 'Processing...' : 'Select File'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SIDE DRAWER PREVIEW */}
        <AnimatePresence>
          {previewDoc && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewDoc(null)}
            >
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full md:w-[500px] h-full bg-[#111113] border-l border-white/5 shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <h3 className="text-[18px] font-medium">{previewDoc.info.label}</h3>
                  <button onClick={() => setPreviewDoc(null)} className="w-10 h-10 rounded-full bg-[#151519] flex items-center justify-center text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* File Preview Area */}
                  <div className="w-full aspect-[3/4] bg-[#151519] border border-white/5 rounded-[24px] overflow-hidden flex items-center justify-center">
                    {previewDoc.doc.fileUrl.includes('.pdf') ? (
                      <div className="flex flex-col items-center gap-4">
                        <FileText size={64} className="text-[#6D5DF6]" />
                        <a href={previewDoc.doc.fileUrl} target="_blank" rel="noreferrer" className="px-6 py-2 bg-white/10 rounded-full text-[12px] font-medium hover:bg-white/20 transition-colors">Open PDF in new tab</a>
                      </div>
                    ) : (
                      <img src={previewDoc.doc.fileUrl} alt={previewDoc.info.label} className="w-full h-full object-contain" />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-4">
                    <h4 className="text-[14px] font-medium text-white flex items-center gap-2"><Info size={16} /> Metadata</h4>
                    <div className="bg-[#151519] border border-white/5 rounded-[16px] p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500">Status</span>
                        <span className={`font-medium ${previewDoc.doc.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>{previewDoc.doc.status === 'verified' ? 'Verified' : 'Pending Review'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500">Uploaded</span>
                        <span className="text-white">{previewDoc.doc.uploadedAt?.toDate ? previewDoc.doc.uploadedAt.toDate().toLocaleString() : 'Just now'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-500">Size</span>
                        <span className="text-white">1.2 MB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/5 grid grid-cols-2 gap-4">
                  <button onClick={() => window.open(previewDoc.doc.fileUrl, '_blank')} className="py-4 bg-[#151519] hover:bg-white/5 rounded-[16px] text-[14px] font-medium transition-colors flex items-center justify-center gap-2">
                    <Download size={16} /> Download
                  </button>
                  <button onClick={() => { handleGlobalUploadClick(previewDoc.id); }} className="py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-[16px] text-[14px] font-medium transition-colors flex items-center justify-center gap-2">
                    <RefreshCcw size={16} /> Replace
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DELETE CONFIRMATION */}
        <AnimatePresence>
          {docToDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#111113] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center relative">
                <button onClick={() => setDocToDelete(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={20} /></button>
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 mx-auto">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-[20px] font-medium text-white mb-2">Delete Document?</h3>
                <p className="text-[14px] text-gray-400 mb-8">This action cannot be undone. The document will be permanently removed from your vault.</p>
                <div className="flex gap-4">
                  <button onClick={() => setDocToDelete(null)} className="flex-1 py-3 bg-[#151519] border border-white/5 hover:bg-white/5 rounded-[16px] text-[14px] font-medium transition-all">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 rounded-[16px] text-[14px] font-medium text-white transition-all">Delete</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  );
}

function OverviewCard({ label, value, color, bg = 'bg-[#151519]', border = 'border-white/5' }: { label: string, value: number, color: string, bg?: string, border?: string }) {
  return (
    <div className={`${bg} border ${border} rounded-[24px] p-6 flex flex-col gap-2`}>
      <span className="text-[14px] font-medium text-gray-400">{label}</span>
      <span className={`text-[32px] font-medium ${color}`}>{value}</span>
    </div>
  )
}

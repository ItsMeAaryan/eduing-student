'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { 
  User, Mail, Phone, MapPin, GraduationCap, 
  Camera, Edit3, Calendar, Shield, Search, 
  Check, X, FileText, Upload, Trash2, Eye, 
  AlertCircle, Loader2, Globe, Bookmark,
  CreditCard, Settings, ChevronRight, Info,
  Unlock, Trash, Bell, LogOut, Verified,
  ExternalLink, Download
} from 'lucide-react'
import { 
  updateUserProfile, 
  uploadProfilePhoto, 
  listenUserProfile, 
  uploadUserDocument, 
  listenUserDocuments,
  calculateProfileCompletion,
  removeProfilePhoto,
  deleteUserDocument,
  listenUserPayments
} from '@/lib/firebase/student'
import { listenStudentApplications } from '@/lib/firebase/applications'
import { onAuthChange } from '@/lib/firebase/auth'
import { UserProfile, UserDocument } from '@/types/firebase'
import { useSearchParams } from 'next/navigation'
import Cropper from 'react-easy-crop'

export default function AccountPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const isIncomplete = searchParams.get('incomplete') === 'true'
  
  const [activeTab, setActiveTab] = useState('profile')
  const [fullProfile, setFullProfile] = useState<UserProfile | null>(null)
  const [documents, setDocuments] = useState<Record<string, UserDocument>>({})
  const [payments, setPayments] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(isIncomplete)
  const [showToast, setShowToast] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(isIncomplete)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Crop states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: 'male',
    category: 'General',
    nationality: 'Indian',
    address: '',
    state: 'Karnataka',
    tenthPercentage: '',
    twelfthPercentage: '',
    entranceExam: '',
    entranceScore: ''
  })

  useEffect(() => {
    console.log("[PROFILE] Initializing data streams...");
    
    // Failsafe: stop loading after 10 seconds no matter what
    const failsafeTimeout = setTimeout(() => {
      if (loading) {
        console.warn("[PROFILE] Loading timed out. Forcing UI render.");
        setLoading(false);
      }
    }, 10000);

    const handleError = (err: any) => {
      console.error("[PROFILE] Data fetch error:", err);
      setError("Failed to load profile data. Please refresh or check your connection.");
      setLoading(false);
    };

    const unsub = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        console.log("[PROFILE] Auth state: User detected", firebaseUser.uid);
        
        try {
          const unsubProfile = listenUserProfile(firebaseUser.uid, (data) => {
            console.log("[PROFILE] Received profile data update");
            if (data) {
              setFullProfile(data);
              setFormData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                dob: data.dob || '',
                gender: data.gender || 'male',
                category: data.category || 'General',
                nationality: data.nationality || 'Indian',
                address: data.address || '',
                state: data.state || 'Karnataka',
                tenthPercentage: data.tenthPercentage?.toString() || '',
                twelfthPercentage: data.twelfthPercentage?.toString() || '',
                entranceExam: data.entranceExam || '',
                entranceScore: data.entranceScore?.toString() || ''
              });
            } else {
              console.warn("[PROFILE] No profile document found for user.");
            }
            setLoading(false);
            clearTimeout(failsafeTimeout);
          }, handleError);

          const unsubDocs = listenUserDocuments(firebaseUser.uid, (docs) => {
            console.log("[PROFILE] Received documents update");
            setDocuments(docs || {});
          }, (err) => console.warn("[PROFILE] Docs fetch error:", err));

          const unsubPayments = listenUserPayments(firebaseUser.uid, (pay) => {
            console.log("[PROFILE] Received payments update");
            setPayments(pay || []);
          }, (err) => console.warn("[PROFILE] Payments fetch error:", err));

          const unsubApps = listenStudentApplications(firebaseUser.uid, (apps) => {
            console.log("[PROFILE] Received applications update");
            setApplications(apps || []);
          }, (err) => console.warn("[PROFILE] Apps fetch error:", err));

          return () => {
            console.log("[PROFILE] Cleaning up listeners...");
            unsubProfile();
            unsubDocs();
            unsubPayments();
            unsubApps();
            clearTimeout(failsafeTimeout);
          };
        } catch (err) {
          handleError(err);
        }
      } else {
        console.log("[PROFILE] Auth state: No user detected");
        setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    });

    return () => {
      unsub();
      clearTimeout(failsafeTimeout);
    };
  }, []);

  useEffect(() => {
    if (fullProfile && !isEditing) {
      try {
        const docsCount = Object.values(documents || {}).filter(d => !!d.fileUrl).length
        const completion = calculateProfileCompletion(fullProfile, docsCount)
        
        // Only update if there is a real change to avoid infinite loops
        if (Math.abs((completion || 0) - (fullProfile.profileCompletion || 0)) > 0.5) {
          console.log(`[PROFILE] Updating completion status: ${completion}%`);
          updateUserProfile(fullProfile.uid, { profileCompletion: completion })
            .catch(err => console.error("[PROFILE] Failed to update completion:", err));
        }
      } catch (err) {
        console.error("[PROFILE] Error calculating completion:", err);
      }
    }
  }, [fullProfile, documents, isEditing])

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImageToCrop(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleUploadCroppedImage = async () => {
    if (!imageToCrop || !user) return
    try {
      setUploadingDoc('photo')
      // For demo, we'll just upload the original file or a mock blob
      // In production, use canvas.toBlob() with croppedAreaPixels
      const response = await fetch(imageToCrop)
      const blob = await response.blob()
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      
      await uploadProfilePhoto(user.uid, file)
      setImageToCrop(null)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('Failed to upload photo')
    } finally {
      setUploadingDoc(null)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: any) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      setUploadingDoc(docId)
      await uploadUserDocument(user.uid, file, docId)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err: any) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploadingDoc(null)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      await updateUserProfile(user.uid, {
        ...formData,
        tenthPercentage: parseFloat(formData.tenthPercentage),
        twelfthPercentage: parseFloat(formData.twelfthPercentage),
        entranceScore: parseFloat(formData.entranceScore)
      } as any)
      setShowToast(true)
      setIsEditing(false)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('Failed to update profile')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-6">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" 
      />
      <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Initializing Secure Dossier...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 text-red-500">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-black mb-4">Connection Interrupted</h2>
      <p className="text-white/40 max-w-md mb-8">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
      >
        Retry Connection
      </button>
    </div>
  )

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'verification', label: 'Verification', icon: Verified },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const completionChecklist = [
    { label: 'Personal Information', completed: !!fullProfile?.fullName && !!fullProfile?.phone },
    { label: 'Academic Metadata', completed: !!fullProfile?.tenthPercentage && !!fullProfile?.twelfthPercentage },
    { label: 'Digital Vault (Docs)', completed: Object.values(documents).filter(d => !!d.fileUrl).length >= 4 },
    { label: 'Biometric Photo', completed: !!fullProfile?.profilePhotoURL },
  ]

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500/50 focus:bg-indigo-500/5 outline-none transition-all placeholder:text-white/10"
  const labelStyle = "text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 mb-2 block"

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-indigo-500/30 font-sans pb-24">
        
        {/* CROP MODAL */}
        <AnimatePresence>
          {imageToCrop && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl">
              <div className="bg-[#111114] border border-white/10 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-xl font-black">Biometric Profile Crop</h3>
                  <button onClick={() => setImageToCrop(null)} className="text-white/40 hover:text-white"><X size={24} /></button>
                </div>
                <div className="h-[400px] relative bg-black/50">
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="p-8 bg-[#111114] space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-white/30">Zoom</span>
                    <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-indigo-500" />
                  </div>
                  <button onClick={handleUploadCroppedImage} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 transition-all">
                    Finalize & Upload
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto px-6 pt-12">
          {/* HEADER SECTION */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <Shield size={14} /> Encrypted Student Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Account Management</h1>
              <p className="text-white/40 text-lg">Identity, credentials, and financial history.</p>
            </div>

            <div className="flex bg-[#111114] border border-white/5 rounded-3xl p-1.5 overflow-x-auto no-scrollbar max-w-full">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
                {/* PROFILE SIDEBAR */}
                <div className="space-y-8">
                  <div className="bg-[#111114] border border-white/5 rounded-[40px] p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[60px]" />
                    
                    <div className="relative group mx-auto w-40 h-40 mb-8">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 p-1">
                        <div className="w-full h-full rounded-full bg-[#111114] flex items-center justify-center overflow-hidden relative">
                          {fullProfile?.profilePhotoURL ? (
                            <img src={fullProfile.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={64} className="text-white/10" />
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Camera className="text-white" />
                            <input type="file" className="hidden" onChange={handlePhotoSelect} accept="image/*" />
                          </label>
                        </div>
                      </div>
                      {fullProfile?.isVerified && <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#111114] flex items-center justify-center text-white"><Check size={16} strokeWidth={4} /></div>}
                    </div>

                    {(() => {
                    const getName = () => {
                      const rawName = fullProfile?.fullName || user?.displayName
                      if (rawName) {
                        return rawName.split(' ').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')
                      }
                      const email = user?.email || ''
                      if (email.includes('@')) {
                        const prefix = email.split('@')[0]
                        return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase()
                      }
                      return 'Student'
                    }
                    const resolvedName = getName()
                    
                    return (
                      <>
                        <h2 className="text-2xl font-black mb-1">{resolvedName}</h2>
                        <p className="text-white/30 text-sm mb-10">{user?.email || fullProfile?.email}</p>
                      </>
                    )
                  })()}

                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                         <span>Dossier Completion</span>
                         <span className="text-indigo-400">{fullProfile?.profileCompletion || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${fullProfile?.profileCompletion || 0}%` }} className="h-full bg-gradient-to-r from-indigo-600 to-violet-600" />
                       </div>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                         <div className="text-[9px] font-black uppercase text-white/20 mb-1">Dossiers</div>
                         <div className="text-xl font-black">{applications.length}</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                         <div className="text-[9px] font-black uppercase text-white/20 mb-1">Status</div>
                         <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111114] border border-white/5 rounded-[40px] p-8">
                    <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Completion Checklist
                    </h3>
                    <div className="space-y-6">
                      {completionChecklist.map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <span className={`text-sm font-bold ${item.completed ? 'text-white/40' : 'text-white'}`}>{item.label}</span>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/10 group-hover:text-white/20'}`}>
                            {item.completed ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PROFILE FORM */}
                <div className="space-y-8">
                  <div className="bg-[#111114] border border-white/5 rounded-[40px] p-10">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-2xl font-black tracking-tight">Personal Metadata</h3>
                       <button onClick={() => setIsEditing(!isEditing)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'}`}>
                         {isEditing ? 'Cancel Edit' : 'Edit Identity'}
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className={labelStyle}>Full Legal Name</label>
                         {isEditing ? <input className={inputStyle} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.fullName}</div>}
                       </div>
                       <div className="space-y-2">
                         <label className={labelStyle}>Global Phone</label>
                         {isEditing ? <input className={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.phone}</div>}
                       </div>
                       <div className="space-y-2">
                         <label className={labelStyle}>Date of Birth</label>
                         {isEditing ? <input type="date" className={inputStyle + " [color-scheme:dark]"} value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.dob}</div>}
                       </div>
                       <div className="space-y-2">
                         <label className={labelStyle}>State of Residence</label>
                         {isEditing ? <input className={inputStyle} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.state}</div>}
                       </div>
                       <div className="md:col-span-2 space-y-2">
                         <label className={labelStyle}>Detailed Address</label>
                         {isEditing ? <textarea className={inputStyle + " h-32 resize-none"} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1 leading-relaxed">{formData.address}</div>}
                       </div>
                    </div>
                  </div>

                  <div className="bg-[#111114] border border-white/5 rounded-[40px] p-10">
                    <h3 className="text-2xl font-black tracking-tight mb-10">Academic Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className={labelStyle}>10th Percentage (%)</label>
                         {isEditing ? <input type="number" className={inputStyle} value={formData.tenthPercentage} onChange={e => setFormData({...formData, tenthPercentage: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.tenthPercentage}%</div>}
                       </div>
                       <div className="space-y-2">
                         <label className={labelStyle}>12th Percentage (%)</label>
                         {isEditing ? <input type="number" className={inputStyle} value={formData.twelfthPercentage} onChange={e => setFormData({...formData, twelfthPercentage: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.twelfthPercentage}%</div>}
                       </div>
                       <div className="space-y-2">
                         <label className={labelStyle}>Entrance Exam</label>
                         {isEditing ? <input className={inputStyle} value={formData.entranceExam} onChange={e => setFormData({...formData, entranceExam: e.target.value})} placeholder="e.g. JEE Main" /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.entranceExam}</div>}
                       </div>
                       <div className="space-y-2">
                         <label className={labelStyle}>Score / Rank</label>
                         {isEditing ? <input type="number" className={inputStyle} value={formData.entranceScore} onChange={e => setFormData({...formData, entranceScore: e.target.value})} /> : <div className="text-white/60 font-bold p-1 ml-1">{formData.entranceScore}</div>}
                       </div>
                    </div>

                    {isEditing && (
                      <div className="mt-12 pt-12 border-t border-white/5 flex justify-end gap-4">
                         <button onClick={() => setIsEditing(false)} className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">Discard Changes</button>
                         <button onClick={handleUpdateProfile} className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">Finalize Metadata</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { id: '10th_marksheet', label: '10th Marksheet', icon: FileText },
                    { id: '12th_marksheet', label: '12th Marksheet', icon: FileText },
                    { id: 'id_proof', label: 'Identity Proof', icon: Shield },
                    { id: 'passport_photo', label: 'Passport Size Photo', icon: Camera }
                  ].map(docType => {
                    const doc = documents[docType.id]
                    const isUploading = uploadingDoc === docType.id
                    return (
                      <div key={docType.id} className="bg-[#111114] border border-white/5 rounded-[32px] p-8 flex flex-col items-center text-center relative group">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all ${doc?.fileUrl ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/20'}`}>
                           <docType.icon size={32} />
                        </div>
                        <h4 className="font-black text-sm mb-1 uppercase tracking-tight">{docType.label}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-8 ${doc?.status === 'verified' ? 'text-green-500' : 'text-white/20'}`}>
                           {doc?.fileUrl ? (doc.status === 'verified' ? 'System Verified' : 'Evaluation Pending') : 'Action Required'}
                        </p>
                        
                        <div className="w-full space-y-3">
                          {doc?.fileUrl ? (
                            <>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <Eye size={14} /> View File
                              </a>
                              <button onClick={() => deleteUserDocument(user.uid, docType.id)} className="flex items-center justify-center gap-2 w-full py-3 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
                                <Trash2 size={14} /> Remove
                              </button>
                            </>
                          ) : (
                            <label className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-indigo-600/10">
                              {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                              {isUploading ? 'Uploading...' : 'Secure Upload'}
                              <input type="file" className="hidden" onChange={e => handleDocumentUpload(e, docType.id)} accept="image/*,.pdf" />
                            </label>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-[32px] p-8 flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <Info size={28} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-amber-500">Document Integrity Notice</h4>
                      <p className="text-amber-500/60 text-sm max-w-3xl">Please ensure all uploads are high-resolution scans. Obscured or unreadable documents will lead to immediate rejection of all active applications. Only PDF or JPG/PNG formats are accepted.</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'verification' && (
              <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto py-12 text-center">
                 <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 text-green-500 relative">
                    <Verified size={64} />
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                 </div>
                 <h2 className="text-4xl font-black mb-4">Identity Verification Status</h2>
                 <p className="text-white/40 text-lg mb-12">Your account is currently under **Tier 1 Level 2 Verification**. This allows you to apply for any university on the platform.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Email', status: 'Verified' },
                      { label: 'Phone', status: 'Verified' },
                      { label: 'Identity', status: 'Processing' }
                    ].map((v, i) => (
                      <div key={i} className="bg-[#111114] border border-white/5 rounded-3xl p-6">
                         <div className="text-[10px] font-black uppercase text-white/20 mb-2">{v.label}</div>
                         <div className={`text-sm font-black uppercase tracking-widest ${v.status === 'Verified' ? 'text-green-500' : 'text-amber-500'}`}>{v.status}</div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                 {payments.length === 0 ? (
                   <div className="py-32 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/10 border border-white/5">
                        <CreditCard size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-white/40 mb-2">No Transaction History</h3>
                      <p className="text-white/20 text-sm">Your financial history for application fees will appear here.</p>
                   </div>
                 ) : (
                   <div className="bg-[#111114] border border-white/5 rounded-[40px] overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                            <th className="px-10 py-8">Transaction ID</th>
                            <th className="px-10 py-8">Purpose</th>
                            <th className="px-10 py-8">Amount</th>
                            <th className="px-10 py-8">Status</th>
                            <th className="px-10 py-8">Date</th>
                            <th className="px-10 py-8">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map(pay => (
                            <tr key={pay.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                              <td className="px-10 py-8 font-mono text-xs text-white/40">#{pay.id.slice(0, 10)}</td>
                              <td className="px-10 py-8 font-black text-sm">{pay.purpose}</td>
                              <td className="px-10 py-8 font-black text-sm">₹{pay.amount}</td>
                              <td className="px-10 py-8">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${pay.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{pay.status}</span>
                              </td>
                              <td className="px-10 py-8 text-xs text-white/40">{pay.createdAt?.toDate().toLocaleDateString()}</td>
                              <td className="px-10 py-8">
                                 <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"><Download size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#111114] border border-white/5 rounded-[40px] p-10 space-y-8">
                       <h3 className="text-xl font-black mb-10 flex items-center gap-3"><Unlock size={24} className="text-indigo-500" /> Security Perimeter</h3>
                       <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 py-5 px-6 rounded-2xl flex items-center justify-between group transition-all">
                          <div className="text-left">
                            <div className="text-sm font-black mb-1">Update Password</div>
                            <div className="text-[10px] text-white/30 uppercase font-bold">Recommended every 90 days</div>
                          </div>
                          <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                       </button>
                       <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 py-5 px-6 rounded-2xl flex items-center justify-between group transition-all">
                          <div className="text-left">
                            <div className="text-sm font-black mb-1">Two-Factor Authentication</div>
                            <div className="text-[10px] text-green-500 uppercase font-bold">Enabled via Authenticator</div>
                          </div>
                          <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                       </button>
                    </div>

                    <div className="bg-[#111114] border border-white/5 rounded-[40px] p-10 space-y-8">
                       <h3 className="text-xl font-black mb-10 flex items-center gap-3"><Bell size={24} className="text-indigo-500" /> Notification Logic</h3>
                       <div className="space-y-6">
                         {[
                           { label: 'Application Updates', desc: 'Alerts when status changes' },
                           { label: 'System Announcements', desc: 'Critical infrastructure notices' },
                           { label: 'Marketing Communications', desc: 'Exclusive institutional offers' }
                         ].map((n, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-black">{n.label}</div>
                                <div className="text-[10px] text-white/30 font-bold">{n.desc}</div>
                              </div>
                              <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                                 <div className="absolute right-1 top-1 bottom-1 w-4 h-4 bg-white rounded-full" />
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="md:col-span-2 bg-red-500/5 border border-red-500/10 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div>
                         <h3 className="text-xl font-black text-red-500 mb-2 flex items-center gap-3"><Trash size={24} /> Dangerous Actions</h3>
                         <p className="text-red-500/40 text-sm max-w-xl">Permanently delete your EDUING account and all associated application history. This action is irreversible and will immediately terminate all active admissions.</p>
                       </div>
                       <button className="bg-red-500 hover:bg-red-400 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all">Terminate Account</button>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOAST NOTIFICATION */}
        <AnimatePresence>
          {showToast && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-10 py-5 rounded-full font-black text-sm shadow-2xl flex items-center gap-3 z-50">
              <CheckCircle2 size={24} /> ACCOUNT SYNCED SUCCESSFULLY
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}

function CheckCircle2({ size, className = "" }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

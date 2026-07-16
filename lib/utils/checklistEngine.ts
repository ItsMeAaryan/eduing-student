import { calculateProfileStrength } from './profileStrength';

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface AdmissionTask {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedTime: number; // in minutes
  actionLabel: string;
  actionUrl: string;
  iconType: 'Document' | 'Profile' | 'Application' | 'Deadline' | 'Bookmark';
}

export interface ChecklistResult {
  tasks: AdmissionTask[];
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  estimatedTimeRemaining: number;
}

export function generateAdmissionChecklist(data: {
  profile: any;
  documents: any[]; 
  applications: any[];
  savedPrograms: any[];
  deadlines: any[];
}): ChecklistResult {
  const tasks: AdmissionTask[] = [];
  
  // 1. Profile Strength Tasks
  const profileStrength = calculateProfileStrength(data.profile, data.profile?.documents || {});
  
  if (profileStrength.percentage === 0) {
    tasks.push({
      id: 'profile_start',
      title: 'Complete Your Profile',
      description: 'Start building your student profile to unlock features.',
      priority: 'High',
      estimatedTime: 5,
      actionLabel: 'Complete Now',
      actionUrl: '/student/profile',
      iconType: 'Profile'
    });
  } else {
    // Convert missing profile fields into tasks
    profileStrength.missingFields.forEach(field => {
      let priority: TaskPriority = field.priority === 'High' ? 'High' : (field.priority === 'Medium' ? 'Medium' : 'Low');
      const isDoc = field.key.startsWith('doc_');
      
      tasks.push({
        id: `missing_${field.key}`,
        title: isDoc ? `Upload ${field.label}` : `Complete ${field.label}`,
        description: isDoc ? 'Required for university verification' : 'Boosts your admission probability',
        priority,
        estimatedTime: field.timeMin,
        actionLabel: isDoc ? 'Upload' : 'Update',
        actionUrl: isDoc ? '/student/documents' : '/student/profile',
        iconType: isDoc ? 'Document' : 'Profile'
      });
    });
  }

  // 2. Deadlines
  if (data.deadlines && data.deadlines.length > 0) {
    data.deadlines.forEach((d, idx) => {
      // Just taking the first one as Critical if it exists, others as High
      const priority = idx === 0 ? 'Critical' : 'High';
      tasks.push({
        id: `deadline_${d.id || idx}`,
        title: `Finish ${d.universityName || 'Application'}`,
        description: `Deadline: ${d.date || 'Approaching soon'}`,
        priority,
        estimatedTime: 15,
        actionLabel: 'Continue',
        actionUrl: '/student/applications',
        iconType: 'Deadline'
      });
    });
  }

  // 3. Applications
  const incompleteApps = data.applications.filter(app => !app.status || app.status === 'submitted' || app.status === 'under_review');
  incompleteApps.forEach(app => {
    tasks.push({
      id: `app_${app.id}`,
      title: `Complete ${app.universityName || 'Application'}`,
      description: 'Your application requires further action.',
      priority: 'High',
      estimatedTime: 10,
      actionLabel: 'Open',
      actionUrl: `/student/applications/${app.id}`,
      iconType: 'Application'
    });
  });

  // 4. Saved Universities
  if (!data.savedPrograms || data.savedPrograms.length === 0) {
    tasks.push({
      id: 'save_program',
      title: 'Save Universities',
      description: 'Bookmark programs you are interested in.',
      priority: 'Low',
      estimatedTime: 2,
      actionLabel: 'Explore',
      actionUrl: '/student/discover',
      iconType: 'Bookmark'
    });
  }

  // Deduplicate and Sort
  const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  tasks.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

  const finalTasks = tasks.slice(0, 6); // Keep top 6 most important tasks
  
  // Calculate realistic stats
  const completedTasks = profileStrength.completedFields + 
                         data.documents.length + 
                         (data.applications.length - incompleteApps.length) + 
                         (data.savedPrograms.length > 0 ? 1 : 0);
                         
  const totalTasks = completedTasks + tasks.length;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    tasks: finalTasks,
    completedTasks,
    totalTasks,
    completionPercentage,
    criticalCount: finalTasks.filter(t => t.priority === 'Critical').length,
    highCount: finalTasks.filter(t => t.priority === 'High').length,
    mediumCount: finalTasks.filter(t => t.priority === 'Medium').length,
    lowCount: finalTasks.filter(t => t.priority === 'Low').length,
    estimatedTimeRemaining: finalTasks.reduce((acc, t) => acc + t.estimatedTime, 0)
  };
}

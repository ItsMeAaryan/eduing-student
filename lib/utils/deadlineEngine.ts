export interface DeadlineInsight {
  id: string;
  title: string;
  date: Date;
  universityName?: string;
  type: string;
  status: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Completed';
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  estimatedTime: string;
  requiredDocuments: string[];
  daysRemaining: number;
  appId?: string;
}

export function generateDeadlineInsights(studentData: {
  deadlines: any[];
  applications: any[];
  documents: any[];
  profileScore: number;
}) {
  const { deadlines, applications, documents, profileScore } = studentData;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const insights: DeadlineInsight[] = [];

  // Parse direct deadlines
  (Array.isArray(deadlines) ? deadlines : []).forEach((d: any, idx) => {
    if (!d.date) return;
    const dDate = new Date(d.date?.toDate ? d.date.toDate() : d.date);
    dDate.setHours(0, 0, 0, 0);
    if (isNaN(dDate.getTime())) return;

    const timeDiff = dDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const isCompleted = d.status === 'Completed' || d.status === 'completed';

    insights.push(createInsight({
      id: d.id || `deadline-${idx}`,
      title: d.title || 'Deadline',
      date: dDate,
      universityName: d.universityName || d.university || 'Various',
      type: d.type || 'deadline',
      status: isCompleted ? 'Completed' : 'Pending',
      daysRemaining,
      isCompleted,
      documents,
      profileScore
    }));
  });

  // Add application deadlines
  (Array.isArray(applications) ? applications : []).forEach((a: any) => {
    if (!a.deadline) return;
    const dDate = new Date(a.deadline?.toDate ? a.deadline.toDate() : a.deadline);
    dDate.setHours(0, 0, 0, 0);
    if (isNaN(dDate.getTime())) return;

    const timeDiff = dDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const isCompleted = a.status === 'submitted' || a.status === 'selected';

    insights.push(createInsight({
      id: `app-${a.id}`,
      title: 'Application Deadline',
      date: dDate,
      universityName: a.universityName || 'University',
      type: 'Application Deadline',
      status: isCompleted ? 'Completed' : 'Pending',
      daysRemaining,
      isCompleted,
      documents,
      profileScore,
      appId: a.id
    }));
  });

  // Sort insights
  insights.sort((a, b) => {
    if (a.priority === 'Completed' && b.priority !== 'Completed') return 1;
    if (a.priority !== 'Completed' && b.priority === 'Completed') return -1;
    return a.date.getTime() - b.date.getTime();
  });

  const criticalTasks = insights.filter(i => i.priority === 'Critical');
  const upcomingDeadlines = insights.filter(i => (i.priority === 'High' || i.priority === 'Medium' || i.priority === 'Low') && i.daysRemaining >= 0);
  const completedDeadlines = insights.filter(i => i.priority === 'Completed');

  const estimatedWorkload = {
    tasks: criticalTasks.length + upcomingDeadlines.length,
    estimatedMinutes: (criticalTasks.length * 45) + (upcomingDeadlines.length * 15),
    difficulty: criticalTasks.length > 2 ? 'High' : (criticalTasks.length > 0 ? 'Medium' : 'Low')
  };

  const dailyPlan = insights.filter(i => i.daysRemaining === 0 && i.priority !== 'Completed');
  const weeklyPlan = insights.filter(i => i.daysRemaining > 0 && i.daysRemaining <= 7 && i.priority !== 'Completed');

  return {
    insights,
    criticalTasks,
    upcomingDeadlines,
    completedDeadlines,
    estimatedWorkload,
    dailyPlan,
    weeklyPlan
  };
}

function createInsight({
  id, title, date, universityName, type, status, daysRemaining, isCompleted, documents, profileScore, appId
}: any): DeadlineInsight {
  
  let priority: DeadlineInsight['priority'] = 'Low';
  if (isCompleted) {
    priority = 'Completed';
  } else if (daysRemaining < 0) {
    priority = 'Critical'; // Overdue
  } else if (daysRemaining <= 2) {
    priority = 'Critical';
  } else if (daysRemaining <= 7) {
    priority = 'High';
  } else if (daysRemaining <= 30) {
    priority = 'Medium';
  }

  const missingDocs: string[] = [];
  let riskLevel: DeadlineInsight['riskLevel'] = 'Low Risk';
  let estimatedTime = '15 mins';

  if (!isCompleted) {
    if (!documents.some((d: any) => d.name?.toLowerCase().includes('12th') || d.name?.toLowerCase().includes('mark'))) {
      missingDocs.push('12th Marksheet');
    }
    
    if (missingDocs.length > 0) riskLevel = 'High Risk';
    else if (profileScore < 80) riskLevel = 'Medium Risk';

    if (daysRemaining <= 7 && riskLevel === 'Medium Risk') riskLevel = 'High Risk';

    if (missingDocs.length > 0) estimatedTime = '45 mins';
    else if (profileScore < 80) estimatedTime = '30 mins';
  }

  return {
    id,
    title,
    date,
    universityName,
    type,
    status,
    priority,
    riskLevel,
    estimatedTime,
    requiredDocuments: missingDocs,
    daysRemaining,
    appId
  };
}

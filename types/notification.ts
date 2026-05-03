export type NotificationType = 
  | 'application_submitted' 
  | 'status_update' 
  | 'deadline_alert' 
  | 'system' 
  | 'approval';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
  link?: string;
}

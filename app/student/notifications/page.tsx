'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Bell, Info, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Application Update',
    message: 'Your application to Indian Institute of Technology has been moved to "Under Review".',
    time: '2 hours ago',
    type: 'info',
    icon: Clock,
    color: '#fbbf24'
  },
  {
    id: 2,
    title: 'Selection Confirmed',
    message: 'Congratulations! You have been selected for the Mechanical Engineering program at Dayananda Sagar University.',
    time: '1 day ago',
    type: 'success',
    icon: CheckCircle2,
    color: '#10b981'
  },
  {
    id: 3,
    title: 'Profile Incomplete',
    message: 'Please complete your profile to improve your admission chances.',
    time: '3 days ago',
    type: 'warning',
    icon: AlertCircle,
    color: '#f87171'
  },
  {
    id: 4,
    title: 'New Program Available',
    message: 'VIT Vellore just added a new program: B.Tech in Artificial Intelligence.',
    time: '5 days ago',
    type: 'info',
    icon: Info,
    color: '#6c6fff'
  },
]

export default function NotificationsPage() {
  const [notifications] = useState(MOCK_NOTIFICATIONS)

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
          
          <header style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Notifications</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>
              Stay updated with your application progress and news
            </p>
          </header>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            maxWidth: '1000px'
          }}>
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  transition: '0.25s cubic-bezier(0.16,1,0.3,1)',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(108,111,255,0.3)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
              >
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: `${notif.color}15`, 
                  color: notif.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <notif.icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>{notif.title}</h3>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{notif.time}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
                    {notif.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div style={{ 
              padding: '60px', 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.3)',
              background: '#111111',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)'
            }}>
              <Bell size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>No new notifications</p>
            </div>
          )}

        </div>
    </ProtectedRoute>
  )
}

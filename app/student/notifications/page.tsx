'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Bell, Info, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'

export default function NotificationsPage() {
  const { notifications } = useStudentData()

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
            {notifications.map((notif: any, i: number) => {
              let Icon = Clock;
              let color = '#6c6fff';
              
              if (notif.type === 'offer') { Icon = CheckCircle2; color = '#10b981' }
              else if (notif.type === 'warning') { Icon = AlertCircle; color = '#f87171' }
              else if (notif.type === 'status') { Icon = Info; color = '#fbbf24' }

              return (
              <motion.div
                key={notif.id || i}
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
                  background: `${color}15`, 
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>{notif.title || 'Notification'}</h3>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{notif.createdAt?.toDate?.().toLocaleDateString() || notif.time || 'Recent'}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
                    {notif.message || notif.description}
                  </p>
                </div>
              </motion.div>
            )})}
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

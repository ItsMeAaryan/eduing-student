'use client'

import React from 'react'

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding: '2rem', color: 'red'}}>
          <h2>Something went wrong</h2>
          <pre>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

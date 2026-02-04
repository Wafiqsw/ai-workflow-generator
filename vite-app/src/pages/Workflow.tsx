import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Mock workflow data (same as Dashboard)
const mockWorkflows = [
  {
    id: '1',
    title: 'Customer Onboarding Flow',
    status: 'active',
    lastModified: '2 hours ago',
    description: 'Automated workflow for onboarding new customers with email verification, profile setup, and welcome sequence.',
    steps: ['Email Verification', 'Profile Setup', 'Welcome Email', 'Assign Account Manager'],
    createdAt: 'Jan 15, 2024'
  },
  {
    id: '2',
    title: 'Data Processing Pipeline',
    status: 'active',
    lastModified: '5 hours ago',
    description: 'Process and transform incoming data from multiple sources, validate, and store in the database.',
    steps: ['Data Ingestion', 'Validation', 'Transformation', 'Storage'],
    createdAt: 'Jan 20, 2024'
  },
  {
    id: '3',
    title: 'Email Notification System',
    status: 'draft',
    lastModified: 'Yesterday',
    description: 'Send automated email notifications based on user actions and system events.',
    steps: ['Event Trigger', 'Template Selection', 'Personalization', 'Send Email'],
    createdAt: 'Feb 1, 2024'
  },
  {
    id: '4',
    title: 'Invoice Generation Workflow',
    status: 'active',
    lastModified: 'Yesterday',
    description: 'Automatically generate and send invoices to customers on a monthly basis.',
    steps: ['Calculate Charges', 'Generate PDF', 'Send Invoice', 'Update Records'],
    createdAt: 'Dec 10, 2023'
  },
  {
    id: '5',
    title: 'User Authentication Flow',
    status: 'draft',
    lastModified: '2 days ago',
    description: 'Handle user login, registration, password reset, and session management.',
    steps: ['Credential Validation', 'Session Creation', 'Token Generation', 'Access Control'],
    createdAt: 'Feb 3, 2024'
  },
  {
    id: '6',
    title: 'Report Generation System',
    status: 'archived',
    lastModified: '3 days ago',
    description: 'Generate monthly reports with analytics, charts, and insights for stakeholders.',
    steps: ['Data Collection', 'Analysis', 'Chart Generation', 'PDF Export'],
    createdAt: 'Nov 5, 2023'
  },
]

const Workflow: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const workflow = mockWorkflows.find(w => w.id === id)

  if (!workflow) {
    return (
      <div className="min-h-full flex items-center justify-center px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Workflow Not Found</h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8">The workflow you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl font-bold text-lg text-black shadow-xl hover:shadow-2xl hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'draft':
        return 'text-gold-400 bg-gold-500/10 border-gold-500/30'
      case 'archived':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-full px-8 py-12 lg:px-16 lg:py-16">
      {/* Back Button */}
      {/* Workflow Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-accent-500 mb-3 tracking-tight">
              {workflow.title}
            </h1>
            <p className="text-base text-[var(--text-secondary)] font-medium mb-3">
              {workflow.description}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(workflow.status)} whitespace-nowrap`}>
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 hover:text-gold-400 transition-colors group py-1"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold">Dashboard</span>
          </button>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-4 font-medium">
            <span>Created: {workflow.createdAt}</span>
            <span className="opacity-30">•</span>
            <span>Last modified: {workflow.lastModified}</span>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl p-8 border-2 border-[var(--border-primary)] mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Workflow Steps</h2>

        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-6 p-6 bg-[var(--bg-secondary)] rounded-2xl border-2 border-[var(--border-secondary)] hover:border-gold-500/30 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/30">
                <span className="text-lg font-extrabold text-black">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{step}</h3>
              </div>
              <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl font-bold text-base text-black shadow-lg hover:shadow-xl hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105">
          Edit Workflow
        </button>
        <button className="px-6 py-3 bg-gold-500/10 hover:bg-gold-500/20 rounded-xl font-bold text-base text-[var(--text-primary)] transition-all duration-300 hover:scale-105 border-2 border-gold-500/30 hover:border-gold-500/50">
          Run Workflow
        </button>
        <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl font-bold text-base text-red-400 transition-all duration-300 hover:scale-105 border-2 border-red-500/30 hover:border-red-500/50">
          Delete
        </button>
      </div>
    </div>
  )
}

export { Workflow }
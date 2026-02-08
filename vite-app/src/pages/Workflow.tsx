import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WorkflowEditor } from '../components/workflow-editor/WorkflowEditor'
import { getWorkflow, runWorkflow, getRunStatus } from '../api/agents'
import type { WorkflowData, RunStatus, TaskResult } from '../api/agents'
import { workflowToReactFlow } from '../utils/workflowTransform'
import { mockStepsToN8n, n8nToReactFlow } from '../utils/n8nTransform'

// Mock workflow data (fallback for non-wf_ IDs)
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

function formatWorkflowName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

const Workflow: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isRealWorkflow = id?.startsWith('wf_')

  const [realWorkflow, setRealWorkflow] = useState<WorkflowData | null>(null)
  const [loading, setLoading] = useState(isRealWorkflow ?? false)
  const [error, setError] = useState(false)

  // Execution state
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const handleRunWorkflow = useCallback(async () => {
    if (!id || !isRealWorkflow || isRunning) return
    setIsRunning(true)
    setRunStatus({ status: 'running', progress: 0, tasks: [], error: null })

    try {
      const { job_id } = await runWorkflow(id)

      pollRef.current = setInterval(async () => {
        try {
          const status = await getRunStatus(id, job_id)
          setRunStatus(status)

          if (status.status === 'completed' || status.status === 'failed') {
            stopPolling()
            setIsRunning(false)
            // Refresh workflow data to pick up status change
            if (status.status === 'completed') {
              getWorkflow(id).then(setRealWorkflow).catch(() => {})
            }
          }
        } catch {
          stopPolling()
          setIsRunning(false)
          setRunStatus(prev => prev ? { ...prev, status: 'failed', error: 'Lost connection to server' } : null)
        }
      }, 1500)
    } catch {
      setIsRunning(false)
      setRunStatus({ status: 'failed', progress: 0, tasks: [], error: 'Failed to start workflow run' })
    }
  }, [id, isRealWorkflow, isRunning, stopPolling])

  useEffect(() => {
    if (!isRealWorkflow || !id) return
    setLoading(true)
    getWorkflow(id)
      .then(setRealWorkflow)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id, isRealWorkflow])

  // Mock workflow fallback
  const mockWorkflow = !isRealWorkflow ? mockWorkflows.find(w => w.id === id) : null

  const flowData = useMemo(() => {
    if (realWorkflow?.steps) {
      return workflowToReactFlow(realWorkflow)
    }
    if (mockWorkflow) {
      const n8n = mockStepsToN8n(mockWorkflow.steps)
      return n8nToReactFlow(n8n)
    }
    return { nodes: [], edges: [] }
  }, [realWorkflow, mockWorkflow])

  // Derive display values
  const title = realWorkflow ? formatWorkflowName(realWorkflow.name) : mockWorkflow?.title
  const description = realWorkflow
    ? `${realWorkflow.steps.length} step workflow`
    : mockWorkflow?.description
  const status = realWorkflow?.status ?? mockWorkflow?.status
  const createdAt = realWorkflow?.created_at ?? mockWorkflow?.createdAt
  const lastModified = realWorkflow?.created_at ?? mockWorkflow?.lastModified

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center px-8 py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-[var(--text-secondary)]">Loading workflow...</p>
        </div>
      </div>
    )
  }

  if (error || (!realWorkflow && !mockWorkflow)) {
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

  const getStatusColor = (s: string) => {
    switch (s) {
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
      {/* Workflow Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-accent-500 mb-3 tracking-tight">
              {title}
            </h1>
            <p className="text-base text-[var(--text-secondary)] font-medium mb-3">
              {description}
            </p>
          </div>
          {status && (
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(status)} whitespace-nowrap`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
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
            {createdAt && <span>Created: {createdAt}</span>}
            {lastModified && (
              <>
                <span className="opacity-30">•</span>
                <span>Last modified: {lastModified}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Editor Canvas */}
      <div className="backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl border-2 border-[var(--border-primary)] mb-6 overflow-hidden" style={{ height: '600px' }}>
        <WorkflowEditor initialNodes={flowData.nodes} initialEdges={flowData.edges} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl font-bold text-base text-black shadow-lg hover:shadow-xl hover:shadow-gold-500/50 transition-all duration-300 hover:scale-105">
          Edit Workflow
        </button>
        {isRealWorkflow && (
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className={`px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 border-2 ${
              isRunning
                ? 'bg-gold-500/5 text-[var(--text-tertiary)] border-gold-500/20 cursor-not-allowed'
                : 'bg-gold-500/10 hover:bg-gold-500/20 text-[var(--text-primary)] hover:scale-105 border-gold-500/30 hover:border-gold-500/50'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                Running...
              </span>
            ) : (
              'Run Workflow'
            )}
          </button>
        )}
        {!isRealWorkflow && (
          <button className="px-6 py-3 bg-gold-500/10 hover:bg-gold-500/20 rounded-xl font-bold text-base text-[var(--text-primary)] transition-all duration-300 hover:scale-105 border-2 border-gold-500/30 hover:border-gold-500/50">
            Run Workflow
          </button>
        )}
        <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl font-bold text-base text-red-400 transition-all duration-300 hover:scale-105 border-2 border-red-500/30 hover:border-red-500/50">
          Delete
        </button>
      </div>

      {/* Execution Status Panel */}
      {runStatus && (
        <div className="mt-6 backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl border-2 border-[var(--border-primary)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Execution {runStatus.status === 'completed' ? 'Complete' : runStatus.status === 'failed' ? 'Failed' : 'In Progress'}
            </h3>
            {runStatus.status !== 'running' && (
              <button
                onClick={() => setRunStatus(null)}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                runStatus.status === 'failed' ? 'bg-red-500' : runStatus.status === 'completed' ? 'bg-green-500' : 'bg-gold-500'
              }`}
              style={{ width: `${runStatus.progress}%` }}
            />
          </div>

          {/* Global error */}
          {runStatus.error && runStatus.tasks.length === 0 && (
            <p className="text-sm text-red-400 mb-4">{runStatus.error}</p>
          )}

          {/* Task list */}
          {runStatus.tasks.length > 0 && (
            <div className="space-y-2">
              {runStatus.tasks.map((task: TaskResult) => (
                <div
                  key={task.task_id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
                >
                  <span className="mt-0.5 text-lg flex-shrink-0">
                    {task.status === 'success' && <span className="text-green-400">&#10003;</span>}
                    {task.status === 'failed' && <span className="text-red-400">&#10007;</span>}
                    {task.status === 'skipped' && <span className="text-gray-500">&#8211;</span>}
                    {task.status === 'running' && (
                      <span className="inline-block w-4 h-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                    )}
                    {task.status === 'pending' && <span className="text-gray-500">&#9675;</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">
                        {task.task_id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      {task.duration_ms > 0 && (
                        <span className="text-xs text-[var(--text-tertiary)]">{task.duration_ms}ms</span>
                      )}
                    </div>
                    {task.output && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono truncate">{task.output}</p>
                    )}
                    {task.error && (
                      <p className="text-xs text-red-400 mt-1">{task.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { Workflow }

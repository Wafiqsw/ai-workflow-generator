import React from 'react'
import { useNavigate } from 'react-router-dom'

// Mock workflow data
const mockWorkflows = [
    { id: '1', title: 'Customer Onboarding Flow', status: 'active', lastModified: '2 hours ago' },
    { id: '2', title: 'Data Processing Pipeline', status: 'active', lastModified: '5 hours ago' },
    { id: '3', title: 'Email Notification System', status: 'draft', lastModified: 'Yesterday' },
    { id: '4', title: 'Invoice Generation Workflow', status: 'active', lastModified: 'Yesterday' },
    { id: '5', title: 'User Authentication Flow', status: 'draft', lastModified: '2 days ago' },
    { id: '6', title: 'Report Generation System', status: 'archived', lastModified: '3 days ago' },
]

const Dashboard: React.FC = () => {
    const navigate = useNavigate()

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
            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-accent-500 mb-3 tracking-tight">
                    Dashboard
                </h1>
                <p className="text-base text-[var(--text-secondary)] font-medium">
                    Manage and monitor your workflows
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <div className="backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl p-6 border-2 border-[var(--border-primary)] hover:shadow-gold-500/20 transition-all duration-300">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-accent-500 mb-2">
                        {mockWorkflows.filter(w => w.status === 'active').length}
                    </div>
                    <div className="text-base font-semibold text-[var(--text-secondary)]">Active Workflows</div>
                </div>

                <div className="backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl p-6 border-2 border-[var(--border-primary)] hover:shadow-gold-500/20 transition-all duration-300">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-accent-500 mb-2">
                        {mockWorkflows.filter(w => w.status === 'draft').length}
                    </div>
                    <div className="text-base font-semibold text-[var(--text-secondary)]">Drafts</div>
                </div>

                <div className="backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl p-6 border-2 border-[var(--border-primary)] hover:shadow-gold-500/20 transition-all duration-300">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-accent-500 mb-2">
                        {mockWorkflows.length}
                    </div>
                    <div className="text-base font-semibold text-[var(--text-secondary)]">Total Workflows</div>
                </div>
            </div>

            {/* Workflows List */}
            <div className="backdrop-blur-xl bg-[var(--bg-tertiary)] rounded-2xl p-8 border-2 border-[var(--border-primary)]">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Your Workflows</h2>

                <div className="space-y-3">
                    {mockWorkflows.map((workflow) => (
                        <div
                            key={workflow.id}
                            onClick={() => navigate(`/workflow/${workflow.id}`)}
                            className="group p-5 bg-[var(--bg-secondary)] rounded-xl border-2 border-[var(--border-secondary)] hover:border-gold-500/50 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-gold-400 transition-colors">
                                        {workflow.title}
                                    </h3>
                                    <p className="text-xs text-[var(--text-tertiary)]">
                                        Last modified: {workflow.lastModified}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusColor(workflow.status)}`}>
                                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                                    </span>

                                    <svg className="w-6 h-6 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export { Dashboard }
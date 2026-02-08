import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkflows } from '../api/agents'
import type { WorkflowSummary } from '../api/agents'

// Mock workflow data (fallback)
const mockWorkflows = [
    { id: '1', title: 'Customer Onboarding Flow', status: 'active', lastModified: '2 hours ago' },
    { id: '2', title: 'Data Processing Pipeline', status: 'active', lastModified: '5 hours ago' },
    { id: '3', title: 'Email Notification System', status: 'draft', lastModified: 'Yesterday' },
    { id: '4', title: 'Invoice Generation Workflow', status: 'active', lastModified: 'Yesterday' },
    { id: '5', title: 'User Authentication Flow', status: 'draft', lastModified: '2 days ago' },
    { id: '6', title: 'Report Generation System', status: 'archived', lastModified: '3 days ago' },
]

interface DisplayWorkflow {
    id: string
    title: string
    status: string
    lastModified: string
}

function formatWorkflowName(name: string): string {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-400 bg-green-500/10 border-green-500/30'
            case 'draft':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            case 'archived':
                return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
        }
    }

    const activeCount = mockWorkflows.filter(w => w.status === 'active').length
    const draftCount = mockWorkflows.filter(w => w.status === 'draft').length
    const totalStatusCount = activeCount + draftCount
    const activePercentage = totalStatusCount === 0 ? 0 : (activeCount / totalStatusCount) * 100

    const filteredWorkflows = mockWorkflows.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-full px-8 py-10">
            {/* Page Header Area (Title + Search at Top Right) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-8 border-b-2 border-[#1a1a1a] pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">
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

                    <div className="bg-[#141414] rounded-2xl border-2 border-[#262626] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b-2 border-[#262626] flex justify-between items-center bg-[#1a1a1a]/50">
                            <h2 className="text-xl font-semibold text-white">Your Workflows</h2>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                Showing {filteredWorkflows.length} items
                            </span>
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

                                    <span className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 ${getStatusColor(workflow.status)}`}>
                                        {workflow.status}
                                    </span>
                                </div>
                            ))}
                            {filteredWorkflows.length === 0 && (
                                <div className="p-16 text-center text-gray-500 italic">
                                    No workflows found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Workflow Progress Gauge (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#141414] rounded-2xl border border-[#262626] p-8 flex flex-col items-center">
                        <div className="w-full mb-6">
                            <h3 className="text-lg font-semibold text-white">Project Progress</h3>
                        </div>

                        {/* Gauge SVG - Repositioned to prevent clipping at the top */}
                        <div className="relative w-64 h-40 overflow-visible">
                            <svg className="w-64 h-64" viewBox="0 0 200 200" fill="none">
                                {/* Background Arc (Draft Workflows - Baseline) */}
                                <path
                                    d="M 30 110 A 70 70 0 0 1 170 110"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="28"
                                    strokeLinecap="round"
                                />
                                {/* Active Workflows Arc (Completed) */}
                                <path
                                    d="M 30 110 A 70 70 0 0 1 170 110"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="28"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(activePercentage / 100) * 219.9} 219.9`}
                                />
                            </svg>

                            <div className="absolute top-[130px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="text-4xl font-bold text-white leading-none">
                                    {Math.round(activePercentage)}%
                                </span>
                                <div className="text-[10px] text-green-500 font-bold uppercase mt-1 tracking-wider">Active Ratio</div>
                            </div>
                        </div>

                        {/* Legend - Centered */}
                        <div className="flex justify-center gap-8 mt-4 w-full border-t border-[#262626] pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                                <span className="text-xs font-semibold text-gray-300">Active</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                                <span className="text-xs font-semibold text-gray-300">Draft</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips or Info Card */}
                    <div className="bg-gold-500/5 rounded-2xl border-2 border-gold-500/10 p-6">
                        <h4 className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-2">Workspace Insight</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            You have {activeCount} workflows active and {draftCount} in review.
                            The gauge above shows the ratio of active vs draft workflows in your studio.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}

export { Dashboard }

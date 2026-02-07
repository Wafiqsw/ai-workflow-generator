import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './Button'
import { WorkflowChatModal } from './modals/WorkflowChatModal'

interface Workflow {
    id: string
    title: string
    timestamp: string
    isActive?: boolean
}

interface SidebarProps { }

const Sidebar: React.FC<SidebarProps> = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isWorkflowChatModalOpen, setIsWorkflowChatModalOpen] = useState(false)

    const [workflows] = useState<Workflow[]>([
        { id: '1', title: 'Customer Onboarding Flow', timestamp: 'Today', isActive: true },
        { id: '2', title: 'Data Processing Pipeline', timestamp: 'Today' },
        { id: '3', title: 'Email Notification System', timestamp: 'Yesterday' },
        { id: '4', title: 'Invoice Generation Workflow', timestamp: 'Yesterday' },
        { id: '5', title: 'User Authentication Flow', timestamp: '2 days ago' },
        { id: '6', title: 'Report Generation System', timestamp: '3 days ago' },
    ])

    const [searchQuery, setSearchQuery] = useState('')

    const filteredWorkflows = workflows.filter(workflow =>
        workflow.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const groupedWorkflows = filteredWorkflows.reduce((acc, workflow) => {
        const group = workflow.timestamp
        if (!acc[group]) acc[group] = []
        acc[group].push(workflow)
        return acc
    }, {} as Record<string, Workflow[]>)

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`
          h-screen w-80 bg-[var(--bg-secondary)] backdrop-blur-lg border-r-2 border-[var(--border-secondary)]
          flex flex-col shadow-2xl shrink-0
        `}
            >
                {/* Sidebar Header - Centered */}
                <div className="p-6 border-b-2 border-[var(--border-secondary)]">
                    <button
                        onClick={() => {
                            navigate('/')
                        }}
                        className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity w-full"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-gold-500/30">
                            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Workflow Studio</h2>
                    </button>

                    {/* New Workflow Button */}
                    <div className="mt-8">
                        <Button
                            variant="primary"
                            size="md"
                            className="w-full"
                            onClick={() => setIsWorkflowChatModalOpen(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            New Workflow
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-[var(--border-secondary)]">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search workflows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Workflow List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                    {Object.entries(groupedWorkflows).map(([timestamp, items]) => (
                        <div key={timestamp}>
                            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-2">
                                {timestamp}
                            </h3>
                            <div className="space-y-1">
                                {items.map((workflow) => (
                                    <button
                                        key={workflow.id}
                                        onClick={() => {
                                            navigate(`/workflow/${workflow.id}`)
                                        }}
                                        className={`
                      w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${location.pathname === `/workflow/${workflow.id}`
                                                ? 'bg-gold-500/10 text-[var(--text-primary)] border border-gold-500/20'
                                                : 'text-[var(--text-secondary)] hover:bg-gold-500/5 hover:text-[var(--text-primary)]'
                                            }
                    `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <svg className="w-4 h-4 flex-shrink-0 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span className="text-sm truncate">{workflow.title}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[var(--border-secondary)]">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gold-500/5 transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-black font-semibold text-sm">
                            F
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">Fernandes</p>
                            <p className="text-xs text-[var(--text-tertiary)] truncate">fernandes@bm2u.com</p>
                        </div>
                        <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </div>
                </div>
            </aside>
            <WorkflowChatModal
                isOpen={isWorkflowChatModalOpen}
                onClose={() => setIsWorkflowChatModalOpen(false)}
            />

            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </>
    )
}

export { Sidebar }
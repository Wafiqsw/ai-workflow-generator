import React, { useState } from 'react'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { UploadModal } from './modals/UploadModal'
import { APITableModal } from './modals/APITableModal'
import { WorkflowChatModal } from './modals/WorkflowChatModal'

interface HeaderProps {
    onToggleSidebar?: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [isAPITableModalOpen, setIsAPITableModalOpen] = useState(false)
    const [isWorkflowChatModalOpen, setIsWorkflowChatModalOpen] = useState(false)
    return (
        <>
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-overlay)] border-b-2 border-[var(--border-primary)] shadow-2xl">
                <div className="flex items-center justify-between px-8 lg:px-12 py-6">
                    {/* Left side - Logo & Title */}
                    <div className="flex items-center gap-5 lg:gap-6">
                        <button
                            onClick={onToggleSidebar}
                            className="p-3 hover:bg-gold-500/10 rounded-2xl transition-all duration-200"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-7 h-7 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-gold-500/30">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 leading-tight tracking-tight">
                                    Workflow Studio
                                </h1>
                                <p className="text-sm lg:text-base text-[var(--text-tertiary)] mt-1 font-medium">AI-Powered Automation</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Action Buttons */}
                    <div className="flex items-center gap-4 lg:gap-5">
                        <ThemeToggle />

                        <Button
                            variant="secondary"
                            size="md"
                            className="hidden sm:inline-flex"
                            onClick={() => setIsUploadModalOpen(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload
                        </Button>

                        <Button variant="primary" size="md" onClick={() => setIsAPITableModalOpen(true)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span className="hidden sm:inline">View API</span>
                        </Button>
                    </div>
                </div>
            </header>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />

            <APITableModal
                isOpen={isAPITableModalOpen}
                onClose={() => setIsAPITableModalOpen(false)}
            />

            <WorkflowChatModal
                isOpen={isWorkflowChatModalOpen}
                onClose={() => setIsWorkflowChatModalOpen(false)}
            />
        </>
    )
}

export { Header }
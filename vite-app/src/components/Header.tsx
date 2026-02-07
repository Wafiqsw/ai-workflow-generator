import React, { useState } from 'react'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { UploadModal } from './modals/UploadModal'
import { APITableModal } from './modals/APITableModal'
import { WorkflowChatModal } from './modals/WorkflowChatModal'

interface HeaderProps { }

const Header: React.FC<HeaderProps> = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [isAPITableModalOpen, setIsAPITableModalOpen] = useState(false)
    const [isWorkflowChatModalOpen, setIsWorkflowChatModalOpen] = useState(false)
    return (
        <>
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-overlay)] border-b-2 border-[var(--border-primary)] shadow-2xl">
                <div className="flex items-center justify-between px-8 lg:px-12 py-3">
                    {/* Left side - Logo & Title */}
                    <div className="flex items-center gap-5 lg:gap-6">
                        {/* Logo removed as requested */}
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
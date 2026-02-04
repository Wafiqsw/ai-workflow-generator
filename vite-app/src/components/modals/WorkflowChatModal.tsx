import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../Button'
import { Loadingbar } from '../Loadingbar'

interface Message {
    id: number
    type: 'user' | 'ai' | 'system'
    content: string
    timestamp: Date
}

interface WorkflowStage {
    id: number
    name: string
    status: 'pending' | 'in-progress' | 'completed' | 'failed'
    progress: number
    color: 'gold' | 'green' | 'blue' | 'red' | 'purple'
}

interface WorkflowChatModalProps {
    isOpen: boolean
    onClose: () => void
}

const WorkflowChatModal: React.FC<WorkflowChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: 'ai',
            content: "👋 Hello! I'm your AI Workflow Assistant. Describe the workflow you'd like to create in natural language, and I'll help you build it!",
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [currentStageIndex, setCurrentStageIndex] = useState(-1)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [stages, setStages] = useState<WorkflowStage[]>([
        { id: 1, name: 'Receiving Prompt', status: 'pending', progress: 0, color: 'blue' },
        { id: 2, name: 'Checking Vector Database', status: 'pending', progress: 0, color: 'purple' },
        { id: 3, name: 'Evaluating Feasibility', status: 'pending', progress: 0, color: 'gold' },
        { id: 4, name: 'Generating Workflow Definition', status: 'pending', progress: 0, color: 'green' },
        { id: 5, name: 'Preparing Execution', status: 'pending', progress: 0, color: 'blue' },
    ])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (!isOpen) return null

    const addMessage = (type: 'user' | 'ai' | 'system', content: string) => {
        const newMessage: Message = {
            id: messages.length + 1,
            type,
            content,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
    }

    const updateStage = (stageId: number, status: WorkflowStage['status'], progress: number) => {
        setStages(prev => prev.map(stage =>
            stage.id === stageId ? { ...stage, status, progress } : stage
        ))
    }

    const simulateStage = (stageId: number, duration: number): Promise<void> => {
        return new Promise((resolve) => {
            updateStage(stageId, 'in-progress', 0)
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                updateStage(stageId, 'in-progress', progress)
                if (progress >= 100) {
                    clearInterval(interval)
                    updateStage(stageId, 'completed', 100)
                    resolve()
                }
            }, duration / 10)
        })
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isGenerating) return

        const userPrompt = inputValue.trim()
        setInputValue('')
        addMessage('user', userPrompt)
        setIsGenerating(true)
        setCurrentStageIndex(0)

        try {
            // Stage 1: Receiving Prompt
            await new Promise(resolve => setTimeout(resolve, 500))
            addMessage('ai', '✅ I received your request! Let me analyze what you need...')
            await simulateStage(1, 1500)
            setCurrentStageIndex(1)

            // Stage 2: Checking Vector Database
            await new Promise(resolve => setTimeout(resolve, 300))
            addMessage('system', '🔍 Searching vector database for relevant APIs...')
            await simulateStage(2, 2000)
            addMessage('ai', '✅ Found 12 relevant APIs that match your requirements!')
            setCurrentStageIndex(2)

            // Stage 3: Evaluating Feasibility
            await new Promise(resolve => setTimeout(resolve, 300))
            addMessage('system', '🤔 Evaluating workflow feasibility...')
            await simulateStage(3, 1500)

            // Random feasibility check
            const isFeasible = Math.random() > 0.2 // 80% success rate

            if (!isFeasible) {
                updateStage(3, 'failed', 100)
                addMessage('ai', '❌ I\'m sorry, but this workflow is not feasible with the current available APIs. Could you try rephrasing your request or simplifying the workflow?')
                setIsGenerating(false)
                setCurrentStageIndex(-1)
                return
            }

            addMessage('ai', '✅ Great news! This workflow is feasible. Generating definition...')
            setCurrentStageIndex(3)

            // Stage 4: Generating Workflow Definition
            await new Promise(resolve => setTimeout(resolve, 300))
            addMessage('system', '⚙️ Generating workflow definition (JSON/Python)...')
            await simulateStage(4, 2500)
            addMessage('ai', '✅ Workflow definition generated successfully!')
            setCurrentStageIndex(4)

            // Stage 5: Preparing Execution
            await new Promise(resolve => setTimeout(resolve, 300))
            addMessage('system', '🚀 Preparing workflow for execution...')
            await simulateStage(5, 1500)
            addMessage('ai', '✅ Workflow is ready! Here\'s a preview of what will be executed:\n\n📋 **Workflow Summary:**\n• Steps: 5\n• Estimated time: 2-3 minutes\n• APIs used: getUserProfile, createWorkflow, executeWorkflow\n\nWould you like to proceed with execution?')

            setIsGenerating(false)
            setCurrentStageIndex(-1)

        } catch (error) {
            addMessage('ai', '❌ An error occurred during workflow generation. Please try again.')
            setIsGenerating(false)
            setCurrentStageIndex(-1)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const resetChat = () => {
        setMessages([
            {
                id: 1,
                type: 'ai',
                content: "👋 Hello! I'm your AI Workflow Assistant. Describe the workflow you'd like to create in natural language, and I'll help you build it!",
                timestamp: new Date()
            }
        ])
        setStages([
            { id: 1, name: 'Receiving Prompt', status: 'pending', progress: 0, color: 'blue' },
            { id: 2, name: 'Checking Vector Database', status: 'pending', progress: 0, color: 'purple' },
            { id: 3, name: 'Evaluating Feasibility', status: 'pending', progress: 0, color: 'gold' },
            { id: 4, name: 'Generating Workflow Definition', status: 'pending', progress: 0, color: 'green' },
            { id: 5, name: 'Preparing Execution', status: 'pending', progress: 0, color: 'blue' },
        ])
        setCurrentStageIndex(-1)
        setIsGenerating(false)
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={isGenerating ? undefined : onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-6xl h-[85vh] overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b-2 border-[var(--border-secondary)] bg-[var(--bg-tertiary)]/30">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">AI Workflow Assistant</h2>
                        <p className="text-sm text-[var(--text-tertiary)] mt-1">
                            Powered by Vector Database & LLM
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={resetChat}
                            disabled={isGenerating}
                            className="p-2.5 hover:bg-blue-500/10 rounded-xl transition-colors disabled:opacity-50"
                            title="Reset Chat"
                        >
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isGenerating}
                            className="p-2.5 hover:bg-gold-500/10 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content - Split View */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side - Chat */}
                    <div className="flex-1 flex flex-col">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-5 py-3 ${message.type === 'user'
                                                ? 'bg-gold-500/20 border-2 border-gold-500/30 text-[var(--text-primary)]'
                                                : message.type === 'system'
                                                    ? 'bg-purple-500/10 border-2 border-purple-500/20 text-purple-300'
                                                    : 'bg-blue-500/10 border-2 border-blue-500/20 text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p className="text-xs mt-2 opacity-60">{formatTime(message.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t-2 border-[var(--border-secondary)] bg-[var(--bg-tertiary)]/30">
                            <div className="flex gap-3">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Describe your workflow in natural language..."
                                    disabled={isGenerating}
                                    className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-gold-500 focus:outline-none transition-colors resize-none disabled:opacity-50"
                                    rows={3}
                                />
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isGenerating}
                                    className="self-end"
                                >
                                    {isGenerating ? (
                                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Status Panel */}
                    <div className="w-96 border-l-2 border-[var(--border-secondary)] bg-[var(--bg-tertiary)]/20 p-6 overflow-y-auto">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Generation Status</h3>

                        <div className="space-y-4">
                            {stages.map((stage, index) => (
                                <div
                                    key={stage.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${stage.status === 'in-progress'
                                            ? 'border-gold-500/50 bg-gold-500/5'
                                            : stage.status === 'completed'
                                                ? 'border-green-500/30 bg-green-500/5'
                                                : stage.status === 'failed'
                                                    ? 'border-red-500/30 bg-red-500/5'
                                                    : 'border-[var(--border-secondary)] bg-[var(--bg-secondary)]/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${stage.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : stage.status === 'in-progress'
                                                            ? 'bg-gold-500/20 text-gold-400'
                                                            : stage.status === 'failed'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                                                    }`}
                                            >
                                                {stage.status === 'completed' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : stage.status === 'failed' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                ) : (
                                                    stage.id
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--text-secondary)]">
                                                {stage.name}
                                            </span>
                                        </div>
                                    </div>

                                    {(stage.status === 'in-progress' || stage.status === 'completed') && (
                                        <Loadingbar
                                            progress={stage.progress}
                                            color={stage.color}
                                            showPercentage={false}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { WorkflowChatModal }

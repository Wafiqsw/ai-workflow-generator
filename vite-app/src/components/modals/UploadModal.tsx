import React, { useState, useRef } from 'react'
import { Button } from '../Button'
import { Loadingbar } from '../Loadingbar'

interface UploadModalProps {
    isOpen: boolean
    onClose: () => void
}

interface UploadStage {
    id: number
    name: string
    progress: number
    status: 'pending' | 'in-progress' | 'completed' | 'error'
    color: 'gold' | 'green' | 'blue' | 'red' | 'purple'
}

interface UploadSummary {
    newAPIs: number
    existingAPIs: number
    totalAPIs: number
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadCompleted, setUploadCompleted] = useState(false)
    const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [stages, setStages] = useState<UploadStage[]>([
        { id: 1, name: 'Transform and Normalize Data', progress: 0, status: 'pending', color: 'blue' },
        { id: 2, name: 'Generate Vector Embedding', progress: 0, status: 'pending', color: 'purple' },
        { id: 3, name: 'Check Exist or Not', progress: 0, status: 'pending', color: 'gold' },
        { id: 4, name: 'Upload API to Database', progress: 0, status: 'pending', color: 'green' },
        { id: 5, name: 'Upload API to Vector Database', progress: 0, status: 'pending', color: 'blue' },
    ])

    if (!isOpen) return null

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const validateAndSetFile = (selectedFile: File) => {
        setError(null)
        setUploadSummary(null)
        if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
            setFile(selectedFile)
        } else {
            setError("Please upload a valid CSV file.")
            setFile(null)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0])
        }
    }

    const onButtonClick = () => {
        inputRef.current?.click()
    }

    const updateStageProgress = (stageId: number, progress: number, status: 'pending' | 'in-progress' | 'completed' | 'error') => {
        setStages(prev => prev.map(stage =>
            stage.id === stageId ? { ...stage, progress, status } : stage
        ))
    }

    const simulateStage = (stageId: number, duration: number): Promise<void> => {
        return new Promise((resolve) => {
            updateStageProgress(stageId, 0, 'in-progress')
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                updateStageProgress(stageId, progress, 'in-progress')
                if (progress >= 100) {
                    clearInterval(interval)
                    updateStageProgress(stageId, 100, 'completed')
                    resolve()
                }
            }, duration / 10)
        })
    }

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setError(null)
        setUploadSummary(null)

        try {
            // Stage 1: Transform and Normalize Data
            await simulateStage(1, 1500)

            // Stage 2: Generate Vector Embedding
            await simulateStage(2, 2000)

            // Stage 3: Check Exist or Not
            await simulateStage(3, 1000)

            // Simulate duplicate detection
            const totalAPIs = Math.floor(Math.random() * 20) + 5
            const existingAPIs = Math.floor(Math.random() * totalAPIs)
            const newAPIs = totalAPIs - existingAPIs

            setUploadSummary({ newAPIs, existingAPIs, totalAPIs })

            // If all exist, stop here
            if (newAPIs === 0) {
                setError("All APIs already exist in the database.")
                setIsUploading(false)
                return
            }

            // Stage 4: Upload API to Database
            await simulateStage(4, 1500)

            // Stage 5: Upload API to Vector Database
            await simulateStage(5, 1500)

            // Success - keep modal open for user to review
            setIsUploading(false)
            setUploadCompleted(true)

        } catch (err) {
            setError("Upload failed. Please try again.")
            setIsUploading(false)
        }
    }

    const resetModal = () => {
        setFile(null)
        setIsUploading(false)
        setUploadCompleted(false)
        setUploadSummary(null)
        setError(null)
        setStages([
            { id: 1, name: 'Transform and Normalize Data', progress: 0, status: 'pending', color: 'blue' },
            { id: 2, name: 'Generate Vector Embedding', progress: 0, status: 'pending', color: 'purple' },
            { id: 3, name: 'Check Exist or Not', progress: 0, status: 'pending', color: 'gold' },
            { id: 4, name: 'Upload API to Database', progress: 0, status: 'pending', color: 'green' },
            { id: 5, name: 'Upload API to Vector Database', progress: 0, status: 'pending', color: 'blue' },
        ])
    }

    const handleClose = () => {
        if (!isUploading) {
            onClose()
            setTimeout(resetModal, 300)
        }
    }

    const getStageColor = (stage: UploadStage): 'gold' | 'green' | 'blue' | 'red' | 'purple' => {
        if (stage.status === 'error') return 'red'
        return stage.color
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">Upload API Data</h2>
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="p-2.5 hover:bg-gold-500/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Side by Side Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Upload Area */}
                        <div className="space-y-6">

                            {/* File Upload Area */}
                            <div
                                className={`
                  relative group cursor-pointer
                  rounded-2xl border-2 border-dashed transition-all duration-300
                  flex flex-col items-center justify-center py-16 px-8 text-center
                  ${dragActive
                                        ? "border-gold-500 bg-gold-500/10 scale-[0.99]"
                                        : "border-[var(--border-secondary)] hover:border-gold-500/40 bg-[var(--bg-tertiary)]/50"
                                    }
                  ${isUploading ? 'pointer-events-none opacity-50' : ''}
                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={onButtonClick}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleChange}
                                    disabled={isUploading}
                                />

                                <div className={`
                  w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300
                  ${file ? "bg-green-500/20 text-green-400" : "bg-gold-500/10 text-gold-500"}
                `}>
                                    {file ? (
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    )}
                                </div>

                                {file ? (
                                    <div className="space-y-2">
                                        <p className="text-lg font-bold text-[var(--text-primary)]">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-[var(--text-tertiary)] font-medium">
                                            {(file.size / 1024).toFixed(2)} KB • Ready to upload
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-lg font-bold text-[var(--text-primary)]">
                                            Click or drag CSV here
                                        </p>
                                        <p className="text-sm text-[var(--text-tertiary)] font-medium">
                                            Only .csv files are supported
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <p className="absolute bottom-4 text-sm font-bold text-red-400 animate-bounce">
                                        {error}
                                    </p>
                                )}
                            </div>
                            {/* CSV Requirements Warning */}
                            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-5">
                                <div className="flex items-start gap-3">
                                    <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-bold text-red-400 mb-2">CSV Requirements</h4>
                                        <p className="text-xs text-red-300/90 leading-relaxed">
                                            Make sure the CSV file has important columns such as <span className="font-semibold">api name</span>, <span className="font-semibold">parameter</span>, <span className="font-semibold">return value</span>, and <span className="font-semibold">description</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="flex-1"
                                    onClick={handleClose}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Processing...' : 'Cancel'}
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-1"
                                    disabled={!file || isUploading || uploadCompleted}
                                    onClick={handleUpload}
                                >
                                    {uploadCompleted ? 'Upload Completed' : isUploading ? 'Uploading...' : 'Upload Data'}
                                </Button>
                            </div>
                        </div>

                        {/* Right Side - Upload Progress */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Upload Progress</h3>

                            {/* Upload Summary */}
                            {uploadSummary && (
                                <div className="bg-[var(--bg-tertiary)] rounded-2xl p-6 border-2 border-[var(--border-secondary)]">
                                    <h4 className="text-base font-bold text-[var(--text-primary)] mb-4">Summary</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-extrabold text-green-400">{uploadSummary.newAPIs}</div>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">New APIs</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-extrabold text-gold-400">{uploadSummary.existingAPIs}</div>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">Already Exist</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-extrabold text-blue-400">{uploadSummary.totalAPIs}</div>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">Total APIs</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Stages */}
                            <div className="space-y-4">
                                {stages.map((stage) => (
                                    <div key={stage.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                          ${stage.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        stage.status === 'in-progress' ? `bg-${stage.color}-500/20 text-${stage.color}-400` :
                                                            stage.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}
                        `}>
                                                    {stage.status === 'completed' ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : stage.id}
                                                </div>
                                                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                                                    {stage.name}
                                                </span>
                                            </div>
                                            {stage.status === 'in-progress' && (
                                                <span className="text-xs font-bold text-gold-400 animate-pulse">
                                                    Processing...
                                                </span>
                                            )}
                                        </div>
                                        <Loadingbar
                                            progress={stage.progress}
                                            color={getStageColor(stage)}
                                            showPercentage={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { UploadModal }

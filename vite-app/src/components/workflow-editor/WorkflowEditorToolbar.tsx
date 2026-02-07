import React from 'react'
import { useReactFlow } from '@xyflow/react'

interface WorkflowEditorToolbarProps {
  onDeleteSelected: () => void
}

export const WorkflowEditorToolbar: React.FC<WorkflowEditorToolbarProps> = ({ onDeleteSelected }) => {
  const { fitView } = useReactFlow()

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
        className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:border-gold-500/30 hover:text-gold-400 transition-all"
        title="Fit View"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
      <button
        onClick={onDeleteSelected}
        className="px-3 py-2 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:border-red-500/30 hover:text-red-400 transition-all"
        title="Delete Selected"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}

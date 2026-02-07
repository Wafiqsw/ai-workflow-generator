import React from 'react'
import { Handle, Position } from '@xyflow/react'
import type { WorkflowNodeData } from '../../../types/workflowEditor'
import { getNodeIcon } from './nodeIcons'
import { getAccentColor, STATUS_COLORS } from './nodeStyles'

interface BaseNodeProps {
  data: WorkflowNodeData
  showInput?: boolean
  showOutput?: boolean
  outputHandles?: Array<{ id: string; label: string; color: string; position: number }>
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  showInput = true,
  showOutput = true,
  outputHandles,
}) => {
  const accent = getAccentColor(data.n8nType)
  const statusColor = STATUS_COLORS[data.status ?? 'idle']

  return (
    <div
      className="relative bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl shadow-lg min-w-[180px] max-w-[220px] transition-all duration-200"
      style={{ borderColor: 'var(--border-secondary)' }}
    >
      {/* Accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: accent }}
      />

      {/* Content */}
      <div className="flex items-center gap-3 px-4 py-3 pt-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          {getNodeIcon(data.n8nType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">
            {data.label}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] truncate">
            {data.n8nType}
          </div>
        </div>
        {/* Status dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusColor }}
        />
      </div>

      {/* Handles */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !border-2 !border-[var(--bg-secondary)] !rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}
      {showOutput && !outputHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !border-2 !border-[var(--bg-secondary)] !rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}
      {outputHandles?.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !border-2 !border-[var(--bg-secondary)] !rounded-full"
          style={{
            backgroundColor: h.color,
            top: `${h.position}%`,
          }}
        />
      ))}
    </div>
  )
}

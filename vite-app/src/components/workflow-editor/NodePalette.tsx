import React, { useState } from 'react'
import { getNodeIcon } from './nodes/nodeIcons'
import { getAccentColor } from './nodes/nodeStyles'

interface PaletteItem {
  type: string
  label: string
  category: 'trigger' | 'action' | 'condition'
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'manualTrigger', label: 'Manual Trigger', category: 'trigger' },
  { type: 'webhook', label: 'Webhook', category: 'trigger' },
  { type: 'scheduleTrigger', label: 'Schedule', category: 'trigger' },
  { type: 'httpRequest', label: 'HTTP Request', category: 'action' },
  { type: 'emailSend', label: 'Send Email', category: 'action' },
  { type: 'set', label: 'Set Data', category: 'action' },
  { type: 'code', label: 'Code', category: 'action' },
  { type: 'slack', label: 'Slack', category: 'action' },
  { type: 'if', label: 'IF Condition', category: 'condition' },
]

const SECTIONS: { key: PaletteItem['category']; label: string }[] = [
  { key: 'trigger', label: 'Triggers' },
  { key: 'action', label: 'Actions' },
  { key: 'condition', label: 'Logic' },
]

export const NodePalette: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)

  const onDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData('application/reactflow-type', item.category)
    e.dataTransfer.setData('application/reactflow-n8ntype', item.type)
    e.dataTransfer.setData('application/reactflow-label', item.label)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="absolute top-4 left-4 z-10 bg-[var(--bg-secondary)] border-2 border-[var(--border-secondary)] rounded-xl shadow-xl overflow-hidden max-h-[calc(100%-2rem)]">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <span>Node Palette</span>
        <svg
          className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3 space-y-3 overflow-y-auto max-h-[400px]">
          {SECTIONS.map((section) => (
            <div key={section.key}>
              <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1.5">
                {section.label}
              </div>
              <div className="space-y-1">
                {PALETTE_ITEMS.filter((item) => item.category === section.key).map((item) => {
                  const accent = getAccentColor(item.type)
                  return (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${accent}20`, color: accent }}
                      >
                        {getNodeIcon(item.type)}
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

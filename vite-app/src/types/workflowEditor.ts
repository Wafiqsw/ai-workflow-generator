export type WorkflowNodeData = Record<string, unknown> & {
  label: string
  n8nType: string
  parameters: Record<string, unknown>
  status?: 'idle' | 'running' | 'success' | 'error'
}

export type NodeCategory = 'trigger' | 'action' | 'condition'

export const NODE_CATEGORY_MAP: Record<string, NodeCategory> = {
  manualTrigger: 'trigger',
  webhook: 'trigger',
  scheduleTrigger: 'trigger',
  httpRequest: 'action',
  emailSend: 'action',
  set: 'action',
  code: 'action',
  slack: 'action',
  if: 'condition',
}

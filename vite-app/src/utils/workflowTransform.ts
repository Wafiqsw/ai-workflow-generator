import type { Node, Edge } from '@xyflow/react'
import type { WorkflowNodeData, NodeCategory } from '../types/workflowEditor'
import type { WorkflowData } from '../api/agents'

interface NormalizedStep {
  step: number
  action: string
  description: string
  params: Record<string, unknown>
}

/**
 * Normalize the inconsistent step formats from the AI into a uniform shape.
 * Handles: steps as array or { raw_info: [...] },
 * and fields: action/api/api_call/api_name/step_name, params/parameters, etc.
 */
function normalizeSteps(raw: unknown): NormalizedStep[] {
  let list: Record<string, unknown>[]
  if (Array.isArray(raw)) {
    list = raw
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as Record<string, unknown>).raw_info)) {
    list = (raw as Record<string, unknown>).raw_info as Record<string, unknown>[]
  } else {
    return []
  }

  return list.map((item, i) => {
    const action =
      (item.action as string) ||
      (item.api as string) ||
      (item.api_name as string) ||
      (item.api_call as string) ||
      (item.step_name as string) ||
      'Unknown'

    const description =
      (item.description as string) || action

    const params =
      (item.params as Record<string, unknown>) ||
      (item.parameters as Record<string, unknown>) ||
      (item.input ? { input: item.input } : {})

    const step = typeof item.step === 'number' ? item.step : i + 1

    return { step, action, description, params }
  })
}

function actionToN8nType(action: string): string {
  const lower = action.toLowerCase()
  if (lower.includes('email') || lower.includes('mail')) return 'emailSend'
  if (lower.includes('http') || lower.includes('request')) return 'httpRequest'
  if (lower.includes('sms') || lower.includes('slack')) return 'slack'
  if (lower.includes('send') || lower.includes('notification')) return 'slack'
  if (lower.includes('webhook') || lower.includes('trigger')) return 'webhook'
  if (lower.includes('set') || lower.includes('assign') || lower.includes('update')) return 'set'
  if (lower.includes('if') || lower.includes('condition') || lower.includes('check')) return 'if'
  return 'code'
}

function n8nTypeToCategory(n8nType: string): NodeCategory {
  if (n8nType === 'manualTrigger' || n8nType === 'webhook' || n8nType === 'scheduleTrigger') return 'trigger'
  if (n8nType === 'if') return 'condition'
  return 'action'
}

export function workflowToReactFlow(workflow: WorkflowData): {
  nodes: Node<WorkflowNodeData>[]
  edges: Edge[]
} {
  const steps = normalizeSteps(workflow.steps)
  const nodes: Node<WorkflowNodeData>[] = steps.map((step, i) => {
    const isFirst = i === 0
    const n8nType = isFirst ? 'manualTrigger' : actionToN8nType(step.action)
    const category: NodeCategory = isFirst ? 'trigger' : n8nTypeToCategory(n8nType)

    return {
      id: `step-${step.step}`,
      type: category,
      position: { x: i * 300, y: 100 },
      data: {
        label: step.description,
        n8nType,
        parameters: step.params as Record<string, unknown>,
        status: 'idle' as const,
      },
    }
  })

  const edges: Edge[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `e-${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'gold',
    })
  }

  return { nodes, edges }
}

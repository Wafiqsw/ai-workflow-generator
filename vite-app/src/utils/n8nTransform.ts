import type { Node, Edge } from '@xyflow/react'
import type { N8nWorkflow } from '../types/n8nWorkflow'
import type { WorkflowNodeData, NodeCategory } from '../types/workflowEditor'
import { NODE_CATEGORY_MAP } from '../types/workflowEditor'

export function n8nToReactFlow(workflow: N8nWorkflow): {
  nodes: Node<WorkflowNodeData>[]
  edges: Edge[]
} {
  const nodes: Node<WorkflowNodeData>[] = workflow.nodes.map((n8nNode) => {
    const category: NodeCategory = NODE_CATEGORY_MAP[n8nNode.type] ?? 'action'
    return {
      id: n8nNode.id,
      type: category,
      position: { x: n8nNode.position[0], y: n8nNode.position[1] },
      data: {
        label: n8nNode.name,
        n8nType: n8nNode.type,
        parameters: n8nNode.parameters,
        status: 'idle' as const,
      },
    }
  })

  const edges: Edge[] = []
  for (const [sourceName, conn] of Object.entries(workflow.connections)) {
    const sourceNode = workflow.nodes.find((n) => n.name === sourceName)
    if (!sourceNode || !conn.main) continue
    for (const outputs of conn.main) {
      for (const link of outputs) {
        const targetNode = workflow.nodes.find((n) => n.name === link.node)
        if (!targetNode) continue
        edges.push({
          id: `e-${sourceNode.id}-${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          type: 'gold',
        })
      }
    }
  }

  return { nodes, edges }
}

const STEP_TYPE_SEQUENCE = [
  'manualTrigger',
  'httpRequest',
  'set',
  'code',
  'emailSend',
  'slack',
]

export function mockStepsToN8n(steps: string[]): N8nWorkflow {
  const nodes = steps.map((step, i) => ({
    id: `node-${i}`,
    name: step,
    type: STEP_TYPE_SEQUENCE[i % STEP_TYPE_SEQUENCE.length],
    position: [i * 300, 100] as [number, number],
    parameters: {},
  }))

  const connections: N8nWorkflow['connections'] = {}
  for (let i = 0; i < nodes.length - 1; i++) {
    connections[nodes[i].name] = {
      main: [[{ node: nodes[i + 1].name, type: 'main', index: 0 }]],
    }
  }

  return { name: 'Mock Workflow', nodes, connections }
}

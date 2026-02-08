export interface N8nNode {
  id: string
  name: string
  type: string
  position: [number, number]
  parameters: Record<string, unknown>
}

export interface N8nConnections {
  [nodeName: string]: {
    main: Array<Array<{ node: string; type: string; index: number }>>
  }
}

export interface N8nWorkflow {
  name: string
  nodes: N8nNode[]
  connections: N8nConnections
}

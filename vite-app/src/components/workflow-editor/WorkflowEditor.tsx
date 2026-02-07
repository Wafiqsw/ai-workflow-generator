import React, { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from './nodes/nodeTypes'
import { edgeTypes } from './edges/edgeTypes'
import { NodePalette } from './NodePalette'
import { WorkflowEditorToolbar } from './WorkflowEditorToolbar'
import { NODE_CATEGORY_MAP } from '../../types/workflowEditor'
import type { WorkflowNodeData } from '../../types/workflowEditor'

interface WorkflowEditorProps {
  initialNodes: Node<WorkflowNodeData>[]
  initialEdges: Edge[]
}

let nodeIdCounter = 100

const WorkflowEditorInner: React.FC<WorkflowEditorProps> = ({ initialNodes, initialEdges }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'gold' }, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const nodeCategory = e.dataTransfer.getData('application/reactflow-type')
      const n8nType = e.dataTransfer.getData('application/reactflow-n8ntype')
      const label = e.dataTransfer.getData('application/reactflow-label')

      if (!nodeCategory || !n8nType) return

      const wrapper = reactFlowWrapper.current
      if (!wrapper) return

      const bounds = wrapper.getBoundingClientRect()
      const position = {
        x: e.clientX - bounds.left - 90,
        y: e.clientY - bounds.top - 30,
      }

      const newNode: Node<WorkflowNodeData> = {
        id: `node-${nodeIdCounter++}`,
        type: NODE_CATEGORY_MAP[n8nType] ?? 'action',
        position,
        data: {
          label,
          n8nType,
          parameters: {},
          status: 'idle',
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [setNodes]
  )

  const onDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected))
    setEdges((eds) => eds.filter((e) => !e.selected))
  }, [setNodes, setEdges])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteSelected()
      }
    },
    [onDeleteSelected]
  )

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ type: 'gold' }}
        deleteKeyCode={['Delete', 'Backspace']}
        className="workflow-editor-canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--text-muted)" />
        <Controls className="workflow-editor-controls" />
        <MiniMap
          className="workflow-editor-minimap"
          nodeColor="#fbbf24"
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
      <NodePalette />
      <WorkflowEditorToolbar onDeleteSelected={onDeleteSelected} />
    </div>
  )
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner {...props} />
    </ReactFlowProvider>
  )
}

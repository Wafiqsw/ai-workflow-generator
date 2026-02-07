import React from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { WorkflowNodeData } from '../../../types/workflowEditor'

export const ConditionNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <BaseNode
      data={data as unknown as WorkflowNodeData}
      showInput={true}
      showOutput={false}
      outputHandles={[
        { id: 'true', label: 'True', color: '#22c55e', position: 35 },
        { id: 'false', label: 'False', color: '#ef4444', position: 65 },
      ]}
    />
  )
}

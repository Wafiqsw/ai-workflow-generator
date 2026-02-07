import React from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './BaseNode'
import type { WorkflowNodeData } from '../../../types/workflowEditor'

export const TriggerNode: React.FC<NodeProps> = ({ data }) => {
  return <BaseNode data={data as unknown as WorkflowNodeData} showInput={false} showOutput={true} />
}

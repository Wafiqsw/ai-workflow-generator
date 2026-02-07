import React from 'react'
import { BezierEdge } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'

export const GoldEdge: React.FC<EdgeProps> = (props) => {
  return (
    <BezierEdge
      {...props}
      style={{
        stroke: '#fbbf24',
        strokeWidth: 2,
        ...props.style,
      }}
    />
  )
}

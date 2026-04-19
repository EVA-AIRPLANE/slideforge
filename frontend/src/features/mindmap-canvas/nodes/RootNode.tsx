import React from 'react'
import { Handle, Position } from '@reactflow/core'
import { Card, Typography } from 'antd'

const { Text } = Typography

interface RootNodeData {
  title: string
  description: string
  speakerNotes: string
  images: Array<{
    id: string
    url: string
    thumbnail: string
    caption?: string
  }>
  aiDescriptionEnabled: boolean
  order: number
  level: number
  aiGenerated?: boolean
}

interface RootNodeProps {
  data: RootNodeData
  selected: boolean
}

const RootNode: React.FC<RootNodeProps> = ({ data, selected }) => {
  return (
    <div style={{ width: 250 }}>
      <Card 
        title={<Text strong style={{ fontSize: '18px' }}>{data.title}</Text>}
        bordered={selected}
        style={{ 
          boxShadow: selected ? '0 0 0 2px #1890ff' : '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
          backgroundColor: '#e6f7ff'
        }}
      >
        <Text type="secondary">PPT 标题页</Text>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default RootNode
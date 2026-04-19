import React from 'react'
import { Handle, Position } from '@reactflow/core'
import { Card, Typography } from 'antd'

const { Text } = Typography

interface ChapterNodeData {
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

interface ChapterNodeProps {
  data: ChapterNodeData
  selected: boolean
}

const ChapterNode: React.FC<ChapterNodeProps> = ({ data, selected }) => {
  return (
    <div style={{ width: 200 }}>
      <Handle type="target" position={Position.Top} />
      <Card 
        title={<Text strong style={{ fontSize: '16px' }}>{data.title}</Text>}
        bordered={selected}
        style={{ 
          boxShadow: selected ? '0 0 0 2px #1890ff' : '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: '4px',
          backgroundColor: '#f0f7ff'
        }}
      >
        <Text type="secondary">章节节点</Text>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default ChapterNode
import React from 'react'
import { Handle, Position } from '@reactflow/core'
import { Card, Typography, Switch, Space, Avatar } from 'antd'

const { Title, Text } = Typography

interface MaterialNodeData {
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

interface MaterialNodeProps {
  data: MaterialNodeData
  selected: boolean
}

const MaterialNode: React.FC<MaterialNodeProps> = ({ data, selected }) => {
  return (
    <div style={{ width: 250 }}>
      <Handle type="target" position={Position.Top} />
      <Card 
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>{data.title}</Text>
            <Switch 
              checked={data.aiDescriptionEnabled} 
              size="small"
              title="AI描述开关"
            />
          </Space>
        }
        bordered={selected}
        style={{ 
          boxShadow: selected ? '0 0 0 2px #1890ff' : '0 2px 8px rgba(0, 0, 0, 0.15)',
          borderRadius: '4px'
        }}
      >
        {data.images.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <Space wrap>
              {data.images.map((image) => (
                <Avatar 
                  key={image.id} 
                  src={image.thumbnail} 
                  size={48} 
                  alt={image.caption || '图片'}
                />
              ))}
            </Space>
          </div>
        )}
        {data.description && (
          <Text ellipsis={{ rows: 2 }} style={{ display: 'block', marginBottom: '8px' }}>
            {data.description}
          </Text>
        )}
        {data.speakerNotes && (
          <Text type="secondary" ellipsis={{ rows: 1 }} style={{ display: 'block' }}>
            备注: {data.speakerNotes}
          </Text>
        )}
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default MaterialNode
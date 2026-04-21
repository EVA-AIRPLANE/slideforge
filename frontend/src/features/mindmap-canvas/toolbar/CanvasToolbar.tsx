import React, { useState } from 'react'
import { Button, Space, Tooltip, Modal, Form, Input, message } from 'antd'
import { FileOutlined, BookOutlined, HomeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Node } from '@reactflow/core'

interface CanvasToolbarProps {
  onAddNode: (type: string, parentId?: string | null) => void
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  setEdges: React.Dispatch<React.SetStateAction<any[]>>
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onAddNode, setNodes, setEdges }) => {
  const [aiModalVisible, setAiModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleGenerateOutline = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // 模拟API调用
      setTimeout(() => {
        // 模拟AI生成的大纲
        const response = {
          nodes: [
            {
              id: 'node-1',
              title: '第一章 介绍',
              children: [
                {
                  id: 'node-1-1',
                  title: '1.1 背景',
                  description: '这是背景介绍'
                },
                {
                  id: 'node-1-2',
                  title: '1.2 目的',
                  description: '这是目的说明'
                }
              ]
            },
            {
              id: 'node-2',
              title: '第二章 内容',
              children: [
                {
                  id: 'node-2-1',
                  title: '2.1 主要内容',
                  description: '这是主要内容'
                },
                {
                  id: 'node-2-2',
                  title: '2.2 案例分析',
                  description: '这是案例分析'
                }
              ]
            },
            {
              id: 'node-3',
              title: '第三章 总结',
              children: [
                {
                  id: 'node-3-1',
                  title: '3.1 结论',
                  description: '这是结论'
                },
                {
                  id: 'node-3-2',
                  title: '3.2 展望',
                  description: '这是未来展望'
                }
              ]
            }
          ]
        }
        
        // 将AI生成的大纲转换为React Flow节点
        const newNodes: Node[] = []
        const newEdges: any[] = []
        
        // 首先创建根节点
        const rootNode: Node = {
          id: 'root',
          type: 'rootNode',
          position: { x: 250, y: 50 },
          data: {
            title: values.topic,
            description: '',
            speakerNotes: '',
            images: [],
            aiDescriptionEnabled: false,
            order: 0,
            level: 0
          }
        }
        newNodes.push(rootNode)
        
        // 遍历AI生成的节点
        let yOffset = 200
        response.nodes.forEach((chapter, idx) => {
          const chapterNode: Node = {
            id: chapter.id,
            type: 'chapterNode',
            position: { x: 250, y: yOffset },
            data: {
              title: chapter.title,
              description: '',
              speakerNotes: '',
              images: [],
              aiDescriptionEnabled: false,
              order: idx + 1,
              level: 1
            }
          }
          newNodes.push(chapterNode)
          newEdges.push({ id: `e-root-${chapter.id}`, source: 'root', target: chapter.id })
          
          // 添加子节点
          if (chapter.children) {
            let childXOffset = 50
            chapter.children.forEach((child, childIdx) => {
              const childNode: Node = {
                id: child.id,
                type: 'materialNode',
                position: { x: childXOffset, y: yOffset + 150 },
                data: {
                  title: child.title,
                  description: child.description || '',
                  speakerNotes: '',
                  images: [],
                  aiDescriptionEnabled: true,
                  aiGenerated: true,
                  order: childIdx + 1,
                  level: 2
                }
              }
              newNodes.push(childNode)
              newEdges.push({ id: `e-${chapter.id}-${child.id}`, source: chapter.id, target: child.id })
              childXOffset += 200
            })
          }
          
          yOffset += 300
        })
        
        // 更新画布
        setNodes(newNodes)
        setEdges(newEdges)
        
        setAiModalVisible(false)
        message.success('大纲生成成功！')
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error('生成大纲失败:', error)
      message.error('生成大纲失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', padding: '12px' }}>
      <Space>
        <Tooltip title="AI生成PPT大纲">
          <Button 
            type="primary"
            icon={<ThunderboltOutlined />} 
            onClick={() => setAiModalVisible(true)}
          >
            AI生成大纲
          </Button>
        </Tooltip>
        <Tooltip title="添加根节点（PPT标题页）">
          <Button 
            icon={<HomeOutlined />} 
            onClick={() => onAddNode('rootNode')}
          >
            根节点
          </Button>
        </Tooltip>
        <Tooltip title="添加章节节点（章节分隔页）">
          <Button 
            icon={<BookOutlined />} 
            onClick={() => onAddNode('chapterNode')}
          >
            章节节点
          </Button>
        </Tooltip>
        <Tooltip title="添加资料节点（内容页）">
          <Button 
            icon={<FileOutlined />} 
            onClick={() => onAddNode('materialNode')}
          >
            资料节点
          </Button>
        </Tooltip>
      </Space>

      <Modal
        title="AI生成PPT大纲"
        open={aiModalVisible}
        onOk={handleGenerateOutline}
        onCancel={() => setAiModalVisible(false)}
        confirmLoading={loading}
        okText="生成"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="topic"
            label="PPT主题"
            rules={[{ required: true, message: '请输入PPT主题' }]}
          >
            <Input placeholder="请输入PPT主题，例如：人工智能在教育中的应用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CanvasToolbar
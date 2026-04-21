import React, { useState, useCallback, useEffect } from 'react'
import { ReactFlow, addEdge, useNodesState, useEdgesState, Node, Edge, ReactFlowProvider } from '@reactflow/core'
import '@reactflow/core/dist/style.css'
import { useParams } from 'react-router-dom'
import { Button, Layout, message } from 'antd'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'

// 导入自定义节点组件
import MaterialNode from './nodes/MaterialNode'
import ChapterNode from './nodes/ChapterNode'
import RootNode from './nodes/RootNode'

// 导入工具栏和侧边栏
import CanvasToolbar from './toolbar/CanvasToolbar'
import NodeSidebar from './sidebar/NodeSidebar'

const { Content } = Layout

// 自定义节点类型
const nodeTypes = {
  materialNode: MaterialNode,
  chapterNode: ChapterNode,
  rootNode: RootNode
}

const CanvasContent: React.FC = () => {
  useParams<{ projectId: string }>()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 初始化一些示例节点
  useEffect(() => {
    const initialNodes: Node[] = [
      {
        id: '1',
        type: 'rootNode',
        position: { x: 250, y: 50 },
        data: {
          title: 'PPT 标题页',
          description: '',
          speakerNotes: '',
          images: [],
          aiDescriptionEnabled: false,
          order: 0,
          level: 0
        }
      },
      {
        id: '2',
        type: 'chapterNode',
        position: { x: 100, y: 200 },
        data: {
          title: '第一章',
          description: '',
          speakerNotes: '',
          images: [],
          aiDescriptionEnabled: false,
          order: 1,
          level: 1
        }
      },
      {
        id: '3',
        type: 'chapterNode',
        position: { x: 400, y: 200 },
        data: {
          title: '第二章',
          description: '',
          speakerNotes: '',
          images: [],
          aiDescriptionEnabled: false,
          order: 2,
          level: 1
        }
      },
      {
        id: '4',
        type: 'materialNode',
        position: { x: 50, y: 350 },
        data: {
          title: '1.1 章节内容',
          description: '这里是章节的具体内容',
          speakerNotes: '',
          images: [],
          aiDescriptionEnabled: false,
          order: 1,
          level: 2
        }
      }
    ]

    const initialEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-4', source: '2', target: '4' }
    ]

    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [setNodes, setEdges])

  // 处理添加节点
  const handleAddNode = useCallback((type: string, parentId: string | null = null) => {
    const parentNode = parentId ? nodes.find(n => n.id === parentId) : null
    const newNode: any = {
      id: `node-${Date.now()}`,
      type: type,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: {
        title: type === 'rootNode' ? 'PPT 标题' : type === 'chapterNode' ? '章节' : '内容节点',
        description: '',
        speakerNotes: '',
        images: [],
        aiDescriptionEnabled: false,
        order: 0,
        level: parentNode ? (parentNode.data as any).level + 1 : 0
      },
      parentId: parentId || undefined
    }

    setNodes(prevNodes => [...prevNodes, newNode])
  }, [nodes, setNodes])

  // 处理节点选择
  const handleNodeClick = useCallback((_event: any, node: any) => {
    setSelectedNodeId(node.id)
  }, [])

  // 处理边的添加
  const handleConnect = useCallback((params: any) => {
    setEdges(prevEdges => addEdge(params, prevEdges))
  }, [setEdges])

  // 处理节点删除
  const handleDeleteNode = useCallback((nodeId: string) => {
    // 删除节点及其相关联的边
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId))
    setEdges(prevEdges => prevEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
    // 如果删除的是当前选中的节点，清除选中状态
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
    }
    message.success('节点删除成功')
  }, [setNodes, setEdges, selectedNodeId])

  // 移除了键盘删除功能，只能通过删除按钮删除

  return (
    <Layout className="min-h-screen">
      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>思维导图画布</h1>
          <div>
            <Button type="primary" icon={<SaveOutlined />} style={{ marginRight: '8px' }}>
              保存
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => handleAddNode('materialNode')}>
              添加节点
            </Button>
          </div>
        </div>
        
        <div style={{ display: 'flex', height: '70vh' }}>
          {/* 画布区域 */}
          <div style={{ flex: 1, border: '1px solid #e8e8e8', borderRadius: '4px', backgroundColor: '#fff' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
            />
          </div>
          
          {/* 节点属性侧边栏 */}
          <div style={{ width: '300px', marginLeft: '24px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <NodeSidebar nodeId={selectedNodeId} nodes={nodes} setNodes={setNodes} onDeleteNode={handleDeleteNode} />
          </div>
        </div>
        
        {/* 画布工具栏 */}
        <div style={{ marginTop: '24px' }}>
          <CanvasToolbar onAddNode={handleAddNode} setNodes={setNodes} setEdges={setEdges} />
        </div>
      </Content>
    </Layout>
  )
}

const CanvasPage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  )
}

export default CanvasPage
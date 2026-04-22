import React, { useState, useCallback, useEffect } from 'react'
import { ReactFlow, addEdge, useNodesState, useEdgesState, Node, Edge, ReactFlowProvider } from '@reactflow/core'
import '@reactflow/core/dist/style.css'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Layout, message, Spin } from 'antd'
import { PlusOutlined, SaveOutlined, RobotOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons'

// 导入AI面板
import AIPanel from '../ai-panel/AIPanel'

// 导入自定义节点组件
import MaterialNode from './nodes/MaterialNode'
import ChapterNode from './nodes/ChapterNode'
import RootNode from './nodes/RootNode'

// 导入工具栏和侧边栏
import CanvasToolbar from './toolbar/CanvasToolbar'
import NodeSidebar from './sidebar/NodeSidebar'

// 导入API
import { canvasApi } from '../../core/api/canvas'

const { Content } = Layout

// 自定义节点类型
const nodeTypes = {
  materialNode: MaterialNode,
  chapterNode: ChapterNode,
  rootNode: RootNode
}

const CanvasContent: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 从数据库加载画布数据
  useEffect(() => {
    const loadCanvasData = async () => {
      if (!projectId) return
      
      try {
        setLoading(true)
        const nodeData = await canvasApi.getNodes(projectId)
        
        if (nodeData && nodeData.length > 0) {
          // 转换为React Flow节点格式
          const reactFlowNodes: Node[] = nodeData.map((node: any) => ({
            id: node.id,
            type: node.node_type === 'root' ? 'rootNode' : 
                  node.node_type === 'chapter' ? 'chapterNode' : 'materialNode',
            position: node.position ? JSON.parse(node.position) : { x: Math.random() * 400, y: Math.random() * 300 },
            data: {
              title: node.title,
              description: node.description || '',
              speakerNotes: node.speaker_notes || '',
              images: [], // 后续需要从API获取图片
              aiDescriptionEnabled: node.ai_description_enabled || false,
              order: node.order,
              level: node.level
            },
            parentId: node.parent_id
          }))
          
          // 构建边
          const reactFlowEdges: Edge[] = []
          reactFlowNodes.forEach((node, index) => {
            if (node.parentId) {
              reactFlowEdges.push({
                id: `e${node.parentId}-${node.id}`,
                source: node.parentId,
                target: node.id
              })
            }
          })
          
          setNodes(reactFlowNodes)
          setEdges(reactFlowEdges)
        } else {
          // 如果没有数据，创建默认节点
          const initialNodes: Node[] = [
            {
              id: `node-${Date.now()}`,
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
            }
          ]
          
          setNodes(initialNodes)
          setEdges([])
        }
      } catch (error) {
        console.error('加载画布数据失败:', error)
        message.error('加载画布数据失败，使用默认数据')
        
        // 加载失败时使用默认数据
        const initialNodes: Node[] = [
          {
            id: `node-${Date.now()}`,
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
          }
        ]
        
        setNodes(initialNodes)
        setEdges([])
      } finally {
        setLoading(false)
      }
    }
    
    loadCanvasData()
  }, [projectId, setNodes, setEdges])

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

  // 保存画布数据
  const handleSave = useCallback(async () => {
    if (!projectId) return
    
    try {
      setSaving(true)
      
      // 首先删除所有旧节点
      const oldNodes = await canvasApi.getNodes(projectId)
      for (const oldNode of oldNodes) {
        await canvasApi.deleteNode(projectId, oldNode.id)
      }
      
      // 保存新节点
      for (const node of nodes) {
        const nodeType = node.type === 'rootNode' ? 'root' : 
                       node.type === 'chapterNode' ? 'chapter' : 'content'
        
        await canvasApi.createNode(projectId, {
          project_id: projectId,
          parent_id: node.parentId,
          node_type: nodeType,
          title: node.data.title,
          description: node.data.description,
          speaker_notes: node.data.speakerNotes,
          order: node.data.order,
          level: node.data.level,
          ai_description_enabled: node.data.aiDescriptionEnabled,
          position: JSON.stringify(node.position)
        })
      }
      
      message.success('画布保存成功')
    } catch (error) {
      console.error('保存画布数据失败:', error)
      message.error('保存画布数据失败')
    } finally {
      setSaving(false)
    }
  }, [projectId, nodes])

  // 移除了键盘删除功能，只能通过删除按钮删除

  return (
    <Layout className="min-h-screen">
      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>思维导图画布</h1>
          <div>
            <Button 
              type="primary" 
              icon={saving ? <LoadingOutlined /> : <SaveOutlined />} 
              onClick={handleSave}
              loading={saving}
              style={{ marginRight: '8px' }}
            >
              保存
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => handleAddNode('materialNode')} style={{ marginRight: '8px' }}>
              添加节点
            </Button>
            <Button type="dashed" icon={<RobotOutlined />} onClick={() => setShowAIPanel(true)} style={{ marginRight: '8px' }}>
              AI 助手
            </Button>
            <Button type="default" icon={<EyeOutlined />} onClick={() => navigate(`/projects/${projectId}/preview`)}>
              预览
            </Button>
          </div>
        </div>
        
        <div style={{ display: 'flex', height: '70vh' }}>
          {/* 画布区域 */}
          <div style={{ flex: 1, border: '1px solid #e8e8e8', borderRadius: '4px', backgroundColor: '#fff', position: 'relative' }}>
            {loading ? (
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}>
                <Spin size="large" tip="加载画布数据..." />
              </div>
            ) : (
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
            )}
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
        
        {/* AI 面板 */}
        {showAIPanel && (
          <AIPanel 
            projectId="test-project" 
            onClose={() => setShowAIPanel(false)} 
          />
        )}
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
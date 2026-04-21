import React, { useState, useEffect } from 'react'
import { Typography, Form, Input, Switch, Upload, Button, Space, List, Avatar, Modal, message, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, ThunderboltOutlined, SearchOutlined } from '@ant-design/icons'
import { Node } from '@reactflow/core'

const { Title, Text } = Typography
const { TextArea } = Input

interface NodeSidebarProps {
  nodeId: string | null
  nodes: Node[]
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  onDeleteNode?: (nodeId: string) => void
}

const NodeSidebar: React.FC<NodeSidebarProps> = ({ nodeId, nodes, setNodes, onDeleteNode }) => {
  const [node, setNode] = useState<Node | null>(null)
  const [form] = Form.useForm()
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [imageSearchModalVisible, setImageSearchModalVisible] = useState(false)
  const [imageSearchLoading, setImageSearchLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    if (nodeId) {
      const foundNode = nodes.find(n => n.id === nodeId)
      if (foundNode) {
        setNode(foundNode)
        form.setFieldsValue({
          title: foundNode.data.title,
          description: foundNode.data.description,
          speakerNotes: foundNode.data.speakerNotes,
          aiDescriptionEnabled: foundNode.data.aiDescriptionEnabled
        })
      }
    } else {
      setNode(null)
    }
  }, [nodeId, nodes, form])

  const handleFormSubmit = (values: any) => {
    if (node) {
      setNodes(prevNodes => 
        prevNodes.map(n => 
          n.id === node.id 
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  ...values 
                } 
              } 
            : n
        )
      )
      message.success('节点属性更新成功')
    }
  }

  const handleGenerateDescription = async () => {
    if (!node) return
    
    try {
      setAiLoading(true)
      // 模拟API调用
      setTimeout(() => {
        form.setFieldValue('description', `这是关于"${node.data.title}"的AI生成描述。`)
        message.success('AI生成描述成功！')
        setAiLoading(false)
      }, 1000)
    } catch (error) {
      console.error('生成描述失败:', error)
      message.error('生成描述失败，请重试')
      setAiLoading(false)
    }
  }

  const handleImageUpload = (options: any) => {
    const { file } = options;
    // 模拟上传，实际项目中应该调用API
    const newImage = {
      id: `img-${Date.now()}`,
      url: URL.createObjectURL(file),
      thumbnail: URL.createObjectURL(file),
      caption: file.name
    }

    if (node) {
      setNodes(prevNodes => 
        prevNodes.map(n => 
          n.id === node.id 
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  images: [...n.data.images, newImage] 
                } 
              } 
            : n
        )
      )
      message.success('图片上传成功')
      // 调用回调函数，通知Upload组件上传成功
      options.onSuccess?.(newImage);
    }
    return false
  }

  const handleImageDelete = (imageId: string) => {
    if (node) {
      setNodes(prevNodes => 
        prevNodes.map(n => 
          n.id === node.id 
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  images: n.data.images.filter((img: any) => img.id !== imageId) 
                } 
              } 
            : n
        )
      )
      message.success('图片删除成功')
    }
  }

  const handlePreview = (file: any) => {
    setPreviewImage(file.url)
    setPreviewVisible(true)
  }

  const handleImageSearch = async () => {
    if (!searchKeyword.trim()) {
      message.warning('请输入搜索关键词')
      return
    }
    
    try {
      setImageSearchLoading(true)
      // 模拟API调用
      setTimeout(() => {
        const mockImages = [
          { id: '1', url: `https://picsum.photos/200/300?random=1`, thumbnail: `https://picsum.photos/100/150?random=1`, photographer: '摄影师1' },
          { id: '2', url: `https://picsum.photos/200/300?random=2`, thumbnail: `https://picsum.photos/100/150?random=2`, photographer: '摄影师2' },
          { id: '3', url: `https://picsum.photos/200/300?random=3`, thumbnail: `https://picsum.photos/100/150?random=3`, photographer: '摄影师3' },
          { id: '4', url: `https://picsum.photos/200/300?random=4`, thumbnail: `https://picsum.photos/100/150?random=4`, photographer: '摄影师4' },
          { id: '5', url: `https://picsum.photos/200/300?random=5`, thumbnail: `https://picsum.photos/100/150?random=5`, photographer: '摄影师5' },
          { id: '6', url: `https://picsum.photos/200/300?random=6`, thumbnail: `https://picsum.photos/100/150?random=6`, photographer: '摄影师6' },
        ]
        setSearchResults(mockImages)
        setImageSearchLoading(false)
      }, 1000)
    } catch (error) {
      console.error('搜索图片失败:', error)
      message.error('搜索图片失败，请重试')
      setImageSearchLoading(false)
    }
  }

  const handleSelectImage = (image: any) => {
    if (!node) return
    
    const newImage = {
      id: `img-${Date.now()}`,
      url: image.url,
      thumbnail: image.thumbnail,
      caption: image.photographer ? `摄影：${image.photographer}` : '图片'
    }

    setNodes(prevNodes => 
      prevNodes.map(n => 
        n.id === node.id 
          ? { 
              ...n, 
              data: { 
                ...n.data, 
                images: [...n.data.images, newImage] 
              } 
            } 
          : n
      )
    )
    setImageSearchModalVisible(false)
    message.success('图片添加成功！')
  }

  if (!node) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary">请选择一个节点进行编辑</Text>
      </div>
    )
  }

  return (
    <div>
      <Title level={4}>节点属性</Title>
      <Form 
        form={form} 
        onFinish={handleFormSubmit} 
        layout="vertical"
      >
        <Form.Item 
          name="title" 
          label="节点标题"
          rules={[{ required: true, message: '请输入节点标题' }]}
        >
          <Input placeholder="请输入节点标题" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="描述"
        >
          <TextArea rows={4} placeholder="请输入描述（将排入PPT正文）" />
        </Form.Item>
        
        <div style={{ marginBottom: '16px' }}>
          <Button 
            type="dashed" 
            icon={<ThunderboltOutlined />} 
            onClick={handleGenerateDescription}
            loading={aiLoading}
            block
          >
            AI生成描述
          </Button>
        </div>

        <Form.Item 
          name="speakerNotes" 
          label="备注"
        >
          <TextArea rows={2} placeholder="请输入备注（将填入PPT演讲者备注栏）" />
        </Form.Item>

        <Form.Item 
          name="aiDescriptionEnabled" 
          label="AI描述开关"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            {onDeleteNode && (
              <Popconfirm
                title="确定要删除这个节点吗？"
                description="此操作不可撤销"
                onConfirm={() => onDeleteNode(node!.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除节点
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Form.Item>
      </Form>

      <div style={{ marginTop: '24px' }}>
        <Title level={5}>图片管理</Title>
        <Space style={{ marginBottom: '16px' }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={handleImageUpload}
          >
            <Button icon={<PlusOutlined />}>上传图片</Button>
          </Upload>
          <Button 
            icon={<SearchOutlined />} 
            onClick={() => setImageSearchModalVisible(true)}
          >
            AI搜索图片
          </Button>
        </Space>

        {node.data.images.length > 0 && (
          <List
            itemLayout="horizontal"
            dataSource={node.data.images}
            renderItem={(image: any) => (
              <List.Item
                actions={[
                  <Button 
                    key="preview" 
                    type="link" 
                    onClick={() => handlePreview(image)}
                  >
                    预览
                  </Button>,
                  <Button 
                    key="delete" 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleImageDelete(image.id)}
                  >
                    删除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={image.thumbnail} />}
                  title={image.caption || '图片'}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <Modal
        visible={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img 
          alt="预览" 
          style={{ width: '100%' }} 
          src={previewImage} 
        />
      </Modal>

      <Modal
        title="AI搜索图片"
        open={imageSearchModalVisible}
        onCancel={() => setImageSearchModalVisible(false)}
        footer={null}
        width={800}
      >
        <Space style={{ marginBottom: '16px', width: '100%' }}>
          <Input 
            placeholder="请输入搜索关键词，例如：商务、自然、科技..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleImageSearch}
            style={{ flex: 1 }}
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleImageSearch}
            loading={imageSearchLoading}
          >
            搜索
          </Button>
        </Space>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
          gap: '12px' 
        }}>
          {searchResults.map((image: any) => (
            <div 
              key={image.id}
              style={{
                cursor: 'pointer',
                border: '2px solid transparent',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent'
              }}
              onClick={() => handleSelectImage(image)}
            >
              <img 
                src={image.thumbnail} 
                alt={image.photographer || '图片'}
                style={{ width: '100%', height: '120px', objectFit: 'cover' }}
              />
              <div style={{ 
                padding: '8px', 
                fontSize: '12px', 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {image.photographer || '图片'}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default NodeSidebar
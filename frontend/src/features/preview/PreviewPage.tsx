import React, { useState, useEffect, useCallback } from 'react'
import { Button, Card, Layout, Typography, List, Space, Divider, Tag, message, Spin, Select } from 'antd'
import { LeftOutlined, RightOutlined, FullscreenOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { canvasApi } from '../../core/api/canvas'
import { projectApi } from '../../core/api/projects'

const { Option } = Select

const { Content, Sider } = Layout
const { Title, Paragraph, Text } = Typography

// 定义幻灯片数据结构
interface Slide {
  id: string
  type: 'title' | 'chapter' | 'content'
  title: string
  content?: string
  speakerNotes?: string
  images?: Array<{ id: string, url: string, thumbnail?: string, caption?: string }>
  level: number
}

// 幻灯片预览组件
const SlidePreview: React.FC<{ slide: Slide }> = ({ slide }) => {
  if (slide.type === 'title') {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
        <Title level={1} className="text-white text-5xl mb-6">{slide.title}</Title>
        {slide.content && (
          <Paragraph className="text-blue-100 text-xl max-w-2xl text-center">
            {slide.content}
          </Paragraph>
        )}
      </div>
    )
  }
  
  if (slide.type === 'chapter') {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-gradient-to-r from-gray-50 to-white p-8">
        <div className="w-full max-w-3xl">
          <Title level={2} className="text-4xl text-gray-800 mb-4">{slide.title}</Title>
          <Divider className="my-6" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full bg-white p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Title level={3} className="text-2xl text-gray-800 mb-6">{slide.title}</Title>
        
        {slide.images && slide.images.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slide.images.map(img => (
                <div key={img.id} className="relative">
                  <img 
                    src={img.url} 
                    alt={img.caption || '幻灯片图片'} 
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  {img.caption && (
                    <Text className="text-gray-500 text-sm mt-2 block text-center">{img.caption}</Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {slide.content && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <Paragraph className="text-gray-700 whitespace-pre-wrap">
              {slide.content}
            </Paragraph>
          </div>
        )}
      </div>
    </div>
  )
}

// 缩略图导航项
const SlideThumbnail: React.FC<{ slide: Slide, isActive: boolean, onClick: () => void }> = ({ slide, isActive, onClick }) => {
  return (
    <Card
      size="small"
      hoverable
      onClick={onClick}
      className={`mb-2 cursor-pointer transition-all ${isActive ? 'border-blue-500 shadow-md' : ''}`}
      style={{ borderRadius: '4px' }}
    >
      <div className="flex items-center gap-2">
        {slide.type === 'title' && <Tag color="blue">标题</Tag>}
        {slide.type === 'chapter' && <Tag color="orange">章节</Tag>}
        {slide.type === 'content' && <Tag color="green">内容</Tag>}
        <Text ellipsis className="flex-1">{slide.title}</Text>
      </div>
    </Card>
  )
}

const PreviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState([
    { id: '1', name: '默认模板' },
    { id: '2', name: '商务模板' },
    { id: '3', name: '创意模板' }
  ])
  
  // 初始化幻灯片数据
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return
      
      try {
        setLoading(true)
        
        // 获取项目信息
        const projectData = await projectApi.getProject(projectId)
        setProject(projectData)
        setSelectedTemplate(projectData.template_id || '1') // 默认使用第一个模板
        
        // 获取预览数据
        const previewData = await canvasApi.getPreview(projectId)
        
        // 使用真实数据或空数组
        if (previewData && previewData.length > 0) {
          setSlides(previewData as Slide[])
        } else {
          // 如果没有数据，显示提示信息
          setSlides([])
          message.info('画布中还没有内容，请先在画布中创建内容')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        message.error('获取数据失败，请稍后重试')
        setSlides([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [projectId])
  
  const currentSlide = slides[currentSlideIndex]
  
  // 导航控制
  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }, [currentSlideIndex])
  
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
    }
  }, [currentSlideIndex, slides.length])
  
  const goToSlide = useCallback((index: number) => {
    setCurrentSlideIndex(index)
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="加载预览数据..." />
      </div>
    )
  }
  
  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="p-6">
        {/* 顶部导航栏 */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Title level={3} className="m-0">PPT 预览</Title>
            <Tag color="blue">{currentSlideIndex + 1} / {slides.length}</Tag>
            <Select
              value={selectedTemplate}
              onChange={(value) => setSelectedTemplate(value)}
              style={{ width: 150 }}
              placeholder="选择模板"
            >
              {templates.map(template => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </div>
          <Space>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/projects/${projectId}`)}>
              返回编辑
            </Button>
            <Button type="primary" icon={<FullscreenOutlined />}>
              全屏演示
            </Button>
          </Space>
        </div>
        
        <Layout className="rounded-lg overflow-hidden shadow-lg">
          {/* 左侧缩略图导航 */}
          <Sider width={280} theme="light" className="border-r border-gray-200">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <Title level={5} className="m-0">幻灯片缩略图</Title>
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: '70vh' }}>
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={slide.id}
                  slide={slide}
                  isActive={index === currentSlideIndex}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </Sider>
          
          {/* 主预览区域 */}
          <Layout>
            <Content className="bg-gray-800 p-8 flex flex-col">
              {/* 幻灯片预览 */}
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white shadow-2xl rounded-lg aspect-video w-full max-w-5xl overflow-hidden">
                  {currentSlide && <SlidePreview slide={currentSlide} />}
                </div>
              </div>
              
              {/* 底部导航控制 */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  icon={<LeftOutlined />}
                  onClick={goToPreviousSlide}
                  disabled={currentSlideIndex === 0}
                  size="large"
                >
                  上一页
                </Button>
                <Button
                  icon={<RightOutlined />}
                  onClick={goToNextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  size="large"
                  type="primary"
                >
                  下一页
                </Button>
              </div>
            </Content>
            
            {/* 右侧演讲者备注 */}
            <Sider width={300} theme="light" className="border-l border-gray-200">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <Title level={5} className="m-0 flex items-center gap-2">
                  <FileTextOutlined /> 演讲者备注
                </Title>
              </div>
              <div className="p-4">
                {currentSlide?.speakerNotes ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <Text className="text-gray-700 whitespace-pre-wrap">
                      {currentSlide.speakerNotes}
                    </Text>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    <FileTextOutlined className="text-4xl mb-2" />
                    <p>暂无备注</p>
                  </div>
                )}
              </div>
            </Sider>
          </Layout>
        </Layout>
      </Content>
    </Layout>
  )
}

export default PreviewPage
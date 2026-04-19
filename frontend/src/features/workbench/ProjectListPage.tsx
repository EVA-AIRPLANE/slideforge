import React, { useState, useEffect } from 'react'
import { Button, Card, Table, message, Modal, Form, Input, Select, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, RightOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { templateApi, Template } from '../../core/api/templates'

const { Option } = Select

// 模拟项目数据
const mockProjects = [
  {
    id: '1',
    name: '产品发布会 PPT',
    mode: 'designer',
    status: 'draft',
    template_id: null,
    created_at: '2026-04-17 10:00:00',
    updated_at: '2026-04-17 10:00:00'
  },
  {
    id: '2',
    name: '季度工作总结',
    mode: 'collab',
    status: 'ready',
    template_id: null,
    created_at: '2026-04-16 15:30:00',
    updated_at: '2026-04-16 16:00:00'
  }
]

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState(mockProjects)
  const [visible, setVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const loadTemplates = async () => {
    try {
      const data = await templateApi.getTemplates()
      setTemplates(data)
    } catch (error) {
      console.warn('加载模板失败，使用默认模板')
      // 即使失败也不显示错误提示，保持静默
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleCreate = () => {
    setEditingProject(null)
    form.resetFields()
    setVisible(true)
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    form.setFieldsValue(project)
    setVisible(true)
  }

  const handleDelete = (projectId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个项目吗？',
      onOk: () => {
        setProjects(projects.filter(p => p.id !== projectId))
        message.success('项目删除成功')
      }
    })
  }

  const handleSubmit = (values: any) => {
    if (editingProject) {
      // 编辑项目
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...values } : p))
      message.success('项目更新成功')
    } else {
      // 创建项目
      const newProject = {
        id: String(projects.length + 1),
        ...values,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setProjects([...projects, newProject])
      message.success('项目创建成功')
    }
    setVisible(false)
  }

  const handleEnterCanvas = (projectId: string) => {
    navigate(`/canvas/${projectId}`)
  }

  const handleEnterSlides = (projectId: string) => {
    navigate(`/slides/${projectId}`)
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (mode: string) => {
        const modeMap = {
          designer: '设计师模式',
          collab: '协作模式',
          auto: '自动模式'
        }
        return modeMap[mode] || mode
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          draft: '草稿',
          generating: '生成中',
          ready: '已完成'
        }
        return statusMap[status] || status
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <div>
          <Button type="link" icon={<RightOutlined />} onClick={() => handleEnterCanvas(record.id)}>
            进入画布
          </Button>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleEnterSlides(record.id)}>
            幻灯片预览
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>项目工作台</h1>
        <Space>
          <Button icon={<FileTextOutlined />} onClick={() => navigate('/templates')}>
            模板管理
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建项目
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={projects} rowKey="id" />
      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="template_id"
            label="选择模板"
            rules={[{ required: true, message: '请选择模板' }]}
            initialValue={templates.length > 0 ? templates[0].id : null}
          >
            <Select placeholder="请选择模板">
              {templates.map(template => (
                <Option key={template.id} value={template.id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="mode"
            label="模式"
            rules={[{ required: true, message: '请选择模式' }]}
          >
            <Select placeholder="请选择模式">
              <Option value="designer">设计师模式</Option>
              <Option value="collab">协作模式</Option>
              <Option value="auto">自动模式</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectListPage

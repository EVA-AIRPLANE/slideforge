import React, { useState, useEffect } from 'react'
import { Button, Card, Table, message, Modal, Form, Input, Select, Space, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, RightOutlined, ReadOutlined, LoadingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../../core/api/projects'
import { templateApi } from '../../core/api/templates'

const { Option } = Select

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [visible, setVisible] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  // 加载项目列表
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        const data = await projectApi.getProjects()
        setProjects(data)
      } catch (error) {
        console.error('加载项目列表失败:', error)
        message.error('加载项目列表失败')
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [])

  // 加载模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await templateApi.getTemplates()
        setTemplates(data)
      } catch (error) {
        console.error('加载模板列表失败:', error)
      }
    }
    
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
      onOk: async () => {
        try {
          await projectApi.deleteProject(projectId)
          setProjects(projects.filter(p => p.id !== projectId))
          message.success('项目删除成功')
        } catch (error) {
          console.error('删除项目失败:', error)
          message.error('删除项目失败')
        }
      }
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      
      if (editingProject) {
        // 编辑项目
        const updatedProject = await projectApi.updateProject(editingProject.id, values)
        setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p))
        message.success('项目更新成功')
      } else {
        // 创建项目
        const newProject = await projectApi.createProject(values)
        setProjects([...projects, newProject])
        message.success('项目创建成功')
      }
      setVisible(false)
    } catch (error) {
      console.error('保存项目失败:', error)
      message.error('保存项目失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEnterCanvas = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const handleEnterPreview = (projectId: string) => {
    navigate(`/projects/${projectId}/preview`)
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
          <Button type="link" icon={<ReadOutlined />} onClick={() => handleEnterPreview(record.id)}>
            预览
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
          <Button icon={<ReadOutlined />} onClick={() => navigate('/templates')}>
            模板管理
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建项目
          </Button>
        </Space>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" tip="加载项目列表..." />
        </div>
      ) : (
        <Table columns={columns} dataSource={projects} rowKey="id" />
      )}
      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
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
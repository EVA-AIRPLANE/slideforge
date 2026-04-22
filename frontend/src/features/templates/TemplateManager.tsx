import React, { useState } from 'react'
import { Button, Table, message, Modal, Upload, Form, Input } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'

const { Dragger } = Upload

// 模拟模板数据
const mockTemplates = [
  {
    id: '1',
    name: '默认模板',
    source: 'builtin',
    file_path: '/templates/default.pptx',
    thumbnail: 'https://picsum.photos/200/150?random=1',
    created_at: '2026-04-15 00:00:00'
  },
  {
    id: '2',
    name: '商务模板',
    source: 'builtin',
    file_path: '/templates/business.pptx',
    thumbnail: 'https://picsum.photos/200/150?random=2',
    created_at: '2026-04-15 00:00:00'
  },
  {
    id: '3',
    name: '创意模板',
    source: 'user_upload',
    file_path: '/uploads/templates/creative.pptx',
    thumbnail: 'https://picsum.photos/200/150?random=3',
    created_at: '2026-04-17 10:00:00'
  }
]

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState(mockTemplates)
  const [visible, setVisible] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [form] = Form.useForm()

  const handleCreate = () => {
    setEditingTemplate(null)
    form.resetFields()
    setVisible(true)
  }

  const handleEdit = (template: any) => {
    setEditingTemplate(template)
    form.setFieldsValue(template)
    setVisible(true)
  }

  const handleDelete = (templateId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模板吗？',
      onOk: () => {
        setTemplates(templates.filter(t => t.id !== templateId))
        message.success('模板删除成功')
      }
    })
  }

  const handleSubmit = (values: any) => {
    if (editingTemplate) {
      // 编辑模板
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, ...values } : t))
      message.success('模板更新成功')
    } else {
      // 创建模板
      const newTemplate = {
        id: String(templates.length + 1),
        ...values,
        source: 'user_upload',
        created_at: new Date().toISOString()
      }
      setTemplates([...templates, newTemplate])
      message.success('模板创建成功')
    }
    setVisible(false)
  }

  const handleUpload = (file: any) => {
    // 模拟上传
    setTimeout(() => {
      const newTemplate = {
        id: String(templates.length + 1),
        name: file.name,
        source: 'user_upload',
        file_path: `/uploads/templates/${file.name}`,
        thumbnail: 'https://picsum.photos/200/150?random=' + Math.floor(Math.random() * 100),
        created_at: new Date().toISOString()
      }
      setTemplates([...templates, newTemplate])
      message.success('模板上传成功')
    }, 1000)
    return false
  }

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        const sourceMap: Record<string, string> = {
          builtin: '系统内置',
          user_upload: '用户上传'
        }
        return sourceMap[source] || source
      }
    },
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (thumbnail: string) => (
        <img src={thumbnail} alt="模板缩略图" style={{ width: 80, height: 60, objectFit: 'cover' }} />
      )
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
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={record.source === 'builtin'}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} disabled={record.source === 'builtin'}>
            删除
          </Button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>模板管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建模板
        </Button>
      </div>
      
      <Dragger
        name="file"
        multiple={false}
        accept=".pptx"
        customRequest={handleUpload}
        style={{ marginBottom: 24 }}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽 .pptx 文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 .pptx 格式的模板文件
        </p>
      </Dragger>
      
      <Table columns={columns} dataSource={templates} rowKey="id" />
      
      <Modal
        title={editingTemplate ? '编辑模板' : '创建模板'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TemplateManager
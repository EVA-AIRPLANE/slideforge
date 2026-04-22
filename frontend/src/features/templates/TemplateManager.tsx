import React, { useState, useEffect } from 'react'
import { Button, Table, message, Modal, Upload, Form, Input } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'

const { Dragger } = Upload

interface Template {
  id: string
  name: string
  source: string
  file_path: string
  thumbnail?: string
  created_at: string
  layouts?: string
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const [pptFile, setPptFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  // 获取模板列表
  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/templates/')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data)
      } else {
        message.error('获取模板列表失败')
      }
    } catch (error) {
      console.error('错误:', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // 打开创建对话框（从创建按钮）
  const handleCreate = () => {
    setPptFile(null)
    setThumbnailFile(null)
    form.resetFields()
    setVisible(true)
  }

  // 打开创建对话框（从拖拽或点击上传区域）
  const handleOpenFromUpload = (file: File) => {
    setPptFile(file)
    // 从文件名获取模板名称（去除扩展名）
    const fileName = file.name.replace(/\.[^/.]+$/, '')
    form.setFieldsValue({ name: fileName })
    setThumbnailFile(null)
    setVisible(true)
  }

  // 处理上传区文件
  const handleUploadFile = (file: any) => {
    handleOpenFromUpload(file.file)
    return false // 阻止默认上传行为
  }

  // 删除模板
  const handleDelete = (templateId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模板吗？',
      onOk: async () => {
        try {
          const response = await fetch(`/api/v1/templates/${templateId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            message.success('模板删除成功')
            fetchTemplates()
          } else {
            message.error('删除模板失败')
          }
        } catch (error) {
          console.error('错误:', error)
          message.error('网络错误，请稍后重试')
        }
      }
    })
  }

  // 取消操作
  const handleCancel = () => {
    setVisible(false)
    setPptFile(null)
    setThumbnailFile(null)
    form.resetFields()
  }

  // 提交创建模板
  const handleSubmit = async (values: any) => {
    if (!pptFile) {
      message.error('请上传.pptx模板文件')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('ppt_file', pptFile)
      if (thumbnailFile) {
        formData.append('thumbnail_file', thumbnailFile)
      }

      const response = await fetch('/api/v1/templates/upload-full', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        message.success('模板创建成功')
        fetchTemplates()
        setVisible(false)
        setPptFile(null)
        setThumbnailFile(null)
        form.resetFields()
      } else {
        message.error('创建模板失败')
      }
    } catch (error) {
      console.error('错误:', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 表格列定义
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
      render: (thumbnail: string, record: Template) => {
        if (thumbnail) {
          return <img src={thumbnail} alt="模板缩略图" style={{ width: 80, height: 60, objectFit: 'cover' }} />
        }
        // 无缩略图时显示模板名称占位图
        return (
          <div style={{ 
            width: 80, 
            height: 60, 
            backgroundColor: '#e6f7ff', 
            border: '1px solid #91d5ff',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: '#1890ff',
            textAlign: 'center',
            padding: 4,
            overflow: 'hidden'
          }}>
            {record.name}
          </div>
        )
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
      render: (_: any, record: Template) => (
        <div>
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
        customRequest={handleUploadFile}
        style={{ marginBottom: 24 }}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽 .pptx 文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 .pptx 格式的模板文件
        </p>
      </Dragger>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span>加载中...</span>
        </div>
      ) : (
        <Table columns={columns} dataSource={templates} rowKey="id" />
      )}
      
      <Modal
        title="创建模板"
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={submitting} onClick={() => form.submit()}>
            确定
          </Button>
        ]}
      >
        <Form form={form} onFinish={handleSubmit} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          
          <Form.Item
            label="缩略图"
            extra="可选，如果不上传将自动从PPT生成"
          >
            <Upload
              name="thumbnail"
              multiple={false}
              accept="image/*"
              showUploadList={true}
              maxCount={1}
              customRequest={({ file }) => {
                setThumbnailFile(file)
                return false
              }}
              beforeUpload={(file) => {
                setThumbnailFile(file)
                return false
              }}
            >
              <Button icon={<UploadOutlined />}>选择缩略图</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            label="PPT模板"
            rules={[{ required: true, message: '请上传.pptx模板文件' }]}
          >
            <Upload
              name="ppt"
              multiple={false}
              accept=".pptx"
              showUploadList={true}
              maxCount={1}
              customRequest={({ file }) => {
                setPptFile(file)
                return false
              }}
              beforeUpload={(file) => {
                setPptFile(file)
                return false
              }}
              fileList={pptFile ? [{ uid: '1', name: pptFile.name, status: 'done' }] : []}
            >
              {!pptFile && <Button icon={<UploadOutlined />}>选择PPT模板</Button>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TemplateManager

import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { templateApi } from '../../core/api/templates'

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 登录成功后清空所有用户上传的模板
      try {
        await templateApi.clearAllTemplates()
      } catch (error) {
        console.error('清空模板失败:', error)
        // 清空模板失败不影响登录流程
      }
      
      message.success('登录成功')
      navigate('/projects')
    } catch (error) {
      message.error('登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>登录页面</h1>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Card title="登录" style={{ width: 400 }}>
          <Form onFinish={handleSubmit}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                登录
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <a href="/register">没有账号？立即注册</a>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage

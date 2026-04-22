import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (_values: { email: string; password: string; name: string }) => {
    setLoading(true)
    try {
      // 模拟注册请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error) {
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="注册" style={{ width: 400 }}>
        <Form onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
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
            rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码长度至少为6位' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                }
              })
            ]}
          >
            <Input.Password placeholder="请确认密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              注册
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <a href="/login">已有账号？立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage
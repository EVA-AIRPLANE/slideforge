import React, { useState } from 'react';
import { Button, Tabs, Card, Spin, message, Modal, Input, Form, Progress, List, Typography } from 'antd';
import { RobotOutlined, PictureOutlined, ReadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AIPanelProps {
  projectId: string;
  onClose: () => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ projectId, onClose }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, pending, completed, failed
  const [result, setResult] = useState<any>(null);
  const [form] = Form.useForm();

  // 生成内容
  const handleGenerateContent = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setStatus('pending');
    setProgress(0);
    
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          topic: values.topic,
          context: values.context,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const taskId = data.data.task_id;
        setTaskId(taskId);
        // 轮询任务状态
        pollTaskStatus(taskId);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      message.error('生成失败，请稍后重试');
      setLoading(false);
      setStatus('idle');
    }
  };

  // 生成大纲
  const handleGenerateOutline = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setStatus('pending');
    setProgress(0);
    
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/ai/outline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          topic: values.topic,
          preferences: values.preferences || {},
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const taskId = data.data.task_id;
        setTaskId(taskId);
        // 轮询任务状态
        pollTaskStatus(taskId);
      } else {
        throw new Error('生成失败');
      }
    } catch (error) {
      message.error('生成失败，请稍后重试');
      setLoading(false);
      setStatus('idle');
    }
  };

  // 搜索图片
  const handleSearchImages = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setStatus('pending');
    setProgress(0);
    
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/ai/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          keyword: values.keyword,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const taskId = data.data.task_id;
        setTaskId(taskId);
        // 轮询任务状态
        pollTaskStatus(taskId);
      } else {
        throw new Error('搜索失败');
      }
    } catch (error) {
      message.error('搜索失败，请稍后重试');
      setLoading(false);
      setStatus('idle');
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}/ai/status?task_id=${taskId}`);
        if (response.ok) {
          const data = await response.json();
          const status = data.data.status;
          const progress = data.data.progress;
          const result = data.data.result;
          
          setStatus(status);
          setProgress(progress);
          
          if (status === 'completed') {
            setResult(result);
            setLoading(false);
            clearInterval(interval);
          } else if (status === 'failed') {
            message.error('任务失败');
            setLoading(false);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('轮询失败:', error);
        clearInterval(interval);
      }
    }, 1000);
  };

  // 重置状态
  const resetState = () => {
    setTaskId(null);
    setProgress(0);
    setStatus('idle');
    setResult(null);
    form.resetFields();
  };

  return (
    <Modal
      title="AI 助手"
      open={true}
      onCancel={onClose}
      width={600}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'content',
            label: <><RobotOutlined /> 内容生成</>,
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="topic"
                  label="主题"
                  rules={[{ required: true, message: '请输入主题' }]}
                >
                  <Input placeholder="请输入生成主题" />
                </Form.Item>
                <Form.Item
                  name="context"
                  label="上下文"
                >
                  <TextArea rows={4} placeholder="请输入上下文信息（可选）" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleGenerateContent}
                    loading={loading}
                  >
                    生成内容
                  </Button>
                </Form.Item>
              </Form>
            )
          },
          {
            key: 'outline',
            label: <><ReadOutlined /> 大纲生成</>,
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="topic"
                  label="主题"
                  rules={[{ required: true, message: '请输入主题' }]}
                >
                  <Input placeholder="请输入大纲主题" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleGenerateOutline}
                    loading={loading}
                  >
                    生成大纲
                  </Button>
                </Form.Item>
              </Form>
            )
          },
          {
            key: 'images',
            label: <><PictureOutlined /> 图片搜索</>,
            children: (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="keyword"
                  label="关键词"
                  rules={[{ required: true, message: '请输入搜索关键词' }]}
                >
                  <Input placeholder="请输入图片搜索关键词" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleSearchImages}
                    loading={loading}
                  >
                    搜索图片
                  </Button>
                </Form.Item>
              </Form>
            )
          }
        ]}
      />

      {/* 进度显示 */}
      {status === 'pending' && (
        <Card style={{ marginTop: 20 }}>
          <Progress percent={progress} status="active" />
          <Text style={{ display: 'block', marginTop: 10, textAlign: 'center' }}>
            正在处理中...
          </Text>
        </Card>
      )}

      {/* 结果显示 */}
      {status === 'completed' && result && (
        <Card style={{ marginTop: 20 }}>
          <Title level={5}>生成结果</Title>
          {activeTab === 'content' && result.content && (
            <Text>{result.content}</Text>
          )}
          {activeTab === 'outline' && result.nodes && (
            <List
              dataSource={result.nodes}
              renderItem={(node) => (
                <List.Item>
                  <Text style={{ marginLeft: node.level * 20 }}>
                    {node.title}
                  </Text>
                </List.Item>
              )}
            />
          )}
          {activeTab === 'images' && result.images && (
            <List
              grid={{ gutter: 16, column: 2 }}
              dataSource={result.images}
              renderItem={(image) => (
                <List.Item>
                  <Card>
                    <img src={image.thumbnail} alt={image.photographer} style={{ width: '100%' }} />
                    <Text style={{ marginTop: 8, display: 'block' }}>
                      {image.photographer}
                    </Text>
                  </Card>
                </List.Item>
              )}
            />
          )}
          <Button 
            style={{ marginTop: 20 }} 
            onClick={resetState}
          >
            重新生成
          </Button>
        </Card>
      )}
    </Modal>
  );
};

export default AIPanel;

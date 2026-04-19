import React, { useState, useEffect } from 'react';
import { Card, Button, Upload, message, Space, Modal, Input, Typography, List, Image, Popconfirm, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { templateApi, Template } from '../../core/api/templates';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      message.error('加载模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleUpload = async () => {
    if (!templateName || !selectedFile) {
      message.error('请填写模板名称并选择文件');
      return;
    }

    setUploading(true);
    try {
      const result = await templateApi.uploadTemplate(templateName, selectedFile, selectedThumbnail || undefined);
      console.log('上传结果:', result);
      message.success('模板上传成功');
      setUploadModalVisible(false);
      setTemplateName('');
      setSelectedFile(null);
      setSelectedThumbnail(null);
      await loadTemplates();
    } catch (error) {
      console.error('上传错误:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      message.error(`模板上传失败: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await templateApi.deleteTemplate(templateId);
      message.success('模板删除成功');
      await loadTemplates();
    } catch (error) {
      console.error('删除错误:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      message.error(`模板删除失败: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>模板管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalVisible(true)}>
          上传模板
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
          dataSource={templates}
          renderItem={(template) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  template.thumbnail ? (
                    <Image
                      alt={template.name}
                      src={template.thumbnail}
                      style={{ height: 200, objectFit: 'cover' }}
                      preview={false}
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <Text type="secondary">暂无缩略图</Text>
                    </div>
                  )
                }
                actions={[
                  <Popconfirm
                    title="确定要删除这个模板吗？"
                    onConfirm={() => handleDelete(template.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={template.name}
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space size="middle">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          来源：{template.source === 'builtin' ? '内置' : '用户上传'}
                        </Text>
                        {template.parse_success ? (
                          <Text type="success" style={{ fontSize: '12px' }}>✓ 解析成功</Text>
                        ) : (
                          <Text type="danger" style={{ fontSize: '12px' }}>✗ 解析失败</Text>
                        )}
                      </Space>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        创建时间：{new Date(template.created_at).toLocaleDateString()}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title="上传新模板"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={handleUpload}
        confirmLoading={uploading}
        okText="上传"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="模板名称"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          
          <Dragger
            accept=".pptx"
            fileList={selectedFile ? [{ uid: '1', name: selectedFile.name, status: 'done' }] : []}
            beforeUpload={(file) => {
              setSelectedFile(file);
              return false;
            }}
            onRemove={() => {
              setSelectedFile(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽 PPTX 文件到此处</p>
            <p className="ant-upload-hint">支持 .pptx 格式</p>
          </Dragger>

          <Upload
            accept="image/*"
            fileList={selectedThumbnail ? [{ uid: '1', name: selectedThumbnail.name, status: 'done' }] : []}
            beforeUpload={(file) => {
              setSelectedThumbnail(file);
              return false;
            }}
            onRemove={() => {
              setSelectedThumbnail(null);
            }}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>上传缩略图（可选）</Button>
          </Upload>
        </Space>
      </Modal>
    </div>
  );
};

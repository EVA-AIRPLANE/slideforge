import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  message,
  Space,
  Typography,
  List,
  Modal,
  Spin
} from "antd";
import {
  PlayCircleOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { slidesApi, Slide } from "../../core/api/slides";

const { Title, Text } = Typography;

export const SlidePreviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [assembling, setAssembling] = useState(false);

  const loadSlides = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const data = await slidesApi.getSlidesByProject(projectId);
      setSlides(data);
      if (data.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      message.error("加载幻灯片失败");
      console.error("加载幻灯片失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, [projectId]);

  const handleAssemble = async () => {
    if (!projectId) return;

    setAssembling(true);
    try {
      const data = await slidesApi.assembleSlides(projectId);
      message.success("成功组装幻灯片！");
      setSlides(data);
      setCurrentIndex(0);
    } catch (error) {
      message.error("组装幻灯片失败");
      console.error("组装幻灯片失败:", error);
    } finally {
      setAssembling(false);
    }
  };

  const handleDelete = async (slideId: string) => {
    Modal.confirm({
      title: "确定要删除这张幻灯片吗？",
      onOk: async () => {
        try {
          await slidesApi.deleteSlide(slideId);
          message.success("删除成功");
          await loadSlides();
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handlePrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    if (direction === 'up' && index > 0) {
      [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
    } else if (direction === 'down' && index < slides.length - 1) {
      [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    }
    setSlides(newSlides);
    message.info("顺序已更新");
  };

  const currentSlide = slides[currentIndex];

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>加载中...</Text>
      </div>
    );
  }

  if (previewMode && currentSlide) {
    return (
      <div style={{ padding: "24px", minHeight: "100vh" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <Button icon={<LeftOutlined />} onClick={() => setPreviewMode(false)}>
            退出预览
          </Button>
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              aspectRatio: "16/9",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px"
            }}
          >
            {currentSlide.content?.title && (
              <Title level={1}>{currentSlide.content.title}</Title>
            )}
            
            {currentSlide.content?.description && (
              <Text style={{ fontSize: "24px", marginBottom: "20px" }}>
                {currentSlide.content.description}
              </Text>
            )}
            
            {currentSlide.content?.images && currentSlide.content.images.length > 0 && (
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                {currentSlide.content.images.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.caption}
                    style={{ maxWidth: "300px", height: "200px", objectFit: "cover" }}
                  />
                ))}
              </div>
            )}
            
            {currentSlide.speaker_notes && (
              <div style={{ marginTop: "auto", width: "80%", borderTop: "1px solid #e8e8e8", paddingTop: "20px" }}>
                <Text type="secondary">演讲者备注：{currentSlide.speaker_notes}</Text>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
          <Button icon={<LeftOutlined />} onClick={handlePrevSlide} disabled={currentIndex === 0}>
            上一张
          </Button>
          <Text>
            {currentIndex + 1} / {slides.length}
          </Text>
          <Button icon={<RightOutlined />} onClick={handleNextSlide} disabled={currentIndex === slides.length - 1}>
            下一张
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <Button icon={<LeftOutlined />} onClick={() => navigate(`/canvas/${projectId}`)}>
            返回画布
          </Button>
        </div>
        <Title level={3} style={{ margin: 0 }}>幻灯片管理</Title>
        <div style={{ gap: "8px", display: "flex" }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleAssemble}
            loading={assembling}
          >
            重新组装幻灯片
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => setPreviewMode(true)}
            disabled={slides.length === 0}
          >
            预览
          </Button>
        </div>
      </div>
      
      {slides.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", border: "1px dashed #d9d9d9", borderRadius: "8px" }}>
          <Title level={4} style={{ marginBottom: "16px" }}>还没有幻灯片</Title>
          <Text type="secondary">点击"重新组装幻灯片"从画布内容生成幻灯片</Text>
        </div>
      ) : (
        <List
          grid={{ gutter: [16, 16], xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
          dataSource={slides}
          renderItem={(slide, index) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: "100%" }}
                title={`第 ${index + 1} 张`}
                extra={
                  <Space size="small">
                    <Button
                      type="text"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => handleReorder(index, "up")}
                    />
                    <Button
                      type="text"
                      icon={<ArrowDownOutlined />}
                      disabled={index === slides.length - 1}
                      onClick={() => handleReorder(index, "down")}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(slide.id)}
                    />
                  </Space>
                }
              >
                {slide.content?.title && (
                  <Title level={5}>{slide.content.title}</Title>
                )}
                {slide.content?.description && (
                  <Text type="secondary" ellipsis={{ rows: 2 }}>
                    {slide.content.description}
                  </Text>
                )}
                <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {slide.content?.images?.slice(0, 3).map((img: any, i: number) => (
                    <img
                      key={i}
                      src={img.url}
                      alt="slide"
                      style={{ width: "80px", height: "60px", objectFit: "cover" }}
                    />
                  ))}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    版式: {slide.layout_type}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SlidePreviewPage;
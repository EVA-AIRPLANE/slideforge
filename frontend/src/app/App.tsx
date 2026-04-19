import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import './styles/global.css'

// 页面组件
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import ProjectListPage from '../features/workbench/ProjectListPage'
import CanvasPage from '../features/mindmap-canvas/CanvasPage'
import { TemplateManager } from '../features/templates/TemplateManager'
import SlidePreviewPage from '../features/slides/SlidePreviewPage'

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/templates" element={<TemplateManager />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/canvas/:projectId" element={<CanvasPage />} />
          <Route path="/slides/:projectId" element={<SlidePreviewPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App

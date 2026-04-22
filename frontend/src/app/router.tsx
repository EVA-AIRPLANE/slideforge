import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ProjectListPage from '../features/workbench/ProjectListPage'
import CanvasPage from '../features/mindmap-canvas/CanvasPage'
import PreviewPage from '../features/preview/PreviewPage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import TemplateManager from '../features/templates/TemplateManager'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/projects',
    element: <App />,
    children: [
      {
        path: '',
        element: <ProjectListPage />
      }
    ]
  },
  {
    path: '/project/:id/canvas',
    element: <App />,
    children: [
      {
        path: '',
        element: <CanvasPage />
      }
    ]
  },
  {
    path: '/project/:id/preview',
    element: <App />,
    children: [
      {
        path: '',
        element: <PreviewPage />
      }
    ]
  },
  {
    path: '/templates',
    element: <App />,
    children: [
      {
        path: '',
        element: <TemplateManager />
      }
    ]
  }
])

export default router
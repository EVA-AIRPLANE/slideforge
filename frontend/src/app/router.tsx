import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import ProjectListPage from '../features/workbench/ProjectListPage'
import CanvasPage from '../features/mindmap-canvas/CanvasPage'
import PreviewPage from '../features/preview/PreviewPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <ProjectListPage />
      },
      {
        path: 'project/:id/canvas',
        element: <CanvasPage />
      },
      {
        path: 'project/:id/preview',
        element: <PreviewPage />
      }
    ]
  }
])

export default router
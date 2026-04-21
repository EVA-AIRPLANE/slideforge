import React from 'react'
import { Link } from 'react-router-dom'

const ProjectListPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">项目列表</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 项目卡片将在这里渲染 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">示例项目</h3>
          <p className="text-gray-600 mb-4">这是一个示例项目</p>
          <div className="flex space-x-2">
            <Link
              to="/project/1/canvas"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              编辑
            </Link>
            <Link
              to="/project/1/preview"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
            >
              预览
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md">
          创建新项目
        </button>
      </div>
    </div>
  )
}

export default ProjectListPage
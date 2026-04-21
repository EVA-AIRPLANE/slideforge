import React from 'react'

const PreviewPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">PPT 预览</h2>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* 预览内容将在这里渲染 */}
        <div className="flex items-center justify-center h-[500px]">
          <p className="text-gray-500">PPT 预览 - 即将实现</p>
        </div>
      </div>
    </div>
  )
}

export default PreviewPage
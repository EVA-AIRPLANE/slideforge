import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (images: string[]) => void;
  onImageRemove?: (imageUrl: string) => void;
  existingImages?: string[];
  maxImages?: number;
  accept?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  onImageRemove,
  existingImages = [],
  maxImages = 5,
  accept = 'image/*',
  placeholder = '点击或拖拽上传图片'
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      handleFiles(files);
    };
    input.click();
  }, [accept]);

  const handleFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages: string[] = [];
    
    validFiles.forEach(file => {
      if (images.length < maxImages) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          
          if (newImages.length === validFiles.length) {
            const updatedImages = [...images, ...newImages].slice(0, maxImages);
            setImages(updatedImages);
            onImageUpload(updatedImages);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, [images, maxImages, onImageUpload]);

  const handleRemoveImage = useCallback((index: number) => {
    const updatedImages = [...images];
    const removedImage = updatedImages.splice(index, 1)[0];
    setImages(updatedImages);
    onImageUpload(updatedImages);
    if (onImageRemove) {
      onImageRemove(removedImage);
    }
  }, [images, onImageUpload, onImageRemove]);

  return (
    <div className="image-uploader">
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="upload-content">
          <svg 
            className="upload-icon" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 5V19M12 5L8 9M12 5L16 9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <p>{placeholder}</p>
          <p className="upload-hint">支持 JPG、PNG、GIF 格式，最多 {maxImages} 张</p>
        </div>
      </div>
      
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview">
              <img src={image} alt={`Uploaded ${index + 1}`} />
              <button 
                className="remove-button"
                onClick={() => handleRemoveImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .image-uploader {
          width: 100%;
        }
        
        .upload-area {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }
        
        .upload-area:hover {
          border-color: #4CAF50;
          background-color: rgba(76, 175, 80, 0.05);
        }
        
        .upload-area.dragging {
          border-color: #4CAF50;
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        .upload-icon {
          color: #999;
          margin-bottom: 10px;
        }
        
        .upload-hint {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        
        .image-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        
        .image-preview {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .remove-button {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          transition: background-color 0.2s ease;
        }
        
        .remove-button:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
};

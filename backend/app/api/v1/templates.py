from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
from pptx import Presentation
import json
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from app.api.deps import get_db
from app.schemas.template import TemplateCreate, TemplateResponse
from app.schemas.common import Response
from app.models.template import Template
from app.core.config import settings

router = APIRouter()

# 使用绝对路径
UPLOAD_DIR = settings.TEMPLATE_DIR
THUMBNAIL_DIR = settings.THUMBNAIL_DIR

def parse_powerpoint_template(file_path: str) -> dict:
    """解析PPT模板的版式和占位符"""
    try:
        prs = Presentation(file_path)
        layouts = []
        
        for i, slide_layout in enumerate(prs.slide_layouts):
            layout_info = {
                "id": i,
                "name": str(slide_layout.name),
                "placeholders": []
            }
            
            # 获取占位符信息
            try:
                placeholders = list(slide_layout.placeholders)
                for shape in placeholders:
                    try:
                        placeholder_info = {
                            "id": int(shape.placeholder_format.idx),
                            "type": int(shape.placeholder_format.type),
                            "name": str(shape.name),
                            "left": float(shape.left),
                            "top": float(shape.top),
                            "width": float(shape.width),
                            "height": float(shape.height)
                        }
                        layout_info["placeholders"].append(placeholder_info)
                    except Exception:
                        # 跳过无效的占位符
                        pass
            except Exception:
                # 如果获取占位符失败，继续处理下一个版式
                pass
            
            layouts.append(layout_info)
        
        return {"layouts": layouts}
    except Exception as e:
        print(f"解析模板失败: {e}")
        return {"layouts": []}

def generate_thumbnail_from_pptx(file_path: str, output_path: str, template_name: str = ""):
    """从PPT模板生成缩略图"""
    try:
        prs = Presentation(file_path)
        
        # 获取模板信息
        slide_count = len(prs.slides)
        layout_count = len(prs.slide_layouts)
        display_name = template_name if template_name else os.path.splitext(os.path.basename(file_path))[0]
        
        # 创建更美观的缩略图
        img = Image.new('RGB', (800, 600), color='#f8fafc')
        draw = ImageDraw.Draw(img)
        
        # 尝试加载中文字体
        font_large = None
        font_medium = None
        font_small = None
        try:
            # 尝试常见的中文字体
            for font_path in ['msyh.ttc', 'simhei.ttf', 'simsun.ttc', 'arial.ttf', 'C:/Windows/Fonts/msyh.ttc']:
                try:
                    font_large = ImageFont.truetype(font_path, 42)
                    font_medium = ImageFont.truetype(font_path, 24)
                    font_small = ImageFont.truetype(font_path, 18)
                    break
                except:
                    continue
        except:
            pass
        
        if not font_large:
            try:
                font_large = ImageFont.truetype("arial.ttf", 42)
                font_medium = ImageFont.truetype("arial.ttf", 24)
                font_small = ImageFont.truetype("arial.ttf", 18)
            except:
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_small = ImageFont.load_default()
        
        # 顶部渐变效果（用多个矩形模拟）
        for i in range(30):
            alpha = int(255 * (1 - i / 30))
            color = (24, 144, 255)  # #1890ff
            draw.rectangle([(0, i * 4), (800, (i + 1) * 4)], fill=color)
        
        # 标题背景
        draw.rectangle([(0, 0), (800, 130)], fill='#1890ff')
        
        # 绘制标题
        draw.text((40, 30), display_name[:20], fill='white', font=font_large)
        
        # 绘制PPT信息行
        info_text = f"📄 {slide_count} 页  |  🎨 {layout_count} 种版式"
        draw.text((40, 95), info_text, fill='#e6f7ff', font=font_medium)
        
        # 中心区域 - PPT图标占位
        center_x, center_y = 400, 350
        
        # 绘制PPT图标（简化的演示文稿图标）
        icon_x, icon_y = center_x - 80, center_y - 100
        # 屏幕/窗口背景
        draw.rounded_rectangle([(icon_x, icon_y), (icon_x + 160, icon_y + 120)], radius=8, fill='#e6f7ff', outline='#91d5ff', width=2)
        # 屏幕顶部条
        draw.rectangle([(icon_x, icon_y), (icon_x + 160, icon_y + 20)], fill='#1890ff')
        # 幻灯片内容（简化的线条）
        for i in range(4):
            line_y = icon_y + 35 + i * 18
            line_width = 80 - i * 15
            draw.rectangle([(icon_x + 40, line_y), (icon_x + 40 + line_width, line_y + 8)], fill='#91d5ff')
        
        # 提示文字
        hint_text = "建议上传自定义缩略图"
        draw.text((center_x - 80, center_y + 40), hint_text, fill='#999', font=font_small)
        
        # 底部信息栏
        draw.rectangle([(0, 550), (800, 600)], fill='#f0f9ff')
        draw.line([(0, 550), (800, 550)], fill='#e6f7ff', width=1)
        footer_text = "SlideForge 智能演示文稿平台"
        draw.text((40, 560), footer_text, fill='#1890ff', font=font_small)
        
        img.save(output_path, 'JPEG', quality=90)
        return True
    except Exception as e:
        print(f"生成缩略图失败: {e}")
        # 降级：创建简单占位图
        try:
            img = Image.new('RGB', (800, 600), color='#f0f0f0')
            draw = ImageDraw.Draw(img)
            draw.rectangle([(0, 0), (800, 100)], fill='#1890ff')
            try:
                font = ImageFont.truetype("arial.ttf", 36)
            except:
                font = ImageFont.load_default()
            draw.text((40, 35), "PPT模板", fill='white', font=font)
            img.save(output_path, 'JPEG', quality=70)
            return True
        except:
            return False

@router.post("/upload-full", response_model=Response[TemplateResponse])
def upload_full_template(
    name: str = Form(...),
    ppt_file: UploadFile = File(...),
    thumbnail_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """上传完整模板（包含PPT文件和缩略图）"""
    # 验证PPT文件类型
    if not ppt_file.filename.endswith('.pptx'):
        raise HTTPException(status_code=400, detail="只支持 .pptx 文件")
    
    # 保存PPT文件
    ppt_filename = f"{name}_{ppt_file.filename}"
    ppt_file_path = UPLOAD_DIR / ppt_filename
    try:
        with open(ppt_file_path, "wb") as buffer:
            content = ppt_file.file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PPT文件保存失败: {str(e)}")
    
    # 处理缩略图
    thumbnail_path = None
    if thumbnail_file:
        # 保存用户上传的缩略图
        thumbnail_filename = f"thumb_{name}_{thumbnail_file.filename}"
        thumbnail_path = THUMBNAIL_DIR / thumbnail_filename
        try:
            with open(thumbnail_path, "wb") as buffer:
                content = thumbnail_file.file.read()
                buffer.write(content)
        except Exception as e:
            print(f"缩略图保存失败: {e}")
            # 继续执行，尝试自动生成缩略图
    else:
        # 自动从PPT生成缩略图
        thumbnail_filename = f"thumb_{name}.jpg"
        thumbnail_path = THUMBNAIL_DIR / thumbnail_filename
        success = generate_thumbnail_from_pptx(str(ppt_file_path), str(thumbnail_path), name)
        if not success:
            thumbnail_path = None
    
    # 解析模板
    layout_info = parse_powerpoint_template(str(ppt_file_path))
    layouts_json = json.dumps(layout_info)
    
    # 保存到数据库
    template = Template(
        name=name,
        source="user_upload",
        file_path=str(ppt_file_path),
        thumbnail=str(thumbnail_path) if thumbnail_path else None,
        layouts=layouts_json
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return Response(data=template)

@router.get("/", response_model=Response[list[TemplateResponse]])
def list_templates(db: Session = Depends(get_db)):
    """获取模板列表"""
    templates = db.query(Template).all()
    
    # 获取 uploads 目录的绝对路径（用于路径替换）
    upload_base = str(settings.UPLOAD_DIR).replace('\\', '/')
    
    for template in templates:
        # 转换文件路径为URL路径
        if template.file_path:
            fp = template.file_path.replace('\\', '/')
            # 使用大小写不敏感比较
            if fp.lower().startswith(upload_base.lower()):
                template.file_path = '/uploads' + fp[len(upload_base):]
        
        # 转换缩略图路径为URL路径
        if template.thumbnail:
            tp = template.thumbnail.replace('\\', '/')
            if tp.lower().startswith(upload_base.lower()):
                template.thumbnail = '/uploads' + tp[len(upload_base):]
    
    return Response(data=templates)

@router.get("/projects/{project_id}/template", response_model=Response[TemplateResponse])
def get_template(project_id: str, db: Session = Depends(get_db)):
    """获取当前项目模板信息"""
    # 这里应该根据项目ID获取关联的模板
    # 暂时返回默认模板
    template = db.query(Template).filter(Template.source == "builtin").first()
    
    if not template:
        # 如果没有内置模板，创建一个默认的
        template = Template(
            name="默认模板",
            source="builtin",
            file_path="./data/uploads/templates/default.pptx",
            layouts="{}"
        )
        db.add(template)
        db.commit()
        db.refresh(template)
    
    return Response(data=template)

@router.post("/", response_model=Response[TemplateResponse])
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    """创建模板"""
    db_template = Template(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return Response(data=db_template)

@router.put("/{template_id}", response_model=Response[TemplateResponse])
def update_template(template_id: str, template: TemplateCreate, db: Session = Depends(get_db)):
    """更新模板"""
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 不允许修改内置模板
    if db_template.source == "builtin":
        raise HTTPException(status_code=400, detail="不能修改内置模板")
    
    update_data = template.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return Response(data=db_template)

@router.delete("/{template_id}", response_model=Response)
def delete_template(template_id: str, db: Session = Depends(get_db)):
    """删除模板"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 不允许删除内置模板
    if template.source == "builtin":
        raise HTTPException(status_code=400, detail="不能删除内置模板")
    
    # 删除文件
    if template.file_path and os.path.exists(template.file_path):
        try:
            os.remove(template.file_path)
        except Exception as e:
            print(f"删除PPT文件失败: {e}")
    
    # 删除缩略图
    if template.thumbnail and os.path.exists(template.thumbnail):
        try:
            os.remove(template.thumbnail)
        except Exception as e:
            print(f"删除缩略图失败: {e}")
    
    # 删除数据库记录
    db.delete(template)
    db.commit()
    return Response()
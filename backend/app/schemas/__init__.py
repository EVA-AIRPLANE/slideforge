from app.schemas.common import BaseResponse, PaginatedResponse, Pagination
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.canvas_node import (
    NodeImageCreate,
    NodeImageResponse,
    NodeCreate,
    NodeUpdate,
    NodeResponse,
    NodeReorderRequest
)
from app.schemas.template import TemplateCreate, TemplateResponse
from app.schemas.slide import SlideCreate, SlideUpdate, SlideResponse
from app.schemas.ai import (
    AIGenerateRequest,
    AIOutlineRequest,
    AIContentRequest,
    AIImageSearchRequest,
    AIImageUnderstandRequest,
    AIGenerateResponse,
    AIOutlineResponse,
    AIContentResponse,
    AIImageSearchResponse,
    AIImageUnderstandResponse,
    AIStatusResponse
)
from app.schemas.export import ExportCreate, ExportResponse

__all__ = [
    # Common
    "BaseResponse",
    "PaginatedResponse",
    "Pagination",
    # Auth
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    # Project
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    # Canvas Node
    "NodeImageCreate",
    "NodeImageResponse",
    "NodeCreate",
    "NodeUpdate",
    "NodeResponse",
    "NodeReorderRequest",
    # Template
    "TemplateCreate",
    "TemplateResponse",
    # Slide
    "SlideCreate",
    "SlideUpdate",
    "SlideResponse",
    # AI
    "AIGenerateRequest",
    "AIOutlineRequest",
    "AIContentRequest",
    "AIImageSearchRequest",
    "AIImageUnderstandRequest",
    "AIGenerateResponse",
    "AIOutlineResponse",
    "AIContentResponse",
    "AIImageSearchResponse",
    "AIImageUnderstandResponse",
    "AIStatusResponse",
    # Export
    "ExportCreate",
    "ExportResponse"
]

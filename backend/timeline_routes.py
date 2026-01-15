# backend/graduate_routes.py
from fastapi import APIRouter
from uuid import UUID
from timeline_service import get_graduate_milestones_with_tasks

router = APIRouter(prefix="/timeline", tags=["Timeline"])

@router.get("/{graduate_id}/milestones-tasks")
async def fetch_milestones_with_tasks(graduate_id: UUID):
    """
    Fetch milestones and tasks with progress for a graduate.
    """
    return await get_graduate_milestones_with_tasks(graduate_id)

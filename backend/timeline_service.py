import os
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)
# backend/graduate_service.py

from uuid import UUID


async def get_graduate_milestones_with_tasks(graduate_id: UUID):
    """
    Fetch milestones with their tasks, progress, and status for a given graduate.
    """

    # 1️⃣ Fetch milestones
    milestones_resp = (
        supabase.table("milestones")
        .select("*")
        .order("display_order")
        .execute()
    )
    milestones = milestones_resp.data

    # 2️⃣ Fetch task_progress joined with tasks
    task_progress_resp = (
        supabase.table("task_progress")
        .select("completed, completed_at, tasks(*)")
        .eq("graduate_id", str(graduate_id))
        .execute()
    )
    task_progress_list = task_progress_resp.data

    result = []
    in_progress_assigned = False  # ensures only ONE milestone is In-Progress

    for milestone in milestones:
        milestone_tasks = []

        for tp in task_progress_list:
            task = tp.get("tasks")
            if task and task["milestone_id"] == milestone["id"]:
                milestone_tasks.append({
                    "task_id": task["id"],
                    "name": task["name"],
                    "task_type": task.get("task_type"),
                    "display_order": task.get("display_order"),
                    "completed": tp.get("completed"),
                    "completed_at": tp.get("completed_at"),
                })

        milestone_tasks = sorted(milestone_tasks, key=lambda t: t["display_order"])

        # 3️⃣ Determine milestone status
        if milestone_tasks and all(t["completed"] for t in milestone_tasks):
            status = "Completed"

        elif not in_progress_assigned:
            status = "In-Progress"
            in_progress_assigned = True

        else:
            status = "Upcoming"

        result.append({
            "milestone_id": milestone["id"],
            "title": milestone["title"],
            "week_label": milestone["week_label"],
            "start_week": milestone["start_week"],
            "end_week": milestone["end_week"],
            "display_order": milestone["display_order"],
            "status": status,
            "tasks": milestone_tasks,
        })

    return sorted(result, key=lambda m: m["display_order"])
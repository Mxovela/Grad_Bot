from fastapi import APIRouter, HTTPException
from userdatabase import get_all_graduates, delete_user
from user_models import GraduateResponse

router = APIRouter(prefix="/graduates", tags=["Graduates"])

@router.get("/list", response_model=list[GraduateResponse])
async def list_graduates_endpoint():
    try:
        graduates = get_all_graduates()
        return graduates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_graduate_endpoint(user_id: str):
    print(f"Received delete request for user_id: '{user_id}'")
    try:
        delete_user(user_id.strip())
        return {"status": "deleted", "id": user_id}
    except Exception as e:
        print(f"Delete endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

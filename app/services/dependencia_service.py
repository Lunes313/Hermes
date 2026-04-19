from app.core.database import get_supabase

async def list_dependencias():
    supabase = get_supabase()
    result = supabase.table("dependencias").select("*").order("nombre").execute()
    return result.data

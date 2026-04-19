from app.core.supabase_client import get_supabase_client


async def list_dependencias():
    supabase = get_supabase_client()
    result = supabase.table("dependencia").select("*").order("nombre").execute()
    return result.data

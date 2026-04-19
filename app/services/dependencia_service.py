from app.core.supabase_client import get_supabase_client


async def list_dependencias():
<<<<<<< Updated upstream
    supabase = get_supabase_client()
    result = supabase.table("dependencia").select("*").order("nombre").execute()
=======
    supabase = get_supabase()
    result = supabase.table("dependencias").select("*").order("nombre").execute()
>>>>>>> Stashed changes
    return result.data

from supabase.client import Client, create_client
from app.core.config import settings

# Cliente de Supabase para operaciones
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

def get_supabase() -> Client:
    return supabase

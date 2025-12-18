import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv() # Load environment variables from a .env file

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

def get_bucket_id():

    try:
        response = supabase.storage.list_buckets()

        bucket_id = response[0].id
        print(bucket_id)

        if not bucket_id:
            raise Exception(f"Error retrieving bucket")
        return bucket_id
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

bucket_name = get_bucket_id()

def upload_file(file_path, file_name):
    try:

       with open(file_path, "rb") as file:
        response = (
            supabase.storage
                .from_(bucket_name)
                .upload(
                    file=file,
                    path=f"{file_name}",
                    file_options={"cache-control": "3600", "upsert": "false"}
                )
        )

        if not response:
            raise Exception(f"Could not upload file: {file_name}")

    except Exception as e:
        print(f"Error: {str(e)}")
        return None
    
    return response

def get_file_url(filename):
    
    response = (supabase.storage.from_(bucket_name).get_public_url(f"{filename}"))
    
    return response

def list_documents():
    response = supabase.storage.from_(bucket_name).list(
        path="",
        options={"limit": 1000}
    )
    return response

def download_file(file_name: str) -> bytes:
    response = supabase.storage.from_(bucket_name).download(file_name)
    return response


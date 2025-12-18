import hashlib
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv() # Load environment variables from a .env file

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)
bucket_name = 'Documents'

def password_hashing(password):
    hashed = hashlib.sha256(password.encode()).hexdigest()
    password = ''  # Clear password variable for security
    return hashed
 
def user_exists(email):
    user = (
    supabase.table("User")
    .select("*")
    .eq("email", email)
    .execute()
    ).data
 
    if user:
        return True
   
    return False
 
def new_user(email, role, first_name, last_name, password, phone=''):
 
    hashed_password = password_hashing(password)
    password = ''  # Clear password variable for security
 
    try:
        if user_exists(email): 
            raise Exception("User already exists")
       
        response = (
        supabase.table("User")
        .insert({"email": email, "role": role, "first_name": first_name, "last_name": last_name, "phone": phone, "hashed_pass": hashed_password})
        .execute()
        ).data
    except Exception as e:
        #print(f"Error creating user: {str(e)}") # testing
        return [None, str(e)]
 
    return response
 
def get_user(email, password):
 
    hashed_pass= password_hashing(password)
    password = ''  # Clear password variable for security

    try:
        if not user_exists(email): raise Exception("User not found")
 
        user = (
        supabase.table("User")
        .select("*")
        .eq("email", email)
        .eq("hashed_pass",hashed_pass)
        .execute()
        ).data

        if not user: raise Exception("Incorrect password")

    except Exception as e:
        #print(f"Error retrieving user: {str(e)}") # testing
        return [None, str(e)] 
   
    return user

def testing():
    user = get_user('mo1@gmail.com', 'Mmotala')

    if user[0]:
        print(user[0]) 
        # Expected output: 
        # {'id': 11, 'email': 'mo1@gmail.com', 'role': 'student', 'first_name': 'first_name', 'last_name': 'last_name', 'phone': '', 'created_at': '2025-12-15T11:29:45.373916+00:00', 'hashed_pass': 'd16213ab08b1b0bbe44d5cc4d0d10613d5d9c76dfd88413689b0cd8fa8ac1cc1'}
    else:
        print("Error:", user[1])

    # Errors
    #user = get_user('mo1@gmail', 'Mmotala') # Expected output: 'Error: User not found'
    #user = get_user('mo1@gmail.com', 'Mmotal') # Expected output: 'Error: Incorrect password'

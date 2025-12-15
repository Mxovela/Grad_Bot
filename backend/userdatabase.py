import hashlib
import os
from supabase import create_client, Client
 
url: str = 'https://xvrmmclctxwjytxlbrke.supabase.co'
key: str = 'sb_publishable_g-AsYN-3M1iw191IYimVhg_t7HXlqco'
supabase: Client = create_client(url, key)
 
def password_hashing(password):
    hashed = hashlib.sha256(password.encode()).hexdigest()
    return hashed
 
def user_exists(email):
    user = (
    supabase.table("User")
    .select("*")
    .eq("email", email)
    .execute()
    )
 
    if user:
        return True
   
    return False
 
def new_user(email, role, first_name, last_name, password, phone=''):
 
    hashed_password = password_hashing(password)
 
    if user_exists(email): return None
 
    try:
        response = (
        supabase.table("User")
        .insert({"email": email, "role": role, "first_name": first_name, "last_name": last_name, "phone": phone, "hashed_pass": hashed_password})
        .execute()
        )
    except :
        return None
 
    return True
 
def get_user(email, password):
 
    hashed_password = password_hashing(password)
 
    if user_exists(email): return None
 
    user = (
    supabase.table("User")
    .select("*")
    .eq("email", email)
    .eq("hashed_pass",hashed_password)
    .execute()
    )
 
    if not user:
        return None
   
    return user
 
x = new_user('gmail', 'student', 'first_name', 'last_name','one', phone='')
print("x",x)
 
y = get_user('gmail', 'one')
 
if y:
    print(y)
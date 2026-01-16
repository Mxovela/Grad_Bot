import os
import tempfile
import tiktoken
from pypdf import PdfReader
from docx import Document
from pptx import Presentation
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI


load_dotenv()

tokenizer = tiktoken.get_encoding("cl100k_base")

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

client = OpenAI()

def extract_text(file_path: str) -> str:
    def download_from_supabase(file_path: str) -> str:
        """
        Downloads a file from Supabase Storage and returns a local file path.
        """

        bucket = "Documents"

        file_name = os.path.basename(file_path)

        tmp_dir = tempfile.gettempdir()
        local_path = os.path.join(tmp_dir, file_name)

        res = supabase.storage.from_(bucket).download(file_path)

        with open(local_path, "wb") as f:
            f.write(res)

        return local_path

    local_path = download_from_supabase(file_path)
    print(local_path)

    if local_path.endswith(".pdf"):
        reader = PdfReader(local_path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if local_path.endswith(".docx"):
        doc = Document(local_path)
        return "\n".join(p.text for p in doc.paragraphs)

    if local_path.endswith(".pptx"):
        prs = Presentation(local_path)
        text = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text.append(shape.text)
        return "\n".join(text)

    raise ValueError("Unsupported file type")

def chunk_text(text, chunk_size=500, overlap=100):
    tokens = tokenizer.encode(text)
    chunks = []

    i = 0
    while i < len(tokens):
        chunk = tokens[i:i + chunk_size]
        chunks.append(tokenizer.decode(chunk))
        i += chunk_size - overlap

    return chunks

def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",  # 1536 dims
        input=text
    )
    return response.data[0].embedding

def index_document(document_id: str, file_path: str):
    text = extract_text(file_path)
    chunks = chunk_text(text)

    # 1. Delete old chunks
    supabase.table("embeddings") \
        .delete() \
        .eq("document_id", document_id) \
        .execute()

    # 2. Insert fresh chunks
    rows = []
    for i, chunk in enumerate(chunks):
        rows.append({
            "document_id": document_id,
            "chunk_index": i,
            "content": chunk,
            "embedding": embed_text(chunk)
        })

    res = supabase.table("embeddings").insert(rows).execute()
    return res

def retrieve_context(query_embedding, limit=5):
    response = supabase.rpc(
        "match_embeddings",
        {
            "query_embedding": query_embedding,
            "match_count": limit
        }
    ).execute()

    return "\n\n".join(r["content"] for r in response.data)

def chat(question: str):
    query_embedding = embed_text(question)
    context = retrieve_context(query_embedding)

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Answer strictly using the provided context."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{question}"}
        ]
    )

    return completion.choices[0].message.content

def test():
    result = supabase.table("documents").select("*").execute().data[4]
    print(result)
    file_path = result["file_path"]
    document_id = result["id"]

    res = index_document(document_id, file_path)

    # file = extract_text(file_path)
    # print(file)
    # chunck = chunk_text(file)
    # print(chunck)

chat = chat("what is the purpose?")
print(chat)
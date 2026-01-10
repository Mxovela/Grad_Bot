# Setup

# create vertual environment

python -m venv venv
./venv/Scripts/activate

# run the thingy in the vertual environement

uvicorn api:app --reload

# install requirements

pip install -r .\requirements.txt

pip install python-jose    

# pip install

pip install langchain-community pypdf python-docx

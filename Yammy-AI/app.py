from fastapi import FastAPI
from controller import baseballdata

app = FastAPI()
app.include_router(baseballdata.router, prefix="/api")

@app.get("/")
def read_root():
    return ''

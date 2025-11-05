from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controller import baseballdata

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # 프론트엔드 도메인
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(baseballdata.router, prefix="/api")

@app.get("/")
def read_root():
    return ''

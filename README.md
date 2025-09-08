# UbiNote - 웹 기반 노트앱

Obsidian과 유사한 기능을 제공하는 웹 기반 마크다운 노트 애플리케이션입니다. AWS S3 클라우드 스토리지를 활용하여 노트를 안전하게 저장하고 관리할 수 있습니다.

## 🌐 라이브 데모

**https://ubinote.alanpark72.com**

> SSL 인증서로 보안이 강화된 HTTPS 연결을 제공합니다.

## 주요 기능

- 📝 **마크다운 에디터**: 실시간 미리보기와 함께 마크다운 형식의 노트 작성
- ☁️ **클라우드 저장**: AWS S3에 안전하게 노트 저장
- 📁 **노트 관리**: 저장된 노트 목록 조회 및 불러오기
- 🎨 **반응형 UI**: 데스크톱과 모바일에서 모두 사용 가능
- 🐳 **Docker 지원**: 간편한 배포 및 실행
- 🔒 **HTTPS 보안**: SSL 인증서를 통한 안전한 연결
- 📡 **서브도메인**: 전용 도메인을 통한 전문적인 서비스 제공

## 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **boto3**: AWS S3 클라이언트 라이브러리
- **uvicorn**: ASGI 서버

### Frontend
- **React**: 사용자 인터페이스 라이브러리
- **react-markdown**: 마크다운 렌더링
- **axios**: HTTP 클라이언트

### 배포 및 보안
- **Docker & Docker Compose**: 컨테이너화 및 서비스 오케스트레이션
- **Nginx**: 리버스 프록시 및 로드 밸런싱
- **Let's Encrypt**: 무료 SSL 인증서 자동 관리

## 빠른 시작

### 사전 요구사항

- Docker & Docker Compose
- AWS S3 버킷
- (선택사항) 도메인 및 SSL 인증서

### 설치 및 실행

1. **프로젝트 클론**
   ```bash
   git clone https://github.com/alanworks72/ubinote.git
   cd ubinote
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 편집하여 AWS S3 설정 추가
   ```

3. **Docker로 실행**
   ```bash
   docker-compose up --build
   ```

4. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

## 환경 변수

```bash
# .env 파일 예시
S3_BUCKET_NAME=your-s3-bucket
AWS_REGION=ap-northeast-2
REACT_APP_API_URL=http://localhost:8000
```

## 개발 모드

### Backend 개발
```bash
cd backend
pip install -r requirements.txt
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend 개발
```bash
cd frontend
npm install
npm start
```

## API 엔드포인트

- `GET /health`: 헬스 체크 및 S3 연결 상태
- `POST /api/upload`: 노트 업로드
- `GET /api/list`: 저장된 노트 목록 조회
- `GET /api/download/{filename}`: 특정 노트 다운로드

## 파일 구조

```
ubinote/
├── backend/                 # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py         # 메인 애플리케이션
│   │   ├── s3_service.py   # S3 서비스 로직
│   │   └── models.py       # 데이터 모델
│   ├── requirements.txt    # Python 의존성
│   └── Dockerfile         # 백엔드 Docker 설정
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── services/      # API 서비스
│   │   ├── App.js         # 메인 앱 컴포넌트
│   │   └── index.js       # React 진입점
│   ├── package.json       # npm 의존성
│   ├── Dockerfile        # 프론트엔드 Docker 설정
│   └── nginx.conf        # Nginx 설정
├── docker-compose.yml     # 서비스 오케스트레이션
├── .env.example          # 환경 변수 템플릿
└── README.md            # 프로젝트 문서
```

## 노트 파일 저장 방식

- **파일명 형식**: `{제목}.md`
- **폴더 구조**: 날짜별 자동 분류
- **내용 형식**: 순수 마크다운 텍스트

## 라이선스

Apache-2.0 License

## 문의

프로젝트 관련 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

- 프로젝트 링크: [https://github.com/alanworks72/ubinote](https://github.com/alanworks72/ubinote)
- 라이브 데모: [https://ubinote.alanpark72.com](https://ubinote.alanpark72.com)
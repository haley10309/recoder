# 🛠️ Re-coder
Re-coder는 txt 가이드 파일에서 데이터를 추출하고 템플릿을 적용해 변환된 결과 파일을 생성하는 React + Node.js 기반의 자동화 도구입니다.

**✅주의: 반드시 상신하신 목적으로만 사용부탁드립니다. 사용상 부주의로 민감/주요자료가 유출되지 않도록 주의바랍니다. **

## ⚙️ 기능
**Code Templates**

- TBW

**Manage Localization Entries**

- TBW

**Template Mapping**

- TBW

**QA**

- TBW

**Guide**
- Re-coder 사용방법

## 🔗 링크모음
- [Re-coder 사이트](http://121.252.183.22:8088/)
- [Swagger(API Docs)](http://121.252.183.22:8088/api-docs/)

## 📁 폴더 구조

이 레포는 프론트엔드(Client)와 백엔드(Server)를 하나의 저장소에서 함께 관리함
```
├── client/ # React.js 프론트엔드
└── server/ # Node.js 백엔드 (Express)
```

## 🚀 로컬환경에서 실행 방법

### 1️⃣ 환경 설치
- Node.js
- npm 또는 yarn
- mysql(데스크탑탑)

### 2️⃣ 환경변수 설정

- client/.env
    ```
    VITE_API=http://localhost:5000 # 5000 <<< 서버 포트
    ```

- server/.env 
    ```
    # 로컬 db 사용 시
    DB_HOST=localhost # 데이터베이스 호스트
    DB_PORT=3306 # 데이터베이스 포트
    DB_USER=root # 데이터베이스 사용자 계정 ID
    DB_PASSWORD=1111 # 데이터베이스 사용자 계정 PW
    DB_NAME=recoder_db # 연결할 데이터베이스 이름 (실제 배포된 db 이름은 다를수도 있어 확인 필요)
    CLIENT=http://localhost:5173 # cors 허용할 클라이언트 호스트
    PORT=5000 # 서버 포트
    ```

    ```
    # 배포용 db 사용 시
    DB_HOST=121.252.183.22
    DB_PORT=8090
    DB_USER=root
    DB_PASSWORD=0000
    DB_NAME=testDB # // (250519기준) recoder_db로 변경해야하는데 아직은 문제 있어 추후 수정 예정
    CLIENT=http://localhost:5173
    PORT=5000
    ```

### 3️⃣ 초기 데이터베이스 세팅

- 로컬 개발 환경에서 사용할 MySQL 데이터베이스와 테이블을 생성하려면, 프로젝트 루트에 있는 `setup-table.sql` 파일을 실행
- 이 파일에는 템플릿 설정, 변환 데이터, 로컬라이제이션 정보를 저장할 기본 테이블 구조가 포함되어 있음


### 4️⃣ 의존성 설치
- cato 상태에서 설치 권면

**Client (프론트엔드)**
```bash
cd client
npm install
npm run dev # dev script 참고 -> client/package.json
```

**Server (백엔드)**
```bash
cd client
npm install
npm run dev # dev script 참고 -> server/package.json
```

## 📦 주요 라이브러리 및 기술 스택
**프론트엔드**
- React.js
- Axios (HTTP 요청)
- FormData (파일 업로드)

**백엔드**
- Node.js + Express
- Multer (파일 업로드 처리)
- fs (txt 데이터 추출)
- MySQL (데이터베이스)

**기타**
- Docker (MySQL 컨테이너화)


## 🌿 브랜치 전략
- `main`: 배포 및 기준 브랜치

- 기능 개발은 다음 형식의 브랜치를 사용합니다:
    - `기능/client/기능명`, `기능/server/기능명`
    - 예시: `feature/client/create-template`, `hotfix/server/linebreak-error`


- **브랜치 생성 시 반드시 `main` 브랜치의 최신 상태 반영**
    ```bash
    git checkout main
    git pull origin main
    git checkout -b 브랜치명
    ```

- 기능 개발 후 main 브랜치로 Pull Request를 보내 병합 (코드리뷰는 생략하고 각자 직접 병합 버튼 누르기)

## 🐳 Docker 명령어
**컨테이너 실행**
```
docker-compose up -d
```

**컨테이너 중지**
```
docker-compose down
```

**MySQL 접속**
```
docker exec -it rawcode_database mysql -u root -p
```

## 📄 라이센스
이 프로젝트는 PTKOREA 라이센스를 따릅니다.

- 제작: PTKOREA D2-DSG-T10 (Digital Strategy Group)
- 책임자: Jayce (김진우)
- 프로젝트 매니저: Mia(김영민), Day(안다희)
- 프로그램 개발자: Amber(이다혜) , Haley(유하영), Lina(한지윤), Frida(배채은), Julie(이재영)
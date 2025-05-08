# Re-coder
이 프로젝트는 사용자가 업로드한 가이드 txt 파일에서 데이터를 추출하고 데이더 베이스에 저장 후, 저장된 템플릿을 적용하여 새로운 결과 파일을 생성하는 React.js 프론트엔드와 Node.js 백엔드로 구성되어 있습니다. create-template 페이지에서는 fs를 사용하여 txt 파일에서 데이터를 추출하여 의도된 템플릿을 저장하며, tobe-applied 페이지에서는 선택한 템플릿을 업로드한 파일에 적용한 후, 반영된 결과 파일을 다운로드할 수 있습니다. qa-check페이지에서는 변환한 파일에 템플릿이 적용되었는지 확인할 수 있으며, localizaton페이지에서는 템플릿이 적용된 최종 파일에 각 나라변 번역 덱을 적용할 수 있습니다. 마지막으로 guide페이지에서는 시스템을 사용하는 방법이 기재되어 있습니다.

## 📁 폴더 구조

이 레포는 프론트엔드(Client)와 백엔드(Server)를 하나의 저장소에서 함께 관리합니다.
```
├── client/ # React.js 프론트엔드
└── server/ # Node.js 백엔드 (Express)
```

## 🚀 실행 방법

각 디렉토리로 이동하여 의존성 설치 후 개발 서버 실행

### Client (프론트엔드)
```bash
cd client
npm install
npm run dev
```

### Server (백엔드)
```bash
cd client
npm install
npm run dev
```

# 🌿 브랜치 전략
- `main`: 배포 및 기준 브랜치

- 기능 개발은 다음 형식의 브랜치를 사용합니다:
    - `기능/client/기능명`, `기능/server/기능명`
    - 예시: `feature/client/create-template`, `hotfix/server/linebreak-error`

- 기능 개발 후 main 브랜치로 Pull Request를 보내 병합


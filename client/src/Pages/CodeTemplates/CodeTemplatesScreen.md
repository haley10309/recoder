### 0) 템플릿 리스트
- `/get-templates` : 기존 존재하는 템플릿 불러와 드롭다운 옵션으로 표시

### 1) 템플릿 불러오기
- `/check-template-exsist` : 템플릿 존재하는지 확인
- `/get-template-details` : 해당 템플릿 DB의 `codeChanges` 그대로 불러옴.
  - codeChanges 없으면 새 템플릿 생성 가능 상태
  - codeChanges 있으면 기존 템플릿 수정 가능 상태
```
const codeChanges = [
  { 
    id: 1,
    ppt_no: 1,
    aswas_code: "<div id="reviewId"></div>",
    tobe_code: "<div id="reviewId">See Reviews</div>",
  }
]
```

### 2) PPT 파일 업로드
- `/upload-guide`: `pptNos`, `asWasCodes`, `toBeCodes` 반환
- `codeChanges`에 저장해서 textareas용 state로 사용
```
const codeChanges = [
  {
    ppt_no: 1,
    aswas_code: "<p id="reviewId"><div>Review</div></p>",
    tobe_code: "<p id="reviewId">See Reviews</p>",
  }
]
```

### 3) 원본코드.html 파일 업로드

- 원본코드.html 파일 업로드 시 `originalHtmlFile`에  저장
- `originalHtmlFile`이 있으면, 코드블럭에 `countOccurrences(item.aswas_code)` 발동하여 코드출현횟수 확인 가능


### 4) 템플릿 저장
- `/create-template` or `/update-template`
- `/get-template-details` 로 최신 `codegChnages` 불러와 다시 `codeChanges`에 저장

### 사용 API 정리
- `/get-templates`
- `/check-template-exsist`
- `/get-template-details`
- `/upload-guide`
- `/create-template`
- `/update-template`
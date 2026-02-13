### 0) 템플릿 리스트
- `/get-templates` : 기존 존재하는 템플릿 불러와 드롭다운 옵션으로 표시

### 1) 템플릿 불러오기

- `/get-template-details` : 해당 템플릿 DB의 codeChanges 그대로 불러옴. 데이터 가공x
- 프론트 코드 내 `codeChanges` state에 그대로 넣고, Textareas state에도 넣음

```
const codeChanges = [
  { 
    id: 1,
    ppt_no: 1,
    aswas_code: "<div id="reviewId"></div>",
    tobe_code: "<div id="reviewId">See Reviews</div>",
  }
]
const textareas = [
  id: codeChangesItem.id,
  pptNo: codeChangesItem.ppt_no,
  asWasCode: codeChangesItem.aswas_code,
  toBeCode: codeChangesItem.tobe_code,
]
```

### 2) 원본코드.html 파일 업로드

- 원본코드.html 파일 업로드 시 `originalFile`에  저장
- /uk/ -> /countryCode/ 변환 버튼 클릭
  - `textareas` 내의 uk를 countryCode로 변환 (temp변수)
  - `/convert-aswas-to-tobe-codes` 날려서 originalFile 내 asWasCode를 toBeCode로 변환시켜주는 API 호출 
  - 호출 성공 시 국가 코드 변환된 `textareas` temp변수를 state에 최종 저장
  - 반환값 `changeResults`는 `handleChangeResults`에 활용 : `isApplied`, `asWasOccurrenceCount`, `toBeOccurrenceCount` 계산
  - 반환값 `fileContent`는 코드변환다운로드 누르면 다운로드 가능

```
// server convertAsWasToToBeCodes 함수 참고
changeResults = { pairIndex: index, changed: !!changed, matchedPart }
```

### 사용 API 정리
- `/get-templates`
- `/get-template-details`
- `/convert-aswas-to-tobe-codes`
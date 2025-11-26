### 1) 템플릿 불러오기

- 템플릿 검색해서 aswas, tobe 코드 불러옴
- `/get-template-details` : 해당 템플릿 DB의 localizationEntries 그대로 불러옴. 데이터 가공x
- 프론트 코드 내 `textareas` state에 code_context를 국가코드 변환하여 넣음
```
const newTextareas = localizationEntries.map((entry) => ({
  localizationEntryId: entry.id,
  toBeCode: entry.code_context.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
}));
const textareas = [
  { 
    localizationEntryId: 1,
    toBeCode: "<div id="reviewId">See Reviews</div>", // 국가코드 있으면 변환도 함
  }
]
```

### 선택한 국가의 ToBe Html 업로드
- 업로드한 To-Be 백업코드파일 `tobeHtmlFile`, `tobeHtmlContent`에 저장해둠

### 번역덱 Txt 업로드
- `/upload-translation` : `englishCopyList`, `translations` 반환

```
englishCopyList = [
  "See Reviews",
  "All"
]

translations = {
  "CL": [
    "Ver reseñas",
    "Toda"
  ]
}
```

- 프론트 코드 : `translationMap` 세팅
```
translationMap = {
  "See Reviews": "Ver reseñas",
  "All": "Toda",
}
```

### 현재까지의 `textareas`
```
toBeCode={textarea.toBeCode}
localizedToBeCode={textarea.localizedToBeCode}
```

### 로컬라이제이션 적용
- `handleApplyLocalization` 함수 실행
- `_applyLocalizedTemplateBlocks` 함수: `textares`의 `toBeCode`에서 번역값을 찾아 `localizedToBeCode`로 치환
- `/convert-aswas-to-tobe-codes` API: `toBeHtmlFile`내 `toBeCode`를 찾아 `localizedToBeCode`로 치환 (이 때, toBeCode의 코드출현횟수가 0이면 치환 불가)
```
const textareas = [
  { 
    localizationEntryId: 1,
    toBeCode: "<div id="reviewId">See Reviews</div>",
    localizedToBeCode: "<div id="reviewId">Ver reseñas</div>", // See Reviews에 해당하는 번역값 적용됨 
  }
]
```

### 로컬라이제이션 적용
- `/convert-aswas-to-tobe-codes` API의 반환값인 `fileContent`를 프론트 코드 내 `localizedHtmlContent` state에 저장한 것을 `text/html`로 변환하여 html로 다운로드





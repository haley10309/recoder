### 1) 템플릿 불러오기

- 템플릿 검색해서 aswas, tobe 코드 불러옴
- `/get-template-details` : 해당 템플릿 DB의 codeChanges 그대로 불러옴. 데이터 가공x
- 프론트 코드 내 `nonAssetCodeChanges(codeChanges)` state에 그대로 넣음
```
const nonAssetCodeChanges = [
  { 
    id: 1,
    ppt_no: 1,
    aswas_code: "<div id="reviewId"></div>",
    tobe_code: "<div id="reviewId">See Reviews</div>",
  }
]
const textareas = [
  pptNo: nonAssetCodeChangeItem.ppt_no,
  asWasCode: nonAssetCodeChangeItem.aswas_code,
  toBeCode: nonAssetCodeChangeItem.tobe_code,
]
```

### 백업코드 업로드
- 업로드한 To-Be 백업코드파일 `fileContent`에 저장해둠 

### 번역덱 업로드
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

### 현재까지의 Textareas
```
asWasCode={textarea.asWasCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`)}
toBeCode={textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`)}
localizedToBeCode={textarea.localizedToBeCode}
```

### 코드 출현 횟수 확인하기
사실은 국가코드 변환

- Textareas 국가코드 변환하여 Set
- `/convert-aswas-to-tobe-codes` : 
이걸 변환해서 뭘 하는거지?


### 로컬라이제이션 적용


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
toBeCode={textarea.toBeCode}
localizedToBeCode={textarea.localizedToBeCode}
```

### 로컬라이제이션 적용
// TODO: 실제 translation key 적용 여부 등의 번역 기능 구현
// TODO: 번역 기능 업데이트 (localizationEntry에 있으면, 그리고 그게 코드출현횟수 기능에 감지가 되면, 코드가 변환이 되도록!)

- `/get-template-details`: `localizationEntries` 불러옴
```
const localizationEntries = [
  {
    "id": 241,
    "code_context": "<span class=\"common-cta-encased__text\">Where to buy</span>\r\n                \t\t   </div>\r\n                            <a href=\"https://www.samsung.com/uk/smartphones/galaxy-s25/reviews/\" class=\"common-cta-underline common-cta-underline--black\" data-omni-type=\"microsite_contentinter\" data-omni=\"galaxy-s25:features:key-vis^img:link-page:reviews\" ga-ca=\"content click\" ga-ac=\"feature\" ga-la=\"galaxy-s25:features:key-vis^img:link-page:reviews\">\r\n                            <span class=\"common-cta-underline__text\">See Reviews</span>\r\n                        </a>\r\n                    </div>\r\n                </div>\r\n                <figure class=\"features-kv__image\">"
  },
  ...
]
```

applyLocalizedTemplateBlocks

// TODO: matchedPart 중요하면 붙이기
// TODO: localized가 비어있으면 서버에 날릴 때 무시하기
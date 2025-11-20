### 1) 템플릿 불러오기
- `/check-template-exsist` : 템플릿 존재하는지 확인
- `/get-template-details` : 해당 템플릿 DB의 codeChanges, localizationEntries 그대로 불러옴. 데이터 가공x
- 프론트 코드 내 `nonAssetCodeChanges(codeChanges)` state에 그대로 넣음 (이미 저장된 `localizationEntries`가 있다면 `localizationEntries`도 저장)
```
const nonAssetCodeChanges = [
  { 
    id: 1,
    ppt_no: 1,
    aswas_code: "<div id="reviewId"></div>",
    tobe_code: "<div id="reviewId">See Reviews</div>",
  }
]
```

### 2) 번역파일 업로드
- `/extract-english-copy-list` : 번역파일 내 COPY열에 있는 텍스트 배열 반환하여, 프론트 코드 내 `englishCopyList` state에 그대로 넣음
- 1에서 불러온 `localizationEntries`의 배열길이가 0이고 `englishCopyList`의 배열길이가 1 이상이면, `nonAssetCodeChanges(codeChanges)`에서, englishCopyList에 해당하는 tobe_code가 있는 항목만 필터링하여 그대로 `localizationEntries`에 넣음

```
const englishCopyList = [
  "See Reviews"
]
const localizationEntries = [
  {
    id: 1,
    code_context: "<span id="reviewId">See Reviews</span>"
  }
]
```

### 3) 로컬라이제이션 템플릿
- `englishCopyList`에 해당하는 문자열이 코드블럭 내에 있으면, 빨간색 글씨로 하이라이팅.
- 코드블럭 최초 렌더링 및 onChange 발동 시 하이라이팅 맞게 세팅됨
```
<TransBox
  ...
  codeContext={item.code_context}
  highlights={highlights}
  ...
/>
```
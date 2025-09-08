// 코드 변환 로직  
  
// 공백 및 특수문자 제거 함수
function normalizeCode(code) {
  return code.replace(/[\s;"',/()]/g, '');
}

// function normalizeCode(code) {
//   return code
//     .replace(/[\s"';,\/(){}\[\].<>:\-\n\r]/g, '')  
//     .replace(/&nbsp;/gi, '')                       
//     .toLowerCase();
// }

// 일치하는 부분 찾기
function findMatchedPart(asWasCode, normalizedOriginal, normalizedAsWas) {
  let matchedParts = {
    frontMatch: '',
    backMatch: ''
  };

  // 앞에서부터 일치하는 부분 찾기
  for (let i = 1; i <= normalizedAsWas.length; i++) {
    const subNormalized = normalizedAsWas.slice(0, i);
    const subIndex = normalizedOriginal.indexOf(subNormalized);

    if (subIndex !== -1) {
      let charCount = 0;
      let realMatch = '';
      for (let j = 0; j < asWasCode.length; j++) {
        if (!/[\s;"',/()]/g.test(asWasCode[j])) charCount++;
        realMatch += asWasCode[j];

        if (charCount >= i) {
          break;
        }
      }
      matchedParts.frontMatch = realMatch;
    }
  }

  // 뒤에서부터 일치하는 부분 찾기
  for (let i = 1; i <= normalizedAsWas.length; i++) {
    const subNormalized = normalizedAsWas.slice(-i);
    const subIndex = normalizedOriginal.indexOf(subNormalized);

    if (subIndex !== -1) {
      let charCount = 0;
      let realMatch = '';
      for (let j = asWasCode.length - 1; j >= 0; j--) {
        if (!/[\s;"',/()]/g.test(asWasCode[j])) charCount++;
        realMatch = asWasCode[j] + realMatch;

        if (charCount >= i) {
          break;
        }
      }
      matchedParts.backMatch = realMatch;
    }
  }

  return matchedParts;
}
  
// 코드 변경
function replaceCode(originalCode, asWasCode, toBeCode) {
  // 1. 주석, 특수문자로 시작하는 경우 단순 치환
  if (asWasCode.startsWith("//") || asWasCode.startsWith("*") || asWasCode.startsWith("[")) {
    let newCode = originalCode.replace(asWasCode, toBeCode);
    return { newCode, changed: newCode !== originalCode };
  }

  // 2. normalize
  const normalizedOriginal = normalizeCode(originalCode);
  const normalizedAsWas = normalizeCode(asWasCode);
  
  // 3. 앞에서 일치하는 부분과 뒤에서 일치하는 부분을 찾기
  const matchedParts = findMatchedPart(asWasCode, normalizedOriginal, normalizedAsWas);

  // 4. 일치하는 부분이 없을 경우, 가장 가까운 일치 부분 출력
  if (!matchedParts.frontMatch && !matchedParts.backMatch) {
    // console.log("일치하는 부분이 없습니다.");
    return { newCode: originalCode, changed: false, matchedPart:[] };
  }

  let matchedPart = [matchedParts.frontMatch, matchedParts.backMatch];

  // 5. 원본 코드에서 실제 위치 찾기 (normalized index)
  const startIndex = normalizedOriginal.indexOf(normalizedAsWas);
  if (startIndex === -1) {
    // console.log("일치하는 부분이 없습니다. 가장 가까운 일치 부분:", matchedPart);
    return { newCode: originalCode, changed: false, matchedPart };
  }
  
  // 6. 실제 위치 매핑
  let realStartIndex = -1, realEndIndex = -1;
  let charCount = 0;
  for (let i = 0; i < originalCode.length; i++) {
    if (/[\s;"',/()]/.test(originalCode[i])) continue;
    if (charCount === startIndex && realStartIndex === -1) realStartIndex = i;
    if (charCount === startIndex + normalizedAsWas.length - 1) {
      realEndIndex = i;
      break;
    }
    charCount++;
  }

  if (realStartIndex === -1 || realEndIndex === -1) {
    // console.log("일치하는 부분을 찾을 수 없습니다.");
    return { newCode: originalCode, changed: false, matchedPart };
  }

  // 7. sliceEndIndex 확장 (치환 대상 코드 뒤에 불필요하게 붙어있는 공백, 세미콜론, 괄호, 따옴표 같은 것들을 포함해서 잘라내려는 처리)
  let sliceEndIndex = realEndIndex + 1;
  while (sliceEndIndex < originalCode.length && /[\s;"',/()]/.test(originalCode[sliceEndIndex])) {
    sliceEndIndex++;
  }

  // 8. 조건부 개행 처리
  let prefixNewline = "\n"; // 기본 추가
  for (let i = realStartIndex - 1; i >= 0; i--) {
    if (originalCode[i] === "\n") {
      prefixNewline = ""; // 줄바꿈 이미 있음
      break;
    }
    if (originalCode[i] !== " " && originalCode[i] !== "\t") {
      // 다른 문자가 나오면 줄바꿈 필요 → prefixNewline 그대로
      prefixNewline = "";
      break;
    }
    // 공백/탭이면 그냥 계속 올라감
  }

  let suffixNewline = "\n"; // 기본 추가

  let newCode = originalCode.slice(0, realStartIndex) + prefixNewline + toBeCode + suffixNewline + originalCode.slice(sliceEndIndex);

  // 9. 최종 반환
  if (newCode !== originalCode) {
    return { newCode, changed: true };
  } else {
    return { newCode, changed: false, matchedPart };
  }
}

function extractEnglishCopyList(copyDeckFile) {
  const fileContent = copyDeckFile.buffer.toString("utf-8");
  const lines = fileContent.split(/\r?\n/);

  if (lines.length < 2) {
    return {
      errorMsg: "File does not contain enough data.",
      statusCode: 400,
    }
  }

  const headerRow = lines[0].split("\t");
  const copyColumnIndex = headerRow.findIndex((col) => col.trim().toUpperCase() === "COPY");

  if (copyColumnIndex === -1) {
    return {
      errorMsg: `"COPY" column not found in header.`,
      statusCode: 400,
    }
  }

  const englishCopyList = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split("\t");
    const englishText = row[copyColumnIndex]?.trim();

    if (englishText) {
      englishCopyList.push(englishText);
    }
  }

  return { englishCopyList };
}
  
module.exports = {
  normalizeCode,
  findMatchedPart,
  replaceCode,
  extractEnglishCopyList,
} 
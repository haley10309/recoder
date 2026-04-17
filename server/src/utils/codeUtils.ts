// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

import { ExtractCopyResult } from "../types/codeTemplate.types";

// 코드 변환 로직
// 공백 및 특수문자 제거 함수
// ⚠️ 프론트 advancedNormalizeCode와 100% 동일해야 하면, 프론트 로직과 맞춰서 수정 필요
export const normalizeCode = (code) => {
  if (!code) return "";
  return code.replace(/[\s;"',/()]/g, "");
};

const IGNORE_REGEX = /[\s;"',/()]/;

// normalized 문자열과 original 문자열 간 index 매핑 생성
const buildNormalizedMap = (code) => {
  let normalized = "";
  let indexMap = []; // normalized index -> original index

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (IGNORE_REGEX.test(ch)) continue;

    normalized += ch;
    indexMap.push(i);
  }

  return { normalized, indexMap };
};

// 일치하는 부분 찾기
export const findMatchedPart = (asWasCode, normalizedOriginal, normalizedAsWas) => {
  let matchedParts = {
    frontMatch: "",
    backMatch: "",
  };

  // 앞에서부터 일치하는 부분 찾기
  for (let i = 1; i <= normalizedAsWas.length; i++) {
    const subNormalized = normalizedAsWas.slice(0, i);
    const subIndex = normalizedOriginal.indexOf(subNormalized);

    if (subIndex !== -1) {
      let charCount = 0;
      let realMatch = "";

      for (let j = 0; j < asWasCode.length; j++) {
        if (!IGNORE_REGEX.test(asWasCode[j])) charCount++;
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
      let realMatch = "";

      for (let j = asWasCode.length - 1; j >= 0; j--) {
        if (!IGNORE_REGEX.test(asWasCode[j])) charCount++;
        realMatch = asWasCode[j] + realMatch;

        if (charCount >= i) {
          break;
        }
      }

      matchedParts.backMatch = realMatch;
    }
  }

  return matchedParts;
};

// fallback용: 첫 유효문자 위치를 기준으로,
// 앞쪽 무시 문자(공백, 괄호, 따옴표 등)까지 포함한 실제 시작 위치 계산
const findRealStartIndexFromOriginal = (
  originalCode,
  asWasCode,
  firstMeaningfulIndex
) => {
  // asWasCode의 첫 유효문자 위치 찾기
  let firstMeaningfulInAsWas = 0;
  while (
    firstMeaningfulInAsWas < asWasCode.length &&
    IGNORE_REGEX.test(asWasCode[firstMeaningfulInAsWas])
  ) {
    firstMeaningfulInAsWas++;
  }

  // 앞쪽 무시 문자가 없으면 그대로 반환
  if (firstMeaningfulInAsWas === 0) {
    return firstMeaningfulIndex;
  }

  // asWas 앞쪽 무시 문자 개수만큼 original에서도 뒤로 확장 시도
  let i = firstMeaningfulIndex - 1;
  let remain = firstMeaningfulInAsWas;
  let realStartIndex = firstMeaningfulIndex;

  while (i >= 0 && remain > 0) {
    if (!IGNORE_REGEX.test(originalCode[i])) {
      break;
    }
    realStartIndex = i;
    i--;
    remain--;
  }

  return realStartIndex;
};

// fallback용: 원본 시작점 기준으로 asWasCode 전체가 대응되는 실제 끝 위치 계산
const findRealEndIndexFromOriginal = (originalCode, asWasCode, realStartIndex) => {
  let i = realStartIndex; // originalCode cursor
  let j = 0; // asWasCode cursor

  while (i < originalCode.length && j < asWasCode.length) {
    const originalChar = originalCode[i];
    const asWasChar = asWasCode[j];

    // 둘 다 무시 문자면 같이 소비
    if (IGNORE_REGEX.test(originalChar) && IGNORE_REGEX.test(asWasChar)) {
      i++;
      j++;
      continue;
    }

    // original만 무시 문자면 original만 이동
    if (IGNORE_REGEX.test(originalChar)) {
      i++;
      continue;
    }

    // asWas만 무시 문자면 asWas만 이동
    if (IGNORE_REGEX.test(asWasChar)) {
      j++;
      continue;
    }

    // 둘 다 유효 문자면 비교
    if (originalChar !== asWasChar) {
      return -1;
    }

    i++;
    j++;
  }

  // asWasCode를 다 소비하지 못했으면 실패
  while (j < asWasCode.length) {
    if (!IGNORE_REGEX.test(asWasCode[j])) {
      return -1;
    }
    j++;
  }

  // i는 "끝 다음 위치"이므로 end index는 i - 1
  return i - 1;
};

// 코드 변경
export const replaceCode = (originalCode, asWasCode, toBeCode) => {
  if (!originalCode || !asWasCode) {
    return { newCode: originalCode, changed: false, matchedPart: [] };
  }

  // 1. 주석, 특수문자로 시작하는 경우 단순 치환
  if (
    asWasCode.startsWith("//") ||
    asWasCode.startsWith("*") ||
    asWasCode.startsWith("[")
  ) {
    const newCode = originalCode.replace(asWasCode, toBeCode);
    return { newCode, changed: newCode !== originalCode };
  }

  // 2. 가장 먼저 원본 코드 기준 exact match 시도
  const rawStartIndex = originalCode.indexOf(asWasCode);

  if (rawStartIndex !== -1) {
    const rawEndIndex = rawStartIndex + asWasCode.length;

    const newCode =
      originalCode.slice(0, rawStartIndex) +
      toBeCode +
      originalCode.slice(rawEndIndex);

    return { newCode, changed: newCode !== originalCode };
  }

  // 3. exact match 실패 시 normalize 기반 fallback
  const { normalized: normalizedOriginal, indexMap } = buildNormalizedMap(originalCode);
  const normalizedAsWas = normalizeCode(asWasCode);

  const matchedParts = findMatchedPart(asWasCode, normalizedOriginal, normalizedAsWas);

  if (!matchedParts.frontMatch && !matchedParts.backMatch) {
    return { newCode: originalCode, changed: false, matchedPart: [] };
  }

  const matchedPart = [matchedParts.frontMatch, matchedParts.backMatch];

  const normalizedStartIndex = normalizedOriginal.indexOf(normalizedAsWas);

  if (normalizedStartIndex === -1) {
    return { newCode: originalCode, changed: false, matchedPart };
  }

  // normalized 상 첫 유효 문자 위치 -> originalCode 상 첫 유효 문자 위치
  const firstMeaningfulIndex = indexMap[normalizedStartIndex];

  if (firstMeaningfulIndex === undefined || firstMeaningfulIndex < 0) {
    return { newCode: originalCode, changed: false, matchedPart };
  }

  // 핵심 1: 시작점 보정
  const realStartIndex = findRealStartIndexFromOriginal(
    originalCode,
    asWasCode,
    firstMeaningfulIndex
  );

  if (realStartIndex === undefined || realStartIndex < 0) {
    return { newCode: originalCode, changed: false, matchedPart };
  }

  // 핵심 2: 끝점 보정
  const realEndIndex = findRealEndIndexFromOriginal(
    originalCode,
    asWasCode,
    realStartIndex
  );

  if (realEndIndex === -1 || realEndIndex < realStartIndex) {
    return { newCode: originalCode, changed: false, matchedPart };
  }

  const sliceEndIndex = realEndIndex + 1;

  const newCode =
    originalCode.slice(0, realStartIndex) +
    toBeCode +
    originalCode.slice(sliceEndIndex);

  if (newCode !== originalCode) {
    return { newCode, changed: true };
  } else {
    return { newCode, changed: false, matchedPart };
  }
};

export const extractEnglishCopyListUtil = (
  copyDeckFile: Express.Multer.File
): ExtractCopyResult => {
  const fileContent = copyDeckFile.buffer.toString("utf-8");
  const lines = fileContent.split(/\r?\n/);

  if (lines.length < 2) {
    return {
      errorMsg: "File does not contain enough data.",
      statusCode: 400,
    };
  }

  const headerRow = lines[0].split("\t");
  const copyColumnIndex = headerRow.findIndex(
    (col) => col.trim().toUpperCase() === "COPY"
  );

  if (copyColumnIndex === -1) {
    return {
      errorMsg: `"COPY" column not found in header.`,
      statusCode: 400,
    };
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
};
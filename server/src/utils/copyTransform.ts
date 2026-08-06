// =========================================
// 디스클레이머 번호 제거
// =========================================

// 디스클레이머 번호에 사용되는 숫자
// ASCII / Arabic-Indic(٠-٩) / Extended Arabic-Indic(۰-۹)
const DIGIT = "0-9\\u0660-\\u0669\\u06F0-\\u06F9";

// 번호 사이 구분자
// 공백 / ASCII 쉼표(,) / 아랍어 쉼표(،) / 전각 쉼표(，)
const SEPARATOR = "\\s,\\u060C\\uFF0C";

// 카피 끝의 디스클레이머 번호 목록
// 예: "5", "5,6", "5, 6", "5،6", "5،6،7" 및 뒤따르는 구분자
const TRAILING_DISCLAIMER_NUMBERS = new RegExp(
  `[${SEPARATOR}]*[${DIGIT}]+(?:[${SEPARATOR}]+[${DIGIT}]+)*[${SEPARATOR}]*$`
);

/**
 * 카피 마지막의 디스클레이머 번호(단일/복수)를 모두 제거한다.
 *
 * - "…النوم.24"   → "…النوم."
 * - "…ذلك.5،6"    → "…ذلك."
 * - "…عن قرب8"    → "…عن قرب"
 *
 * <sup> 앞 공백은 normalizeSupFormat에서 앞 문맥을 보고 일괄 결정하므로
 * 여기서는 다루지 않는다.
 *
 * 이미 번호가 제거된 값이 들어와도 결과가 동일한 멱등 함수.
 */
export const stripDisclaimerNumber = (rawCopy: string): string => {
  return rawCopy
    .replace(/\s+$/, "")
    .replace(TRAILING_DISCLAIMER_NUMBERS, "")
    .replace(/\s+$/, "");
};
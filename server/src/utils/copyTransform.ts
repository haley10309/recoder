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

// =========================================
// Disclaimer Snapdragon® 기호 처리
// =========================================

// ® 기호 표기 (문자 / 엔티티 모두 대응)
const REG_SYMBOL_PATTERN = /®|&reg;|&#174;|&#xAE;/gi;

// <sup> 블록 (중복 감싸기 방지용 탐색)
const SUP_BLOCK_SCAN = /<sup\b[^>]*>[\s\S]*?<\/sup>/gi;

/**
 * Disclaimer 카피의 ® 기호를 <sup>&reg;</sup> 형태로 변환한다.
 * 이미 <sup>으로 감싸진 구간은 내부 표기만 &reg;로 통일하여
 * <sup> 태그가 중복 생성되지 않도록 한다.
 *
 * 이미 변환된 값이 다시 들어와도 결과가 동일한 멱등 함수.
 */
export const wrapRegSymbol = (copy: string): string => {
  let result = "";
  let lastIndex = 0;

  SUP_BLOCK_SCAN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = SUP_BLOCK_SCAN.exec(copy)) !== null) {
    // sup 밖 구간 → <sup>&reg;</sup> 로 감쌈
    result += copy
      .slice(lastIndex, match.index)
      .replace(REG_SYMBOL_PATTERN, "<sup>&reg;</sup>");

    // sup 안 구간 → 표기만 &reg; 로 통일 (감싸지 않음)
    result += match[0].replace(REG_SYMBOL_PATTERN, "&reg;");

    lastIndex = match.index + match[0].length;
  }

  result += copy.slice(lastIndex).replace(REG_SYMBOL_PATTERN, "<sup>&reg;</sup>");

  return result;
};
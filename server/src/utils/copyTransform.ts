export type DisclaimerStripResult = {
  copy: string;
  needsSpace: boolean;   // <sup> 앞에 공백을 넣을지 여부
};

// 카피 끝의 디스클레이머 번호 목록
// 예: "5", "5,6", "5, 6", "5, 6, 7", "5 6" 및 뒤따르는 쉼표/공백
const TRAILING_DISCLAIMER_NUMBERS = /[\s,]*\d+(?:[\s,]+\d+)*[\s,]*$/;

/**
 * 카피 마지막의 디스클레이머 번호(단일/복수)를 모두 제거하고
 * <sup> 앞 공백 필요 여부를 판단한다.
 *
 * - 번호 앞이 온점(.)  → 공백 없음
 * - 번호 앞이 일반 문자 → 공백 1개
 *
 * 이미 번호가 제거된 값이 들어와도 결과가 동일한 멱등 함수.
 */
export const stripDisclaimerNumber = (
  rawCopy: string
): DisclaimerStripResult => {
  const copy = rawCopy.replace(/\s+$/, "");

  const cleaned = copy
    .replace(TRAILING_DISCLAIMER_NUMBERS, "")
    .replace(/\s+$/, "");

  return {
    copy: cleaned,
    // 온점으로 끝나면 공백 없음, 그 외에는 공백 1개
    needsSpace: !cleaned.endsWith("."),
  };
};
// translation-qa: 언팩 번역이 실제 HTML(after)에 잘 반영되었는지 검사하는 기능.
// diff 기반이 아니라, copy.xlsx의 각 row(data-copy-set)를 기준으로 apply_type별 값이
// 번역본으로 바뀌었는지 검사한다. (기존 unpack의 extract_unpack_excel 재사용)

// 한 row(= 하나의 data-copy-set)에 대한 검사 결과 블록
export type TranslationQaBlock = {
  index: number;
  /** data-copy-set 값 (예: "F08-014"). sup 셀렉터면 sup-번호 */
  copySetNumber: string;
  /** 엑셀 원본 target_selector (예: data-copy-set="F08-014") */
  targetSelector: string;
  apply_type: string;
  original_copy: string;
  /** site_code(국가) 기준 기대 번역 카피 (text_transform 반영 후) */
  expected_copy: string;
  /** before.html에서 찾은 해당 요소 (표시용) */
  beforeCode: string;
  /** after.html에서 찾은 해당 요소 (표시용) */
  afterCode: string;
  /** after.html에서 apply_type 기준으로 실제 추출한 값 */
  afterValue: string | null;
  /** 번역이 정상 반영되었는지 여부 */
  matched: boolean;
  /** 사용자에게 보여줄 검사 결과 문구 */
  resultText: string;
  /** 실패 사유 (matched=false일 때) */
  failReason?: string;
  /** 매칭 실패했지만 after.html에 번역 전 원문이 그대로 남아있는지 여부 */
  originalStillPresent?: boolean;
  /** 매칭 실패 시, 이 자리에 반영되어야 할 정답 번역 카피 (원문이 남아있을 때) */
  correctAnswer?: string;
};

export type VerifyTranslationQaResponse =
  | { success: false; error: string }
  | { success: true; blocks: TranslationQaBlock[] };

// Pre Coder: wwpd 작업 전 recoder에 넣기 위한 파일(html) 최적화 검사 로직.
// 사업부 제공 .html 파일 + 영문 카피덱(xlsx → row_list)을 대조하여
// data-copy-set 고유성 / 태그 스코프 / 카피 종류 자동분류 / 순서 / 누락카피 를 검사한다.

import { isTextLeaf } from "./extractFeaturesDisclaimer";

export type CopyDeckRow = {
  row_order?: number;
  target_selector: string; // 예: data-copy-set="F02-004"
  apply_type: string; // alt | aria-label | innerText | text_disclaimer 등
  exclude_sup?: boolean;
  enable_text_transform?: boolean;
  original_copy?: string;
  // FAQ 카피덱에서 함께 내려오는 분류 컬럼 (엑셀 파서가 반환하지만 기존에는 사용하지 않았다)
  category?: string;
  item?: string; // Questions | Answer
};

export type DetectedCopyType =
  | "alt"
  | "aria-label"
  | "title"
  | "innerText"
  | "disclaimer"
  | "unknown";

export type HtmlCopySetNode = {
  domIndex: number; // 문서 내 등장 순서 (0부터)
  value: string; // data-copy-set 값 ("" 이면 미할당)
  tagName: string;
  detectedType: DetectedCopyType;
  extractedText: string; // 비교용 카피 (<sup>과 그 안의 각주 숫자는 뺀 값)
  // <sup>이 있던 자리에 SUP_MARK를 남긴 카피. 카피덱에 각주 숫자가 일반 글자로 적힌 경우
  // (예: "battery.1") 그 자리의 숫자만 허용해서 비교하는 데 쓴다.
  textWithSupMarks?: string;
  line: number; // 원본 html 기준 몇 번째 줄인지 (못 찾으면 -1)
  outerHtmlPreview: string;
};

export type DuplicateIssue = {
  value: string;
  count: number;
  lines: number[];
  contentsMatch: boolean;
  message: string;
};

export type ScopeIssue = {
  value: string;
  type: "nested-child" | "child-missing-copyset" | "deck-not-in-html";
  line?: number;
  deckRowOrder?: number;
  message: string;
};

export type TypeMismatchIssue = {
  value: string;
  tagName: string;
  declaredType: string;
  detectedType: DetectedCopyType;
  suggestedType?: string;
  line: number;
  message: string;
};

export type OrderIssueType = "deckIdOrder" | "htmlPosition";

export type OrderIssue = {
  value: string;
  deckRowOrder?: number;
  line: number;
  prevValue: string;
  prevLine: number;
  issueType: OrderIssueType;
  message: string;
};

export type OrderSequenceItem = {
  value: string;
  deckRowOrder?: number;
  line: number;
  original_copy?: string;
  outOfOrder: boolean;
  issueType?: OrderIssueType; // 정상이거나 alreadyMentioned면 없음
  alreadyMentioned: boolean; // 같은 data-copy-set이 카피덱에 반복 등장해, 앞서 이미 검수된 값인 경우
};

export type UntaggedCopyKind = "alt" | "aria-label" | "disclaimer" | "title" | "innerText";

export type UntaggedCopyIssue = {
  attrText: string;
  tagNames: string[];
  values: (string | null)[];
  lines: number[];
  message: string;
  copyKind: UntaggedCopyKind;
  // value-not-in-deck(이미 값은 있음) 케이스에는 의미가 없어 항상 false
  contentFoundInDeck: boolean;
  contentFoundTaggedElsewhereInHtml: boolean;
};

export type UnassignedTagIssue = {
  tagName: string;
  line: number;
  snippet: string; // data-copy-set="" 이 포함된 태그 코드 조각
};

export type ContentMismatchIssue = {
  value: string;
  tagName: string;
  line: number;
  deckCopy: string;
  htmlCopy: string;
  diffIndex: number;
  message: string;
};

export type SupFlagMismatchIssue = {
  value: string;
  tagName: string;
  line: number;
  declaredExcludeSup: boolean;
  hasSupInHtml: boolean;
  // 어떤 플래그의 불일치인지 (이 필드가 추가되기 전에 저장된 결과는 모두 exclude_sup)
  flag?: "exclude_sup" | "enable_text_transform";
  declared?: boolean; // 카피덱에 해당 플래그가 O로 지정됐는지
  message: string;
};

// 카피덱 안에서 같은 target_selector(data-copy-set)가 여러 행에 쓰인 경우
export type DeckDuplicateIssue = {
  targetSelector: string;
  count: number;
  rowOrders: (number | null)[];
  copies: string[];
  copiesDiffer: boolean;
  message: string;
};

export type FaqItemMismatchIssue = {
  value: string;
  line: number;
  deckItem: string; // 카피덱에 적힌 item
  detectedItem: string; // html 구조로 판별한 item
  copyPreview: string;
  message: string;
};

export type PreCoderAnalysisResult = {
  totalHtmlCopySetCount: number;
  totalDeckRowCount: number;
  unassignedCount: number;
  unassignedLines: number[];
  unassignedIssues: UnassignedTagIssue[];
  duplicateIssues: DuplicateIssue[];
  scopeIssues: ScopeIssue[];
  typeMismatchIssues: TypeMismatchIssue[];
  orderIssues: OrderIssue[];
  orderSequence: OrderSequenceItem[];
  untaggedCopyIssues: UntaggedCopyIssue[];
  contentMismatchIssues: ContentMismatchIssue[];
  supFlagMismatchIssues: SupFlagMismatchIssue[];
  faqItemMismatchIssues: FaqItemMismatchIssue[];
  // 나중에 추가된 필드라 이전에 저장된 결과에는 없을 수 있다.
  deckDuplicateIssues?: DeckDuplicateIssue[];
};

export type PreCoderAnalysisScope = "features-disclaimer" | "faq" | "all";

// ────────────────────────────────────────────────────────────────────────────
// 공통 유틸
// ────────────────────────────────────────────────────────────────────────────

const normalize = (value: string | null | undefined): string => {
  return (value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
};

// 두 문자열이 처음으로 달라지는 글자 위치를 찾는다. (한쪽이 다른 쪽의 접두사면 짧은 쪽 길이를 반환)
const findFirstDiffIndex = (a: string, b: string): number => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return len;
};

// 불일치 지점 주변 텍스트를 잘라서 보여주기 위한 헬퍼
const excerptAround = (text: string, index: number, radius = 20): string => {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
};

// disclaimer 각주 링크(sup > a[data-sup-tag]/.click_sup)가 요소 안 어디에든 있는지 확인
const hasClickSupAnywhere = (el: Element): boolean => {
  return !!el.querySelector('sup a[data-sup-tag], sup a.click_sup');
};

// data-copy-set="F02-004" -> { attr: "data-copy-set", value: "F02-004" }
const parseTargetSelector = (
  targetSelector: string
): { attr: string; value: string } | null => {
  const match = (targetSelector || "").match(/^([\w-]+)=["']([^"']+)["']$/);
  if (!match) return null;
  return { attr: match[1], value: match[2].trim() };
};

// data-copy-set은 보통 "알파벳+숫자" + "-숫자"(1개 이상) 형태(예: C04-138, C04-138-2).
// 문자열(사전식) 비교로는 "C10"이 "C9"보다 작다고 오판할 수 있어(자리수 다른 숫자 비교 버그),
// 각 숫자 세그먼트를 실제 숫자값으로 파싱해 비교한다.
type ParsedCopySetId = {
  prefix: string; // 예: "C"
  groupNumber: number; // 예: 4 (그룹 세그먼트 "04")
  groupKey: string; // 예: "C-4" (같은 그룹인지 판별용)
  restSegments: number[]; // 그룹 뒤의 나머지 숫자 세그먼트들, 예: "003" -> [3], "003-2" -> [3, 2]
};

const parseCopySetId = (value: string): ParsedCopySetId | null => {
  const match = (value || "").match(/^([A-Za-z]+)(\d+)((?:-\d+)*)$/);
  if (!match) return null;
  const [, prefix, groupStr, restStr] = match;
  const groupNumber = parseInt(groupStr, 10);
  const restSegments = restStr
    ? restStr
        .split("-")
        .filter(Boolean)
        .map((s) => parseInt(s, 10))
    : [];
  return { prefix, groupNumber, groupKey: `${prefix}-${groupNumber}`, restSegments };
};

// 숫자 세그먼트 배열을 앞자리부터 순서대로 비교 (버전 번호 비교와 동일한 방식, 진수 처리)
const compareSegments = (a: number[], b: number[]): number => {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
};

const buildLineOffsets = (text: string): number[] => {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) offsets.push(i + 1);
  }
  return offsets;
};

const lineNumberFromOffset = (offsets: number[], index: number): number => {
  if (index < 0) return -1;
  let lo = 0;
  let hi = offsets.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid] <= index) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans + 1;
};

// alt 속성을 실제로 지원하는 태그
const ALT_CAPABLE_TAGS = ["img", "area", "input"];
// 자식 텍스트를 가질 수 없는(innerText 불가능) 태그
const VOID_LIKE_TAGS = ["img", "area", "input", "video", "source", "track", "br", "hr"];

// 자기 자신의 텍스트를 직접 담는, 별도 카피 단위로 취급될 가능성이 높은 태그
// (span/div는 단순 스타일 래핑용으로 쓰이는 경우가 많아 노이즈를 줄이기 위해 제외)
const TEXT_CONTAINER_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "li",
  "a",
  "button",
  "label",
  "blockquote",
  "figcaption",
  "dt",
  "dd",
  "td",
  "th",
];

// <sup>(각주)이 있던 자리 표시용 문자. 비교할 때는 지우고, 카피덱의 각주 숫자를 허용할 위치로만 쓴다.
const SUP_MARK = "\uE000";

// <br> 태그를 비교용 표준 표기로 만든다. 속성(class="cm-br-mo" 등)은 순서대로 그대로 두고,
// <br> / <br/> / <br /> 같은 닫는 방식 차이만 "<br .../>"로 통일한다.
const formatBrTag = (attrs: [string, string][]): string =>
  `<br${attrs.map(([name, value]) => ` ${name.toLowerCase()}="${value}"`).join("")}/>`;

// &reg; / &trade;(및 숫자 엔티티)는 ® / ™와 같은 값으로 본다.
const unifySymbolEntities = (text: string): string =>
  text.replace(/&reg;|&#174;|&#x0*ae;/gi, "®").replace(/&trade;|&#8482;|&#x0*2122;/gi, "™");

// html·카피덱 카피 공통 정리: 공백 정리, ®/™ 엔티티 통일, <br/> 앞뒤 공백 제거
// (소스 줄바꿈·들여쓰기 때문에 "문장 <br/> 문장"처럼 생기는 공백 차이는 무시한다)
const cleanCopy = (text: string): string =>
  normalize(unifySymbolEntities(text)).replace(/\s*(<br\b[^>]*\/>)\s*/g, "$1");

const stripSupMarks = (text: string): string => cleanCopy(text.split(SUP_MARK).join(""));

// 카피 비교/표시용 텍스트를 추출한다.
// - <br>은 카피덱에도 그대로 적혀 있으므로 속성까지 포함한 태그 문자열(<br class="cm-br-mo"/>)로 남긴다.
// - <strong> 등 인라인 태그는 안의 글자만 그대로 이어 붙인다.
// - <sup>(각주)은 html과 카피덱의 표기가 달라(html: 각주 앵커 / 카피덱: 화면에 보이는 숫자)
//   내용을 빼고 자리만 SUP_MARK로 남긴다.
const extractTextRespectingBr = (el: Element): string => {
  let result = "";
  const walk = (node: ChildNode) => {
    if (node.nodeType === 3) {
      result += node.textContent || "";
    } else if (node.nodeType === 1) {
      const tag = (node as Element).tagName.toLowerCase();
      if (tag === "br") {
        const attrs = Array.from((node as Element).attributes).map(
          (a) => [a.name, a.value] as [string, string]
        );
        result += formatBrTag(attrs);
      } else if (tag === "sup") {
        result += SUP_MARK;
      } else {
        Array.from(node.childNodes).forEach(walk);
      }
    }
  };
  Array.from(el.childNodes).forEach(walk);
  return result;
};

// 카피덱 카피를 html 카피와 같은 기준으로 맞춘다.
// - <sup>…</sup>은 태그와 안의 각주 숫자까지 제거
// - <br>은 속성을 그대로 둔 채 표준 표기(<br class="..."/>)로 통일
// - <strong>, <b>, <em> 등 서식 태그는 태그만 지우고 글자는 남김
const normalizeDeckCopy = (copy: string | null | undefined): string =>
  cleanCopy(
    (copy ?? "")
      .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
      .replace(/<br\b([^>]*?)\s*\/?>/gi, (_match, attrText: string) => {
        const attrs: [string, string][] = [];
        const attrRegex = /([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g;
        let m: RegExpExecArray | null;
        while ((m = attrRegex.exec(attrText))) attrs.push([m[1] as string, m[3] as string]);
        return formatBrTag(attrs);
      })
      .replace(/<\/?(?:strong|b|em|i|u|sub|small|span)\b[^>]*>/gi, "")
  );

const escapeRegExp = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// html의 <sup> 자리에 카피덱이 각주 숫자를 일반 글자로 적은 경우(예: "battery.1", "battery.1,2")까지
// 같은 카피로 본다. <sup> 자리에서만 숫자(와 , - – ~)를 허용한다.
const matchesIgnoringSupNumbers = (deckCopy: string, htmlTextWithSupMarks: string): boolean => {
  if (!htmlTextWithSupMarks.includes(SUP_MARK)) return false;
  const pattern = cleanCopy(htmlTextWithSupMarks)
    .split(SUP_MARK)
    .map((segment) => escapeRegExp(cleanCopy(segment)))
    .join("\\s*[\\d,\\-–~]*\\s*");
  return new RegExp(`^${pattern}$`).test(deckCopy);
};

// 카피 안에서 서식·줄바꿈·각주용으로 쓰이는 인라인 태그.
// data-copy-set 태그(또는 카피 한 덩어리) 안에 있으면 부모 카피의 일부일 뿐 별도 카피가 아니다.
const INLINE_COPY_TAGS = new Set(["br", "sup", "sub", "b", "i", "em", "strong", "u"]);

const detectCopyType = (el: Element): { type: DetectedCopyType; text: string } => {
  const value = el.getAttribute("data-copy-set") || "";
  if (value === "disclaimer") {
    return { type: "disclaimer", text: cleanCopy(extractTextRespectingBr(el)) }; // SUP_MARK 포함
  }
  if (el.hasAttribute("alt")) {
    return { type: "alt", text: normalize(el.getAttribute("alt")) };
  }
  if (el.hasAttribute("aria-label")) {
    return { type: "aria-label", text: normalize(el.getAttribute("aria-label")) };
  }
  if (el.hasAttribute("title") && !normalize(el.textContent)) {
    return { type: "title", text: normalize(el.getAttribute("title")) };
  }
  if (normalize(el.textContent)) {
    return { type: "innerText", text: cleanCopy(extractTextRespectingBr(el)) }; // SUP_MARK 포함
  }
  return { type: "unknown", text: "" };
};

// 카피덱 apply_type이 실제 태그 구조상 유효한지 확인.
// (ex. apply_type=alt 인데 <video> 태그라 alt 미지원 → aria-label 로 지정되어야 함)
const validateApplyTypeForTag = (
  applyType: string,
  tagName: string
): { valid: boolean; suggested?: string } => {
  const type = (applyType || "").toLowerCase();

  if (type === "alt") {
    if (ALT_CAPABLE_TAGS.includes(tagName)) return { valid: true };
    return { valid: false, suggested: "aria-label" };
  }
  if (type === "aria-label") {
    return { valid: true };
  }
  if (type === "text_disclaimer" || type === "disclaimer") {
    return { valid: true };
  }
  if (type === "title") {
    return { valid: true };
  }
  // innerText 등 텍스트형: img/area/input/video 등 텍스트를 담을 수 없는 태그면 이상 케이스
  if (VOID_LIKE_TAGS.includes(tagName)) {
    return {
      valid: false,
      suggested: ALT_CAPABLE_TAGS.includes(tagName) ? "alt" : "aria-label",
    };
  }
  return { valid: true };
};

// ────────────────────────────────────────────────────────────────────────────
// 메인 분석 함수
// ────────────────────────────────────────────────────────────────────────────

export const analyzePreCoder = (
  htmlText: string,
  copyDeckRows: CopyDeckRow[],
  scope: PreCoderAnalysisScope = "all"
): PreCoderAnalysisResult => {
  const offsets = buildLineOffsets(htmlText);

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const domEls = Array.from(doc.querySelectorAll("[data-copy-set]"));

  // ── 모드(scope) 필터: "html 정제" 탭의 ①features+disclaimer / ②FAQ 구분과 동일한 기준으로
  // .watch-faq_item 안/밖을 구분한다. line 번호 정합성을 위해 domEls/nodes 자체는 전체를
  // 그대로 계산하고, 이슈를 만들 때만 scope에 맞춰 걸러낸다.
  const isFaqElement = (el: Element): boolean => !!el.closest(".watch-faq_item");
  const elementInScope = (el: Element): boolean => {
    if (scope === "all") return true;
    const inFaq = isFaqElement(el);
    return scope === "faq" ? inFaq : !inFaq;
  };
  const nodeInScopeFlags: boolean[] = domEls.map((el) => elementInScope(el));

  // 카피덱 행이 scope에 속하는지: target_selector로 실제 html 엘리먼트를 찾아 판단한다.
  // html에서 아예 못 찾은 행("카피덱-html 불일치")은 어느 scope에서든 항상 노출한다.
  const deckRowInScope = (row: CopyDeckRow): boolean => {
    if (scope === "all") return true;
    const parsed = parseTargetSelector(row.target_selector);
    if (!parsed) return true;
    let matched: Element[] = [];
    try {
      matched = Array.from(
        doc.querySelectorAll(`[${parsed.attr}="${parsed.value.replace(/"/g, '\\"')}"]`)
      );
    } catch {
      return true;
    }
    if (matched.length === 0) return true;
    return matched.some((el) => elementInScope(el));
  };
  const scopedCopyDeckRows = scope === "all" ? copyDeckRows : copyDeckRows.filter(deckRowInScope);

  // 소스 원문에서 data-copy-set 등장 위치를 순서대로 수집해 line number를 붙인다.
  // (DOM 순회 순서 == 원문 등장 순서라고 가정하고 index로 매칭)
  const attrRegex = /data-copy-set\s*=\s*["']([^"']*)["']/g;
  const positions: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(htmlText))) {
    positions.push(m.index);
  }
  const canAlignByIndex = positions.length === domEls.length;

  const nodes: HtmlCopySetNode[] = domEls.map((el, i) => {
    const value = el.getAttribute("data-copy-set") || "";
    const { type, text } = detectCopyType(el);
    const line = canAlignByIndex ? lineNumberFromOffset(offsets, positions[i]) : -1;
    const outerHtmlPreview = (el.outerHTML || "").slice(0, 160);
    return {
      domIndex: i,
      value,
      tagName: el.tagName.toLowerCase(),
      detectedType: type,
      extractedText: stripSupMarks(text),
      textWithSupMarks: text,
      line,
      outerHtmlPreview,
    };
  });

  // value -> node[] 맵 (빈 값 제외). scope와 무관하게 항상 전체로 유지한다
  // ("카피덱-html 불일치" 판단 등 다른 검사에서 전체 값 존재 여부가 필요하기 때문).
  const valueMap = new Map<string, HtmlCopySetNode[]>();
  nodes.forEach((n) => {
    if (!n.value) return;
    if (!valueMap.has(n.value)) valueMap.set(n.value, []);
    valueMap.get(n.value)!.push(n);
  });

  // scope에 속하는 값들만 모은 집합 (duplicateIssues 등 이슈 필터링용)
  const scopedValueSet = new Set<string>();
  domEls.forEach((el, i) => {
    const v = el.getAttribute("data-copy-set");
    if (v && nodeInScopeFlags[i]) scopedValueSet.add(v);
  });

  // ── ① 고유성 검사 (동일 data-copy-set이 서로 다른 카피를 가리키는 경우만 위반)
  // 내용이 동일한 중복은 어차피 같은 값으로 치환되므로 fail로 잡지 않는다.
  const duplicateIssues: DuplicateIssue[] = [];
  valueMap.forEach((group, value) => {
    if (value === "disclaimer") return; // disclaimer는 예약값 (여러 곳에서 재사용되는 정책)
    if (scope !== "all" && !scopedValueSet.has(value)) return;
    if (group.length <= 1) return;

    const texts = group.map((g) => g.extractedText);
    const contentsMatch = texts.every((t) => t === texts[0]);
    if (contentsMatch) return; // 동일 내용 중복은 문제 없음

    duplicateIssues.push({
      value,
      count: group.length,
      lines: group.map((g) => g.line),
      contentsMatch,
      message: `data-copy-set="${value}"가 서로 다른 카피를 가리키며 ${group.length}개 태그에 중복 사용되었습니다.`,
    });
  });

  const unassigned = nodes.filter((n, i) => !n.value && nodeInScopeFlags[i]);
  const unassignedIssues: UnassignedTagIssue[] = unassigned.map((n) => ({
    tagName: n.tagName,
    line: n.line,
    snippet: n.outerHtmlPreview,
  }));

  // ── ② 태그 스코프 검사 (부모/자식 태그에 중첩된 data-copy-set이 있는지 + 카피덱 값이 html에 존재하는지)
  const scopeIssues: ScopeIssue[] = [];
  domEls.forEach((el) => {
    if (!elementInScope(el)) return;
    const value = el.getAttribute("data-copy-set");
    if (!value || value === "disclaimer") return;

    const nestedChildren = Array.from(el.querySelectorAll("[data-copy-set]")).filter(
      (c) => c.getAttribute("data-copy-set")
    );
    if (nestedChildren.length > 0) {
      const childValues = nestedChildren
        .map((c) => c.getAttribute("data-copy-set"))
        .join(", ");
      const node = nodes.find((n) => n.value === value);
      scopeIssues.push({
        value,
        type: "nested-child",
        line: node?.line,
        message: `data-copy-set="${value}" 태그 내부에 또 다른 data-copy-set(${childValues})을 가진 자식 태그가 있습니다. 카피를 감싸는 정확한 태그에만 지정되어야 합니다.`,
      });
    }

    // 부모에는 data-copy-set이 있지만, 그 내부에 자기 자신만의 카피(별도 data-copy-set)가
    // 필요해 보이는 자식 태그가 부모 값에 묻혀있는 케이스.
    // 대상: alt/aria-label 속성을 가진 태그, 또는 h1~h6/p/li/a/button 등 자기 텍스트를 직접
    // 담는 태그. (title만 있는 태그는 별도 지정이 어려운 경우가 많아 제외)
    const attrCandidates = Array.from(el.querySelectorAll("[alt], [aria-label]"));
    const textCandidates = Array.from(el.querySelectorAll(TEXT_CONTAINER_TAGS.join(","))).filter(
      (c) => normalize(c.textContent).length > 0
    );
    const rawCandidates = Array.from(new Set([...attrCandidates, ...textCandidates])).filter(
      (c) => !c.hasAttribute("data-copy-set")
    );
    const rawSet = new Set(rawCandidates);
    // 후보끼리 중첩된 경우(ex. <li><a>text</a></li>) 가장 바깥쪽 태그만 남긴다.
    const topLevelCandidates = rawCandidates.filter((c) => {
      let p = c.parentElement;
      while (p && p !== el) {
        if (rawSet.has(p)) return false;
        p = p.parentElement;
      }
      return true;
    });

    if (topLevelCandidates.length > 0) {
      const node = nodes.find((n) => n.value === value);
      const childTags = Array.from(
        new Set(topLevelCandidates.map((c) => c.tagName.toLowerCase()))
      ).join(", ");
      scopeIssues.push({
        value,
        type: "child-missing-copyset",
        line: node?.line,
        message: `data-copy-set="${value}" 태그 내부에 별도 카피로 보이는 자식 태그(${childTags})가 있지만 자기 자신의 data-copy-set이 지정되어 있지 않습니다. 부모 카피에 묻혀 번역 대상에서 누락될 수 있습니다.`,
      });
    }
  });

  copyDeckRows.forEach((row) => {
    // "카피덱-html 불일치"는 scope와 무관하게 모두 노출한다 (deckRowInScope도 이 경우 항상 true).
    const parsed = parseTargetSelector(row.target_selector);
    if (!parsed || parsed.attr !== "data-copy-set") return;
    if (valueMap.has(parsed.value)) return;
    scopeIssues.push({
      value: parsed.value,
      type: "deck-not-in-html",
      deckRowOrder: row.row_order,
      message: `카피덱에 있는 data-copy-set="${parsed.value}"가 HTML에 존재하지 않습니다.`,
    });
  });

  // ── ③ 카피 종류 자동 분류 검사
  const deckByValue = new Map<string, CopyDeckRow>();
  scopedCopyDeckRows.forEach((row) => {
    const parsed = parseTargetSelector(row.target_selector);
    if (parsed) deckByValue.set(parsed.value, row);
  });

  // ── ①-2 카피덱 고유값 위반: 같은 target_selector가 카피덱 여러 행에 쓰인 경우
  // (위 deckByValue처럼 뒤 행이 앞 행을 조용히 덮어써서, 앞 행의 카피는 검사·적용에서 빠진다)
  const deckRowsBySelector = new Map<string, CopyDeckRow[]>();
  scopedCopyDeckRows.forEach((row) => {
    const parsed = parseTargetSelector(row.target_selector);
    if (!parsed || parsed.value === "disclaimer") return; // disclaimer는 재사용 정책 예약값
    const selector = `${parsed.attr}="${parsed.value}"`;
    const group = deckRowsBySelector.get(selector) ?? [];
    group.push(row);
    deckRowsBySelector.set(selector, group);
  });
  const deckDuplicateIssues: DeckDuplicateIssue[] = [];
  deckRowsBySelector.forEach((group, selector) => {
    if (group.length <= 1) return;
    const copies = group.map((r) => normalizeDeckCopy(r.original_copy));
    const copiesDiffer = copies.some((c) => c !== copies[0]);
    deckDuplicateIssues.push({
      targetSelector: selector,
      count: group.length,
      rowOrders: group.map((r) => r.row_order ?? null),
      copies,
      copiesDiffer,
      message: copiesDiffer
        ? `${selector}가 카피덱 ${group.length}개 행에 서로 다른 카피로 중복 지정되었습니다. 마지막 행만 적용되고 나머지 카피는 빠집니다.`
        : `${selector}가 카피덱 ${group.length}개 행에 같은 카피로 중복 지정되었습니다. 중복 행을 정리해주세요.`,
    });
  });

  const typeMismatchIssues: TypeMismatchIssue[] = [];
  nodes.forEach((n, i) => {
    if (!nodeInScopeFlags[i]) return;
    if (!n.value || n.value === "disclaimer") return;
    const deckRow = deckByValue.get(n.value);
    const declaredType = deckRow?.apply_type || n.detectedType;

    const validity = validateApplyTypeForTag(declaredType, n.tagName);
    if (!validity.valid) {
      // 권장 종류는 임의로 추측하지 않고, HTML에서 실제로 감지된 종류를 그대로 사용한다.
      const suggested = n.detectedType !== "unknown" ? n.detectedType : validity.suggested;
      typeMismatchIssues.push({
        value: n.value,
        tagName: n.tagName,
        declaredType,
        detectedType: n.detectedType,
        suggestedType: suggested,
        line: n.line,
        message: `<${n.tagName}> 태그는 "${declaredType}" 속성을 지원하지 않습니다. HTML에서 실제 감지된 "${suggested}" 종류로 지정되어야 합니다.`,
      });
      return;
    }

    // 카피덱에 apply_type이 있는데, 실제 HTML에서 감지된 종류와 다른 경우
    if (
      deckRow &&
      n.detectedType !== "unknown" &&
      deckRow.apply_type &&
      deckRow.apply_type.toLowerCase() !== n.detectedType.toLowerCase() &&
      !(deckRow.apply_type.toLowerCase() === "text_disclaimer" && n.detectedType === "disclaimer")
    ) {
      typeMismatchIssues.push({
        value: n.value,
        tagName: n.tagName,
        declaredType: deckRow.apply_type,
        detectedType: n.detectedType,
        suggestedType: n.detectedType,
        line: n.line,
        message: `카피덱에는 apply_type="${deckRow.apply_type}"로 지정되어 있지만, HTML에서는 "${n.detectedType}" 형태로 감지되었습니다.`,
      });
    }
  });

  // ── ④ 영문 카피덱 순서 vs HTML 노출 순서 비교
  const deckSequence = scopedCopyDeckRows
    .map((row) => {
      const parsed = parseTargetSelector(row.target_selector);
      const value = parsed?.value;
      const node = value ? valueMap.get(value)?.[0] : undefined;
      return {
        value: value || "",
        deckRowOrder: row.row_order,
        original_copy: row.original_copy,
        line: node?.line ?? -1,
        domIndex: node?.domIndex ?? -1,
      };
    })
    .filter((x) => x.value && x.domIndex !== -1);

  const orderIssues: OrderIssue[] = [];
  // 같은 data-copy-set이 카피덱에 반복 등장하는 경우(동일 카피 재사용), 매번 첫 등장 위치와
  // 비교하면 오탐이 나므로, 이미 검수된 값이 다시 나오면 순서 비교 대상에서 제외하고
  // "앞에서 언급됨"으로만 표시한다. 순서 비교 기준점(lastGenuine*)도 갱신하지 않는다.
  const seenValues = new Set<string>();
  let lastGenuineDomIndex = -1;
  let lastGenuineValue = "";
  let lastGenuineLine = -1;
  let lastGenuineParsed: ParsedCopySetId | null = null;

  const orderSequence: OrderSequenceItem[] = deckSequence.map((item) => {
    if (seenValues.has(item.value)) {
      return {
        value: item.value,
        deckRowOrder: item.deckRowOrder,
        line: item.line,
        original_copy: item.original_copy,
        outOfOrder: false,
        alreadyMentioned: true,
      };
    }

    const parsedCurrent = parseCopySetId(item.value);
    let outOfOrder = false;
    let issueType: OrderIssueType | undefined;

    if (lastGenuineDomIndex !== -1) {
      const sameGroup =
        parsedCurrent && lastGenuineParsed && parsedCurrent.groupKey === lastGenuineParsed.groupKey;

      if (parsedCurrent && lastGenuineParsed) {
        // 먼저 data-copy-set 번호 자체의 자연스러운 순서(진수 비교)로 "카피덱 행 순서가
        // 번호 순서와 맞는지"를 검사한다. 이건 HTML과 무관하게 카피덱 자체의 실수를 잡아낸다.
        const idCompare = sameGroup
          ? compareSegments(parsedCurrent.restSegments, lastGenuineParsed.restSegments)
          : (() => {
              const prefixCompare = parsedCurrent.prefix.localeCompare(lastGenuineParsed!.prefix);
              return prefixCompare !== 0
                ? prefixCompare
                : parsedCurrent.groupNumber - lastGenuineParsed!.groupNumber;
            })();

        if (idCompare < 0) {
          // 카피덱 자체 순서 오류: 번호상 앞서야 할 항목이 카피덱에 더 뒤에 나열되어 있음
          outOfOrder = true;
          issueType = "deckIdOrder";
          orderIssues.push({
            value: item.value,
            deckRowOrder: item.deckRowOrder,
            line: item.line,
            prevValue: lastGenuineValue,
            prevLine: lastGenuineLine,
            issueType: "deckIdOrder",
            message: `카피덱 행 순서 오류: data-copy-set 번호 기준으로 "${item.value}"가 "${lastGenuineValue}"보다 앞에 와야 하는데, 카피덱에는 더 뒤에 나열되어 있습니다.`,
          });
        } else if (sameGroup && item.domIndex < lastGenuineDomIndex) {
          // 카피덱 번호 순서 자체는 맞지만(같은 그룹 내), 실제 HTML 물리적 위치가 그 순서와 다름
          outOfOrder = true;
          issueType = "htmlPosition";
          orderIssues.push({
            value: item.value,
            deckRowOrder: item.deckRowOrder,
            line: item.line,
            prevValue: lastGenuineValue,
            prevLine: lastGenuineLine,
            issueType: "htmlPosition",
            message: `HTML 노출 순서 불일치: 카피덱 순서상 "${item.value}"가 "${lastGenuineValue}" 다음에 와야 하지만, HTML에서는 ${item.line}번째 줄로 더 앞(${lastGenuineLine}번째 줄보다 앞)에 위치해 있습니다.`,
          });
        }
        // 그룹이 바뀌면서 번호가 정상적으로 증가한 경우는 물리적 줄 번호가 뒤섞여 있어도 정상으로 간주한다
        // (서로 다른 섹션이라 HTML 소스상 위치가 번호 순서와 무관할 수 있음).
      } else {
        // 형식이 맞지 않는 값 등 파싱이 안 되는 경우는 기존처럼 줄 번호 비교로 폴백한다.
        if (item.domIndex < lastGenuineDomIndex) {
          outOfOrder = true;
          issueType = "htmlPosition";
          orderIssues.push({
            value: item.value,
            deckRowOrder: item.deckRowOrder,
            line: item.line,
            prevValue: lastGenuineValue,
            prevLine: lastGenuineLine,
            issueType: "htmlPosition",
            message: `카피덱 순서상 "${item.value}"가 "${lastGenuineValue}" 다음에 와야 하지만, HTML에서는 ${item.line}번째 줄로 더 앞(${lastGenuineLine}번째 줄보다 앞)에 위치해 순서가 뒤바뀌었습니다.`,
          });
        }
      }
    }

    seenValues.add(item.value);
    lastGenuineDomIndex = item.domIndex;
    lastGenuineValue = item.value;
    lastGenuineLine = item.line;
    lastGenuineParsed = parsedCurrent;

    return {
      value: item.value,
      deckRowOrder: item.deckRowOrder,
      line: item.line,
      original_copy: item.original_copy,
      outOfOrder,
      issueType,
      alreadyMentioned: false,
    };
  });

  // ── ⑤ 카피덱에 없지만 번역이 필요해 보이는 카피가 HTML에 존재하는지
  // (alt / aria-label / disclaimer / title / innerText 모두 대상)
  const deckValueSet = new Set(Array.from(deckByValue.keys()));

  // 카피덱 원문 내용 인덱스 (값이 아니라 "내용"으로 존재 여부를 판단하기 위함)
  const deckContentSet = new Set<string>();
  scopedCopyDeckRows.forEach((row) => {
    const c = normalizeDeckCopy(row.original_copy);
    if (c) deckContentSet.add(c);
  });

  // html에서 이미 정상적으로 data-copy-set이 지정된 노드들의 원문 내용 인덱스
  // ("다른 위치에는 이미 태깅되어 있는지" 판단용, 같은 scope 범위 기준)
  const taggedContentSet = new Set<string>();
  nodes.forEach((n, i) => {
    if (!n.value || !nodeInScopeFlags[i]) return;
    const c = normalize(n.extractedText);
    if (c) taggedContentSet.add(c);
  });

  const UNTAGGED_SKIP_TAGS = new Set([
    "script",
    "style",
    "noscript",
    "svg",
    "path",
    "template",
    "head",
    "meta",
    "link",
    "br",
    "iframe",
  ]);

  let searchCursor = 0;

  type RawUntaggedItem = {
    tagName: string;
    attrText: string;
    value: string | null;
    line: number;
    reason: string;
    copyKind: UntaggedCopyKind;
    contentFoundInDeck: boolean;
    contentFoundTaggedElsewhereInHtml: boolean;
  };
  const rawItems: RawUntaggedItem[] = [];

  const pushUntaggedCandidate = (
    el: Element,
    copyKind: UntaggedCopyKind,
    rawText: string
  ) => {
    if (!elementInScope(el)) return;
    const text = normalize(rawText);
    if (!text) return;

    const value = el.getAttribute("data-copy-set");
    const hasCopySetAttr = el.hasAttribute("data-copy-set");

    let reason: string | null = null;
    let contentFoundInDeck = false;
    let contentFoundTaggedElsewhereInHtml = false;

    if (!hasCopySetAttr || !value) {
      // 미지정(속성 자체가 없음) / 빈 값 케이스: 카피덱-내용 / html-다른 위치 태깅 여부를
      // 함께 확인해서, "정말 아예 없는 카피"인지 "이 위치만 누락된 카피"인지 구분한다.
      contentFoundInDeck = deckContentSet.has(text);
      contentFoundTaggedElsewhereInHtml = taggedContentSet.has(text);

      const deckPart = contentFoundInDeck
        ? "카피덱에는 동일한 카피가 있고"
        : "카피덱에도 동일한 카피가 없고";
      const htmlPart = contentFoundTaggedElsewhereInHtml
        ? "html의 다른 위치에는 이미 data-copy-set이 지정되어 있습니다. 이 위치에도 같은 data-copy-set을 지정해야 합니다."
        : "html의 다른 위치에도 태깅된 동일 카피가 없습니다. 신규 카피로 추가하고 data-copy-set을 지정해야 합니다.";

      reason = !hasCopySetAttr
        ? `data-copy-set이 지정되지 않았습니다. ${deckPart}, ${htmlPart}`
        : `data-copy-set이 빈 값으로 지정되어 있습니다. ${deckPart}, ${htmlPart}`;
    } else if (value !== "disclaimer" && !deckValueSet.has(value)) {
      reason = `data-copy-set="${value}"가 지정되어 있지만 카피덱에는 해당 값이 없습니다.`;
    }
    if (!reason) return;

    const openTagMatch = (el.outerHTML || "").match(/^<[^>]*>/);
    const needle = openTagMatch ? openTagMatch[0] : "";
    let line = -1;
    if (needle) {
      const idx = htmlText.indexOf(needle, searchCursor);
      if (idx !== -1) {
        line = lineNumberFromOffset(offsets, idx);
        searchCursor = idx + needle.length;
      }
    }

    rawItems.push({
      tagName: el.tagName.toLowerCase(),
      attrText: text,
      value: value ?? null,
      line,
      reason,
      copyKind,
      contentFoundInDeck,
      contentFoundTaggedElsewhereInHtml,
    });
  };

  Array.from(doc.querySelectorAll("*")).forEach((el) => {
    if (UNTAGGED_SKIP_TAGS.has(el.tagName.toLowerCase())) return;

    // 우선순위: disclaimer > alt > aria-label > innerText (한 요소당 한 종류만 매칭)
    if (el.classList.contains("text_disclaimer")) {
      pushUntaggedCandidate(el, "disclaimer", stripSupMarks(extractTextRespectingBr(el)));
      return;
    }
    const alt = el.getAttribute("alt");
    if (alt !== null && normalize(alt)) {
      pushUntaggedCandidate(el, "alt", alt);
      return;
    }
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel !== null && normalize(ariaLabel)) {
      pushUntaggedCandidate(el, "aria-label", ariaLabel);
      return;
    }
    // title 속성은 번역 검수 대상이 아니라서 "카피덱 누락 카피"에서 제외한다.
    if (isTextLeaf(el)) {
      // <strong>/<br>/<sup> 등이 data-copy-set 태그(또는 다른 카피 덩어리) 안에 있으면
      // 부모 카피의 일부일 뿐이므로 따로 "카피덱 누락 카피"로 잡지 않는다.
      const parent = el.parentElement;
      const isPartOfParentCopy =
        INLINE_COPY_TAGS.has(el.tagName.toLowerCase()) &&
        !!parent &&
        (!!parent.closest("[data-copy-set]") || isTextLeaf(parent));
      if (isPartOfParentCopy) return;
      pushUntaggedCandidate(el, "innerText", stripSupMarks(extractTextRespectingBr(el)));
    }
  });

  // 동일한 카피 종류 + 내용은 하나로 합치고, 줄 번호만 배열로 모은다.
  const untaggedGroups = new Map<string, RawUntaggedItem[]>();
  rawItems.forEach((item) => {
    const key = `${item.copyKind}::${normalize(item.attrText)}`;
    if (!untaggedGroups.has(key)) untaggedGroups.set(key, []);
    untaggedGroups.get(key)!.push(item);
  });

  const untaggedCopyIssues: UntaggedCopyIssue[] = Array.from(untaggedGroups.values()).map(
    (group) => {
      const lines = Array.from(new Set(group.map((g) => g.line))).sort((a, b) => a - b);
      const tagNames = Array.from(new Set(group.map((g) => g.tagName)));
      const values = Array.from(new Set(group.map((g) => g.value)));
      return {
        attrText: group[0].attrText,
        tagNames,
        values,
        lines,
        message: group[0].reason,
        copyKind: group[0].copyKind,
        contentFoundInDeck: group[0].contentFoundInDeck,
        contentFoundTaggedElsewhereInHtml: group[0].contentFoundTaggedElsewhereInHtml,
      };
    }
  );

  // ── ⑦ 카피덱 <-> HTML 문자열 일치 검사 (글자 단위로 최초 불일치 지점을 찾는다)
  const contentMismatchIssues: ContentMismatchIssue[] = [];
  nodes.forEach((n, i) => {
    if (!nodeInScopeFlags[i]) return;
    if (!n.value || n.value === "disclaimer") return;
    const deckRow = deckByValue.get(n.value);
    if (!deckRow || deckRow.original_copy === undefined) return;

    // 양쪽 모두 <sup>(각주)과 그 안의 숫자는 빼고, <strong>/<br> 등은 같은 기준으로 맞춰서 비교한다.
    const deckCopy = normalizeDeckCopy(deckRow.original_copy);
    const htmlCopy = n.extractedText;
    if (!deckCopy || !htmlCopy) return;
    if (deckCopy === htmlCopy) return;
    if (n.textWithSupMarks && matchesIgnoringSupNumbers(deckCopy, n.textWithSupMarks)) return;

    const diffIndex = findFirstDiffIndex(deckCopy, htmlCopy);
    contentMismatchIssues.push({
      value: n.value,
      tagName: n.tagName,
      line: n.line,
      deckCopy,
      htmlCopy,
      diffIndex,
      message: `data-copy-set="${n.value}": 카피덱과 HTML 카피가 ${diffIndex + 1}번째 글자부터 다릅니다. (카피덱: "${excerptAround(deckCopy, diffIndex)}" / HTML: "${excerptAround(htmlCopy, diffIndex)}")`,
    });
  });

  // ── ⑧ exclude_sup / enable_text_transform 일치 검사
  // 카피덱에 exclude_sup=O로 지정돼 있으면 HTML에도 실제 각주(sup) 링크가 있어야 하고,
  // 반대로 카피덱에 표시가 없는데 HTML에 각주가 있으면 recoder 적용 시 그 각주가 유실된다.
  const supFlagMismatchIssues: SupFlagMismatchIssue[] = [];
  nodes.forEach((n, i) => {
    if (!nodeInScopeFlags[i]) return;
    if (!n.value || n.value === "disclaimer") return;
    const deckRow = deckByValue.get(n.value);
    if (!deckRow) return;

    const el = domEls[n.domIndex];
    const hasSupInHtml = hasClickSupAnywhere(el);
    const declaredExcludeSup = !!deckRow.exclude_sup;

    if (declaredExcludeSup !== hasSupInHtml) {
      supFlagMismatchIssues.push({
        value: n.value,
        tagName: n.tagName,
        line: n.line,
        declaredExcludeSup,
        hasSupInHtml,
        flag: "exclude_sup",
        declared: declaredExcludeSup,
        message: declaredExcludeSup
          ? `data-copy-set="${n.value}": 카피덱에는 exclude_sup=O로 지정되어 있지만, HTML에는 각주(sup) 태그가 없습니다.`
          : `data-copy-set="${n.value}": HTML에 각주(sup) 태그가 있지만, 카피덱에는 exclude_sup이 지정되어 있지 않습니다. recoder 적용 시 각주가 유실될 수 있습니다.`,
      });
    }

    // enable_text_transform: innerText 카피는 각주(sup)가 있을 때 exclude_sup과 함께 O여야 한다.
    // ("html 정제"의 카피덱 생성 규칙 및 recoder 변환 규칙과 동일)
    if (normalize(deckRow.apply_type).toLowerCase() !== "innertext") return;
    const declaredTextTransform = !!deckRow.enable_text_transform;
    if (declaredTextTransform === hasSupInHtml) return;
    supFlagMismatchIssues.push({
      value: n.value,
      tagName: n.tagName,
      line: n.line,
      declaredExcludeSup,
      hasSupInHtml,
      flag: "enable_text_transform",
      declared: declaredTextTransform,
      message: declaredTextTransform
        ? `data-copy-set="${n.value}": 카피덱에는 enable_text_transform=O로 지정되어 있지만, HTML에는 각주(sup) 태그가 없습니다.`
        : `data-copy-set="${n.value}": HTML에 각주(sup) 태그가 있지만, 카피덱에는 enable_text_transform이 지정되어 있지 않습니다. recoder 적용 시 각주 위치가 어긋날 수 있습니다.`,
    });
  });

  // ── ⑨ FAQ item 종류(Questions / Answer) 일치 검사
  // html 구조상 .watch-faq_text는 질문, .watch-faq_desc/.watch-faq_answer-item은 답변이다.
  // 카피덱의 item 값이 이 구조와 다르면(질문을 Answer로 적는 등) 잡아낸다.
  const faqItemMismatchIssues: FaqItemMismatchIssue[] = [];
  nodes.forEach((n, i) => {
    if (!nodeInScopeFlags[i]) return;
    if (!n.value || n.value === "disclaimer") return;
    const deckRow = deckByValue.get(n.value);
    if (!deckRow) return;

    const deckItem = normalize(deckRow.item);
    if (!deckItem) return; // 카피덱에 item 컬럼 자체가 없으면 검사 대상 아님

    const el = domEls[n.domIndex];
    if (!el.closest(".watch-faq_item")) return; // FAQ 영역 밖은 대상 아님

    let detectedItem = "";
    if (el.closest(".watch-faq_question") || el.classList.contains("watch-faq_text")) {
      detectedItem = "Questions";
    } else if (
      el.closest(".watch-faq_answer") ||
      el.classList.contains("watch-faq_desc") ||
      el.classList.contains("watch-faq_answer-item")
    ) {
      detectedItem = "Answer";
    }
    if (!detectedItem) return; // 구조상 판별 불가하면 건너뜀

    // "Questions" / "Question" / "questions" 같은 표기 차이는 허용
    const looseDeck = deckItem.toLowerCase().replace(/[\s_-]/g, "").replace(/s$/, "");
    const looseDetected = detectedItem.toLowerCase().replace(/[\s_-]/g, "").replace(/s$/, "");
    if (looseDeck === looseDetected) return;

    faqItemMismatchIssues.push({
      value: n.value,
      line: n.line,
      deckItem,
      detectedItem,
      copyPreview: n.extractedText.slice(0, 60),
      message: `data-copy-set="${n.value}": 카피덱에는 item이 "${deckItem}"로 되어 있지만, HTML 구조상 "${detectedItem}" 영역입니다.`,
    });
  });

  return {
    totalHtmlCopySetCount: nodes.filter((n, i) => n.value && nodeInScopeFlags[i]).length,
    totalDeckRowCount: scopedCopyDeckRows.length,
    unassignedCount: unassigned.length,
    unassignedLines: unassigned.map((n) => n.line),
    unassignedIssues,
    duplicateIssues,
    scopeIssues,
    typeMismatchIssues,
    orderIssues,
    orderSequence,
    untaggedCopyIssues,
    contentMismatchIssues,
    supFlagMismatchIssues,
    faqItemMismatchIssues,
    deckDuplicateIssues,
  };
};

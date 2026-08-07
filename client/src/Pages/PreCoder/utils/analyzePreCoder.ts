// Pre Coder: wwpd 작업 전 recoder에 넣기 위한 파일(html) 최적화 검사 로직.
// 사업부 제공 .html 파일 + 영문 카피덱(xlsx → row_list)을 대조하여
// data-copy-set 고유성 / 태그 스코프 / 카피 종류 자동분류 / 순서 / 누락카피 를 검사한다.

export type CopyDeckRow = {
  row_order?: number;
  target_selector: string; // 예: data-copy-set="F02-004"
  apply_type: string; // alt | aria-label | innerText | text_disclaimer 등
  exclude_sup?: boolean;
  enable_text_transform?: boolean;
  original_copy?: string;
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
  extractedText: string;
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

export type UntaggedCopyIssue = {
  attrText: string;
  tagNames: string[];
  values: (string | null)[];
  lines: number[];
  message: string;
};

export type UnassignedTagIssue = {
  tagName: string;
  line: number;
  snippet: string; // data-copy-set="" 이 포함된 태그 코드 조각
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
};

// ────────────────────────────────────────────────────────────────────────────
// 공통 유틸
// ────────────────────────────────────────────────────────────────────────────

const normalize = (value: string | null | undefined): string => {
  return (value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
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

const detectCopyType = (el: Element): { type: DetectedCopyType; text: string } => {
  const value = el.getAttribute("data-copy-set") || "";
  if (value === "disclaimer") {
    return { type: "disclaimer", text: normalize(el.textContent) };
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
    return { type: "innerText", text: normalize(el.textContent) };
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
  copyDeckRows: CopyDeckRow[]
): PreCoderAnalysisResult => {
  const offsets = buildLineOffsets(htmlText);

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const domEls = Array.from(doc.querySelectorAll("[data-copy-set]"));

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
      extractedText: text,
      line,
      outerHtmlPreview,
    };
  });

  // value -> node[] 맵 (빈 값 제외)
  const valueMap = new Map<string, HtmlCopySetNode[]>();
  nodes.forEach((n) => {
    if (!n.value) return;
    if (!valueMap.has(n.value)) valueMap.set(n.value, []);
    valueMap.get(n.value)!.push(n);
  });

  // ── ① 고유성 검사 (동일 data-copy-set이 서로 다른 카피를 가리키는 경우만 위반)
  // 내용이 동일한 중복은 어차피 같은 값으로 치환되므로 fail로 잡지 않는다.
  const duplicateIssues: DuplicateIssue[] = [];
  valueMap.forEach((group, value) => {
    if (value === "disclaimer") return; // disclaimer는 예약값 (여러 곳에서 재사용되는 정책)
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

  const unassigned = nodes.filter((n) => !n.value);
  const unassignedIssues: UnassignedTagIssue[] = unassigned.map((n) => ({
    tagName: n.tagName,
    line: n.line,
    snippet: n.outerHtmlPreview,
  }));

  // ── ② 태그 스코프 검사 (부모/자식 태그에 중첩된 data-copy-set이 있는지 + 카피덱 값이 html에 존재하는지)
  const scopeIssues: ScopeIssue[] = [];
  domEls.forEach((el) => {
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
  copyDeckRows.forEach((row) => {
    const parsed = parseTargetSelector(row.target_selector);
    if (parsed) deckByValue.set(parsed.value, row);
  });

  const typeMismatchIssues: TypeMismatchIssue[] = [];
  nodes.forEach((n) => {
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
  const deckSequence = copyDeckRows
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
  const deckValueSet = new Set(Array.from(deckByValue.keys()));
  const candidates = Array.from(doc.querySelectorAll("[title], [alt], [aria-label]"));
  let searchCursor = 0;

  type RawUntaggedItem = {
    tagName: string;
    attrText: string;
    value: string | null;
    line: number;
    reason: string;
  };
  const rawItems: RawUntaggedItem[] = [];

  candidates.forEach((el) => {
    const attrTexts = ["title", "alt", "aria-label"]
      .map((a) => el.getAttribute(a))
      .filter((v) => v && v.trim());
    if (attrTexts.length === 0) return;

    const value = el.getAttribute("data-copy-set");
    const hasCopySetAttr = el.hasAttribute("data-copy-set");

    let reason: string | null = null;
    if (!hasCopySetAttr) {
      reason = `data-copy-set이 지정되지 않은 번역 대상 카피가 있습니다.`;
    } else if (!value) {
      reason = `data-copy-set이 빈 값으로 지정된 번역 대상 카피가 있습니다.`;
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
      attrText: attrTexts.join(" / "),
      value: value ?? null,
      line,
      reason,
    });
  });

  // 동일한 카피(속성값) 내용은 하나로 합치고, 줄 번호만 배열로 모은다.
  const untaggedGroups = new Map<string, RawUntaggedItem[]>();
  rawItems.forEach((item) => {
    const key = normalize(item.attrText);
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
      };
    }
  );

  return {
    totalHtmlCopySetCount: nodes.filter((n) => n.value).length,
    totalDeckRowCount: copyDeckRows.length,
    unassignedCount: unassigned.length,
    unassignedLines: unassigned.map((n) => n.line),
    unassignedIssues,
    duplicateIssues,
    scopeIssues,
    typeMismatchIssues,
    orderIssues,
    orderSequence,
    untaggedCopyIssues,
  };
};

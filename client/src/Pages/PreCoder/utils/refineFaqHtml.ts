// Pre Coder "FAQ 정제" 기능의 핵심 로직.
// - 입력: data-copy-set이 없는 FAQ html + Key/Category/Item/Copy/Remark(+로컬 국가) 형식의 카피덱
// - 출력: ① 새 data-copy-set이 삽입된 html, ② recoder 입력용 엑셀 데이터(row 목록)
//
// 매칭 방식은 "카피덱의 Questions/Answer 순서" ↔ "HTML의 FAQ 아이템 순서"를 그대로 1:1로
// 매칭하는 순번 매칭이다 (텍스트 유사도 매칭보다 훨씬 안정적).

export type FaqCopyDeckRow = {
  key: string;
  category: string;
  item: string; // "Questions" | "Answer"
  copy: string;
  remark: string;
  locales: Record<string, string>; // V 마커 오른쪽 로컬 국가 컬럼 원본 값 (code -> value)
};

export type FaqExportRow = {
  key: string;
  dataCopySet: string; // 값만 (예: "SC1-001")
  targetSelector: string; // recoder apply_type 포맷 (예: data-copy-set="SC1-001")
  applyType: "innerText";
  excludeSup: boolean;
  enableTextTransform: boolean;
  category: string;
  item: string;
  copy: string;
  remark: string;
  locales: Record<string, string>; // 소스 행의 로컬 국가 컬럼 값을 그대로 이어받음
};

export type FaqRefineWarning = {
  type: "count-mismatch" | "item-not-found" | "element-not-found" | "parse-error";
  message: string;
};

export type FaqRefineResult = {
  html: string;
  exportRows: FaqExportRow[];
  warnings: FaqRefineWarning[];
};

const normalize = (v: string | null | undefined): string => (v ?? "").normalize("NFC").trim();

// 병합 셀 때문에 비어있는 Category 값을 앞의 값으로 채운다.
const forwardFillCategory = (rows: FaqCopyDeckRow[]): FaqCopyDeckRow[] => {
  let lastCategory = "";
  return rows.map((row) => {
    if (normalize(row.category)) {
      lastCategory = normalize(row.category);
      return { ...row, category: lastCategory };
    }
    return { ...row, category: lastCategory };
  });
};

type FaqGroup = {
  questionRow: FaqCopyDeckRow;
  answerRows: FaqCopyDeckRow[];
};

const groupDeckRows = (rows: FaqCopyDeckRow[], warnings: FaqRefineWarning[]): FaqGroup[] => {
  const groups: FaqGroup[] = [];
  let current: FaqGroup | null = null;

  rows.forEach((row, i) => {
    const item = normalize(row.item).toLowerCase();
    if (!item && !normalize(row.copy)) return; // 완전 빈 행

    if (item.startsWith("question")) {
      current = { questionRow: row, answerRows: [] };
      groups.push(current);
    } else if (item.startsWith("answer")) {
      if (!current) {
        warnings.push({
          type: "item-not-found",
          message: `${i + 1}번째 카피덱 행: Questions 없이 Answer가 먼저 나와 건너뜁니다. (key: ${row.key || "-"})`,
        });
        return;
      }
      current.answerRows.push(row);
    } else {
      warnings.push({
        type: "item-not-found",
        message: `${i + 1}번째 카피덱 행: item 값("${row.item}")이 Questions/Answer가 아니어서 건너뜁니다. (key: ${row.key || "-"})`,
      });
    }
  });

  return groups;
};

type AnswerSegment = { text: string; sourceRow: FaqCopyDeckRow };

// 줄 하나에서 불릿 마커만 제거 (분리 여부와 무관하게 공통으로 사용)
const stripBulletMarker = (line: string): string =>
  line.replace(/^[•▪‣◦\-*]\s*/, "").trim();

// 카피덱 Copy 셀 하나를 줄바꿈 기준으로 여러 세그먼트로 분리 (불릿 마커 제거)
// ⚠️ 태그 개수와 맞는지 확인하지 않고 무조건 분리하므로, 셀 내부에 줄바꿈이 있지만
//   대응되는 html 태그는 하나뿐인 경우 잘못 분리될 수 있다.
//   실제 매칭은 아래 buildAnswerSegments에서 answerRows/answerEls 개수를 먼저 비교해 결정한다.
const splitAnswerSegments = (row: FaqCopyDeckRow): AnswerSegment[] => {
  return row.copy
    .split(/\r\n|\r|\n/)
    .map(stripBulletMarker)
    .filter((line) => line.length > 0)
    .map((text) => ({ text, sourceRow: row }));
};

// row.copy를 분리하지 않고, 줄바꿈만 정리해서 하나의 세그먼트로 유지
// (태그가 하나뿐인데 셀 안에 줄바꿈이 있는 경우, 카피가 잘리지 않도록 통째로 보존)
const buildUnsplitAnswerSegment = (row: FaqCopyDeckRow): AnswerSegment => {
  const text = row.copy
    .split(/\r\n|\r|\n/)
    .map(stripBulletMarker)
    .filter((line) => line.length > 0)
    .join("\n");
  return { text, sourceRow: row };
};

// 카피덱 answerRows ↔ html answerEls 매칭용 세그먼트를 만든다.
// - raw row 개수가 이미 태그 개수와 같으면: 셀 내부 줄바꿈이 있어도 분리하지 않는다
//   (분리해버리면 태그는 하나인데 세그먼트가 여러 개가 되어 카피가 잘리는 문제가 생김).
// - raw row 개수가 태그 개수보다 적으면: 일부 셀이 여러 태그 몫을 압축해 담고 있다는 뜻이므로
//   기존처럼 줄바꿈 기준으로 분리해서 매칭을 시도한다.
const buildAnswerSegments = (
  answerRows: FaqCopyDeckRow[],
  answerElCount: number
): AnswerSegment[] => {
  if (answerRows.length === answerElCount) {
    return answerRows.map(buildUnsplitAnswerSegment);
  }
  return answerRows.flatMap((row) => splitAnswerSegments(row));
};

// sup 각주 참조(<sup><a class="click_sup" data-sup-tag="sup-N">...) 감지 및 번호 추출
// (문장 맨 끝에 붙는 각주형 sup만 대상으로 한다)
const detectTrailingSupFootnote = (el: Element): string | null => {
  let node: ChildNode | null = el.lastChild;
  while (node && node.nodeType === 3 && !normalize(node.textContent)) {
    node = node.previousSibling;
  }
  if (!node || node.nodeType !== 1) return null;
  const elNode = node as Element;
  if (elNode.tagName.toLowerCase() !== "sup") return null;

  const links = Array.from(elNode.querySelectorAll("a[data-sup-tag]"));
  if (links.length === 0) return null;

  const numbers = links
    .map((a) => {
      const m = (a.getAttribute("data-sup-tag") || "").match(/(\d+)/);
      return m ? m[1] : null;
    })
    .filter((n): n is string => !!n);

  if (numbers.length === 0) return null;
  return numbers.join(",");
};

// 문장 중간을 포함해 요소 안 어디든 <sup>이 있는지 감지.
// (각주형 트레일링 sup은 detectTrailingSupFootnote가 별도로 처리하므로 여기서는 제외해도 되고,
//  포함되어도 무방 — 최종 판단은 호출부에서 트레일링 여부와 함께 조합한다)
// recoder(applyToHtmlController)가 "몇 번째 온점 뒤에 sup이 있는지"를 원본 html에서 직접 다시
// 찾아 처리하므로, 여기서는 "이 카피에 위치 보존이 필요한 sup이 있다"는 사실만 표시하면 된다.
const hasAnySup = (el: Element): boolean => !!el.querySelector("sup");

const buildDataCopySetGenerator = (prefix: string, existingValues: Set<string>) => {
  let counter = 1;
  return (): string => {
    let candidate = "";
    do {
      candidate = `${prefix}-${String(counter).padStart(3, "0")}`;
      counter += 1;
    } while (existingValues.has(candidate));
    existingValues.add(candidate);
    return candidate;
  };
};

export const refineFaqHtml = (
  htmlText: string,
  deckRowsRaw: FaqCopyDeckRow[],
  prefix: string
): FaqRefineResult => {
  const warnings: FaqRefineWarning[] = [];
  const deckRows = forwardFillCategory(deckRowsRaw);
  const groups = groupDeckRows(deckRows, warnings);

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const faqItems = Array.from(doc.querySelectorAll(".watch-faq_item"));

  if (faqItems.length === 0) {
    warnings.push({
      type: "element-not-found",
      message: `HTML에서 FAQ 아이템(.watch-faq_item)을 찾지 못했습니다. FAQ 템플릿 구조가 다를 수 있습니다.`,
    });
    return { html: htmlText, exportRows: [], warnings };
  }

  if (groups.length !== faqItems.length) {
    warnings.push({
      type: "count-mismatch",
      message: `카피덱의 FAQ 개수(${groups.length}개)와 HTML의 FAQ 개수(${faqItems.length}개)가 다릅니다. 앞에서부터 순서대로 매칭된 부분까지만 처리합니다.`,
    });
  }

  const existingValues = new Set<string>();
  const attrRegex = /data-copy-set\s*=\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(htmlText))) {
    if (m[1]) existingValues.add(m[1]);
  }
  const nextDataCopySet = buildDataCopySetGenerator(prefix, existingValues);

  type PendingInsertion = { el: Element; value: string; needsInsertion: boolean };
  const pending: PendingInsertion[] = [];
  const exportRows: FaqExportRow[] = [];

  const pairCount = Math.min(groups.length, faqItems.length);

  for (let g = 0; g < pairCount; g++) {
    const group = groups[g];
    const item = faqItems[g];

    // ── 질문
    const questionEl = item.querySelector(".watch-faq_text");
    if (!questionEl) {
      warnings.push({
        type: "element-not-found",
        message: `${g + 1}번째 FAQ: 질문 요소(.watch-faq_text)를 찾지 못해 건너뜁니다.`,
      });
    } else {
      const existing = questionEl.getAttribute("data-copy-set");
      const value = existing && existing.trim() ? existing.trim() : nextDataCopySet();
      pending.push({ el: questionEl, value, needsInsertion: !existing });
      exportRows.push({
        key: group.questionRow.key,
        dataCopySet: value,
        targetSelector: `data-copy-set="${value}"`,
        applyType: "innerText",
        excludeSup: false,
        enableTextTransform: false,
        category: group.questionRow.category,
        item: "Questions",
        copy: normalize(group.questionRow.copy),
        remark: group.questionRow.remark,
        locales: group.questionRow.locales || {},
      });
    }

    // ── 답변 (문단 + 불릿, 순서대로 매칭)
    const answerEls = Array.from(item.querySelectorAll(".watch-faq_desc, .watch-faq_answer-item"));
    const answerSegments = buildAnswerSegments(group.answerRows, answerEls.length);

    if (answerSegments.length !== answerEls.length) {
      warnings.push({
        type: "count-mismatch",
        message: `${g + 1}번째 FAQ("${normalize(group.questionRow.copy).slice(0, 40)}..."): 카피덱 답변 세그먼트 수(${answerSegments.length})와 HTML 답변 요소 수(${answerEls.length})가 달라, 앞에서부터 매칭되는 부분까지만 처리합니다.`,
      });
    }

    const answerPairCount = Math.min(answerSegments.length, answerEls.length);
    for (let a = 0; a < answerPairCount; a++) {
      const el = answerEls[a];
      const segment = answerSegments[a];
      const supNumbers = detectTrailingSupFootnote(el);
      // 트레일링 각주형 sup이 아니면서 요소 안 어딘가(문장 중간 포함)에 sup이 있는 경우도
      // 위치 보존이 필요한 카피로 표시한다 (recoder가 온점 순번 기준으로 다시 찾아 삽입).
      const midSentenceSup = !supNumbers && hasAnySup(el);
      const needsSupHandling = !!supNumbers || midSentenceSup;

      const existing = el.getAttribute("data-copy-set");
      const value = existing && existing.trim() ? existing.trim() : nextDataCopySet();
      pending.push({ el, value, needsInsertion: !existing });

      exportRows.push({
        key: segment.sourceRow.key,
        dataCopySet: value,
        targetSelector: `data-copy-set="${value}"`,
        applyType: "innerText",
        excludeSup: needsSupHandling,
        enableTextTransform: needsSupHandling,
        category: segment.sourceRow.category,
        item: "Answer",
        copy: supNumbers ? `${segment.text}${supNumbers}` : segment.text,
        remark: segment.sourceRow.remark,
        locales: segment.sourceRow.locales || {},
      });
    }
  }

  // ── 실제 원문 HTML 문자열에 data-copy-set 삽입 (DOM 재직렬화 없이 원문 그대로 유지)
  // 요소들을 문서 등장 순서대로 정렬한 뒤, 커서를 단조 증가시키며 각 요소의 여는 태그 위치를 찾는다.
  const orderedPending = pending
    .map((p) => {
      const openTagMatch = (p.el.outerHTML || "").match(/^<([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/);
      return { ...p, tagName: openTagMatch ? openTagMatch[1] : "", needle: openTagMatch ? openTagMatch[0] : "" };
    })
    .filter((p) => p.needle);

  let cursor = 0;
  let resultHtml = "";
  let lastCut = 0;

  orderedPending.forEach((p) => {
    const idx = htmlText.indexOf(p.needle, cursor);
    if (idx === -1) {
      warnings.push({
        type: "element-not-found",
        message: `<${p.tagName}> 태그 위치를 원문에서 찾지 못해 data-copy-set="${p.value}" 삽입을 건너뜁니다.`,
      });
      return;
    }
    cursor = idx + p.needle.length;

    if (!p.needsInsertion) return; // 이미 data-copy-set이 있던 요소는 삽입하지 않음

    const insertionPoint = idx + 1 + p.tagName.length; // "<tagname" 바로 뒤
    resultHtml += htmlText.slice(lastCut, insertionPoint);
    resultHtml += ` data-copy-set="${p.value}"`;
    lastCut = insertionPoint;
  });
  resultHtml += htmlText.slice(lastCut);

  return { html: resultHtml, exportRows, warnings };
};
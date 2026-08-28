// PreCoder "html 정제" 탭의 새 옵션 ④: FAQ가 아닌 나머지 영역(features + disclaimer)에서
// data-copy-set이 있어야 하는 위치를 찾아 빠진 곳에 커스텀 data-copy-set을 배정하고,
// recoder 입력용 카피덱(엑셀)을 뽑아내는 로직.
//
// 사업부 정의 기준, data-copy-set이 있어야 하는 4가지 위치:
//   1. class="text_disclaimer" 요소 (디스클레이머 문구)
//   2. alt 속성이 있는 요소 (주로 img)
//   3. aria-label 속성이 있는 요소
//   4. 그 외 "태그 > innerText" 형태로 화면에 보이는 카피를 직접 담고 있는 leaf 요소
//
// FAQ 영역(.watch-faq_item)은 "FAQ 정제" 옵션에서 이미 별도로 처리하므로 여기서는 제외한다.
//
// ⚠️ 실제 index_pim.html 샘플 없이 작성된 best-effort 휴리스틱이다.
//   - EXCLUDE_SELECTORS / MAIN_CONTENT_SELECTOR는 gnb/header/footer 같은 공통 영역이
//     "features"로 잘못 잡히는 것을 막기 위한 자리표시자이므로, 실제 템플릿 클래스명을
//     확인한 뒤 반드시 다듬어야 한다.
//   - leaf 판정(isTextLeaf) 기준도 템플릿 구조에 따라 과다/과소 추출될 수 있어
//     결과 미리보기에서 반드시 검수가 필요하다.

export type FeatureDisclaimerItemType = "Disclaimer" | "Alt" | "Aria-label" | "Text";

export type FeatureDisclaimerExportRow = {
  key: string;
  dataCopySet: string;
  targetSelector: string; // recoder apply_type 포맷 (예: data-copy-set="SC1-001")
  applyType: "innerText" | "alt" | "aria-label";
  category: string;
  item: FeatureDisclaimerItemType;
  copy: string;
  isCustom: boolean; // true = 원본 html에 없던 것을 이번에 새로 배정함
};

export type FeatureDisclaimerWarning = {
  type: "element-not-found" | "empty-copy" | "too-many-matches";
  message: string;
};

export type FeatureDisclaimerResult = {
  html: string;
  exportRows: FeatureDisclaimerExportRow[]; // 전체 (기존 + 커스텀 신규)
  customRows: FeatureDisclaimerExportRow[]; // 이번에 새로 배정한 것만 (엑셀 별도 시트용)
  warnings: FeatureDisclaimerWarning[];
};

// 본문 콘텐츠로 취급할 루트. 없으면 body 전체를 대상으로 한다.
// (실제 템플릿 구조 확인 후 더 정확한 selector로 교체 권장)
const MAIN_CONTENT_SELECTOR = "main, #contents, .wwpd-contents, .watch-container";

// features/disclaimer 후보에서 제외할 공통 영역 (gnb/header/footer 등).
// 실제 index_pim.html의 클래스명 확인 후 조정 필요.
const EXCLUDE_SELECTORS =
  "header, nav, footer, script, style, [class*='gnb'], [class*='lnb'], [class*='header'], [class*='footer'], [class*='breadcrumb'], [class*='skip-nav']";

const SKIP_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "svg",
  "path",
  "template",
  "head",
  "meta",
  "link",
  "title",
  "br",
  "iframe",
]);

// leaf 판정 시 "서식용"으로 취급해 무시할 인라인 태그
// ⚠️ span / a 는 여기 포함하지 않는다: 이 템플릿에서는 span/a가 순수 서식이 아니라
//   자체적으로 data-copy-set을 갖는 독립 콘텐츠 단위로 쓰이는 경우가 흔해서,
//   포함시키면 "<button><span data-copy-set=...>텍스트</span></button>" 같은 구조에서
//   바깥 button까지 leaf로 잘못 잡혀 이중으로 data-copy-set이 붙는 문제가 생긴다.
const INLINE_TAGS = new Set(["br", "sup", "sub", "b", "i", "em", "strong", "u"]);

const normalize = (v: string | null | undefined): string => (v ?? "").normalize("NFC").trim();

const stripBulletMarker = (line: string): string => line.replace(/^[•▪‣◦\-*]\s*/, "").trim();

const isWithinFaqItem = (el: Element): boolean => !!el.closest(".watch-faq_item");

const isWithinExcludedArea = (el: Element): boolean => !!el.closest(EXCLUDE_SELECTORS);

// 요소 하나의 표시 텍스트를 추출한다. <br>은 줄바꿈으로 보존, 불릿 마커는 제거.
const extractElementText = (doc: Document, el: Element): string => {
  const clone = el.cloneNode(true) as Element;
  Array.from(clone.querySelectorAll("br")).forEach((br) => {
    br.replaceWith(doc.createTextNode("\n"));
  });

  return normalize(clone.textContent)
    .split(/\r\n|\r|\n/)
    .map(stripBulletMarker)
    .filter((line) => line.length > 0)
    .join("\n");
};

// element가 "leaf 텍스트" 요소인지 판단:
// - 자식 요소가 없거나, 인라인 서식 태그로만 이루어져 있고
// - trim한 텍스트가 비어있지 않고
// - 내부에 원본 html에서 이미 data-copy-set이 붙어있는 하위 요소가 없는 경우
//   (있다면 그 하위 요소가 이미 독립된 카피 단위이므로, 바깥 요소를 통째로 leaf로
//    잡아 이중으로 태깅하지 않도록 건너뛴다)
const isTextLeaf = (el: Element): boolean => {
  const childEls = Array.from(el.children);
  const onlyInline = childEls.every((c) => INLINE_TAGS.has(c.tagName.toLowerCase()));
  if (!onlyInline) return false;
  if (normalize(el.textContent).length === 0) return false;
  if (el.querySelector("[data-copy-set]")) return false;
  return true;
};

// 주변 heading류 텍스트를 best-effort로 찾아 카테고리로 사용 (못 찾으면 빈 값)
const detectCategoryLabel = (el: Element): string => {
  const section = el.closest("section, [class*='feature'], [class*='section']");
  const heading = section?.querySelector("h1, h2, h3, h4, [class*='title']");
  return normalize(heading?.textContent);
};

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

type PendingInsertion = { el: Element; value: string; needsInsertion: boolean };

// pending 요소들의 여는 태그 위치를 원문 htmlText에서 순서대로 찾아
// data-copy-set 속성을 삽입한다 (DOM 재직렬화 없이 원문 문자열 그대로 보존).
// alt/aria-label 대상도 어차피 "같은 태그에 data-copy-set 속성을 추가"하는 것이라
// innerText 대상과 삽입 로직 자체는 동일하다.
const buildTaggedHtml = (
  htmlText: string,
  pending: PendingInsertion[],
  warnings: FeatureDisclaimerWarning[]
): string => {
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

  return resultHtml;
};

export const extractFeaturesDisclaimerFromHtml = (
  htmlText: string,
  prefix: string
): FeatureDisclaimerResult => {
  const warnings: FeatureDisclaimerWarning[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  const root = doc.querySelector(MAIN_CONTENT_SELECTOR) ?? doc.body;
  if (!root) {
    warnings.push({ type: "element-not-found", message: "html에서 본문 영역을 찾지 못했습니다." });
    return { html: htmlText, exportRows: [], customRows: [], warnings };
  }

  const existingValues = new Set<string>();
  const attrRegex = /data-copy-set\s*=\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(htmlText))) {
    if (m[1]) existingValues.add(m[1]);
  }
  const nextDataCopySet = buildDataCopySetGenerator(prefix, existingValues);

  const pending: PendingInsertion[] = [];
  const exportRows: FeatureDisclaimerExportRow[] = [];
  const claimed = new Set<Element>(); // 이미 하나의 카피 단위로 확정된 요소의 하위 요소 재처리 방지

  const claimSubtree = (el: Element) => {
    Array.from(el.querySelectorAll("*")).forEach((d) => claimed.add(d));
  };

  const pushRow = (
    el: Element,
    itemType: FeatureDisclaimerItemType,
    applyType: "innerText" | "alt" | "aria-label",
    copy: string
  ) => {
    if (!normalize(copy)) {
      warnings.push({
        type: "empty-copy",
        message: `${itemType} 후보 요소(<${el.tagName.toLowerCase()}>)를 찾았지만 카피가 비어 있어 건너뜁니다.`,
      });
      return;
    }

    const existing = el.getAttribute("data-copy-set");
    const value = existing && existing.trim() ? existing.trim() : nextDataCopySet();
    const isCustom = !existing;
    pending.push({ el, value, needsInsertion: isCustom });

    exportRows.push({
      key: value,
      dataCopySet: value,
      targetSelector: `data-copy-set="${value}"`,
      applyType,
      category: detectCategoryLabel(el),
      item: itemType,
      copy,
      isCustom,
    });
  };

  const allEls = Array.from(root.querySelectorAll("*"));

  allEls.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    if (isWithinFaqItem(el)) return;
    if (isWithinExcludedArea(el)) return;
    if (claimed.has(el)) return;

    // 1. 디스클레이머 (class="text_disclaimer")
    if (el.classList.contains("text_disclaimer")) {
      claimSubtree(el);
      pushRow(el, "Disclaimer", "innerText", extractElementText(doc, el));
      return;
    }

    // 2. alt 속성
    const alt = el.getAttribute("alt");
    if (alt !== null && normalize(alt)) {
      claimSubtree(el);
      pushRow(el, "Alt", "alt", normalize(alt));
      return;
    }

    // 3. aria-label 속성
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel !== null && normalize(ariaLabel)) {
      claimSubtree(el);
      pushRow(el, "Aria-label", "aria-label", normalize(ariaLabel));
      return;
    }

    // 4. 그 외 leaf 텍스트
    if (isTextLeaf(el)) {
      claimSubtree(el);
      pushRow(el, "Text", "innerText", extractElementText(doc, el));
    }
  });

  if (exportRows.length === 0) {
    warnings.push({
      type: "element-not-found",
      message:
        "features/disclaimer 후보 요소를 하나도 찾지 못했습니다. 템플릿 구조가 예상과 달라 selector 조정이 필요할 수 있습니다.",
    });
  } else if (exportRows.length > 400) {
    warnings.push({
      type: "too-many-matches",
      message: `추출된 항목이 ${exportRows.length}건으로 매우 많습니다. gnb/footer 등 공통 영역이 함께 잡혔을 수 있으니 결과를 꼭 검수해주세요.`,
    });
  }

  const resultHtml = buildTaggedHtml(htmlText, pending, warnings);
  const customRows = exportRows.filter((row) => row.isCustom);

  return { html: resultHtml, exportRows, customRows, warnings };
};

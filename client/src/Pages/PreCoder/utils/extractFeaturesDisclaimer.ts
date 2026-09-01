// PreCoder "html 정제" 탭의 새 옵션 ④: FAQ가 아닌 나머지 영역(features + disclaimer)에서
// data-copy-set이 있어야 하는 위치를 찾아 빠진 곳에 커스텀 data-copy-set을 배정하고,
// recoder 입력용 카피덱(엑셀)을 뽑아내는 로직.
//
// 사업부 정의 기준, data-copy-set이 있어야 하는 4가지 위치:
//   1. class="text_disclaimer" 요소 (디스클레이머 문구) — data-copy-set은 인스턴스별로
//      다른 값을 새로 발급하지 않고, recoder 쪽 규약에 맞춰 항상 리터럴 값 "disclaimer"를
//      공유한다 (server/applyToHtmlController.ts replaceDisclaimer,
//      verifyTranslationQaController.ts의 data-copy-set="disclaimer" 정규식과 동일한 규약).
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
  applyType: "innerText" | "alt" | "aria-label" | "text_disclaimer";
  category: string;
  item: FeatureDisclaimerItemType;
  copy: string;
  isCustom: boolean; // true = 원본 html에 없던 것을 이번에 새로 배정함
};

export type FeatureDisclaimerWarning = {
  type: "element-not-found" | "empty-copy" | "too-many-matches" | "content-duplicate";
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

// disclaimer는 인스턴스마다 새 값을 발급하지 않고 이 리터럴 값을 공유한다.
const DISCLAIMER_FIXED_VALUE = "disclaimer";

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

// disclaimer 실제 target_selector 탐지: recoder는 data-copy-set="disclaimer"(리터럴)로
// "이 안의 disclaimer 텍스트"를 찾고, 그걸 감싸는 wrapper의 data-sup="sup-N" 값으로
// "어떤 인스턴스인지"를 구분한다 (server의 replaceDisclaimer 2단 구조와 동일 규약).
const DATA_SUP_VALUE_PATTERN = /^sup-\d+$/;

const findDisclaimerWrapperSelector = (el: Element): { attr: string; value: string } | null => {
  const wrapper = el.closest("[data-sup]");
  if (!wrapper) return null;
  const raw = wrapper.getAttribute("data-sup");
  const value = normalize(raw);
  if (!value || !DATA_SUP_VALUE_PATTERN.test(value)) return null;
  return { attr: "data-sup", value };
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
  const claimed = new Set<Element>(); // 이미 하나의 카피 단위로 확정된 요소의 하위 요소 재처리 방지

  // "검사 실행" 탭과 동일한 원칙: 동일 카피(같은 apply_type + 같은 텍스트)는 같은
  // data-copy-set 값을 공유해야 한다. key: `${applyType}::${normalizedCopy}` -> 대표 value
  const canonicalValueByCopy = new Map<string, string>();
  // 최종 카피덱은 "요소 하나당 한 행"이 아니라 "data-copy-set 값 하나당 한 행"이어야 하므로
  // value -> 이미 만들어진 row 를 들고 있다가 중복 요소는 새 행을 만들지 않고 재사용한다.
  const rowByValue = new Map<string, FeatureDisclaimerExportRow>();

  const claimSubtree = (el: Element) => {
    claimed.add(el); // 요소 자기 자신도 claim (다른 패스에서 재처리되지 않도록)
    Array.from(el.querySelectorAll("*")).forEach((d) => claimed.add(d));
  };

  const pushRow = (
    el: Element,
    itemType: FeatureDisclaimerItemType,
    applyType: "innerText" | "alt" | "aria-label",
    copy: string
  ) => {
    const normalizedCopy = normalize(copy);
    if (!normalizedCopy) {
      warnings.push({
        type: "empty-copy",
        message: `${itemType} 후보 요소(<${el.tagName.toLowerCase()}>)를 찾았지만 카피가 비어 있어 건너뜁니다.`,
      });
      return;
    }

    const dedupeKey = `${applyType}::${normalizedCopy}`;
    const existingAttr = el.getAttribute("data-copy-set");
    const hasOwnValue = !!(existingAttr && existingAttr.trim());

    let value: string;
    if (hasOwnValue) {
      value = existingAttr!.trim();
      // 이미 이 카피 내용으로 다른 값이 대표값(canonical)으로 등록돼 있는데,
      // 이 요소는 그와 "다른" 기존 값을 갖고 있는 경우 = 원본 html에 동일 카피가
      // 서로 다른 data-copy-set으로 이미 중복 지정돼 있었다는 뜻. 값은 건드리지 않되 알려준다.
      const canonical = canonicalValueByCopy.get(dedupeKey);
      if (canonical && canonical !== value) {
        warnings.push({
          type: "content-duplicate",
          message: `동일한 카피("${normalizedCopy.slice(0, 40)}${normalizedCopy.length > 40 ? "..." : ""}")가 이미 서로 다른 data-copy-set("${canonical}", "${value}")으로 지정되어 있습니다. 원본 값은 그대로 두었으니 필요하면 직접 통일해주세요.`,
        });
      }
    } else if (canonicalValueByCopy.has(dedupeKey)) {
      value = canonicalValueByCopy.get(dedupeKey)!; // 동일 카피 재사용
    } else {
      value = nextDataCopySet();
    }
    if (!canonicalValueByCopy.has(dedupeKey)) canonicalValueByCopy.set(dedupeKey, value);

    const needsInsertion = !hasOwnValue; // 이 요소 자체에는 아직 속성이 없어 새로 넣어야 함
    pending.push({ el, value, needsInsertion });

    const existingRow = rowByValue.get(value);
    if (existingRow) {
      // 같은 값으로 이미 한 행이 있으면 새 행을 추가하지 않고, 이번에 삽입이 필요했다면
      // "커스텀 배정" 여부만 갱신한다 (한 곳이라도 새로 넣었으면 검수 대상으로 표시).
      if (needsInsertion) existingRow.isCustom = true;
      return;
    }

    rowByValue.set(value, {
      key: value,
      dataCopySet: value,
      targetSelector: `data-copy-set="${value}"`,
      applyType,
      category: detectCategoryLabel(el),
      item: itemType,
      copy: normalizedCopy,
      isCustom: needsInsertion,
    });
  };

  // disclaimer 전용:
  // - 안쪽 span 자체에는 여전히 리터럴 값 "disclaimer"를 data-copy-set으로 부여한다
  //   (원래 값이 있으면 그대로 둔다) — recoder가 wrapper 내부에서 이 태그를 찾는 마커.
  // - 하지만 카피덱의 target_selector/행 구분은 이 span을 감싸는 wrapper의
  //   data-sup="sup-N" 값을 우선 사용한다 (실제 인스턴스 구분자). wrapper가 없으면
  //   어쩔 수 없이 리터럴 "disclaimer" 값 자체를 target_selector로 fallback한다
  //   (이 경우 서로 다른 disclaimer 문구가 섞이면 경고로 알려준다).
  const pushDisclaimerRow = (el: Element, copy: string) => {
    const normalizedCopy = normalize(copy);
    if (!normalizedCopy) {
      warnings.push({
        type: "empty-copy",
        message: `Disclaimer 후보 요소(<${el.tagName.toLowerCase()}>)를 찾았지만 카피가 비어 있어 건너뜁니다.`,
      });
      return;
    }

    const existingAttr = el.getAttribute("data-copy-set");
    const hasOwnValue = !!(existingAttr && existingAttr.trim());
    const innerValue = hasOwnValue ? existingAttr!.trim() : DISCLAIMER_FIXED_VALUE;
    const needsInsertion = !hasOwnValue;
    pending.push({ el, value: innerValue, needsInsertion });

    const wrapper = findDisclaimerWrapperSelector(el);
    const rowKey = wrapper ? `${wrapper.attr}="${wrapper.value}"` : `data-copy-set="${innerValue}"`;
    const isFallbackKey = !wrapper;

    const existingRow = rowByValue.get(rowKey);
    if (existingRow) {
      if (needsInsertion) existingRow.isCustom = true;
      if (existingRow.copy !== normalizedCopy) {
        warnings.push({
          type: "content-duplicate",
          message: isFallbackKey
            ? `disclaimer를 감싸는 data-sup wrapper가 없어 리터럴 target_selector(${rowKey})를 여러 요소가 공유하는데, 문구가 서로 다릅니다 (대표 문구: "${existingRow.copy.slice(0, 40)}${existingRow.copy.length > 40 ? "..." : ""}" / 이번 발견: "${normalizedCopy.slice(0, 40)}${normalizedCopy.length > 40 ? "..." : ""}"). 실제 서로 다른 disclaimer라면 wrapper에 data-sup을 붙여 구분해야 합니다.`
            : `target_selector(${rowKey})가 같은데 disclaimer 문구가 서로 다릅니다 (대표 문구: "${existingRow.copy.slice(0, 40)}${existingRow.copy.length > 40 ? "..." : ""}" / 이번 발견: "${normalizedCopy.slice(0, 40)}${normalizedCopy.length > 40 ? "..." : ""}"). data-sup 값이 중복 사용되지 않았는지 확인해주세요.`,
        });
      }
      return;
    }

    rowByValue.set(rowKey, {
      key: rowKey,
      dataCopySet: innerValue,
      targetSelector: rowKey,
      applyType: "text_disclaimer",
      category: detectCategoryLabel(el),
      item: "Disclaimer",
      copy: normalizedCopy,
      isCustom: needsInsertion,
    });
  };

  // disclaimer(.text_disclaimer)는 명시적 클래스 마커라 오탐 위험이 낮고,
  // 실제로는 페이지 하단 footer 영역에 있는 경우가 많다. features 탐지용
  // MAIN_CONTENT_SELECTOR/EXCLUDE_SELECTORS(footer 등)에 걸려 누락되지 않도록,
  // disclaimer는 문서 전체를 대상으로 별도 패스에서 먼저 처리한다 (FAQ 영역만 제외).
  const disclaimerCandidates = Array.from(doc.querySelectorAll(".text_disclaimer"));
  disclaimerCandidates.forEach((el) => {
    if (isWithinFaqItem(el)) return;
    if (claimed.has(el)) return;
    claimSubtree(el);
    pushDisclaimerRow(el, extractElementText(doc, el));
  });

  const allEls = Array.from(root.querySelectorAll("*"));

  allEls.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    if (isWithinFaqItem(el)) return;
    if (isWithinExcludedArea(el)) return;
    if (claimed.has(el)) return;

    // 1. alt 속성
    const alt = el.getAttribute("alt");
    if (alt !== null && normalize(alt)) {
      claimSubtree(el);
      pushRow(el, "Alt", "alt", normalize(alt));
      return;
    }

    // 2. aria-label 속성
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel !== null && normalize(ariaLabel)) {
      claimSubtree(el);
      pushRow(el, "Aria-label", "aria-label", normalize(ariaLabel));
      return;
    }

    // 3. 그 외 leaf 텍스트
    if (isTextLeaf(el)) {
      claimSubtree(el);
      pushRow(el, "Text", "innerText", extractElementText(doc, el));
    }
  });

  if (rowByValue.size === 0) {
    warnings.push({
      type: "element-not-found",
      message:
        "features/disclaimer 후보 요소를 하나도 찾지 못했습니다. 템플릿 구조가 예상과 달라 selector 조정이 필요할 수 있습니다.",
    });
  } else if (rowByValue.size > 400) {
    warnings.push({
      type: "too-many-matches",
      message: `추출된 항목이 ${rowByValue.size}건으로 매우 많습니다. gnb/footer 등 공통 영역이 함께 잡혔을 수 있으니 결과를 꼭 검수해주세요.`,
    });
  }

  const resultHtml = buildTaggedHtml(htmlText, pending, warnings);
  const exportRows = Array.from(rowByValue.values());
  const customRows = exportRows.filter((row) => row.isCustom);

  return { html: resultHtml, exportRows, customRows, warnings };
};
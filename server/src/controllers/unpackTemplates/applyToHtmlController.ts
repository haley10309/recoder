import path from "path";
import { Request, Response } from "express";

import { ApplyToHtmlBody, UnpackRow } from "../../types/unpack.types";
import { stripDisclaimerNumber } from "../../utils/copyTransform";

// =========================================
// 공통 유틸
// =========================================

// process-copy에서 가공된 값이 있으면 그것을 사용하며, 없다면 기존 카피값 그대로를 사용
const getCopy = (row: UnpackRow): string => {
  return row.processed_translated_copy ?? row.translated_copy ?? "";
};

// 시트에서 넘어오는 값이 O인지 o인지 "true"인지 True인지를 단순하게 한번에 판별
const isTrue = (value: unknown): boolean => {
  return value === true || value === "true" || value === "o" || value === "O";
};

// 혹여나 특수 문자가 있을 경우 이스케이프 시켜주는 함수
const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// selector를 분해하여 전달해준다
// data-copy-set="C01-001" -> { attr: "data-copy-set", value: "C01-001" }
const parseTargetSelector = (
  targetSelector: string
): { attr: string; value: string } | null => {
  const match = targetSelector.match(/^([\w-]+)=["']([^"']+)["']$/);

  if (!match) return null;

  return {
    attr: match[1],
    value: match[2].trim(),
  };
};

// data-copy-set="C1-1", data-copy-set="C22-3" 이런 형식인지 검사
const isCopySetSelector = (targetSelector: string): boolean => {
  return /^data-copy-set=["'][A-Za-z]+\d+(?:-\d+)+\s*["']$/.test(targetSelector);
};

// data-sup="sup-1" 형식 검사
const isSupSelector = (targetSelector: string): boolean => {
  return /^data-sup=["']sup-\d+["']$/.test(targetSelector);
};

// =========================================
// 따옴표 이스케이프 (alt / aria-label 전용)
// =========================================

// 속성 값에 삽입되는 카피의 따옴표를 HTML 엔티티로 치환
// (속성 구분자로 오인되는 문자만 처리. 스마트 따옴표는 파싱에 영향이 없어 제외)
const escapeQuotesForAttribute = (value: string): string => {
  return value
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// =========================================
// sup 태그 판별
// =========================================

// 디스클레이머용 <sup> 태그
// 내부에 click_sup 앵커(data-sup-tag)를 가진 <sup>만 대상으로 한다.
// class 유무는 템플릿마다 달라 판별 기준으로 삼지 않는다.
// (<sup>&reg;</sup>, <sup class="sup-text">&reg;</sup> 등 기호용 sup은 제외)
const DISCLAIMER_SUP_REGEX =
  /<sup\b[^>]*>\s*<a\b[^>]*(?:\bclick_sup\b|\bdata-sup-tag\s*=)/i;

// 카피에 디스클레이머용 sup이 포함되어 있는지 검사
const containsDisclaimerSup = (value: string): boolean => {
  return DISCLAIMER_SUP_REGEX.test(value);
};

// =========================================
// Copy Deck 불균형 태그 정리
// =========================================

const VOID_TAGS = new Set([
  "br", "img", "input", "hr", "meta", "link",
  "source", "area", "base", "col", "embed", "param", "track", "wbr",
]);

/**
 * Copy Deck에 포함된 짝 없는 닫는 태그를 제거한다.
 * (덱 작성 오류로 기존 HTML 구조가 깨지는 것을 방지)
 */
const stripUnbalancedCloseTags = (copy: string): string => {
  const stack: string[] = [];
  const removeRanges: Array<[number, number]> = [];
  const tagRegex = /<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g;

  let m: RegExpExecArray | null;
  while ((m = tagRegex.exec(copy)) !== null) {
    const name = m[2].toLowerCase();

    // self-closing 및 void 태그는 스택에 쌓지 않음
    if (m[3] === "/" || VOID_TAGS.has(name)) continue;

    if (m[1] === "/") {
      const idx = stack.lastIndexOf(name);

      if (idx === -1) {
        // 여는 태그 없이 등장한 닫는 태그 → 제거 대상
        removeRanges.push([m.index, m.index + m[0].length]);
      } else {
        stack.length = idx;
      }
    } else {
      stack.push(name);
    }
  }

  if (removeRanges.length === 0) return copy;

  let result = "";
  let cursor = 0;

  for (const [start, end] of removeRanges) {
    result += copy.slice(cursor, start);
    cursor = end;
  }

  return result + copy.slice(cursor);
};

// =========================================
// 태그 범위 탐색
// =========================================

/**
 * fromIndex부터 스캔하며 depth를 세어 대응되는 닫는 태그 위치를 찾는다.
 * 같은 종류의 태그가 중첩되어 있어도 올바른 종료 지점을 반환한다.
 */
const findMatchingCloseIndex = (
  html: string,
  tagName: string,
  fromIndex: number
): { closeStart: number; closeEnd: number } | null => {
  const scanRegex = new RegExp(
    `<(/?)${escapeRegExp(tagName)}\\b[^>]*?(/?)>`,
    "gi"
  );
  scanRegex.lastIndex = fromIndex;

  let depth = 1;
  let match: RegExpExecArray | null;

  while ((match = scanRegex.exec(html)) !== null) {
    const isClosing = match[1] === "/";
    const isSelfClosing = match[2] === "/";

    if (isClosing) {
      depth -= 1;
      if (depth === 0) {
        return {
          closeStart: match.index,
          closeEnd: match.index + match[0].length,
        };
      }
    } else if (!isSelfClosing) {
      depth += 1;
    }
  }

  return null;
};

/**
 * 지정한 속성을 가진 태그를 찾아 inner 영역만 교체한다.
 * 시작 태그 → 대응되는 닫는 태그까지를 하나의 치환 대상으로 판단한다.
 */
const replaceTagInner = (
  html: string,
  attr: string,
  value: string,
  buildInner: (inner: string) => string
): string => {
  const openRegex = new RegExp(
    `<([a-zA-Z][\\w:-]*)[^>]*\\s${escapeRegExp(attr)}=(["'])${escapeRegExp(value)}\\2[^>]*>`,
    "gi"
  );

  let result = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = openRegex.exec(html)) !== null) {
    const tagName = match[1];
    const openEnd = match.index + match[0].length;

    // self-closing 태그는 inner가 없으므로 건너뜀
    if (match[0].endsWith("/>")) continue;

    const close = findMatchingCloseIndex(html, tagName, openEnd);
    if (!close) continue;

    const inner = html.slice(openEnd, close.closeStart);

    result += html.slice(cursor, openEnd) + buildInner(inner);
    cursor = close.closeStart;

    // 이미 처리한 블록 내부를 다시 매칭하지 않도록 커서 이동
    openRegex.lastIndex = close.closeEnd;
  }

  result += html.slice(cursor);
  return result;
};

// =========================================
// 치환 로직
// =========================================

// 속성 값 변경 (alt, aria-label)
const replaceAttribute = (
  html: string,
  targetSelector: string,
  attrName: string,
  copy: string
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  const targetAttr = escapeRegExp(parsed.attr);
  const targetValue = escapeRegExp(parsed.value);
  const targetAttrName = escapeRegExp(attrName);

  // 속성 값에 들어가므로 따옴표를 엔티티로 치환
  const escapedCopy = escapeQuotesForAttribute(copy);

  const tagRegex = new RegExp(
    `<[^>]*\\s${targetAttr}=(["'])${targetValue}\\1[^>]*>`,
    "gi"
  );

  return html.replace(tagRegex, (tag) => {
    // 속성 종료는 "여는 따옴표와 동일한 따옴표"로만 판단한다.
    // 값 내부의 Apostrophe(') 나 스마트 따옴표는 종료로 인식하지 않는다.
    // 앞의 \s 는 data-alt 같은 유사 속성명 오매칭 방지용.
    const attrRegex = new RegExp(
      `(\\s${targetAttrName}=(["']))[\\s\\S]*?\\2`,
      "i"
    );

    // 콜백 치환으로 카피 내 $ 문자가 정규식 패턴으로 해석되는 것을 방지
    return tag.replace(
      attrRegex,
      (_m, head, quote) => `${head}${escapedCopy}${quote}`
    );
  });
};

// inner html 변경
const replaceInnerHtml = (
  html: string,
  targetSelector: string,
  copy: string
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  const safeCopy = stripUnbalancedCloseTags(copy);

  return replaceTagInner(html, parsed.attr, parsed.value, (inner) => {
    // 카피에 디스클레이머 sup 포함 → 카피가 완성본이므로 통째로 교체
    if (containsDisclaimerSup(safeCopy)) return safeCopy;

    // HTML의 디스클레이머 sup 위치 (기호용 sup은 건너뜀)
    const supIndex = inner.search(DISCLAIMER_SUP_REGEX);

    // 디스클레이머 sup 없음 → 기존 로직 유지
    if (supIndex === -1) return safeCopy;

    // sup 존재 → 번호만 제거하고 sup 보존
    // (앞 공백은 normalizeSupFormat에서 일괄 결정)
    return `${stripDisclaimerNumber(safeCopy)}${inner.slice(supIndex)}`;
  });
};

// 디스클레이머 변경
const replaceDisclaimer = (
  html: string,
  targetSelector: string,
  copy: string
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  const safeCopy = stripUnbalancedCloseTags(copy);

  // 외곽 블록 → 내부의 data-copy-set="disclaimer" 요소 inner 교체
  return replaceTagInner(html, parsed.attr, parsed.value, (inner) =>
    replaceTagInner(inner, "data-copy-set", "disclaimer", () => safeCopy)
  );
};

// =========================================
// sup 포맷 정리
// =========================================

// 디스클레이머 sup 직전 문맥 (닫는 태그 또는 일반 문자 1개)
const BEFORE_DISCLAIMER_SUP =
  /(<\/[a-zA-Z][\w:-]*>|[^\s>])\s*(?=<sup\b[^>]*>\s*<a\b[^>]*(?:\bclick_sup\b|\bdata-sup-tag\s*=))/gi;

// <sup> 블록 전체
const SUP_BLOCK = /<sup\b[^>]*>[\s\S]*?<\/sup>/gi;

/**
 * 디스클레이머 <sup> 앞 공백을 앞 문맥에 따라 일괄 결정하고,
 * <sup> 내부 구분 쉼표 뒤 공백을 제거한다.
 *
 * - 온점(.)  → 공백 없음
 * - 그 외    → 공백 1개 (일반 문자, </p>, </sup> 등 모든 닫는 태그 포함)
 */
const normalizeSupFormat = (html: string): string => {
  return html
    .replace(BEFORE_DISCLAIMER_SUP, (_m, prev: string) =>
      prev === "." ? prev : `${prev} `
    )
    .replace(SUP_BLOCK, (block) => block.replace(/,\s+/g, ","));
};

// =========================================
// 행 적용
// =========================================

const applyRowsToHtml = (html: string, rows: UnpackRow[]): string => {
  let convertedHtml = html;

  rows.forEach((row) => {
    const targetSelector = row.target_selector;
    const applyType = row.apply_type;
    const copy = getCopy(row);

    if (!targetSelector || !applyType) return;

    if (isCopySetSelector(targetSelector)) {
      if (applyType === "alt") {
        convertedHtml = replaceAttribute(convertedHtml, targetSelector, "alt", copy);
        return;
      }

      if (applyType === "innerText") {
        convertedHtml = replaceInnerHtml(convertedHtml, targetSelector, copy);
        return;
      }

      if (applyType === "aria-label") {
        convertedHtml = replaceAttribute(convertedHtml, targetSelector, "aria-label", copy);
        return;
      }
    }

    if (isSupSelector(targetSelector) && applyType === "text_disclaimer") {
      convertedHtml = replaceDisclaimer(convertedHtml, targetSelector, copy);
    }
  });

  // 치환 완료 후 sup 포맷 정리
  return normalizeSupFormat(convertedHtml);
};

// =========================================
// 컨트롤러
// =========================================

export const applyToHtml = async (
  req: Request<{}, {}, ApplyToHtmlBody>,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded." });
      return;
    }

    if (!req.body.row_list) {
      res.status(400).json({ success: false, error: "row_list is required." });
      return;
    }

    let row_list: UnpackRow[];
    try {
      row_list = JSON.parse(req.body.row_list);
    } catch {
      res.status(400).json({ success: false, error: "row_list must be a valid JSON string." });
      return;
    }

    if (!Array.isArray(row_list)) {
      res.status(400).json({ success: false, error: "row_list must be an array." });
      return;
    }

    const originalHtml = req.file.buffer.toString("utf-8");
    const convertedHtml = applyRowsToHtml(originalHtml, row_list);

    const originalName = path.parse(req.file.originalname).name;
    const outputFileName = `${originalName}_converted.html`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${outputFileName}"`);
    res.send(convertedHtml);
  } catch (err) {
    console.error("Error applying to html:", err);
    res.status(500).json({ success: false, error: "Failed to apply to html" });
  }
};
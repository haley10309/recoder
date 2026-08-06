import fs from "fs";
import os from "os";
import path from "path";
import { Request, Response } from "express";
import { stripDisclaimerNumber } from "../../utils/copyTransform";
// import * as cheerio from "cheerio";

import { ApplyToHtmlBody, UnpackRow } from "../../types/unpack.types";

// 따옴표가 속성 구분자로 오인되지 않도록 HTML 엔티티로 치환
// 태그 형태(<br />, <sup>, </span> 등)만 매칭
// 앞에 반드시 알파벳 또는 /가 와야 하므로 "5 < 10" 같은 일반 텍스트는 태그로 오인하지 않음
const HTML_TAG_REGEX = /<\/?[a-zA-Z][^>]*>/g;

// 텍스트 조각의 따옴표만 HTML 엔티티로 치환
const escapeQuotesInText = (value: string): string => {
  return value
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// 카피 내 HTML 태그(속성 따옴표 포함)는 원본 유지, 텍스트 구간만 치환
const escapeQuotes = (value: string): string => {
  let result = "";
  let lastIndex = 0;

  HTML_TAG_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = HTML_TAG_REGEX.exec(value)) !== null) {
    // 태그 앞 텍스트 → 치환
    result += escapeQuotesInText(value.slice(lastIndex, match.index));
    // 태그 자체 → 원본 그대로
    result += match[0];
    lastIndex = match.index + match[0].length;
  }

  // 마지막 태그 이후 남은 텍스트 → 치환
  result += escapeQuotesInText(value.slice(lastIndex));

  return result;
};

// process-copy에서 가공된 값이 있으면 그것을 사용하며, 없다면 기존 카피값 그대로를 사용
const getCopy = (row: UnpackRow): string => {
  return row.processed_translated_copy ?? row.translated_copy ?? "";
};


// 시트에서 넘어오는 값이 O인지 o인지 "true"인지 True인지를 단순하게 한번에 판별
const isTrue = (value: unknown): boolean => {
  return value === true || value === "true" || value === "o" || value === "O";
};

// 혹여나 특수 문자가 있을 경우 이스케이프 시켜주는 함수.
const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// selector를 분해하여 전달해준다.
const parseTargetSelector = (
  targetSelector: string
): { attr: string; value: string } | null => {
  const match = targetSelector.match(/^([\w-]+)=["']([^"']+)["']$/);

  if (!match) return null;

  /*

  data-copy-set="C01-001"

  ->

  attr: "data-copy-set",
  value: "C01-001"

  */
  return {
    attr: match[1],
    value: match[2].trim(),
  };
};

// data-copy-set="C1-1", data-copy-set="C22-3" 이런 형식인지 검사(특정 형식)
const isCopySetSelector = (targetSelector: string): boolean => {
  return /^data-copy-set=["'][A-Za-z]+\d+(?:-\d+)+\s*["']$/.test(targetSelector);
};

// 위와 마찬가지로 데이터 sup의 형식 검사 
const isSupSelector = (targetSelector: string): boolean => {
  return /^data-sup=["']sup-\d+["']$/.test(targetSelector);
};

// alt / aria-label 속성 값에서 이스케이프할 따옴표 문자
// 속성 값에 삽입되는 카피의 따옴표를 HTML 엔티티로 치환
const escapeQuotesForAttribute = (value: string): string => {
  return value
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
//속성 값 변경 (alt, aria-label 등)cd 
// const replaceAttribute = (
//   html: string,
//   targetSelector: string,
//   attrName: string,
//   copy: string
// ): string => {
//   const parsed = parseTargetSelector(targetSelector);
//   if (!parsed) return html;

//   const targetAttr = escapeRegExp(parsed.attr);
//   const targetValue = escapeRegExp(parsed.value);
//   const targetAttrName = escapeRegExp(attrName);

//   // 속성 값에 들어가므로 따옴표를 엔티티로 치환
//   const escapedCopy = escapeQuotesForAttribute(copy);

//   const tagRegex = new RegExp(
//     `<[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*>`,
//     "gi"
//   );

//   return html.replace(tagRegex, (tag) => {
//     const attrRegex = new RegExp(
//       `(${targetAttrName}=["'])([^"']*)(["'])`,
//       "i"
//     );

//     // 콜백으로 치환하여 카피 내 $ 문자가 정규식 패턴으로 해석되는 것을 방지
//     return tag.replace(attrRegex, (_m, open, _old, close) =>
//       `${open}${escapedCopy}${close}`
//     );
//   });
// };

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
    return tag.replace(attrRegex, (_m, head, quote) =>
      `${head}${escapedCopy}${quote}`
    );
  });
};

// inner html 변경하기
// 
const replaceInnerHtml = (
  html: string,
  targetSelector: string,
  copy: string,
  excludeSup: boolean
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  return replaceTagInner(html, parsed.attr, parsed.value, (inner) => {
    // 카피에 sup이 포함된 경우 → 카피가 sup까지 포함한 완성본이므로 통째로 교체
    // (기존 sup을 덧붙이면 중복 생성됨)
    if (containsSupTag(copy)) return copy;

    if (!excludeSup) return copy;

    const supIndex = inner.search(/<sup\b[^>]*>/i);
    if (supIndex === -1) return copy;

    // sup 존재 → 디스클레이머 번호 제거 + 공백 규칙 적용
    const { copy: cleaned, needsSpace } = stripDisclaimerNumber(copy);
    const space = needsSpace ? " " : "";

    return `${cleaned}${space}${inner.slice(supIndex)}`;
  });
};

// 디스클레이머 변경하기.
// const replaceDisclaimer = (
//   html: string,
//   targetSelector: string,
//   copy: string
// ): string => {
//   const parsed = parseTargetSelector(targetSelector);
//   if (!parsed) return html;

//   const targetAttr = escapeRegExp(parsed.attr);
//   const targetValue = escapeRegExp(parsed.value);

//   const targetBlockRegex = new RegExp(
//     `(<([a-zA-Z][\\w:-]*)[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*>)([\\s\\S]*?)(</\\2>)`,
//     "gi"
//   );

//   return html.replace(targetBlockRegex, (full, openTag, tagName, inner, closeTag) => {
//     const disclaimerRegex =
//       /(<([a-zA-Z][\w:-]*)[^>]*\sdata-copy-set=["']disclaimer["'][^>]*>)([\s\S]*?)(<\/\2>)/i;

//     const replacedInner = inner.replace(
//       disclaimerRegex,
//       (
//         full: string,
//         disclaimerOpenTag: string,
//         tagName: string,
//         disclaimerInner: string,
//         disclaimerCloseTag: string
//       ) => {
//         return `${disclaimerOpenTag}${copy}${disclaimerCloseTag}`;
//       }
//     );

//     return `${openTag}${replacedInner}${closeTag}`;
//   });
// };

// 카피에 sup 태그가 포함되어 있는지 검사
const containsSupTag = (value: string): boolean => {
  return /<sup\b[^>]*>/i.test(value);
};

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
        return { closeStart: match.index, closeEnd: match.index + match[0].length };
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

const replaceDisclaimer = (
  html: string,
  targetSelector: string,
  copy: string
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  // 외곽 블록 → 내부의 data-copy-set="disclaimer" 요소 inner 교체
  return replaceTagInner(html, parsed.attr, parsed.value, (inner) =>
    replaceTagInner(inner, "data-copy-set", "disclaimer", () => copy)
  );
};

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
        convertedHtml = replaceInnerHtml(
          convertedHtml,
          targetSelector,
          copy,
          isTrue(row.exclude_sup)
        );
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

  return convertedHtml;
};

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
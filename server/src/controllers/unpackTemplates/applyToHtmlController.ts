import fs from "fs";
import os from "os";
import path from "path";
import { Request, Response } from "express";
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
  const copy = row.processed_translated_copy ?? row.translated_copy ?? "";
  return escapeQuotes(copy);
};
// const getCopy = (row: UnpackRow): string => {
//   return row.processed_translated_copy ?? row.translated_copy ?? "";
// };


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

//속성 값 변경 (alt, aria-label 등)cd 
const replaceAttribute = (
  html: string,
  targetSelector: string,
  attrName: string,
  copy: string
): string => {

  //selector를 가져옴. data copy set & alt
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;


  // 특수문자로 인한 오류를 막기위한 방어 함수(사실 escapeRegExp는 없어도 됨)
  const targetAttr = escapeRegExp(parsed.attr);
  const targetValue = escapeRegExp(parsed.value);
  const targetAttrName = escapeRegExp(attrName);

  const tagRegex = new RegExp(
    `<[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*>`,
    "gi"
  );

  // alt 부분을 regex 함수를 통해 찾는다.
  // < .... data-copy-set="C01-001" .... alt="여기" .... >
  return html.replace(tagRegex, (tag) => {
    const attrRegex = new RegExp(
      `(${targetAttrName}=["'])([^"']*)(["'])`,
      "i"
    );

    // $ 문자 버그 수정 로직 추가
    // return tag.replace(attrRegex, `$1${copy}$3`);
    return tag.replace(attrRegex, (_m, open, _old, close) => `${open}${copy}${close}`);
  });
};

// inner html 변경하기
const replaceInnerHtml = (
  html: string,
  targetSelector: string,
  copy: string,
  excludeSup: boolean
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  const targetAttr = escapeRegExp(parsed.attr);
  const targetValue = escapeRegExp(parsed.value);

  const tagRegex = new RegExp(
    `(<([a-zA-Z][\\w:-]*)[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*>)([\\s\\S]*?)(</\\2>)`,
    "gi"
  );

  return html.replace(tagRegex, (full, openTag, tagName, inner, closeTag) => {
    if (!excludeSup) {
      // excludeSup 값이 false이면 통째로 교체
      return `${openTag}${copy}${closeTag}`;
    }

    // sup을 제외한다면, sup의 시작 위치를 찾는다.
    const supIndex = inner.search(/<sup\b[^>]*>/i);

    if (supIndex === -1) {
      // sup 이 없으면 그냥 전체 교체.
      return `${openTag}${copy}${closeTag}`;
    }
    // 아니라면 
    return `${openTag}${copy}${inner.slice(supIndex)}${closeTag}`;
  });
};

// 디스클레이머 변경하기.
const replaceDisclaimer = (
  html: string,
  targetSelector: string,
  copy: string
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  const targetAttr = escapeRegExp(parsed.attr);
  const targetValue = escapeRegExp(parsed.value);

  const targetBlockRegex = new RegExp(
    `(<([a-zA-Z][\\w:-]*)[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*>)([\\s\\S]*?)(</\\2>)`,
    "gi"
  );

  return html.replace(targetBlockRegex, (full, openTag, tagName, inner, closeTag) => {
    const disclaimerRegex =
      /(<([a-zA-Z][\w:-]*)[^>]*\sdata-copy-set=["']disclaimer["'][^>]*>)([\s\S]*?)(<\/\2>)/i;

    const replacedInner = inner.replace(
      disclaimerRegex,
      (
        full: string,
        disclaimerOpenTag: string,
        tagName: string,
        disclaimerInner: string,
        disclaimerCloseTag: string
      ) => {
        return `${disclaimerOpenTag}${copy}${disclaimerCloseTag}`;
      }
    );

    return `${openTag}${replacedInner}${closeTag}`;
  });
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
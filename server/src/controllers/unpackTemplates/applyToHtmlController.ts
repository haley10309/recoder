// server/src/controllers/unpackTemplates/applyToHtmlController.ts
import path from "path";
import { Request, Response } from "express";

import { ApplyToHtmlBody, UnpackRow } from "../../types/unpack.types";
import { localizeSchema, SCHEMA_KEY_REGEX } from "../../services/schema/index";
import { stripDisclaimerNumber, wrapRegSymbol } from "../../utils/copyTransform";

// =========================================
// 공통 유틸
// =========================================

// process-copy에서 가공된 값이 있으면 그것을 사용하며, 없다면 기존 카피값 그대로를 사용
const getCopy = (row: UnpackRow): string => {
  return row.processed_translated_copy || row.translated_copy || "";
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
// 문장 중간 sup 위치 보존 (exclude_sup === O 전용)
// =========================================

// 원본 inner 안의 <sup>...</sup> 블록 전부 (트레일링 각주형 여부와 무관)
// ⚠️ 내부 콘텐츠([\s\S]*?)가 다른 <sup>/</sup> 경계를 "건너뛰어" 매칭하지 않도록
//   부정 전방탐색으로 막는다. 이게 없으면 sup이 2개 이상일 때 첫 sup의 lazy
//   매칭이 백트래킹으로 두 번째 sup까지 통째로 삼켜버리는 문제가 생긴다.
const ANY_SUP_BLOCK_REGEX_G = /<sup\b[^>]*>(?:(?!<\/?sup\b)[\s\S])*?<\/sup>/gi;

// 디스클레이머 번호에 쓰이는 숫자 / 구분자 (copyTransform.ts와 동일 기준)
const DIGIT = "0-9\\u0660-\\u0669\\u06F0-\\u06F9";
const SEPARATOR = "\\s,\\u060C\\uFF0C";

// html에서 태그를 제거한 순수 텍스트 기준으로, index 이전에 등장한 온점(.) 개수를 센다.
const countPeriodsBeforeIndex = (html: string, index: number): number => {
  const textBefore = html.slice(0, index).replace(/<[^>]*>/g, "");
  const matches = textBefore.match(/\./g);
  return matches ? matches.length : 0;
};

// 순수 텍스트에서 n번째 온점 "바로 뒤" 위치를 찾는다. 못 찾으면 -1.
const findIndexAfterNthPeriod = (text: string, n: number): number => {
  if (n <= 0) return -1;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ".") {
      count += 1;
      if (count === n) return i + 1;
    }
  }
  return -1;
};

// index 위치에서 시작하는 디스클레이머 번호 마커(예: "29", "5,6", " 29")가 있으면
// 제거하고, 없으면 그대로 둔다. (stripDisclaimerNumber와 동일한 숫자/구분자 규칙을
// 문자열 "끝"이 아니라 특정 위치에 적용한 버전)
const stripDigitMarkerAt = (
  text: string,
  index: number
): { text: string; index: number } => {
  const re = new RegExp(
    `^[${SEPARATOR}]*[${DIGIT}]+(?:[${SEPARATOR}]+[${DIGIT}]+)*`
  );
  const match = text.slice(index).match(re);
  if (!match) return { text, index };
  return {
    text: text.slice(0, index) + text.slice(index + match[0].length),
    index,
  };
};

/**
 * exclude_sup === O 인 행 전용: 원본 inner에 있는 sup들을, 번역 카피 안에서
 * "원본과 동일한 번째 온점 뒤" 위치에 그대로 복원한다.
 *
 * sup을 끼워 넣을 위치를 찾으면, 그 자리에 이미 남아있는 디스클레이머 번호
 * 마커(예: "29")가 있는지 확인해 있으면 제거한 뒤 sup을 넣는다.
 * (원문 HTML의 sup 앵커는 보통 빈 텍스트라 표시 번호가 CSS로 그려지므로,
 *  카피 안의 숫자 값 자체를 미리 알 수 없다 — 그래서 "값"을 예측하지 않고,
 *  "삽입 위치에 실제로 놓여 있는 숫자"를 그 자리에서 바로 지운다)
 *
 * 온점을 못 찾으면(문장 앞이거나 온점이 없음) 카피 끝에 안전하게 붙이되,
 * 끝에 남은 번호 마커가 있으면 마찬가지로 제거한다.
 */
const insertSupMarkers = (originalInner: string, translatedCopy: string): string => {
  const supRegex = new RegExp(ANY_SUP_BLOCK_REGEX_G.source, "gi");
  const sups: { html: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = supRegex.exec(originalInner)) !== null) {
    sups.push({ html: m[0], index: m.index });
  }
  if (sups.length === 0) return translatedCopy;

  let result = translatedCopy;
  let cursor = 0;
  let prevPeriodCount = 0;

  for (const sup of sups) {
    const periodCount = countPeriodsBeforeIndex(originalInner, sup.index);
    // 이전 sup 이후로 "새로 등장한" 온점 개수 (cursor 이후 구간 기준 상대값)
    const relativePeriodCount = periodCount - prevPeriodCount;
    prevPeriodCount = periodCount;

    const insertAt =
      relativePeriodCount > 0
        ? findIndexAfterNthPeriod(result.slice(cursor), relativePeriodCount)
        : -1;

    if (insertAt === -1) {
      // 폴백: 카피 끝에 붙이되, 끝에 남은 번호 마커가 있으면 제거
      result = `${stripDisclaimerNumber(result)}${sup.html}`;
      cursor = result.length;
      continue;
    }

    const absIndex = cursor + insertAt;
    const stripped = stripDigitMarkerAt(result, absIndex);
    result =
      stripped.text.slice(0, stripped.index) +
      sup.html +
      stripped.text.slice(stripped.index);
    cursor = stripped.index + sup.html.length;
  }

  return result;
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

// 카피 안의 literal 줄바꿈(\n, \r\n)을 <br />로 변환한다.
// (하나의 태그에 여러 줄이 있던 셀을 분리하지 않고 그대로 보존한 경우,
//  줄바꿈이 그대로 남아있으면 브라우저에서 공백으로 무시되어 원본의 시각적
//  줄바꿈(<br />)이 사라지므로 명시적으로 복원해준다)
const normalizeCopyLineBreaks = (value: string): string => {
  return value.replace(/\r\n|\r|\n/g, "<br />");
};

// inner html 변경
const replaceInnerHtml = (
  html: string,
  targetSelector: string,
  copy: string,
  excludeSup: boolean
): string => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return html;

  const safeCopy = normalizeCopyLineBreaks(stripUnbalancedCloseTags(copy));

  return replaceTagInner(html, parsed.attr, parsed.value, (inner) => {
    // 카피에 디스클레이머 sup 포함 → 카피가 완성본이므로 통째로 교체
    if (containsDisclaimerSup(safeCopy)) return safeCopy;

    if (!/<sup\b/i.test(inner)) return safeCopy;

    // HTML의 디스클레이머(각주형) sup 위치
    const supIndex = inner.search(DISCLAIMER_SUP_REGEX);

    // sup 이후에 (공백을 제외하고) 다른 sup 블록 외의 내용이 없을 때만
    // "진짜 트레일링"으로 본다. 문장 중간에 sup이 있고 그 뒤로 <br/>나 다른 문장이
    // 이어지는 경우는 아래 insertSupMarkers의 온점 기반 위치 복원으로 처리해야 한다.
    // (정규식 하나로 한 번에 판별하면 [\s\S]*? 의 백트래킹이 sup 경계를 넘어
    //  두 번째 sup까지 통째로 삼켜버릴 수 있어, 실제로 sup 블록들을 떼어낸 뒤
    //  남는 게 공백뿐인지로 직접 판별한다)
    const isTrailing =
      supIndex !== -1 &&
      inner
        .slice(supIndex)
        .replace(new RegExp(ANY_SUP_BLOCK_REGEX_G.source, "gi"), "")
        .trim() === "";

    // 진짜 트레일링 각주형 sup → 번호만 제거하고 sup 보존
    // (앞 공백은 normalizeSupFormat에서 일괄 결정)
    if (isTrailing) {
      return `${stripDisclaimerNumber(safeCopy)}${inner.slice(supIndex)}`;
    }

    // 문장 중간(또는 뒤에 다른 내용이 이어지는) sup, 혹은 exclude_sup === O 로 표시된
    // 기호형 sup → 온점 순번 기반 위치 복원 (그 자리의 남은 번호 마커도 함께 제거)
    if (supIndex !== -1 || excludeSup) {
      return insertSupMarkers(inner, safeCopy);
    }

    return safeCopy;
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

  // data-sup 영역 전용: ® → <sup>&reg;</sup>
  const safeCopy = wrapRegSymbol(stripUnbalancedCloseTags(copy));

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
    // 스키마 행은 별도 파이프라인(localizeSchema)에서 처리
    if (SCHEMA_KEY_REGEX.test(row.key ?? "")) return;

    const targetSelector = row.target_selector;
    const applyType = row.apply_type;
    const copy = getCopy(row);

    if (!targetSelector || !applyType) return;

    // =========================
    // feature 영역
    // =========================
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

    // =========================
    // disclaimer 영역
    // =========================
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

    // 1) 기존 HTML 치환
    let convertedHtml = applyRowsToHtml(originalHtml, row_list);

    // 2) Schema 치환 (SCHEMA- 행이 있을 때만 동작)
    const countryCode = req.body.country_code ?? "";

    // ===== 임시 디버깅 =====
    // console.log("[apply] country_code:", JSON.stringify(countryCode));
    // console.log("[apply] 총 행수:", row_list.length);
    // console.log("[apply] key 있는 행:", row_list.filter((r: any) => r.key).length);
    // console.log("[apply] SCHEMA 행수:",
    //   row_list.filter((r: any) => /^SCHEMA-/i.test(String(r.key ?? ""))).length);
    // console.log("[apply] 첫 행:", row_list[0]);
    // =====================

    const schemaResult = localizeSchema(convertedHtml, row_list, countryCode);
    convertedHtml = schemaResult.html;

    console.log("[apply] 리포트:", schemaResult.report ?? "null");

    const originalName = path.parse(req.file.originalname).name;
    const outputFileName = `${originalName}_converted.html`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${outputFileName}"`);

    // 응답 본문은 파일(blob)이므로 리포트는 헤더로 전달한다
    if (schemaResult.report) {
      res.setHeader(
        "X-Schema-Report",
        Buffer.from(JSON.stringify(schemaResult.report), "utf-8").toString("base64")
      );
      res.setHeader(
        "Access-Control-Expose-Headers",
        "X-Schema-Report, Content-Disposition"
      );
    }

    res.send(convertedHtml);
  } catch (err) {
    console.error("Error applying to html:", err);
    res.status(500).json({ success: false, error: "Failed to apply to html" });
  }
};

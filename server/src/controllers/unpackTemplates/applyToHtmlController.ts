import path from "path";
import { Request, Response } from "express";

import { ApplyToHtmlBody, UnpackRow } from "../../types/unpack.types";
import { stripDisclaimerNumber, wrapRegSymbol } from "../../utils/copyTransform";

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
// 문장 중간 sup 위치 보존 (exclude_sup === O 전용)
// =========================================

// 원본 inner 안의 <sup>...</sup> 블록 전부 (트레일링 각주형 여부와 무관)
const ANY_SUP_BLOCK_REGEX_G = /<sup\b[^>]*>[\s\S]*?<\/sup>/gi;

// 디스클레이머 번호에 쓰이는 숫자 / 구분자 (copyTransform.ts와 동일 기준)
const DIGIT = "0-9\\u0660-\\u0669\\u06F0-\\u06F9";
const SEPARATOR = "\\s,\\u060C\\uFF0C";

// 독립된 숫자 토큰(예: "29", "5,6") 하나를 찾는 패턴.
// ⚠️ data-sup-tag="sup-29" 의 29는 내부 카탈로그/각주 ID일 뿐, 화면에 보이는
//   번호(카피에 실제로 적힌 숫자)와 항상 같다는 보장이 없다. 따라서 이 값을
//   신뢰하지 않고, 사람이 직접 입력한 row.original_copy 안의 숫자 토큰을
//   "sup이 등장하는 순서"에 맞춰 그대로 사용한다.
const NUMBER_TOKEN_REGEX = new RegExp(
  `(?<![${DIGIT}])[${DIGIT}]+(?:[${SEPARATOR}]+[${DIGIT}]+)*(?![${DIGIT}])`,
  "g"
);

// text 안에서 독립된 숫자 토큰들을 등장 순서대로 모두 추출
const extractNumberTokens = (text: string): string[] => {
  const matches = text.match(NUMBER_TOKEN_REGEX);
  return matches ? matches : [];
};

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

// text의 fromIndex 이후 구간에서 token(숫자 토큰 원문, 예: "29", "5,6")을 찾아
// (앞에 붙은 구분자까지 포함해) 제거하고 그 위치를 반환한다. 못 찾으면 null.
const stripInlineNumberMarker = (
  text: string,
  token: string,
  fromIndex: number
): { text: string; index: number } | null => {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`[${SEPARATOR}]*(?<![${DIGIT}])${escaped}(?![${DIGIT}])`);

  const searchSpace = text.slice(fromIndex);
  const match = searchSpace.match(re);
  if (!match || match.index === undefined) return null;

  const absIndex = fromIndex + match.index;
  const newText = text.slice(0, absIndex) + text.slice(absIndex + match[0].length);
  return { text: newText, index: absIndex };
};

/**
 * exclude_sup === O 인 행 전용: 원본 inner에 있는 sup들을 번역 카피에 복원한다.
 *
 * 1순위: originalCopy(사람이 입력한 원문 카피)에 있는 숫자 토큰을, 원본 inner의
 *        sup 등장 순서와 1:1로 짝지어 "몇 번째 숫자 토큰인지"를 구한다.
 *        번역 카피에서 동일한 숫자 토큰(원문 그대로, 번역가가 보통 숫자는
 *        그대로 두므로)을 찾아 그 자리(숫자는 제거)에 실제 <sup> 마크업을 삽입한다.
 *        (data-sup-tag의 내부 ID 숫자는 화면 표기 번호와 다를 수 있어 사용하지 않는다)
 * 2순위: 대응되는 숫자 토큰이 없거나(originalCopy 미제공, 순수 기호형 sup 등)
 *        번역 카피에서 해당 토큰을 찾지 못하면, 원본에서 sup 앞에 등장한 온점
 *        개수와 동일한 번째 온점 뒤에 삽입한다.
 * 최종 폴백: 그래도 위치를 못 찾으면 카피 끝에 안전하게 붙인다.
 */
const insertSupMarkers = (
  originalInner: string,
  translatedCopy: string,
  originalCopy?: string
): string => {
  const sups = originalInner.match(ANY_SUP_BLOCK_REGEX_G);
  if (!sups) return translatedCopy;

  // 원문 카피에 사람이 직접 적어둔 숫자 토큰들 (sup 등장 순서와 1:1 대응한다고 가정)
  const originalTokens = originalCopy ? extractNumberTokens(originalCopy) : [];

  let result = translatedCopy;
  let cursor = 0;

  sups.forEach((supHtml, i) => {
    let inserted = false;
    const token = originalTokens[i];

    if (token) {
      const stripped = stripInlineNumberMarker(result, token, cursor);
      if (stripped) {
        result =
          stripped.text.slice(0, stripped.index) +
          supHtml +
          stripped.text.slice(stripped.index);
        cursor = stripped.index + supHtml.length;
        inserted = true;
      }
    }

    if (!inserted) {
      const supIndexInOriginal = originalInner.indexOf(supHtml);
      const periodCount =
        supIndexInOriginal === -1
          ? 0
          : countPeriodsBeforeIndex(originalInner, supIndexInOriginal);
      const insertAt =
        periodCount > 0 ? findIndexAfterNthPeriod(result.slice(cursor), periodCount) : -1;

      if (insertAt !== -1) {
        const absIndex = cursor + insertAt;
        result = result.slice(0, absIndex) + supHtml + result.slice(absIndex);
        cursor = absIndex + supHtml.length;
      } else {
        result = `${result}${supHtml}`;
        cursor = result.length;
      }
    }
  });

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
  excludeSup: boolean,
  originalCopy?: string
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
    // 이어지는 경우는 아래 insertSupMarkers의 번호 기반 위치 복원으로 처리해야 한다.
    const isTrailing =
      supIndex !== -1 &&
      /^\s*(?:<sup\b[^>]*>[\s\S]*?<\/sup>\s*)+$/i.test(inner.slice(supIndex));

    // 진짜 트레일링 각주형 sup → 번호만 제거하고 sup 보존
    // (앞 공백은 normalizeSupFormat에서 일괄 결정)
    if (isTrailing) {
      return `${stripDisclaimerNumber(safeCopy)}${inner.slice(supIndex)}`;
    }

    // 문장 중간(또는 뒤에 다른 내용이 이어지는) sup, 혹은 exclude_sup === O 로 표시된
    // 기호형 sup → 원문 카피(original_copy)의 숫자 토큰 기반(우선) / 온점 순번 기반(폴백) 위치 복원
    if (supIndex !== -1 || excludeSup) {
      return insertSupMarkers(inner, safeCopy, originalCopy);
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
          isTrue(row.exclude_sup),
          row.original_copy
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
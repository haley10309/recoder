// "data-copy-set"이 붙은 요소 전체(내부 콘텐츠 포함)를 제거
const VOID_TAGS = new Set([
  "br", "img", "input", "hr", "meta", "link",
  "source", "area", "base", "col", "embed", "param", "track", "wbr",
]);

// data-copy-set 속성을 가진 여는 태그
const COPY_SET_OPEN_TAG =
  /<([a-zA-Z][\w:-]*)\b[^>]*\sdata-copy-set\s*=\s*(["'])([^"']*)\2[^>]*>/gi;

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
 * 삭제 범위 앞뒤의 들여쓰기·줄바꿈을 함께 포함시켜
 * 제거 후 빈 줄이 남지 않도록 한다.
 */
const expandRange = (
  html: string,
  start: number,
  end: number
): { start: number; end: number } => {
  let s = start;
  let e = end;

  // 같은 줄 앞쪽 공백/탭 흡수
  while (s > 0 && (html[s - 1] === " " || html[s - 1] === "\t")) s -= 1;

  // 뒤쪽 공백 + 줄바꿈 1개 흡수
  while (e < html.length && (html[e] === " " || html[e] === "\t")) e += 1;
  if (html[e] === "\r") e += 1;
  if (html[e] === "\n") e += 1;

  return { start: s, end: e };
};

export interface RemovedElement {
  copySet: string;
  tagName: string;
}

export interface RemoveResult {
  html: string;
  removed: RemovedElement[];
  /** HTML에 존재하는 모든 data-copy-set 번호 (중복 제거) */
  foundInHtml: string[];
}

/**
 * shouldRemove가 true를 반환하는 data-copy-set 요소를
 * 내부 콘텐츠까지 통째로 삭제한다.
 *
 * 중첩된 경우 바깥 요소만 삭제하며, 그 안의 요소는 함께 사라지므로
 * 중복 계산하지 않는다.
 */
export const removeElementsByCopySet = (
  html: string,
  shouldRemove: (copySet: string) => boolean
): RemoveResult => {
  const regex = new RegExp(COPY_SET_OPEN_TAG.source, "gi");

  const foundSet = new Set<string>();
  const ranges: Array<{ start: number; end: number; copySet: string; tagName: string }> = [];

  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const tagName = match[1];
    const copySet = match[3].trim();

    if (copySet) foundSet.add(copySet);
    if (!copySet || !shouldRemove(copySet)) continue;

    const openStart = match.index;
    const openEnd = match.index + match[0].length;

    const isVoid =
      VOID_TAGS.has(tagName.toLowerCase()) || match[0].endsWith("/>");

    let end = openEnd;

    if (!isVoid) {
      const close = findMatchingCloseIndex(html, tagName, openEnd);

      if (!close) {
        // 닫는 태그를 찾지 못하면 구조가 깨질 수 있으므로 삭제하지 않는다
        console.error(
          `[recovery] 닫는 태그를 찾지 못해 건너뜁니다: <${tagName} data-copy-set="${copySet}">`
        );
        continue;
      }

      end = close.closeEnd;
    }

    ranges.push({ start: openStart, end, copySet, tagName });
  }

  // 중첩 제거: 앞선 범위에 포함되는 항목은 제외 (바깥 요소가 이미 삭제)
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: typeof ranges = [];
  let lastEnd = -1;

  for (const r of ranges) {
    if (r.start < lastEnd) continue;
    merged.push(r);
    lastEnd = r.end;
  }

  // 뒤에서부터 제거해야 인덱스가 밀리지 않는다
  let result = html;

  for (let i = merged.length - 1; i >= 0; i--) {
    const { start, end } = expandRange(result, merged[i].start, merged[i].end);
    result = result.slice(0, start) + result.slice(end);
  }

  return {
    html: result,
    removed: merged.map((r) => ({ copySet: r.copySet, tagName: r.tagName })),
    foundInHtml: Array.from(foundSet),
  };
};
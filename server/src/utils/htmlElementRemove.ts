// data-copy-set 속성을 가진 여는 태그
const TAG_WITH_COPY_SET =
  /<[a-zA-Z][\w:-]*\b[^>]*\sdata-copy-set\s*=\s*(["'])[^"']*\1[^>]*>/gi;

// 태그 안의 data-copy-set 속성 (앞 공백 포함)
const COPY_SET_ATTR = /\sdata-copy-set\s*=\s*(["'])([^"']*)\1/i;

// 여는 태그의 태그명
const TAG_NAME = /^<([a-zA-Z][\w:-]*)/;

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
 * shouldRemove가 true를 반환하는 data-copy-set 속성을 제거한다.
 * 요소와 내부 콘텐츠는 그대로 두고 속성만 삭제한다.
 */
export const removeElementsByCopySet = (
  html: string,
  shouldRemove: (copySet: string) => boolean
): RemoveResult => {
  const foundSet = new Set<string>();
  const removed: RemovedElement[] = [];

  const result = html.replace(
    new RegExp(TAG_WITH_COPY_SET.source, "gi"),
    (tag) => {
      const attrMatch = tag.match(COPY_SET_ATTR);
      if (!attrMatch) return tag;

      const copySet = attrMatch[2].trim();
      if (!copySet) return tag;

      foundSet.add(copySet);

      if (!shouldRemove(copySet)) return tag;

      const tagName = tag.match(TAG_NAME)?.[1] ?? "";

      removed.push({ copySet, tagName });

      // 속성만 제거 (앞 공백 포함)
      return tag.replace(COPY_SET_ATTR, "");
    }
  );

  return {
    html: result,
    removed,
    foundInHtml: Array.from(foundSet),
  };
};
const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",   "&reg;": "®",   "&trade;": "™",
  "&copy;": "©",  "&nbsp;": " ",  "&quot;": '"',
  "&#39;": "'",   "&apos;": "'",  "&lt;": "<",     "&gt;": ">",
};

const ENTITY_REGEX = /&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/gi;

/** HTML 엔티티를 실제 문자로 복원 */
const decodeEntities = (text: string): string => {
  return text.replace(ENTITY_REGEX, (m) => {
    const lower = m.toLowerCase();
    if (ENTITY_MAP[lower]) return ENTITY_MAP[lower];

    const num = lower.match(/^&#(x?)([0-9a-f]+);$/);
    if (num) {
      try {
        return String.fromCodePoint(parseInt(num[2], num[1] ? 16 : 10));
      } catch {
        return m;
      }
    }
    return m;
  });
};

/**
 * 영문 원문을 매칭 key로 정규화한다.
 * HTML 원본과 Excel 카피덱 사이의 표기 차이를 흡수하는 것이 목적이며,
 * 반환값은 매칭 전용이다. 실제 출력에는 사용하지 않는다.
 */
export const normalizeKey = (raw: string): string => {
  if (!raw) return "";

  return decodeEntities(raw)
    // HTML 태그 제거 (<br>, <strong> 등이 섞여 들어오는 경우)
    .replace(/<[^>]+>/g, " ")
    // 스마트 따옴표 → 직선 (Excel 자동 고침 대응)
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // 각종 대시 → 하이픈
    .replace(/[\u2010-\u2015]/g, "-")
    // 비단절 공백·제로폭 문자 정리
    .replace(/[\u00A0\u2000-\u200B\uFEFF]/g, " ")
    // 줄바꿈 포함 모든 공백 → 단일 공백
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

/** 리포트 표시용 축약 */
export const truncate = (text: string, max = 45): string => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}…`;
};
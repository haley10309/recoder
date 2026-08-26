import { resolveLocale } from "../../data/localMap";
import { normalizeKey, truncate } from "../../utils/schemaMatch";
import { UnpackRow } from "../../types/unpack.types";
import {
  LocalizeContext,
  SchemaHandler,
  SchemaReport,
  addEntry,
  isType,
} from "../../types/schema.types";
import { faqPageHandler } from "./handlers/faqPage";
import { videoObjectHandler } from "./handlers/videoObject";

// 신규 Schema 타입은 핸들러 파일 추가 후 이 배열에만 등록하면 된다
const HANDLERS: SchemaHandler[] = [faqPageHandler, videoObjectHandler];

// Key가 SCHEMA-로 시작하는 행만 스키마 작업 대상
export const SCHEMA_KEY_REGEX = /^SCHEMA-/i;

const SCRIPT_REGEX =
  /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

/** 스키마 작업 대상 행이 존재하는지 판별 */
export const hasSchemaRows = (rows: UnpackRow[]): boolean => {
  return rows.some((r) => SCHEMA_KEY_REGEX.test(r.key ?? ""));
};

/** 정규화된 영문 → 로컬 카피 Map 구성 */
const buildCopyMap = (
  rows: UnpackRow[],
  report: SchemaReport
): Map<string, string> => {
  const map = new Map<string, string>();
  const seenBy = new Map<string, string>();

  for (const row of rows) {
    if (!SCHEMA_KEY_REGEX.test(row.key ?? "")) continue;

    const rowKey = row.key ?? "-";
    const normalized = normalizeKey(row.original_copy ?? "");
    const localized = (row.translated_copy ?? "").trim();

    if (!normalized) continue;

    if (!localized) {
      addEntry(report, {
        status: "warning",
        schemaType: "-",
        index: 0,
        field: rowKey,
        before: truncate(row.original_copy ?? ""),
        message: "로컬 카피가 비어 있어 건너뜁니다.",
      });
      continue;
    }

    const existing = map.get(normalized);

    if (existing !== undefined) {
      if (existing !== localized) {
        addEntry(report, {
          status: "warning",
          schemaType: "-",
          index: 0,
          field: rowKey,
          before: truncate(row.original_copy ?? ""),
          message: `동일한 영문이 ${seenBy.get(normalized)}와 중복됩니다. 첫 번째 값을 사용합니다.`,
        });
      }
      continue;
    }

    map.set(normalized, localized);
    seenBy.set(normalized, rowKey);
  }

  return map;
};

/** @graph, 배열, 중첩 구조를 모두 순회하며 각 객체 노드를 방문한다 */
const walk = (node: any, visit: (n: any) => void): void => {
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, visit));
    return;
  }

  if (node && typeof node === "object") {
    visit(node);
    Object.values(node).forEach((v) => walk(v, visit));
  }
};

/** 원본 JSON의 들여쓰기 폭을 추정 (diff 최소화용) */
const detectIndent = (jsonText: string): number => {
  const m = jsonText.match(/\n([ \t]+)["{[]/);
  if (!m) return 2;
  return m[1].includes("\t") ? 2 : m[1].length;
};

export interface SchemaLocalizeResult {
  html: string;
  report: SchemaReport | null;
}

/**
 * HTML 내 JSON-LD Schema를 로컬 카피로 치환한다.
 * Key가 SCHEMA-로 시작하는 행이 없으면 아무것도 하지 않는다.
 */
export const localizeSchema = (
  html: string,
  rows: UnpackRow[],
  countryCode: string
): SchemaLocalizeResult => {
  if (!hasSchemaRows(rows)) {
    return { html, report: null };
  }

  const locale = resolveLocale(countryCode);

  const report: SchemaReport = {
    countryCode,
    locale: locale ?? "-",
    entries: [],
    totalTargets: 0,
    replacedCount: 0,
    warningCount: 0,
    errorCount: 0,
  };

  // locale이 확인되지 않으면 치환하지 않는다 (잘못된 값 주입 방지)
  if (!locale) {
    addEntry(report, {
      status: "error",
      schemaType: "-",
      index: 0,
      field: "countryCode",
      before: countryCode || "(없음)",
      message: "매핑 테이블에 없는 국가코드입니다. Schema 치환을 중단했습니다.",
    });
    return { html, report };
  }

  const copyMap = buildCopyMap(rows, report);

  if (copyMap.size === 0) {
    addEntry(report, {
      status: "error",
      schemaType: "-",
      index: 0,
      field: "copyDeck",
      message: "SCHEMA 행은 있으나 사용 가능한 로컬 카피가 없습니다.",
    });
    return { html, report };
  }

  const ctx: LocalizeContext = { copyMap, locale, report };
  const typeCounter = new Map<string, number>();
  let foundScript = false;

  const converted = html.replace(SCRIPT_REGEX, (full, jsonText: string) => {
    foundScript = true;

    const trimmed = jsonText.trim();
    if (!trimmed) return full;

    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      addEntry(report, {
        status: "error",
        schemaType: "-",
        index: 0,
        field: "JSON-LD",
        message: "JSON 파싱에 실패하여 해당 script를 건너뛰었습니다.",
      });
      return full;
    }

    let changed = false;

    walk(parsed, (node) => {
      for (const handler of HANDLERS) {
        if (!isType(node, handler.type)) continue;

        const index = (typeCounter.get(handler.type) ?? 0) + 1;
        typeCounter.set(handler.type, index);

        if (handler.localize(node, index, ctx)) changed = true;
      }
    });

    if (!changed) return full;

    const indent = detectIndent(jsonText);

    // script 태그 조기 종료 방지
    const serialized = JSON.stringify(parsed, null, indent)
      .replace(/<\/script>/gi, "<\\/script>");

    return full.replace(jsonText, `\n${serialized}\n`);
  });

  if (!foundScript) {
    addEntry(report, {
      status: "error",
      schemaType: "-",
      index: 0,
      field: "JSON-LD",
      message: "HTML에서 application/ld+json script를 찾지 못했습니다.",
    });
  }

  return { html: converted, report };
};
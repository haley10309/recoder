import { normalizeKey, truncate } from "../../../utils/schemaMatch";
import { LocalizeContext, SchemaHandler, addEntry, isType, toArray } from "../../../types/schema.types";

const SCHEMA_TYPE = "FAQPage";

/**
 * 영문 원문으로 로컬 카피를 찾아 치환한다.
 * 매칭 실패 시 원문을 유지하고 경고를 남긴다.
 */
const translateField = (
  owner: any,
  field: string,
  label: string,
  index: number,
  ctx: LocalizeContext
): boolean => {
  const original = owner?.[field];
  if (typeof original !== "string" || !original.trim()) return false;

  const localized = ctx.copyMap.get(normalizeKey(original));

  // 이미 로컬 카피와 동일하면 치환 대상에서 제외
  if (localized === original) return false;

  ctx.report.totalTargets += 1;

  if (!localized) {
    addEntry(ctx.report, {
      status: "warning",
      schemaType: SCHEMA_TYPE,
      index,
      field: label,
      before: truncate(original),
      message: "카피덱에 매칭되는 항목이 없어 원문을 유지했습니다.",
    });
    return false;
  }

  owner[field] = localized;

  addEntry(ctx.report, {
    status: "success",
    schemaType: SCHEMA_TYPE,
    index,
    field: label,
    before: truncate(original),
    after: truncate(localized),
  });

  return true;
};

export const faqPageHandler: SchemaHandler = {
  type: SCHEMA_TYPE,

  localize(node: any, index: number, ctx: LocalizeContext): boolean {
    let changed = false;

    // inLanguage
    if (node.inLanguage !== ctx.locale) {
      const before = node.inLanguage;
      node.inLanguage = ctx.locale;
      changed = true;

      ctx.report.totalTargets += 1;
      addEntry(ctx.report, {
        status: "success",
        schemaType: SCHEMA_TYPE,
        index,
        field: "inLanguage",
        before: before ?? "(없음)",
        after: ctx.locale,
      });
    }

    // mainEntity — 단일 객체와 배열 모두 허용
    const questions = toArray<any>(node.mainEntity);

    if (questions.length === 0) {
      addEntry(ctx.report, {
        status: "warning",
        schemaType: SCHEMA_TYPE,
        index,
        field: "mainEntity",
        message: "Question 항목이 없습니다.",
      });
      return changed;
    }

    for (const q of questions) {
      if (!isType(q, "Question")) continue;

      // Question.name
      if (translateField(q, "name", "Question", index, ctx)) changed = true;

      // acceptedAnswer.text — 배열로 오는 경우도 처리
      for (const a of toArray<any>(q.acceptedAnswer)) {
        if (translateField(a, "text", "Answer", index, ctx)) changed = true;
      }
    }

    return changed;
  },
};
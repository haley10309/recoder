import { normalizeKey, truncate } from "../../../utils/schemaMatch";
import { LocalizeContext, SchemaHandler, addEntry } from "../../../types/schema.types";

const SCHEMA_TYPE = "VideoObject";

const translateField = (
  owner: any,
  field: string,
  index: number,
  ctx: LocalizeContext
): boolean => {
  const original = owner?.[field];
  if (typeof original !== "string" || !original.trim()) return false;

  const localized = ctx.copyMap.get(normalizeKey(original));

  if (localized === original) return false;

  ctx.report.totalTargets += 1;

  if (!localized) {
    addEntry(ctx.report, {
      status: "warning",
      schemaType: SCHEMA_TYPE,
      index,
      field,
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
    field,
    before: truncate(original),
    after: truncate(localized),
  });

  return true;
};

export const videoObjectHandler: SchemaHandler = {
  type: SCHEMA_TYPE,

  localize(node: any, index: number, ctx: LocalizeContext): boolean {
    let changed = false;

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

    if (translateField(node, "name", index, ctx)) changed = true;
    if (translateField(node, "description", index, ctx)) changed = true;

    return changed;
  },
};
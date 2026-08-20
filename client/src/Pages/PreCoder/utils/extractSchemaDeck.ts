// Pre Coder "schema deck 추출" 핵심 로직.
// index_pim html 안의 application/ld+json에서 FAQPage / VideoObject를 찾아
// recoder용 카피덱 row로 변환한다.
//
// - FAQPage:
//   mainEntity[].name -> Questions (original_copy)
//   mainEntity[].acceptedAnswer.text -> Answer (original_copy)
// - VideoObject:
//   name -> Name (original_copy)
//   description -> Description (original_copy)
// - inLanguage는 추출 결과에서 사용하지 않는다.
//
// schema 자체에는 data-copy-set을 넣지 않기 때문에 target_selector/apply_type은
// 비워 둔다. 이 기능은 우선 "schema deck 추출"을 담당하며, schema 적용은 별도 로직이 필요하다.

export type SchemaDeckRow = {
  key: string;
  targetSelector: string;
  applyType: string;
  excludeSup: boolean;
  enableTextTransform: boolean;
  category: string;
  item: string;
  originalCopy: string;
  remark: string;
  locales: Record<string, string>;
};

export type SchemaDeckWarning = {
  message: string;
};

export type SchemaDeckResult = {
  rows: SchemaDeckRow[];
  localeCodes: string[];
  warnings: SchemaDeckWarning[];
};

type JsonLdObject = Record<string, any>;

const normalize = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFC")
    .trim();

const asTypeSet = (value: unknown): Set<string> => {
  if (Array.isArray(value)) {
    return new Set(value.map(normalize).filter(Boolean));
  }
  const type = normalize(value);
  return type ? new Set([type]) : new Set();
};

const getSchemaObjects = (value: any): JsonLdObject[] => {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => getSchemaObjects(entry));
  }
  if (value && typeof value === "object") {
    // @graph 안에 FAQPage / VideoObject가 들어있는 JSON-LD도 지원한다.
    if (Array.isArray(value["@graph"])) {
      const ownObject = { ...value };
      delete ownObject["@graph"];
      return [
        ...(Object.keys(ownObject).length > 0 ? [ownObject] : []),
        ...value["@graph"].flatMap((entry: any) => getSchemaObjects(entry)),
      ];
    }
    return [value];
  }
  return [];
};

const pushRow = (
  rows: SchemaDeckRow[],
  input: {
    category: string;
    item: string;
    copy: string;
  }
) => {
  const copy = normalize(input.copy);
  if (!copy) return;

  // Schema에서 추출한 모든 원문은 original_copy에 넣는다.
  // CA_FR은 로컬 법인이 번역/작성하여 회신하는 영역이므로 추출 단계에서는 비워 둔다.
  // inLanguage는 원문 위치를 판단하는 용도가 아니라 Remark에만 기록한다.
  const locales: Record<string, string> = {};
  const originalCopy = copy;

  rows.push({
    key: `SCHEMA-${String(rows.length + 1).padStart(3, "0")}`,
    targetSelector: "",
    applyType: "",
    excludeSup: false,
    enableTextTransform: false,
    category: input.category,
    item: input.item,
    originalCopy,
    remark: "",
    locales,
  });
};

export const extractSchemaDeckFromHtml = (htmlText: string): SchemaDeckResult => {
  const rows: SchemaDeckRow[] = [];
  const localeCodes: string[] = [];
  const warnings: SchemaDeckWarning[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));

  if (scripts.length === 0) {
    return {
      rows: [],
      localeCodes: [],
      warnings: [{ message: 'HTML에서 <script type="application/ld+json">를 찾지 못했습니다.' }],
    };
  }

  scripts.forEach((script, scriptIndex) => {
    const raw = script.textContent || "";
    if (!normalize(raw)) return;

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      warnings.push({
        message: `${scriptIndex + 1}번째 JSON-LD script의 JSON 파싱에 실패해 건너뛰었습니다.`,
      });
      return;
    }

    const objects = getSchemaObjects(parsed);

    objects.forEach((schema) => {
      const types = asTypeSet(schema["@type"]);

      if (types.has("FAQPage")) {
        const mainEntity = Array.isArray(schema.mainEntity) ? schema.mainEntity : [];

        mainEntity.forEach((question: any) => {
          const questionTypes = asTypeSet(question?.["@type"]);
          if (!questionTypes.has("Question")) return;

          pushRow(rows, {
            category: "FAQ",
            item: "Questions",
            copy: question?.name,
          });

          const answer = question?.acceptedAnswer;
          const answerTypes = asTypeSet(answer?.["@type"]);
          if (answer && (answerTypes.size === 0 || answerTypes.has("Answer"))) {
            pushRow(rows, {
              category: "FAQ",
              item: "Answer",
              copy: answer?.text,
            });
          }
        });
      }

      if (types.has("VideoObject")) {
        pushRow(rows, {
          category: "Video Object",
          item: "Name",
          copy: schema.name,
        });

        pushRow(rows, {
          category: "Video Object",
          item: "Description",
          copy: schema.description,
        });
      }
    });
  });

  if (rows.length === 0) {
    warnings.push({
      message: 'FAQPage 또는 VideoObject schema를 찾지 못했습니다.',
    });
  }

  return { rows, localeCodes, warnings };
};

export type ReportStatus = "success" | "warning" | "error";

export interface ReportEntry {
  status: ReportStatus;
  schemaType: string;      // "FAQPage" | "VideoObject" | "-"
  index: number;           // 같은 타입 내 순번 (1부터)
  field: string;           // "Question" | "Answer" | "inLanguage" | "name"
  before?: string;
  after?: string;
  message?: string;
}

export interface SchemaReport {
  countryCode: string;
  locale: string;
  entries: ReportEntry[];
  totalTargets: number;    // 치환 시도 대상 수
  replacedCount: number;   // 실제 치환된 수
  warningCount: number;
  errorCount: number;
}

export interface LocalizeContext {
  /** 정규화된 영문 → 로컬 카피 */
  copyMap: Map<string, string>;
  locale: string;
  report: SchemaReport;
}

export interface SchemaHandler {
  /** 담당하는 @type 값 */
  type: string;

  /**
   * 파싱된 JSON-LD 노드를 로컬라이징한다.
   * @returns 변경이 발생했으면 true
   */
  localize(node: any, index: number, ctx: LocalizeContext): boolean;
}

/** 리포트 기록 헬퍼 */
export const addEntry = (report: SchemaReport, entry: ReportEntry): void => {
  report.entries.push(entry);

  if (entry.status === "warning") report.warningCount += 1;
  if (entry.status === "error") report.errorCount += 1;
  if (entry.status === "success") report.replacedCount += 1;
};

/** @type이 문자열/배열 어느 쪽이든 일치 여부 판별 */
export const isType = (node: any, type: string): boolean => {
  const t = node?.["@type"];
  return Array.isArray(t) ? t.includes(type) : t === type;
};

/** 단일 객체와 배열을 모두 배열로 정규화 */
export const toArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};
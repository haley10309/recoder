export interface SavePreCoderResultBody {
  title?: string;
  copyDeckJson: string;
  resultJson: string;
}

export type FaqCopyDeckLocaleColumn = {
  code: string; // 예: "CA_FR"
  label: string; // 예: "French"
};

export type FaqCopyDeckRow = {
  key: string;
  category: string;
  item: string; // "Questions" | "Answer"
  copy: string;
  remark: string;
  locales: Record<string, string>; // localeColumn.code를 key로 하는 원본 그대로의 로컬 국가 컬럼 값
};

export type ExtractFaqCopyDeckResponse =
  | { success: true; row_list: FaqCopyDeckRow[]; locale_columns: FaqCopyDeckLocaleColumn[] }
  | { success: false; error: string };

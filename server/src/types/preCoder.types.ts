export interface PreCoderResultSummary {
  id: number;
  title: string;
  html_filename: string;
  excel_filename: string;
  created_by_name: string | null;
  created_at: string;
}

export interface PreCoderResultDetail extends PreCoderResultSummary {
  html_content: string;
  copy_deck_json: string; // CopyDeckRow[] (JSON string)
  result_json: string; // PreCoderAnalysisResult (JSON string)
}

export interface SavePreCoderResultBody {
  title?: string;
  copyDeckJson: string;
  resultJson: string;
}

export type FaqCopyDeckRow = {
  key: string;
  category: string;
  item: string; // "Questions" | "Answer"
  copy: string;
  remark: string;
};

export type ExtractFaqCopyDeckResponse =
  | { success: true; row_list: FaqCopyDeckRow[] }
  | { success: false; error: string };

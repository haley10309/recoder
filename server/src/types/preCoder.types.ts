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

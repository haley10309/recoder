type JsonStringified<T> = string & { __type: T };

export type UnpackRow = {
  /** DB의 PK값 */
  id?: number;
  /** 엑셀에서 단순구분을 위한 값 (unique한 값 아님) */
  row_order?: number;
  target_selector: string;
  apply_type: string;
  exclude_sup: boolean;
  enable_text_transform: boolean;
  original_copy?: string;
  translated_copy?: string;
  processed_translated_copy?: string;
};

export type ExtractUnpackExcelResponse =
  | { success: true; row_list: UnpackRow[] }
  | { success: false; error: string };
  
export type GetUnpackTemplateDetailsBody = {
  // 언팩용 직관적인 변수명으로 수정하는 것이 좋음 (다만 중요한 부분 아니므로 일단 작업 생략) 
  ticket_num: string;
  ticket_url: string;
};

export type GetUnpackTemplateDetailsResponse =
  | { success: true; templateId: number; row_list: UnpackRow[] }
  | { success: false; error: string };

export type SaveUnpackTemplateBody = { 
  ticket_num: string;
  ticket_url: string;
  row_list: UnpackRow[];
}

export type SaveUnpackTemplateResponse =
  | { success: false; error: string }
  | { success: true }

export type GetUnpackTemplateDetailsWithExcelBody = {
  ticket_num: string;
  ticket_url: string;
  country_code: string;
  // +) file
};

export type GetUnpackTemplateDetailsWithExcelResponse =
  | { success: true; row_list: UnpackRow[] }
  | { success: false; error: string };

export type ProcessCopyBody = {
  row_list: UnpackRow[];
};

export type ProcessCopyResponse =
  | { success: true; row_list: UnpackRow[] }
  | { success: false; error: string };

export type ApplyToHtmlBody = {
  /** JSON.stringify(UnpackRow[]) — multipart form-data라 string으로 수신 */
  row_list: JsonStringified<UnpackRow[]>; 
};
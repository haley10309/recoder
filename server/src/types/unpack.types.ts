type JsonStringified<T> = string & { __type: T };

export type UnpackRow = {
  /** DB의 PK값 */
  id?: number;
  /** 엑셀에서 단순구분을 위한 값 (unique한 값 아님) */
  row_order?: number;

  /**
   * 엑셀의 Key 컬럼.
   * "SCHEMA-"로 시작하면 JSON-LD Schema 치환 대상으로 분류된다.
   */
  key?: string;

  /** Schema 행은 비어 있음 */
  target_selector: string;
  /** Schema 행은 비어 있음 */
  apply_type: string;

  exclude_sup: boolean;
  enable_text_transform: boolean;

  /** Schema 치환 시 매칭 key로 사용되는 영문 원문 */
  original_copy?: string;
  translated_copy?: string;
  processed_translated_copy?: string;

  /** 엑셀의 Category 컬럼 (예: "FAQ") */
  category?: string;
  /** 엑셀의 Item 컬럼 (예: "Question" | "Answer") */
  item?: string;
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
};

export type SaveUnpackTemplateResponse =
  | { success: false; error: string }
  | { success: true };

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

  /**
   * COUNTRY 영역에서 선택한 국가코드 (예: "CA_FR").
   * Schema 치환 시 inLanguage 값 도출에 사용된다.
   */
  country_code?: string;
};
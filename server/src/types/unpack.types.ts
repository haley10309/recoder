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
};

export type ExtractUnpackExcelResponse =
  | { success: true; row_list: UnpackRow[] }
  | { success: false; error: string };

  
  
export type GetUnpackTemplateDetailsBody = {
  ticket_num: string;
  ticket_url: string;
};

export type GetUnpackTemplateDetailsResponse =
  | { templateId: number; row_list: UnpackRow[] }
  | { error: string };

export type SaveUnpackTemplateBody = { 
  ticket_num: string;
  ticket_url: string;
  row_list: UnpackRow[];
}

export type SaveUnpackTemplateResponse =
  | { success: false; error: string }
  | { success: true }
export type UnpackRow = {
  row_order?: number;
  target_selector: string;
  apply_type: string;
  exclude_sup: boolean;
  enable_text_transform: boolean;
  original_copy?: string;
  translated_copy?: string;
};

export type SaveUnpackExcelTemplateBody = { 
  ticket_num: string;
  ticket_url: string;
  row_list: UnpackRow[];
}

export type SaveUnpackExcelTemplateResponse =
  | { success: false; error: string }
  | { success: true }

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
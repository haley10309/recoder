export type Variation = {
  aswas_code_variation: string;
  tobe_code_variation?: string;
  description?: string;
  countries?: string[];
};

export type CodeChange = {
  ppt_no: string;
  aswas_code: string;
  tobe_code: string;
  variations?: Variation[];
};

export type CreateTemplateBody = {
  ticket_num: string;
  ticket_url: string;
  code_changes: string; // stringified된 code_changes 문자열
};

export type UpdateTemplateBody = {
  ticket_num: string;
  ticket_url: string;
  code_changes: string; // stringified된 code_changes 문자열
};

// update 시 기존 row는 id가 있고, 새 row는 없음
export type CodeChangeWithId = CodeChange & {
  id?: number;
};

// updateTemplate 응답 타입
export type UpdateTemplateResponse =
  | { error: string }
  | { message: string };

// getTemplateDetails 요청/응답 타입
export type GetTemplateDetailsBody = {
  ticket_num: string;
  ticket_url: string;
};

export type GetTemplateDetailsResponse =
  | { error: string }
  | {
      templateId: number;
      codeChanges: TemplateCodeChangeRow[];
      localizationEntries: TemplateLocalizationEntryRow[];
    };

// DB row 타입
export interface TemplateRow {
  id: number;
  ticket_num: string;
  ticket_url: string;
  deleted_at: string | null;
}

export interface TemplateCodeChangeIdRow {
  id: number;
}

export interface TemplateCodeChangeRow {
  id: number;
  ppt_no: string;
  aswas_code: string;
  tobe_code: string;
  variations: TemplateVariationRow[];  // 추가
}

export interface TemplateLocalizationEntryRow {
  id: number;
  code_context: string;
}

// variation DB row
export interface TemplateVariationRow {
  id: number;
  aswas_code_variation: string;
  tobe_code_variation: string;
  description: string | null;
  countries: string[];  // 후처리로 붙임
}

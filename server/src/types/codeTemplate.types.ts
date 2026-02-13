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

export type UpdateTemplateResponse =
  | { error: string }
  | { message: string };

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

export type GetTemplatesResponse =
  | { error: string }
  | Pick<TemplateRow, "id" | "ticket_num" | "ticket_url">[];

export type CheckTemplateBody = {
  ticket_num: string;
  ticket_url: string;
};

export type CheckTemplatesResponse =
  | { error: string }
  | { isTemplateExist: boolean };

export type GuideUploadResponse =
  | { error: string }
  | {
      pptNos: string[];
      asWasCodes: string[];
      toBeCodes: string[];
    };

export type ConvertCodesBody = {
  codeChanges: string; // JSON.parse 해서 쓰니까 string으로 들어옴
  ticket_url: string;
  countryCode: string;
};

// JSON.parse 후 각 항목
// TODO: CodeChange랑 겹쳐서 합쳐야될듯
export type CodeChangePair = {
  asWasCode: string;
  toBeCode: string;
  variations?: Variation[];
};

// changeResults 각 항목
export type ChangeResult = {
  pairIndex: number;
  changed: boolean;
  matchedPart?: string[];  // [frontMatch, backMatch] 또는 빈 배열
};

export type ConvertCodesResponse =
  | { success: false; message: string }
  | {
      success: true;
      changeResults: ChangeResult[];
      filename: string;
      fileContent: string;
    };

// extractEnglishCopyList 유틸 반환 타입
export type ExtractCopyResult =
  | { errorMsg: string; statusCode: number }
  | { englishCopyList: string[] };

// 컨트롤러 응답 타입
export type ExtractCopyResponse =
  | { error: string }
  | { englishCopyList: string[] };

// updateLocalizationEntries 요청 body
export type UpdateLocalizationEntriesBody = {
  ticket_num: string;
  ticket_url: string;
  localization_entries?: LocalizationEntryInput[];
  delete_ids?: number[];
};

// localization entry 입력 (id 있으면 update, 없으면 insert)
export type LocalizationEntryInput = {
  id?: number;
  code_context: string;
};

// updateLocalizationEntries 응답
export type UpdateLocalizationEntriesResponse =
  | { success: false; message: string }
  | { success: true };

export type ParseTranslationFileResponse =
  | { error: string }
  | {
      validCountries: string[];
      invalidCountries: string[];
      translations: Record<string, string[]>;
      englishCopyList: string[];
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

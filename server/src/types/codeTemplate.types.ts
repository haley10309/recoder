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
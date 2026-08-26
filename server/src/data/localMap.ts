/**
 * Samsung.com site code → JSON-LD inLanguage 값 매핑.
 * 시트 기준 90개 사이트.
 */
export const SITE_LOCALE_MAP: Record<string, string> = {
  AE: "en-AE",         AE_AR: "ar-AE",      AFRICA_EN: "en-BW",
  AFRICA_FR: "fr-BF",  AFRICA_PT: "pt-AO",  AL: "sq-AL",
  AR: "es-AR",         AT: "de-AT",         AU: "en-AU",
  AZ: "az-AZ",         BA: "bs-BA",         BD: "en-BD",
  BE: "nl-BE",         BE_FR: "fr-BE",      BG: "bg-BG",

  BR: "pt-BR",         CA: "en-CA",         CA_FR: "fr-CA",
  CH: "de-CH",         CH_FR: "fr-CH",      CL: "es-CL",
  CN: "zh-CN",         CO: "es-CO",         CZ: "cs-CZ",
  DE: "de-DE",         DK: "da-DK",         EE: "et-EE",
  EG: "ar-EG",         ES: "es-ES",         FI: "fi-FI",

  FR: "fr-FR",         GR: "el-GR",         HK: "zh-HK",
  HK_EN: "en-HK",      HR: "hr-HR",         HU: "hu-HU",
  ID: "id-ID",         IE: "en-IE",         IL: "he-IL",
  IN: "en-IN",         IQ_AR: "ar-IQ",      IQ_KU: "ku-IQ",
  IRAN: "fa-IR",       IT: "it-IT",         JP: "ja-JP",

  KZ_KZ: "kk-KZ",      KZ_RU: "ru-KZ",      LATIN: "es-PA",
  LATIN_EN: "en-TT",   LB: "en-LB",         LEVANT: "en-JO",
  LEVANT_AR: "ar-JO",  LT: "lt-LT",         LV: "lv-LV",
  MK: "mk-MK",         MM: "my-MM",         MN: "mn-MN",
  MX: "es-MX",         MY: "en-MY",         N_AFRICA: "fr-MA",

  NL: "nl-NL",         NO: "no-NO",         NZ: "en-NZ",
  PE: "es-PE",         PH: "en-PH",         PK: "en-PK",
  PL: "pl-PL",         PT: "pt-PT",         PY: "es-PY",
  RO: "ro-RO",         RS: "sr-RS",         RU: "ru-RU",
  SA: "ar-SA",         SA_EN: "en-SA",      SE: "sv-SE",

  SG: "en-SG",         SI: "sl-SI",         SK: "sk-SK",
  TH: "th-TH",         TR: "tr-TR",         TW: "zh-TW",
  UA: "uk-UA",         UK: "en-GB",         US: "en-US",
  UY: "es-UY",         UZ_RU: "ru-UZ",      UZ_UZ: "uz-UZ",
  VN: "vi-VN",         ZA: "en-ZA",         SEC: "ko-KR",
};

/**
 * 국가코드로 inLanguage 값을 조회한다.
 * 대소문자와 하이픈 표기(ca-fr, ae_ar)를 모두 허용한다.
 */
export const resolveLocale = (countryCode: string): string | null => {
  if (!countryCode) return null;

  const normalized = countryCode.trim().toUpperCase().replace(/-/g, "_");
  return SITE_LOCALE_MAP[normalized] ?? null;
};
import { Request, Response } from "express";

const escapeRegExp = (str: string): string => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * HTML 문자열에서 텍스트 노드 + 속성값을 추출.
 * 브라우저의 getTextWithAttributes(DOMParser)와 동일한 역할.
 */
const extractTextsFromHtml = (html: string): string => {
  const texts: string[] = [];

  const textContent = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (textContent) texts.push(textContent);

  const attrRegex = /\s[\w\-:]+="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(html)) !== null) {
    if (match[1].trim()) texts.push(match[1].trim());
  }

  return texts.join("\n");
};

/**
 * tobeHtmlFileContent 내에서 blockCode가 몇 번 등장하는지 카운트.
 * 클라이언트의 countOccurrences(originalTobeCode)와 동일.
 */
const countOccurrences = (tobeHtmlContent: string, blockCode: string): number => {
  if (!tobeHtmlContent || !blockCode) return 0;
  const escaped = escapeRegExp(blockCode.trim().replace(/\s+/g, " "));
  const normalizedHtml = tobeHtmlContent.replace(/\s+/g, " ");
  const matches = normalizedHtml.match(new RegExp(escaped, "g"));
  return matches ? matches.length : 0;
};

/**
 * blockCode 안에 포함된 영어 카피 필터링.
 * 클라이언트의 findMatchingEnglishCopies와 동일.
 */
const findMatchingEnglishCopies = (toBeCode: string, englishList: string[]): string[] => {
  if (!toBeCode || !Array.isArray(englishList)) return [];
  return englishList
    .filter((eng) => {
      const cleanedEng = eng.trim().replace(/\s+/g, " ");
      const cleanedHtml = toBeCode.replace(/\s+/g, " ");
      return cleanedHtml.includes(cleanedEng);
    })
    .sort((a, b) => b.length - a.length); // 긴 문자열부터 치환 (짧은 게 먼저 치환되면 긴 것과 겹칠 수 있음)
};

/**
 * 블록 단위로 영어 텍스트를 번역본으로 치환.
 * 클라이언트의 _applyLocalizedTemplateBlocks와 동일.
 */
const applyLocalizedTemplateBlocks = (
  toBeCode: string,
  translationMap: Record<string, string>,
  selectedEnglishCopies: string[],
  tobeHtmlFileContent: string
): string => {
  if (!toBeCode) return "";
  if (countOccurrences(tobeHtmlFileContent, toBeCode) !== 1) return "";

  let localizedToBeCode = toBeCode;
  const blockText = extractTextsFromHtml(localizedToBeCode);

  // 긴 문자열부터 치환 (짧은 게 먼저 치환되면 긴 것과 겹칠 수 있음)
  const sortedCopies = [...selectedEnglishCopies].sort((a, b) => b.length - a.length);

  sortedCopies.forEach((copy) => {
    if (!copy || !translationMap[copy]) return;

    const cleanedCopy = copy.trim().replace(/\s+/g, " ");
    const cleanedBlockText = blockText?.replace(/\s+/g, " ");

    if (cleanedBlockText && cleanedBlockText.includes(cleanedCopy)) {
      const local = translationMap[copy];
      const regex = new RegExp(escapeRegExp(copy), "g");
      localizedToBeCode = localizedToBeCode.replace(regex, local);
    }
  });

  return localizedToBeCode;
};

interface TextareaItem {
  toBeCode?: string;
  selectedEnglishCopies?: string[];
  [key: string]: unknown;
}

interface UpdatedTextareaItem extends TextareaItem {
  matchingEnglishCopies: string[];
  selectedEnglishCopies: string[];
  localizedToBeCode: string;
  errorState: boolean;
}

/**
 * POST /apply-localization
 *
 * multipart/form-data:
 *   file            : To-Be HTML 파일 (countOccurrences 검증용)
 *   textareas       : JSON string — TextareaItem[]
 *   translationMap  : JSON string — Record<string, string>
 *   englishCopyList : JSON string — string[]
 *
 * response JSON:
 *   success          : boolean
 *   updatedTextareas : UpdatedTextareaItem[]
 */
export const applyLocalization = (req: Request, res: Response): void => {
  const { textareas, translationMap, englishCopyList } = req.body;

  if (!req.file || !textareas || !translationMap || !englishCopyList) {
    res.status(400).json({
      success: false,
      message: "file, textareas, translationMap, englishCopyList are all required.",
    });
    return;
  }

  try {
    const tobeHtmlFileContent = req.file.buffer.toString("utf-8");

    let parsedTextareas: TextareaItem[];
    let parsedTranslationMap: Record<string, string>;
    let parsedEnglishCopyList: string[];

    try {
      parsedTextareas = JSON.parse(textareas);
      parsedTranslationMap = JSON.parse(translationMap);
      parsedEnglishCopyList = JSON.parse(englishCopyList);
    } catch {
      res.status(400).json({ success: false, message: "Invalid JSON in body fields." });
      return;
    }

    const updatedTextareas: UpdatedTextareaItem[] = parsedTextareas.map((textarea) => {
      const matchingEnglishCopies = findMatchingEnglishCopies(
        textarea.toBeCode ?? "",
        parsedEnglishCopyList
      );

      // 명시적으로 배열이 넘어오면 그대로 사용 (빈 배열 = 번역 안함)
      // undefined/null인 경우만 matchingEnglishCopies로 fallback
      const selectedEnglishCopies = Array.isArray(textarea.selectedEnglishCopies)
        ? textarea.selectedEnglishCopies
        : matchingEnglishCopies;

      const localizedToBeCode = applyLocalizedTemplateBlocks(
        textarea.toBeCode ?? "",
        parsedTranslationMap,
        selectedEnglishCopies,
        tobeHtmlFileContent
      );

      const errorState = Object.keys(parsedTranslationMap).some((key) =>
        localizedToBeCode.includes(key)
      );

      return {
        ...textarea,
        matchingEnglishCopies,
        selectedEnglishCopies,
        localizedToBeCode,
        errorState,
      };
    });

    res.json({ success: true, updatedTextareas });
  } catch (error) {
    console.error("[applyLocalization] Error:", error);
    res.status(500).json({ success: false, message: "Error processing localization." });
  }
};
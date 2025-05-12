/**
 * 코드 문자열에서 공백, 세미콜론, 따옴표, 쉼표, 괄호를 제거하여 비교를 위한 일관된 문자열로 변환합니다.
 * 제거 대상 문자: 공백, ; " ' , ( )
 */
export const normalizeCode = (code) => {
  return code.replace(/[\s;"',()]/g, '');
};

/**
 * 코드 문자열에서 normalizeCode의 문자 외에도 슬래시(`/`)까지 제거하여 더 간소화된 형태로 변환합니다.
 * 제거 대상 문자: 공백, ; " ' , / ( )
 * → 주로 import 문 등의 경로까지 무시하고 비교해야 하는 경우에 사용합니다.
 */
export const kind_normalizeCode = (code) => {
  return code.replace(/[\s;"',/()]/g, "");
};

/**
 * 원본 파일 내에서 특정 코드 조각(asWasCode)이 몇 번 등장하는지 계산합니다.
 * normalizeCode를 통해 공백 및 구두점을 제거한 뒤 비교합니다.
 * 주로 기본 코드 패턴의 등장 횟수를 확인할 때 사용합니다.
 */
export const countOccurrences = (fileContent, asWasCode) => {
  if (!fileContent || !asWasCode) return 0;

  const normalizedAsWasCode = normalizeCode(asWasCode);
  const normalizedFileContent = normalizeCode(fileContent);

  let occurrenceCount = 0;
  let startIndex = 0;

  while (
    (startIndex = normalizedFileContent.indexOf(
      normalizedAsWasCode,
      startIndex
    )) !== -1
  ) {
    occurrenceCount++;
    startIndex += normalizedAsWasCode.length;
  }

  return occurrenceCount;
};

/**
 * kind_normalizeCode를 기반으로 비교하여 코드 등장 횟수를 계산합니다.
 * 경로(`/`)를 포함한 다양한 차이도 무시하고 비교가 필요한 경우 사용합니다.
 * 예: import 경로나 괄호/포맷 차이가 있는 코드 비교 시 유용
 */
export const kind_countOccurrences = (fileContent, asWasCode) => {
  if (!fileContent || !asWasCode) return 0;

  const normalizedAsWasCode = kind_normalizeCode(asWasCode);
  const normalizedFileContent = kind_normalizeCode(fileContent);

  let occurrenceCount = 0;
  let startIndex = 0;

  while (
    (startIndex = normalizedFileContent.indexOf(
      normalizedAsWasCode,
      startIndex
    )) !== -1
  ) {
    occurrenceCount++;
    startIndex += normalizedAsWasCode.length;
  }

  return occurrenceCount;
};

export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    // HTTPS + clipboard API 사용 가능
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Clipboard API 에러:", err);
      fallbackCopyTextToClipboard(text);
      return false;
    }
  } else {
    // HTTP 환경 fallback
    const result = fallbackCopyTextToClipboard(text);
    return result;
  }
};

const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  // 모바일 대응: 오프스크린으로 위치
  textArea.style.position = "fixed";
  textArea.style.top = "-1000px";
  textArea.style.left = "-1000px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let result;
  try {
    const successful = document.execCommand("copy");
    if (successful) {
      result = true;
    } else {
      result = false;
    }
  } catch (err) {
    console.error("Fallback 복사 실패:", err);
    result = false;
  }

  document.body.removeChild(textArea);
  return result;
};

/**
 * @returns true: asset, false: non-asset
 */
export const isAssetCode = (str) => {
  return str?.trim().startsWith("//");
};
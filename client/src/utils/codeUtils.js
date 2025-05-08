export const normalizeCode = (code) => {
  return code.replace(/[\s;"',()]/g, '');
};

export const kind_normalizeCode = (code) => {
  return code.replace(/[\s;"',/()]/g, "");
};

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

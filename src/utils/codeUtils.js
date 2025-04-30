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

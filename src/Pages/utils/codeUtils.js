
// utils/codeUtils.js

export const normalizeCode = (code) => {
    return code.replace(/\s+/g, ""); // Remove all whitespace and newlines
  };
  
  export const countOccurrences = (fileContent, asWasCode) => {
    if (!fileContent || !asWasCode) return "null";
  
    const normalizedAsWasCode = normalizeCode(asWasCode);
    const normalizedFileContent = normalizeCode(fileContent);
  
    let occurrenceCount = 0;
    let startIndex = 0;
  
    // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
    while (
      (startIndex = normalizedFileContent.indexOf(
        normalizedAsWasCode,
        startIndex
      )) !== -1
    ) {
      occurrenceCount++;
      startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
    }
  
    return occurrenceCount; // Return the total count of occurrences
  };
  
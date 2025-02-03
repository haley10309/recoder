


// export const normalizeCode = (code) => {
//     return code.replace(/\s+/g, ""); // Remove all whitespace and newlines
//   };
  
//   export const countOccurrences = (fileContent, asWasCode) => {
//     if (!fileContent || !asWasCode) return "null";
  
//     const normalizedAsWasCode = normalizeCode(asWasCode);
//     const normalizedFileContent = normalizeCode(fileContent);
  
//     let occurrenceCount = 0;
//     let startIndex = 0;
  
//     // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
//     while (
//       (startIndex = normalizedFileContent.indexOf(
//         normalizedAsWasCode,
//         startIndex
//       )) !== -1
//     ) {
//       occurrenceCount++;
//       startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
//     }
  
//     return occurrenceCount; // Return the total count of occurrences
//   };
  //==================================================================
// function normalizeCode(code) {
//   // Remove whitespace, newlines, semicolons, and quotes
//   return code.replace(/[\s;"']/g, '');
// }

// function countOccurrences(fileContent, asWasCode) {
//   if (!fileContent || !asWasCode) return "null";

//   const normalizedAsWasCode = normalizeCode(asWasCode);
//   const normalizedFileContent = normalizeCode(fileContent);

//   let occurrenceCount = 0;
//   let startIndex = 0;

//   // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
//   while (
//     (startIndex = normalizedFileContent.indexOf(
//       normalizedAsWasCode,
//       startIndex
//     )) !== -1
//   ) {
//     occurrenceCount++;
//     startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
//   }

//   return occurrenceCount; // Return the total count of occurrences
// }
//==================================================================
export const normalizeCode = (code) => {
  // Remove whitespace, newlines, semicolons, double quotes, single quotes, and parentheses
  return code.replace(/[\s;"'()]/g, '');
};
export const kind_normalizeCode = (code) => {
  // Remove whitespace, newlines, semicolons, double quotes, single quotes, and parentheses
  return code.replace(/[\s;"',/()]/g, '');
};
export const countOccurrences = (fileContent, asWasCode) => {
  if (!fileContent || !asWasCode) return 0; // Return 0 instead of "null"

  // Normalize the codes for comparison
  const normalizedAsWasCode = normalizeCode(asWasCode);
  const normalizedFileContent = normalizeCode(fileContent);

  let occurrenceCount = 0;
  let startIndex = 0;

  // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
  while (
    (startIndex = normalizedFileContent.indexOf(normalizedAsWasCode, startIndex)) !== -1
  ) {
    occurrenceCount++;
    startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
  }

  return occurrenceCount; // Return the total count of occurrences
};

export const kind_countOccurrences = (fileContent, asWasCode) => {
  if (!fileContent || !asWasCode) return 0; // Return 0 instead of "null"

  // Normalize the codes for comparison
  const normalizedAsWasCode = kind_normalizeCode(asWasCode);
  const normalizedFileContent = kind_normalizeCode(fileContent);

  let occurrenceCount = 0;
  let startIndex = 0;

  // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
  while (
    (startIndex = normalizedFileContent.indexOf(normalizedAsWasCode, startIndex)) !== -1
  ) {
    occurrenceCount++;
    startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
  }

  return occurrenceCount; // Return the total count of occurrences
};
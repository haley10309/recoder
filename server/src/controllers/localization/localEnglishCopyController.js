// // 번역 텍스트 파일에서 영어 원문만 추출
// exports.extractEnglishCopy = (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded." });
//       }
  
//       const fileContent = req.file.buffer.toString('utf-8');
//       const lines = fileContent.split(/\r?\n/);
      
//       if (lines.length < 2) {
//         return res.status(400).json({ error: "File does not contain enough data." });
//       }
  
//       let englishCopy = [];
  
//       for (let i = 1; i < lines.length; i++) {
//         const row = lines[i].split("\t");
//         const englishText = row[0]; 
  
//         if (englishText) {
//           englishCopy.push(englishText.trim());
//         }
//       }
  
//       res.json({ englishCopy });
  
//     } catch (error) {
//       console.error("Error processing file:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   };
  
exports.extractEnglishCopy = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const fileContent = req.file.buffer.toString("utf-8");
    const lines = fileContent.split(/\r?\n/);

    if (lines.length < 2) {
      return res.status(400).json({ error: "File does not contain enough data." });
    }

    const headerRow = lines[0].split("\t");
    const copyColumnIndex = headerRow.findIndex((col) => col.trim().toUpperCase() === "COPY");

    if (copyColumnIndex === -1) {
      return res.status(400).json({ error: '"COPY" column not found in header.' });
    }

    const englishCopy = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split("\t");
      const englishText = row[copyColumnIndex];

      if (englishText && englishText.trim()) {
        englishCopy.push(englishText.trim());
      }
    }

    res.json({ englishCopy });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

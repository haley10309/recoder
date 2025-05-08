// 번역 텍스트 파일에서 국가별 번역 리스트 반환

const validCountryCodes = [
    "ae", "ae_ar", "africa_en", "africa_fr", "africa_pt", "al", "ar", "at", "au", "az", "ba", "bd",
    "be", "be_fr", "bg", "br", "ca", "ca_fr", "ch", "ch_fr", "cl", "cn", "co", "cz", "de", "dk", "ee",
    "eg", "es", "fi", "fr", "ge", "gr", "hk", "hr", "hu", "id", "ie", "il", "in", "iq_ar", "iq_ku",
    "iran", "it", "jp", "kz_kz", "kz_ru", "latin", "lb", "latin_en", "levant", "levant_ar", "lt",
    "lv", "mk", "mm", "mn", "mx", "my", "n_africa", "nl", "no", "nz", "pe", "ph", "pk", "pl", "ps",
    "pt", "py", "ro", "rs", "ru", "sa", "sa_en", "se", "sg", "si", "sk", "th", "tr", "tw", "ua", "us",
    "uk", "uy", "uz_ru", "uz_uz", "vn", "vn_za", "za"
  ];

// exports.localUploadData = (req, res) => {
//   try {
//     if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded." });
//     }
    
//     const fileContent = req.file.buffer.toString('utf-8');

//     const lines = fileContent.split(/\r?\n/); // 파일을 줄(\n) 단위로 분할하여 배열로 변환합니다.
//     if (lines.length < 2) {
//         return res.status(400).json({ error: "File does not contain enough data." });

//     }

//     const headers = lines[0].split("\t"); // Copy, 국가코드 추출해 header에 저장
//     const countryCodes = headers.slice(1); // Copy 제외, 국가코드 추출해 countryCodes에 저장

//     let countryCount = {}; // 각 국가 코드마다 번역되는 문장이 몇개인지 저장 {CN:2, JP:1}
//     let validCountries = []; // 유효한 국가 코드
//     let invalidCountries = []; // 유효하지 않은 국가 코드
//     let englishCopy = []; // 영어 원문

//     //각 국가 코드가 유효한 코드인지 확인
//     countryCodes.forEach(code => {
//         countryCount[code] = 0;
//         if (validCountryCodes.includes(code.toLowerCase())) {
//             validCountries.push(code);
//         } else {
//             invalidCountries.push(code);
//         }
//     });

//     let translations = {}; // 국가별 번역어 저장

//     for (let i = 1; i < lines.length; i++) {
//         const row = lines[i].split("\t"); // 각 번역어 추출
//         const englishText = row[0]; // 영어 추출
    
//         if (englishText) {
//             englishCopy.push(englishText);
//         }
    
//         for (let j = 1; j < row.length; j++) {
//             const countryCode = countryCodes[j - 1];
//             const value = row[j] ? row[j].trim() : "";
    
//             if (!translations[countryCode]) {
//                 translations[countryCode] = [];
//             }
    
//             if (value) {
//                 // 값이 정상적으로 있으면 그대로 저장
//                 translations[countryCode].push(value);
//             } else {
//                 // 값이 없으면 영어 원문을 저장
//                 translations[countryCode].push(englishText.trim());
//             }
//         }
//     }
    

   
//     res.json({ 
//         validCountries, 
//         invalidCountries, 
//         translations, 
//         englishCopy 
//     });

//   } catch (error) {
//       console.error("Error processing file:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.localUploadData = (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
  
      const fileContent = req.file.buffer.toString("utf-8");
      const lines = fileContent.split(/\r?\n/);
  
      if (lines.length < 2) {
        return res.status(400).json({ error: "File does not contain enough data." });
      }
  
      const headers = lines[0].split("\t");
  
      // "COPY" 열 위치를 자동으로 찾음
      const copyColumnIndex = headers.findIndex(h => h.trim().toUpperCase() === "COPY");
      if (copyColumnIndex === -1) {
        return res.status(400).json({ error: '"COPY" column not found in header.' });
      }
  
      // "COPY" 열을 제외한 국가 코드들 추출
      const countryCodes = headers
        .map((code, i) => ({ code, index: i }))
        .filter((_, i) => i !== copyColumnIndex);
  
      const countryCount = {};
      const validCountries = [];
      const invalidCountries = [];
      const englishCopy = [];
      const translations = {};
  
      countryCodes.forEach(({ code }) => {
        countryCount[code] = 0;
        if (validCountryCodes.includes(code.toLowerCase())) {
          validCountries.push(code);
        } else {
          invalidCountries.push(code);
        }
      });
  
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split("\t");
        const englishText = row[copyColumnIndex]?.trim();
        if (englishText) {
          englishCopy.push(englishText);
        } else {
          englishCopy.push(""); // 빈 값이라도 자리 유지
        }
  
        countryCodes.forEach(({ code, index }) => {
          const value = row[index]?.trim();
  
          if (!translations[code]) {
            translations[code] = [];
          }
  
          if (value) {
            translations[code].push(value);
          } else {
            translations[code].push(englishText || "");
          }
        });
      }
  
      res.json({
        validCountries,
        invalidCountries,
        translations,
        englishCopy
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
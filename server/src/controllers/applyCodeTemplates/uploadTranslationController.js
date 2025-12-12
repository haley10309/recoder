// 번역 텍스트 파일에서 국가별 번역 리스트 반환!

const validCountryCodes = [
    "ae", "ae_ar", "africa_en", "africa_fr", "africa_pt", "al", "ar", "at", "au", "az", "ba", "bd",
    "be", "be_fr", "bg", "br", "ca", "ca_fr", "ch", "ch_fr", "cl", "cn", "co", "cz", "de", "dk", "ee",
    "eg", "es", "fi", "fr", "ge", "gr", "hk", "hr", "hu", "id", "ie", "il", "in", "iq_ar", "iq_ku",
    "iran", "it", "jp", "kz_kz", "kz_ru", "latin", "lb", "latin_en", "levant", "levant_ar", "lt",
    "lv", "mk", "mm", "mn", "mx", "my", "n_africa", "nl", "no", "nz", "pe", "ph", "pk", "pl", "ps",
    "pt", "py", "ro", "rs", "ru", "sa", "sa_en", "se", "sg", "si", "sk", "th", "tr", "tw", "ua", "us",
    "uk", "uy", "uz_ru", "uz_uz", "vn", "vn_za", "za"
  ];

export const uploadTranslation = (req, res) => {
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
      const englishCopyList = [];
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
          englishCopyList.push(englishText);
        } else {
          englishCopyList.push(""); // 빈 값이라도 자리 유지
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
        englishCopyList,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
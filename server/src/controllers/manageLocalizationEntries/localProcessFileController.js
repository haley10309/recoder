// 번역 기능 - 사용 안함 (헤일리 버전)

function replace_translation(originalCode, asWasCode, toBeCode) {
    const escapedAsWasCode = asWasCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
      const regex = new RegExp(escapedAsWasCode, "g"); // Global replacement
      let newCode = originalCode.replace(regex, toBeCode);
      return { newCode, changed: newCode !== originalCode };
  }

exports.localProcessFileData = async (req, res) => {
    try {
        const country_code = req.body.country_code;
        const english_copies = JSON.parse(req.body.english_copies);
        const local_copies = JSON.parse(req.body.local_copies);

        if (!req.files || req.files.length === 0 || !country_code) {
            return res.status(400).json({
                success: false,
                message: "Files, country code, and translation copies are required.",
            });
        }

        if (!Array.isArray(english_copies) || !Array.isArray(local_copies)) {
            return res.status(400).json({
                success: false,
                message: "english_copies and local_copies must be arrays.",
            });
        }

        const results = [];

        // Iterate over the uploaded files
        for (const file of req.files) {
            let htmlContent = file.buffer.toString('utf-8'); // Access file buffer properly

            let changed = false;
            let untranslatedEnglishCopies = [];
            let untranslatedLocalCopies = [];

            // Replace all English copies with local copies
            english_copies.forEach((english_copy, index) => {
                const local_copy = local_copies[index] || english_copy;
                const { newCode, changed: isChanged } = replace_translation(htmlContent, english_copy, local_copy);

                if (isChanged) {
                    htmlContent = newCode;
                    changed = true;
                } else {
                    untranslatedEnglishCopies.push({ index, english_copy });
                    untranslatedLocalCopies.push(local_copy);
                }
            });

            const buffer = Buffer.from(htmlContent, 'utf-8');
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "").slice(2);
            const formattedDateStr = String(formattedDate); 
            const outputFileName = `translated_${country_code}_${formattedDateStr}.html`;
            const encodedFilename = encodeURIComponent(outputFileName);

            results.push({
                status: "success",
                htmlContent,
                untranslatedEnglishCopies: untranslatedEnglishCopies.length > 0 ? untranslatedEnglishCopies : null,
                untranslatedLocalCopies: untranslatedLocalCopies.length > 0 ? untranslatedLocalCopies : null,
                file: encodedFilename,
            });

        }

        if (results.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files were successfully translated.",
            });
        }

        res.json({
            status: true,
            results,
            message: "Translation completed successfully.",
        });
        

    } catch (error) {
        console.error("Translation processing failed:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
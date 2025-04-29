import { useState } from "react";
import styled from "styled-components";
import { countOccurrences } from "@/utils/codeUtils";
import FileUpload from "@/assets/shift-fill.svg";
import HtmlFile from "@/assets/union.svg";
import { fileExecute } from "@/apis/apis";
import { uploadTranslationDeck } from "@/apis/apis";
import { fetchLocalizationList } from "@/apis/apis";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  countryCodeState,
  ticketUrlState,
  ticketNumState,
  isEnglishCountryState,
} from "@/recoil/atoms/state";

const FileConvert = ({ textareas, setTextareas }) => {
  const ticketUrl = useRecoilValue(ticketUrlState);
  const ticketNum = useRecoilValue(ticketNumState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocalizationProcessing, setIsLocalizationProcessing] =
    useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isExecuted, setIsExecuted] = useState(false);
  const [changeResults, setChangeResults] = useState([]);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);
  const [fileContent, setFileContent] = useState("");
  const [downloadedFileContent, setDownloadedFileContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState("");
  const [translationsByCountry, setTranslationsByCountry] = useState({});
  const [currentTranslations, setCurrentTranslations] = useState({});
  const [translationFile, setTranslationFile] = useState({});
  const [validCountries, setValidCountries] = useState([]);
  const [htmlUploadStatus, setHtmlUploadStatus] = useState("");
  const [htmlFileName, setHtmlFileName] = useState("");
  const [txtUploadStatus, setTxtUploadStatus] = useState("");
  const [txtFileName, setTxtFileName] = useState("");
  const isEnglishCountry = useRecoilValue(isEnglishCountryState); // 영문국 비영문국 분기 처리
  const [localizedFileContent, setLocalizedFileContent] = useState("");
  const [localizedFileName, setLocalizedFileName] = useState("");
  const [isLocalizationApplied, setIsLocalizationApplied] = useState(false);
  const [localizationStatus, setLocalizationStatus] = useState("");

  const handleTranslationUpload = async (e) => {
    const file = e.target.files[0];
    setTranslationFile(file);
    if (!file) {
      setTxtUploadStatus("fail");
      return;
    }

    try {
      const { translations, englishCopy, validCountries } =
        await uploadTranslationDeck(file);

      setValidCountries(validCountries);
      setTranslationsByCountry(translations);

      const currentCountry = country_code;
      const countryTranslations = translations[currentCountry] || [];

      const dictionary = {};
      for (let i = 0; i < englishCopy.length; i++) {
        const key = englishCopy[i]?.trim();
        const value = countryTranslations[i]?.trim();
        if (value && key !== value) {
          dictionary[key] = value;
        }
      }

      setCurrentTranslations(dictionary);
      setTxtUploadStatus("success");
      setTxtFileName(file.name);
    } catch (err) {
      console.error(err);
      setTxtUploadStatus("fail");
    }
  };

  function applyLocalizedTemplateBlocks(
    htmlString,
    dictionary,
    localizationList
  ) {
    let result = htmlString;

    localizationList.forEach((item) => {
      let originalBlock = item.local_code;
      let blockDoc = new DOMParser().parseFromString(
        originalBlock,
        "text/html"
      );
      let blockText = blockDoc.body.textContent?.trim();

      Object.entries(dictionary).forEach(([eng, local]) => {
        const cleanedEng = eng.trim().replace(/\s+/g, " ");
        const cleanedBlockText = blockText.replace(/\s+/g, " ");

        if (cleanedBlockText.includes(cleanedEng)) {
          const regex = new RegExp(escapeRegExp(eng), "g");
          originalBlock = originalBlock.replace(regex, local);
        }
      });

      if (result.includes(item.local_code)) {
        result = result.replace(item.local_code, originalBlock);
      }
    });

    return result;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const handleApplyLocalization = async () => {
    if (!originalFile) {
      alert("먼저 HTML 파일을 업로드하고 코드 변환을 진행해주세요.");
      return;
    }

    try {
      const localization_list = await fetchLocalizationList(
        ticketNum,
        ticketUrl
      );

      const validTemplateTexts = localization_list.flatMap((item) => {
        const texts = [];
        const doc = new DOMParser().parseFromString(
          item.local_code,
          "text/html"
        );
        if (doc.body.textContent?.trim())
          texts.push(doc.body.textContent.trim());

        Object.entries(item).forEach(([key, val]) => {
          if (key.startsWith("value") && typeof val === "string") {
            const innerDoc = new DOMParser().parseFromString(val, "text/html");
            if (innerDoc.body.textContent?.trim())
              texts.push(innerDoc.body.textContent.trim());
          }
        });
        return texts;
      });

      const normalizeText = (text) => {
        return text
          ?.replace(/\s+/g, " ")
          .replace(/[\[\]]/g, "")
          .replace(/\n/g, "")
          .replace(/\r/g, "")
          .trim();
      };

      // 1. missingKey 체크
      const missingKeys = Object.keys(currentTranslations).filter((key) => {
        const cleanedKey = normalizeText(key);

        const isFound = validTemplateTexts.some((templateText) => {
          const cleanedTemplate = normalizeText(templateText);
          return cleanedTemplate.includes(cleanedKey);
        });

        if (!isFound) {
          console.log("🚨 missingKey 발견:", cleanedKey);
        }

        return !isFound;
      });

      const updatedTextareas = textareas.map((textarea) => {
        const lowerCaseCode = country_code?.toLowerCase?.() || "";

        const localizedToBe = applyLocalizedTemplateBlocks(
          textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
          currentTranslations,
          localization_list
        );

        // ✨ errorState 판단
        const errorState = Object.keys(currentTranslations).some((key) => {
          return localizedToBe.includes(key); // 번역 이후에도 원본 영어가 남아있으면 문제
        });

        return {
          ...textarea,
          asWasCode: textarea.asWasCode.replace(
            /\/site\//g,
            `/${lowerCaseCode}/`
          ),
          toBeCode: textarea.toBeCode.replace(
            /\/site\//g,
            `/${lowerCaseCode}/`
          ),
          localizedToBeCode: localizedToBe,
          errorState,
        };
      });

      // 전체 HTML에도 적용하는 부분은 기존 그대로 두고
      let localizedFullHtml = downloadedFileContent;
      localization_list.forEach((item) => {
        let originalBlock = item.local_code;
        let blockDoc = new DOMParser().parseFromString(
          originalBlock,
          "text/html"
        );
        let blockText = blockDoc.body.textContent?.trim();

        Object.entries(currentTranslations).forEach(([eng, local]) => {
          const cleanedEng = eng.trim().replace(/\s+/g, " ");
          const cleanedBlockText = blockText?.replace(/\s+/g, " ");
          if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
            const regex = new RegExp(escapeRegExp(eng), "g");
            originalBlock = originalBlock.replace(regex, local);
          }
        });

        if (localizedFullHtml.includes(item.local_code)) {
          localizedFullHtml = localizedFullHtml.replace(
            item.local_code,
            originalBlock
          );
        }
      });

      setLocalizedFileContent(localizedFullHtml);
      setLocalizedFileName(`localized_${fileName}`);
      setTextareas(updatedTextareas);
      setIsLocalizationApplied(true);
    } catch (error) {
      console.error("로컬라이제이션 적용 실패:", error);
      setUploadStatus("fail");
    }
  };

  // 로컬라이제이션 적용된 파일 다운로드
  const handleLocalizedDownload = () => {
    const hasUnapplied = textareas.some(
      (textarea) => textarea.isApplied === "no"
    );

    if (hasUnapplied) {
      const proceed = window.confirm(
        "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
      );
      if (!proceed) {
        return; // 사용자가 취소 누르면 다운로드 중단
      }
    }

    if (localizedFileContent) {
      const blob = new Blob([localizedFileContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = localizedFileName || "localized_file.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("먼저 로컬라이제이션 적용을 진행해주세요.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;
      setFileContent(content);
      setHtmlUploadStatus("success");
      setHtmlFileName(selectedFile.name);
    };

    if (selectedFile) {
      reader.readAsText(selectedFile);
      setOriginalFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setHtmlUploadStatus("fail");
      console.warn("No file selected");
    }
  };

  // 변경된 결과를 처리하여 textareas 상태를 업데이트
  const handleChangeResults = (changeResults) => {
    const updatedTextareas = textareas.map((textarea, index) => {
      const { changed, matchedPart } =
        changeResults.find((result) => result.pairIndex === index) || {};

      const asWasOccurrenceCount = countOccurrences(
        fileContent,
        textarea.asWasCode
      );
      const toBeOccurrenceCount = countOccurrences(
        downloadedFileContent,
        textarea.toBeCode
      );
      const lowerCaseCode = country_code?.toLowerCase?.() || "";

      const normalizePath = (code) =>
        code?.replace(new RegExp(`/${lowerCaseCode}/`, "g"), "/site/")?.trim();

      const normalizedAsWas = normalizePath(textarea.asWasCode);
      const normalizedToBe = normalizePath(textarea.toBeCode);

      const actualChanged = normalizedAsWas !== normalizedToBe;
      const isFound = asWasOccurrenceCount > 0;

      return {
        ...textarea,
        pptNo: textarea.pptNo,
        changed: isFound && actualChanged, // 일치했을 때만 '변경' 인정
        isApplied: isFound ? (actualChanged ? "yes" : "no") : "no", // 찾지 못했으면 무조건 "no"
        matchedPart: matchedPart,
        asWasOccurrenceCount,
        toBeOccurrenceCount,
        asWasCode: textarea.asWasCode.replace(
          /\/site\//g,
          `/${lowerCaseCode}/`
        ),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      };
    });

    setTextareas(updatedTextareas);
  };

  // 실행 버튼 클릭 시, 파일과 텍스트 영역 상태 업데이트
  const handleExecute = async () => {
    const lowerCaseCode = country_code?.toLowerCase?.() || "";
    const updatedTextareas = textareas.map((textarea) => ({
      ...textarea,
      pptNo: textarea.pptNo,
      asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      changed: textarea.asWasCode !== "",
    }));

    setTextareas(updatedTextareas);
    setIsExecuted(true);
    setUploadProgress(0);

    // 파일과 코드 쌍이 유효한지 체크
    if (
      originalFile &&
      updatedTextareas.every(
        ({ asWasCode, toBeCode }) =>
          asWasCode && (toBeCode !== null || toBeCode === "")
      )
    ) {
      const formData = new FormData();
      formData.append("file", originalFile);

      const codePairs = updatedTextareas
        .filter((textarea) => textarea.changed)
        .map((textarea) => ({
          asWasCode: textarea.asWasCode,
          toBeCode: textarea.toBeCode,
        }));
      formData.append("codePairs", JSON.stringify(codePairs));

      setIsProcessing(true);

      try {
        // 파일 업로드 진행 상태 업데이트
        const progressUpdatePromise = new Promise((resolve) => {
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 100) {
                clearInterval(progressInterval);
                resolve();
                return 100;
              }
              return prev + 10;
            });
          }, 100);
        });

        // API 요청 처리 및 결과 업데이트
        const { fileContent, filename } = await fileExecute(
          setChangeResults,
          handleChangeResults,
          setIsProcessing,
          formData,
          updatedTextareas,
          setTextareas,
          ticketUrl,
          country_code
        );

        setDownloadedFileContent(fileContent);
        setDownloadedFileName(filename);

        await progressUpdatePromise;
        setUploadStatus("success");
        setIsDownloaded(false);
      } catch (error) {
        console.error("파일 실행 오류", error);
        setUploadStatus("fail");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("파일 선택, asWasCode과 toBeCode 입력은 필수입니다.");
    }
  };

  // 다운로드 버튼 클릭 시 변환된 파일 다운로드
  const handleDownload = () => {
    const hasUnapplied = textareas.some(
      (textarea) => textarea.isApplied === "no"
    );

    if (hasUnapplied) {
      const proceed = window.confirm(
        "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
      );
      if (!proceed) {
        return; // 사용자가 취소 누르면 다운로드 중단
      }
    }
    if (downloadedFileContent) {
      const blob = new Blob([downloadedFileContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadedFileName || "downloaded_file.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("변환된 파일이 없습니다. 먼저 코드 변환을 진행해주세요.");
    }
  };

  return (
    <>
      <ConvertTitle>📤 파일 업로드</ConvertTitle>
      <ConvertSection>
        <ConvertContainer>
          {/* HTML 업로드 */}
          <div>
            {htmlUploadStatus ? (
              <PreviewHeader style={{ marginTop: "0.75rem" }}>
                <img src={HtmlFile} alt="htmlicon" />
                <div id="preview-text">
                  <span>{htmlFileName}</span>
                  <ProgressBar>
                    <ProgressFill $progress={100} />
                  </ProgressBar>
                  <UploadStatus $success={htmlUploadStatus === "success"}>
                    {htmlUploadStatus === "success"
                      ? "📂 HTML 파일 업로드 성공!"
                      : "❌ HTML 파일 업로드 실패"}
                  </UploadStatus>
                </div>
              </PreviewHeader>
            ) : (
              <FileDropLabel htmlFor="dropzone-file">
                <FileDropInner>
                  <img src={FileUpload} alt="Apply" />
                  <p>Backup HTML 을 업로드 해주세요.</p>
                </FileDropInner>
                <input
                  id="dropzone-file"
                  type="file"
                  onChange={handleFileChange}
                  hidden
                />
              </FileDropLabel>
            )}
          </div>

          {/* TXT 업로드 (영문국이면 숨김) */}
          {!isEnglishCountry && (
            <div>
              {txtUploadStatus ? (
                <PreviewHeader style={{ marginTop: "0.75rem" }}>
                  <img src={HtmlFile} alt="txticon" />
                  <div id="preview-text">
                    <span>{txtFileName}</span>
                    <ProgressBar>
                      <ProgressFill $progress={100} />
                    </ProgressBar>
                    <UploadStatus $success={txtUploadStatus === "success"}>
                      {txtUploadStatus === "success"
                        ? "📄 번역덱 TXT 업로드 성공!"
                        : "❌ 번역덱 TXT 업로드 실패"}
                    </UploadStatus>
                  </div>
                </PreviewHeader>
              ) : (
                <FileDropLabel htmlFor="dropzone-txt">
                  <FileDropInner>
                    <img src={FileUpload} alt="Apply" />
                    <p>번역덱 TXT 을 업로드 해주세요.</p>
                  </FileDropInner>
                  <input
                    id="dropzone-txt"
                    type="file"
                    onChange={handleTranslationUpload}
                    hidden
                  />
                </FileDropLabel>
              )}
            </div>
          )}
        </ConvertContainer>
      </ConvertSection>

      {fileName && (
        <PreviewContainer>
          <ButtonBox>
            <ConvertButton
              onClick={handleExecute}
              disabled={isProcessing || fileName === ""}
              $active={fileName !== "" && !isProcessing}
            >
              {isProcessing ? "코드 변환 중 .." : "코드 변환"}
            </ConvertButton>
            {/* 로컬라이제이션 적용 버튼도 영문국이면 숨김 */}
            {!isEnglishCountry && (
              <>
                <ConvertButton
                  $bgColor="black"
                  onClick={handleApplyLocalization}
                  disabled={isLocalizationProcessing || fileName === ""}
                  $active={fileName !== "" && !isLocalizationProcessing}
                >
                  {isLocalizationProcessing
                    ? "로컬라이제이션 적용 중 .."
                    : "로컬라이제이션 적용"}
                </ConvertButton>
              </>
            )}
          </ButtonBox>
          <PreviewCard>
            <PreviewHeader>
              <img src={HtmlFile} alt="htmlicon" />
              <div id="preview-text">
                <FileName>{downloadedFileName}</FileName>
                <ProgressBar>
                  <ProgressFill $progress={uploadProgress} />
                </ProgressBar>
                {(uploadStatus || localizationStatus) && (
                  <UploadStatus
                    $success={
                      uploadStatus === "success" ||
                      localizationStatus === "success"
                    }
                  >
                    {uploadStatus === "success" &&
                      "핫픽스 작업이 완료된 파일이 생성되었습니다!"}
                    {uploadStatus === "fail" && "파일 생성에 실패하였습니다."}
                    {localizationStatus === "success" &&
                      "로컬라이제이션이 완료되었습니다!"}
                    {localizationStatus === "fail" &&
                      "로컬라이제이션 적용에 실패했습니다."}
                  </UploadStatus>
                )}
              </div>
            </PreviewHeader>
            {isExecuted && (
              <DownloadButton onClick={handleDownload}>
                코드 변환 다운로드
              </DownloadButton>
            )}
            {isLocalizationApplied && (
              <LocalaizationDownloadButton onClick={handleLocalizedDownload}>
                로컬라이제이션 적용본 다운로드
              </LocalaizationDownloadButton>
            )}
          </PreviewCard>
        </PreviewContainer>
      )}
    </>
  );
};

export default FileConvert;

const ConvertTitle = styled.p`
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

const ConvertSection = styled.div`
  display: flex;
  min-height: 11.5rem;
  border-radius: 0.625rem;
  background: #f9f9f9;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
`;

const ConvertContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const FileDropLabel = styled.label`
  width: 20.625rem;
  height: 7.6875rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #111827;
  cursor: pointer;
`;

const FileDropInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  img {
    width: 24px;
    height: 24px;
  }

  p {
    font-size: 14px;
  }

  span {
    font-size: 12px;
  }
`;
const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ConvertButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 10.9375rem;
  height: 2.5625rem;
  border-radius: 0.625rem;
  border-radius: 10px;
  color: white;
  background-color: ${({ $active, $bgColor }) =>
    $bgColor || ($active ? "#ff782f" : "#d1d5db")};
  font-weight: 600;
  font-size: 0.9rem;

  img {
    width: 19px;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  margin-top: 1.5rem;
  justify-content: space-between;
`;

const PreviewCard = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  #preview-text {
    font-size: 0.8rem;
    font-weight: 500;
    line-height: normal;
  }

  img {
    width: 1.875rem;
    height: 1.875rem;
  }
`;

const FileName = styled.span`
  display: inline-block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
`;

const ProgressBar = styled.div`
  width: 11.25rem;
  height: 0.125rem;
  flex-shrink: 0;

  background-color: #e5e7eb;
  border-radius: 999px;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  width: ${({ $progress }) => ($progress ? `${$progress}%` : "0%")};
  height: 100%;
  background: #5b975b;
  border-radius: 999px;
`;

const UploadStatus = styled.div`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
  width: 100%;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10.9375rem;
  height: 2.5625rem;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  background-color: #ff782f;
  border-radius: 10px;
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LocalaizationDownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13.9375rem;
  height: 2.5625rem;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  background-color: #000000;
  border-radius: 10px;
  svg {
    width: 20px;
    height: 20px;
  }
`;

import { useState } from "react";
import styled from "styled-components";
import { countOccurrences } from "@/utils/codeUtils";
import Process from "@/assets/uim_process.png";
import FileUpload from "@/assets/shift-fill.svg";
import HtmlFile from "@/assets/union.svg";
import { fileExecute } from "@/apis/apis";
import { useRecoilState } from "recoil";
import { countryCodeState, ticketUrlState } from "@/recoil/atoms/state";

const FileConvert = ({ textareas, setTextareas }) => {
  // 상태 관리
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isExecuted, setIsExecuted] = useState(false);
  const [changeResults, setChangeResults] = useState([]);
  const [ticketUrl, setticketUrl] = useRecoilState(ticketUrlState);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);
  const [fileContent, setFileContent] = useState("");
  const [downloadedFileContent, setDownloadedFileContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState("");

  const handleLocalization = () => {
    return 0;
  };

  // 파일 변경 시 파일 읽기 및 상태 업데이트
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;
      setFileContent(content);
    };

    reader.readAsText(selectedFile);

    // 파일명과 원본 파일 상태 업데이트
    if (selectedFile) {
      setOriginalFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
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

      return {
        ...textarea,
        changed: changed || false,
        isApplied: changed ? "yes" : "no",
        matchedPart: matchedPart,
        asWasOccurrenceCount,
        toBeOccurrenceCount,
        asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
      };
    });

    setTextareas(updatedTextareas);
  };

  // 실행 버튼 클릭 시, 파일과 텍스트 영역 상태 업데이트
  const handleExecute = async () => {
    const updatedTextareas = textareas.map((textarea) => ({
      ...textarea,
      asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
      toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
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
          <FileDropLabel htmlFor="dropzone-file">
            <FileDropInner>
              <img src={FileUpload} alt="Apply" />
              <p>번역덱 TXT 을 업로드 해주세요.</p>
            </FileDropInner>
            <input
              id="dropzone-file"
              type="file"
              onChange={handleLocalization}
              hidden
            />
          </FileDropLabel>
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
            <ConvertButton
              $bgColor="black"
              onClick={handleExecute}
              disabled={isProcessing || fileName === ""}
              $active={fileName !== "" && !isProcessing}
            >
              {isProcessing
                ? "로컬라이제이션 적용 중 .."
                : "로컬라이제이션 적용"}
            </ConvertButton>
          </ButtonBox>
          <PreviewCard>
            <PreviewHeader>
              <img src={HtmlFile} alt="htmlicon" />
              <div id="preview-text">
                <span>{fileName}</span>
                <ProgressBar>
                  <ProgressFill $progress={uploadProgress} />
                </ProgressBar>
                {uploadStatus && (
                  <UploadStatus $success={uploadStatus === "success"}>
                    {uploadStatus === "success"
                      ? "핫픽스 작업이 완료된 파일이 생성되었습니다!"
                      : "파일 생성에 실패하였습니다."}
                  </UploadStatus>
                )}
              </div>
            </PreviewHeader>
            {isExecuted && (
              <DownloadButton onClick={handleDownload}>다운로드</DownloadButton>
            )}
          </PreviewCard>
        </PreviewContainer>
      )}
    </>
  );
};

export default FileConvert;

const ConvertTitle = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: black;
`;

const ConvertSection = styled.div`
  display: flex;
  border-radius: 0.625rem;
  background: #f9f9f9;
  justify-content: center;
  padding: 1.5rem;
`;

const ConvertContainer = styled.div`
  display: flex;
  gap: 2rem;
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
  gap: 1.5rem;
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
  margin-bottom: 2rem;
  justify-content: space-between;
`;

const PreviewCard = styled.div`
  display: flex;
  gap: 4rem;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  #preview-text {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: normal;
  }

  img {
    width: 1.875rem;
    height: 1.875rem;
  }
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
  width: ${({ $progress }) => `${$progress}%`};
  background: #5b975b;
  border-radius: 999px;
`;

const UploadStatus = styled.div`
  font-size: 12px;
  margin-top: 8px;
  color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
  text-align: center;
  width: 100%;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 10.9375rem;
  height: 2.5625rem;
  font-weight: 600;
  color: white;
  background-color: #ff782f;
  border-radius: 10px;
  svg {
    width: 20px;
    height: 20px;
  }
`;

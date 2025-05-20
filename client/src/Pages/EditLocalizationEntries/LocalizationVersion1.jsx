import React, { useState } from "react";
import axios from "axios";
import Translation_country_code from "./localization_country_code";
import { BASE_URL } from "@/utils/routePath";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ShowDetail from "@/Pages/EditLocalizationEntries/ShowDetail";
import styled from "styled-components";
// TODO: 코드확인필요
const LocalizationVersion1 = () => {
  const [translationFile, setTranslationFile] = useState(null);
  const [translations, setTranslations] = useState({});
  const [rows, setRows] = useState([]);
  const [validCountries, setValidCountries] = useState([]);
  const [english_copies, setEnglish_copies] = useState([]);

  const handleTranslationFileChange = async (e) => {
    const file = e.target.files[0];
    setTranslationFile(file);
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${BASE_URL}/translation_upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setValidCountries(response.data.validCountries);
      setTranslations(response.data.translations || {});
      setEnglish_copies(response.data.englishCopyList || []);
      if (rows.length === 0) {
        setRows(
          new Array(4).fill(null).map(() => ({
            id: Date.now(),
            countryCode: "",
            htmlFiles: [],
            status: null,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to upload translation file.");
    }
  };

  const handleTranslate = async (index) => {
    const row = rows[index];
    if (!row.countryCode || row.htmlFiles.length === 0) {
      alert(
        "Please select a country and upload HTML files before translating."
      );
      return;
    }

    const localCopies = translations[row.countryCode] || [];
    const formData = new FormData();
    row.htmlFiles.forEach((file) => formData.append("htmlFiles", file));
    formData.append("country_code", row.countryCode);
    formData.append("english_copies", JSON.stringify(english_copies));
    formData.append("local_copies", JSON.stringify(localCopies));

    try {
      const response = await axios.post(
        `${BASE_URL}/translate_html`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index].status =
          response.data.results.length > 0
            ? response.data.results[0].status
            : "error";
        updatedRows[index].downloadLink =
          response.data.results[0]?.file || null;
        updatedRows[index].untranslated_en =
          response.data.results[0]?.untranslatedEnglishCopies || [];
        updatedRows[index].untranslated_lo =
          response.data.results[0]?.untranslatedLocalCopies || [];
        return updatedRows;
      });

      if (
        response.data.results.length > 0 &&
        response.data.results[0].status === "success"
      ) {
        const blob = new Blob([response.data.results[0].htmlContent], {
          type: "text/html",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.data.results[0].file;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error in translation:", err);
      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        updatedRows[index].status = "error";
        return updatedRows;
      });
    }
  };

  const handleCountryChange = (index, newCode) => {
    const updatedRows = [...rows];
    updatedRows[index].countryCode = newCode;
    setRows(updatedRows);
  };

  const handleHtmlFileChange = (index, e) => {
    const files = Array.from(e.target.files);
    const updatedRows = [...rows];
    updatedRows[index].htmlFiles = files;
    setRows(updatedRows);
  };

  return (
    <Container>
      {/* 번역 파일 업로드 */}
      <UploadSection>
        <UploadButton>
          <FileInput
            type="file"
            accept=".txt"
            onChange={handleTranslationFileChange}
          />
          <FileUploadIcon />
          <span>
            {translationFile
              ? translationFile.name
              : "📄 번역 기준 파일 업로드 (.txt)"}
          </span>
        </UploadButton>
      </UploadSection>

      {/* 각 번역 row 렌더링 */}
      {rows.length > 0 ? (
        <div>
          {rows.map((row, index) => (
            <RowWrapper key={index}>
              <RowActions>
                {/* 국가 선택 */}
                <Translation_country_code
                  countryCode={row.countryCode}
                  validCountries={validCountries}
                  onChange={(code) => handleCountryChange(index, code)}
                />

                <FileLabel>
                  <FileInput
                    type="file"
                    accept=".html"
                    multiple
                    onChange={(e) => handleHtmlFileChange(index, e)}
                  />
                  <span>{row.htmlFiles?.[0]?.name || "Upload rc01"}</span>
                </FileLabel>

                <Button onClick={() => handleTranslate(index)}>
                  Translate
                </Button>
              </RowActions>

              {/* 상태 표시 */}
              <StatusIcon success={row.status === "success"}>
                {row.status === "success" ? (
                  <CheckCircleIcon />
                ) : row.status === "error" ? (
                  <ErrorIcon />
                ) : null}
              </StatusIcon>

              {/* 상세 보기 */}
              {(row.untranslated_en?.length > 0 ||
                row.translated?.length > 0) && (
                <ShowDetail
                  untranslatedCopies={row.untranslated_en}
                  untranslatedLocalCopies={row.untranslated_lo}
                />
              )}
            </RowWrapper>
          ))}

          {/* Row 추가 */}
          <AddRowButton
            onClick={() =>
              setRows([
                ...rows,
                {
                  id: Date.now(),
                  countryCode: "",
                  htmlFiles: [],
                  status: null,
                },
              ])
            }
          >
            <AddCircleOutlineIcon /> Add Row
          </AddRowButton>
        </div>
      ) : (
        <EmptyState>
          <FileUploadIcon sx={{ fontSize: 48 }} />
          <p>Upload the copy deck in txt file.</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default LocalizationVersion1;

// Styled components
const Container = styled.div`
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const UploadSection = styled.div`
  margin-bottom: 1.5rem;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #e0f2fe;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #93c5fd;
  cursor: pointer;
  &:hover {
    background-color: #bfdbfe;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RowActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
`;

const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  color: #4b5563;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  &:hover {
    background-color: #e5e7eb;
  }
`;

const Button = styled.button`
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  &:hover {
    background-color: #1d4ed8;
  }
`;

const AddRowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-size: 0.875rem;
  &:hover {
    color: #2563eb;
  }
  margin-top: 1rem;
`;

const StatusIcon = styled.div`
  font-size: 1.25rem;
  color: ${(props) => (props.success ? "#10b981" : "#ef4444")};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 4rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

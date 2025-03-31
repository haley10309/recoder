import React, { useState } from "react";
import axios from "axios";
import { useRecoilState } from "recoil";
import "./Localization.scss";
import Translation_country_code from "./localization_country_code";
import { BASE_URL } from "../../utils/routePath";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {  productNameState } from "@/recoil/atoms/state";
import ShowDetail from './ShowDetail';

const Localization = () => {
    const [translationFile, setTranslationFile] = useState(null);
    const [translations, setTranslations] = useState({});
    const [rows, setRows] = useState([]); // Dynamic rows
    const [validCountries, setValidCountries] = useState([]); // Store valid countries
    const [english_copies, setEnglish_copies] = useState([]);
    const [productName, setProductName] = useRecoilState(productNameState);
    const [copyPairs, setCopyPairs] = useState([]);

    // Handle translation file upload (TXT file)
    const handleTranslationFileChange = async (e) => {
        const file = e.target.files[0];
        console.log('Uploaded File:', file);
        setTranslationFile(file);
    
        if (!file) return; // If no file is selected, do nothing
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.post(`${BASE_URL}/translation_upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            setValidCountries(response.data.validCountries); // Set the valid country codes
            setTranslations(response.data.translations || {}); // Store translations
            setEnglish_copies(response.data.englishCopy || []); // Store the English copies
            if(rows.length==0){
                setRows(new Array(4).fill(null).map(() => ({ id: Date.now(), country_code: "", htmlFiles: [], status: null }))); // Create 4 rows automatically
            }
            
        } catch (err) {
            console.error("Failed to upload translation file.");
        }
    };
    
    // Handle translation function
    const handleTranslate = async (index) => {
        const row = rows[index];
    
        if (!row.country_code || row.htmlFiles.length === 0) {
            alert("나라 코드를 선택 후 변환을 원하시는 파일을 업로드 해주시기 바랍니다.");
            return;
        }
    
        const localCopies = translations[row.country_code] || [];
        const formData = new FormData();
        row.htmlFiles.forEach((file) => formData.append("htmlFiles", file));
        formData.append("country_code", row.country_code);
        formData.append("english_copies", JSON.stringify(english_copies));
        formData.append("local_copies", JSON.stringify(localCopies));
    
        try {
            const response = await axios.post(`${BASE_URL}/translate_html`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            console.log("API Response:", response.data); // Debugging
    
            setRows((prevRows) => {
                const updatedRows = [...prevRows];
                updatedRows[index].status = response.data.status ? "success" : "error";
    
                if (response.data.results.length > 0) {
                    updatedRows[index].downloadLink = response.data.results[0].downloadLink;
                    updatedRows[index].status = response.data.results[0].status;
    
                    // Handle untranslated copies
                    const untranslatedEnglishCopies = response.data.results[0].untranslatedEnglishCopies || [];
                    const untranslatedLocalCopies = response.data.results[0].untranslatedLocalCopies || [];
    
                    if (untranslatedEnglishCopies.length > 0) {
                        const untranslatedList = untranslatedEnglishCopies.map((item, i) => {
                            const localCopy = untranslatedLocalCopies[i] || "N/A";
                            return `Index: ${item.index}, English: "${item.english_copy}", Local: "${localCopy}"`;
                        }).join("\n");
    
                        // alert(`The following English copies were not found in the HTML:\n${untranslatedList}`);
    
                        updatedRows[index].untranslated_en = untranslatedEnglishCopies;
                        updatedRows[index].untranslated_lo = untranslatedLocalCopies;
                    }
                }
    
                return updatedRows;
            });
        } catch (err) {
            console.error("Error in translation:", err);
            setRows((prevRows) => {
                const updatedRows = [...prevRows];
                updatedRows[index].status = "error";
                return updatedRows;
            });
        }
    };
    
    
    
    
    const handleDownloadFile = async (index) => {
        const row = rows[index];
    
        if (!row.downloadLink) {
            alert("다운로드 가능한 파일이 없습니다.");
            return;
        }
    
        try {
            const response = await axios.get(row.downloadLink, {
                responseType: "blob",
            });
    
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `translated_${row.country_code}.html`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error downloading file:", err);
        }
    };
    
    

    // Handle country selection change
    const handleCountryChange = (index, newCode) => {
        const updatedRows = [...rows];
        updatedRows[index].country_code = newCode;
        setRows(updatedRows);
    };

    // Handle HTML file selection
    const handleHtmlFileChange = (index, e) => {
        const files = Array.from(e.target.files);
        const updatedRows = [...rows];
        updatedRows[index].htmlFiles = files;
        console.log(updatedRows[index].htmlFiles[0].name);
        setRows(updatedRows);
    };
//일괄 실행 버튼
const handleRunInAll = async () => {
    const filteredRows = rows.filter((row) => row.country_code && row.htmlFiles && row.htmlFiles.length > 0);

    if (filteredRows.length === 0) {
        alert("나라 코드 혹은 html 파일이 업로드 되지 않았습니다.");
        return;
    }

    try {
        // Loop through each valid row and trigger translation
        for (let i = 0; i < filteredRows.length; i++) {
            const row = filteredRows[i];
            await handleTranslate(i); // Trigger translation for each valid row
        }

        //alert("Batch translation completed successfully.");
    } catch (error) {
        console.error("Error during batch translation:", error);
        alert("일괄 실행 중 오류가 발생하였습니다.");
    }
};
//일괄 다운로드
const handleDownloadInAll = async () => {
    const downloadableRows = rows.filter((row) => row.downloadLink);

    if (downloadableRows.length === 0) {
        alert("다운로드 가능한 파일이 없습니다.");
        return;
    }

    try {
        for (let i = 0; i < downloadableRows.length; i++) {
            await handleDownloadFile(i); // Trigger individual downloads
        }

       
    } catch (error) {
        console.error("Error during batch download:", error);
        alert("파일 다운로드 중 오류가 발생하였습니다.");
    }
};



    
    return (
        <div className="Translation_page_div">
            {/* Translation Deck Upload */}
            <div className="upload-section">
                <label className="file-upload-label">
                    <input type="file" accept=".txt" onChange={handleTranslationFileChange} hidden />
                    {translationFile?<>
                        <span className="txt-file-upload-button">{translationFile.name}</span>
                        </>:<>
                        <span className="txt-file-upload-button">Upload Translation File</span>
                        </>
                    }
                    
                </label>
                
            </div>
            {/* 영어 카피 렌더링 */}
{/* {english_copies.length > 0 && (
    <div className="english_copy_section">
        <h3>English Copy</h3>
        <ul>
            {english_copies.map((copy, index) => (
                <li key={index}>{copy}</li>
            ))}
        </ul>
    </div>
)} */}

{/* 로컬 카피 렌더링 */}
{/* {Object.keys(translations).length > 0 && (
    <div className="translations_section">
        <h3>Localized Translations</h3>
        {Object.entries(translations).map(([countryCode, localCopies]) => (
            <div key={countryCode} className="translation_each_row">
                <h4>{countryCode}</h4>
                <ul>
                    {localCopies.map((translation, index) => (
                        <li key={index}>{translation}</li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
)} */}


            {/* Dynamic Rows */}
            {Object.keys(translations).length !== 0 && (
    <div className="buttons_for_all">
        <button className="run_in_all" onClick={handleRunInAll}>일괄 실행</button>
        <button className="download_in_all" onClick={handleDownloadInAll}>일괄 저장</button>
    </div>
)}

            
            <div className="translation-rows">
                {rows.map((row, index) => (
                    <div key={row.id} className="translation-row">
                        {/* Country Selection Dropdown */}
                        <Translation_country_code 
                            country_code={row.country_code} 
                            validCountries={validCountries} 
                            onChange={(code) => handleCountryChange(index, code)} 
                        />

                        {/* HTML File Upload */}
                        <label className="file-upload-label">
                            <input
                                type="file"
                                accept=".html"
                                multiple
                                onChange={(e) => handleHtmlFileChange(index, e)}
                                hidden
                            />
                             {/* <span className="txt-file-upload-button">Upload HTML</span> */}
                            {row.htmlFiles && row.htmlFiles.length === 0 ? (
                                <span className="txt-file-upload-button">Upload rc01</span>
                            ) : (
                                <span className="txt-file-upload-button">
                                    {row.htmlFiles[0].name}
                                </span>
                            )}
                        </label>


                        {/* 변환 */}
                        <button className="translate-button" onClick={() => handleTranslate(index)}>
                            Translate
                        </button>

                        {/* 변환 결과 */}
                        {row.status === "success" && <CheckCircleIcon className="success-icon" />}
                        {row.status === "error" && <ErrorIcon className="error-icon" />}

                        {/* 다운로드 */}
                        {row.status==='success'?(<button className="download-button" onClick={() => handleDownloadFile(index)}>
                            Download
                        </button>):(<div></div>)}

                        {/* 자세히 보기 - 모달창 */}
                       
                        {row.untranslated_en && row.untranslated_en.length > 0 && (
                            <ShowDetail 
                                untranslatedCopies={row.untranslated_en} 
                                untranslatedLocalCopies={row.untranslated_lo}
                            />
                        )}
                        
                    </div>
                ))}

                {/* Show message if no translations available */}
                {Object.keys(translations).length === 0 && (
                    <div className="nothing_rendered">
                        <FileUploadIcon sx={{ fontSize: 40 }} className="nothing_randered_img" />
                        <h2 className="nothing_rendered_text">Upload the copy deck in txt file.</h2>
                    </div>
                )}
                
                {/* Add Row Button */}
                <button className="add-row-button" onClick={() => setRows([...rows, { id: Date.now(), country_code: "", htmlFiles: [], status: null }])}>
                    <AddCircleOutlineIcon /> Add Row
                </button>  
            </div>   
        </div>
    );
};

export default Localization;

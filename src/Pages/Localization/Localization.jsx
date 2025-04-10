import React, { useState } from "react";
import axios from "axios";
// import { useRecoilState } from "recoil";
import "./Localization.scss";
import Translation_country_code from "./localization_country_code";
import { BASE_URL } from "../../utils/routePath";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import {  productNameState } from "@/recoil/atoms/state";
import ShowDetail from './ShowDetail';

const Localization = () => {
    const [translationFile, setTranslationFile] = useState(null);
    const [translations, setTranslations] = useState({});
    const [rows, setRows] = useState([]);
    const [validCountries, setValidCountries] = useState([]);
    const [english_copies, setEnglish_copies] = useState([]);
    // const [productName, setProductName] = useRecoilState(productNameState);
    // const [copyPairs, setCopyPairs] = useState([]);

    const handleTranslationFileChange = async (e) => {
        const file = e.target.files[0];
        console.log('Uploaded File:', file);
        setTranslationFile(file);
    
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.post(`${BASE_URL}/translation_upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            setValidCountries(response.data.validCountries);
            setTranslations(response.data.translations || {});
            setEnglish_copies(response.data.englishCopy || []);
            if(rows.length==0){
                setRows(new Array(4).fill(null).map(() => ({ id: Date.now(), country_code: "", htmlFiles: [], status: null })));
            }
            
        } catch (err) {
            console.error("Failed to upload translation file.");
        }
    };
    

    const handleTranslate = async (index) => {
        const row = rows[index];
    
        if (!row.country_code || row.htmlFiles.length === 0) {
            alert("Please select a country and upload HTML files before translating.");
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
    
            console.log("API Response:", response.data);
    
            setRows((prevRows) => {
                const updatedRows = [...prevRows];
                updatedRows[index].status = response.data.results.length > 0 ? response.data.results[0].status : "error";
                updatedRows[index].downloadLink = response.data.results[0]?.file || null;
                updatedRows[index].untranslated_en = response.data.results[0]?.untranslatedEnglishCopies || [];
                updatedRows[index].untranslated_lo = response.data.results[0]?.untranslatedLocalCopies || [];
                return updatedRows;
            });
    
            // Only proceed with file download if status is "success"
            if (response.data.results.length > 0 && response.data.results[0].status === "success") {
                const blob = new Blob([response.data.results[0].htmlContent], { type: "text/html" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = response.data.results[0].file; // File will not be downloaded if status is "error"
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
    
    

    // Handle country selection change
    const handleCountryChange = (index, newCode) => {
        const updatedRows = [...rows];
        updatedRows[index].country_code = newCode;
        setRows(updatedRows);
    };

    const handleHtmlFileChange = (index, e) => {
        const files = Array.from(e.target.files);
        const updatedRows = [...rows];
        updatedRows[index].htmlFiles = files;
        console.log(updatedRows[index].htmlFiles[0].name);
        setRows(updatedRows);
    };


    
    return (
        <div className="Translation_page_div">
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
            <div className="translation-rows">
                {rows.map((row, index) => (
                    <div key={index} className="translation-row">
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
                        {/* {row.status==='success'?(<button className="download-button" onClick={() => handleDownloadFile(index)}>
                            Download
                        </button>):(<div></div>)} */}

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

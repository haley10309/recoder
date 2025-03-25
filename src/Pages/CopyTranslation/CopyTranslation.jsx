import { useState } from "react";
import { BASE_URL } from "../../utils/routePath";
import axios from "axios";
import Country_code from "../../Components/Template_detail_set/Country_code";
import "./CopyTranslation.scss";


  const CopyTranslation=()=>{
    const [country_code, setCountry_code] = useState("");
    const [translation_file, setTranslation_File] = useState(null);
    const [validCountries, setValidCountries] = useState([]);
    const [error, setError] = useState(null);
    const [local_copies,setLocal_copies] = useState([]);
    const [english_copies,setEnglish_copies] = useState([]);
    
    const handle_Translation_FileChange = (e) => {
        const file = e.target.files[0];
        console.log("Selected file:", file);
        setTranslation_File(file);
        translation_handleFile(file);
      };

    const translation_handleFile = async (file) => {
        if (!file) {
            setError("Please select a file.");
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        console.log("Sending file:", file);
  
        try {
            const response = await axios.post(`${BASE_URL}/translation_upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            console.log("Response:", response.data);
    
            const translations = response.data.translations;
            const englishCopy = response.data.englishCopy;
    
            Object.entries(translations).forEach(([countryCode, translationArray]) => {
                if (Array.isArray(translationArray) && translationArray.length > 0) {
                    if (!local_copies[countryCode]) {
                        local_copies[countryCode] = [];
                    }
                    local_copies[countryCode].push(...translationArray);
                }
            });
    
            console.log("Categorized Translations:", local_copies);
    
            setValidCountries(local_copies);
            setEnglish_copies(englishCopy);
            setError(null);
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload file.");
        }
    };

    return(
        <div className="Translation_page_div">
             <div className="flex gap-14 p-10 justify-between bg-white shadow-xl rounded-b-[20px] ml-16 mr-16">
                <div className="flex w-full gap-14 justify-center items-center">
                    <Country_code
                        country_code={country_code}
                        setCountry_code={setCountry_code}
                    />
                     <input type="file" accept=".txt" onChange={handle_Translation_FileChange} />
                     <button onClick={() => translation_handleFile(translation_file)}>Upload</button>
                </div>
            </div>
            <div >
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {validCountries && Object.keys(validCountries).length > 0 && (
                <div>
                    <h3>Localized Translations by Country Code</h3>
                    <div >
                        {Object.entries(validCountries).map(([countryCode, translations]) => (
                            <div className="translation_each_row" key={countryCode}>
                                {english_copies && english_copies.length > 0 && (
                                    <div className="english_copy_section">
                                        <h4>English Copy</h4>
                                        <ul>
                                            {english_copies.map((copy, index) => (
                                                <li key={index}>{copy}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div  className="translation_section">
                                    <h4 >{countryCode}</h4>
                                    <ul>
                                        {translations.map((translation, index) => (
                                            <li className="translation_local_copy" key={index}>
                                                {translation}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    )
 }

export default CopyTranslation;
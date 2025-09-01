import React, { useState } from "react";
import "@/Pages/Qa_Page/Qa_Page.scss"; // Import CSS for styling
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import { Dropdown } from "primereact/dropdown";
import Country_code from "@/Components/Template_detail_set/Country_code";
import sad_face from "@/assets/no_value.png";
import { countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';


const Qa_page = () => {
  return (
    <div>준비중이에요.</div>
  );
  
//   const [_value, _setValue] = useState("");
//   const [projectName, setProjectName] = useState("");
//   const [PDP, setPDP] = useState("");
//   const [productName, setProductName] = useState("");
//   const [country_code, setCountry_code] = useState("");
//   const [asWasCodes, setAsWasCodes] = useState([]);
//   const [toBeCodes, setToBeCodes] = useState([]);
//   const [site_ToBeCodes, setSite_ToBeCodes] = useState([]); //site -> 권역 코드로 바뀐 to be 코드드
//   const [pptNos, setPptNos] = useState([]);
//   const [file, setFile] = useState(null);
//   const [fileContent, setFileContent] = useState("");
//   const [selectedViewOption, setSelectedViewOption] = useState("전체");
//   const [call_template_fail, setCall_template_fail] = useState(false);

//   const view_options = [
//     { name: "전체", code: "all" },
//     { name: "적용 완료", code: "true" },
//     { name: "적용 미완료", code: "false" },
//   ];

//   const normalizeCode = (code) => {
//     // Remove irrelevant characters for normalization
//     return code.replace(/[\s;"']/g, '');
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     if (selectedFile) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setFileContent(event.target.result);
//       };
//       reader.readAsText(selectedFile);
//     }
//   };

//   const checkForExistingTemplate = async () => {
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/check-template`,
//         {
//           projectName,
//           PDP,
//           productName,
//         }
//       );
  
//       if (response.data.length > 0) {
//         const detailsResponse = await axios.post(
//           `${BASE_URL}/get-template-details`,
//           {
//             projectName,
//             PDP,
//             productName,
//           }
//         );
  
//         const details = detailsResponse.data?.aswas_tobe_list || [];
//         setPptNos([]);
//         setAsWasCodes([]);
//         setToBeCodes([]);
//         setSite_ToBeCodes([]);

//         setPptNos(details.map((item) => item.ppt_no || ""));
//         setAsWasCodes(details.map((item) => item.aswas_code?.trim() || ""));
//         setToBeCodes(details.map((item) => item.tobe_code?.trim() || ""));
  
//         // After setting the toBeCodes, create site_ToBeCodes
//         setSite_ToBeCodes(details.map((item) => item.tobe_code.replace(/\/site\//g, `/${country_code}/`)));

  
//       } else {
//         alert("해당 조건의 템플릿이 없습니다.");
//         setCall_template_fail(true);
//       }
//     } catch (error) {
//       console.error("Error checking for existing templates:", error);
//       alert("템플릿 확인 중 오류가 발생했습니다.");
//       setCall_template_fail(true);
//     }
//   };

//   const updateToBeCodes = (updatedToBeCode) => {//tobe 코드 site코드 나라 권역으로 바꾸고, to be 에쎗으로 업데이트

    
//   // 에쎗 경로 배열 구분 //
//     const asset_ToBeCodes = toBeCodes
//       .filter(code => code.trim().startsWith("//"))
//       .map(code => code.replace(/\/site\//g, `/${country_code}/`));
  
//     const asset_AsWasCodes = asWasCodes
//       .filter(code => code.trim().startsWith("//"))
//       .map(code => code.replace(/\/site\//g, `/${country_code}/`));
  
//     // Ensure both arrays are not empty
//     if (asset_ToBeCodes.length === 0 || asset_AsWasCodes.length === 0) {
//       console.warn("에쎗 코드 없음.");
//       return updatedToBeCode; // Return the original code if no valid codes
//     }
//   //에쎗 코드로 한 번 더  to be 코드를 교체
//     for (let i = 0; i < asset_AsWasCodes.length; i++) {
//       const asWasCode = asset_AsWasCodes[i];
//       const toBeCode = asset_ToBeCodes[i];
  
//       if (countOccurrences(updatedToBeCode, asWasCode) > 0) {
//         // Use a regex to replace all occurrences of asWasCode with toBeCode
//         const regex = new RegExp(asWasCode, 'g'); // Global regex to replace all occurrences
//         updatedToBeCode = updatedToBeCode.replace(regex, toBeCode);
//       }
//     }
  
//     return updatedToBeCode; // Return the modified code
//   };
  

//   // 에쎗 경로 배열 구분 //
// //   const asset_ToBeCodes = toBeCodes
// //   .filter((code) => code.trim().startsWith("//"))
// //   .map((code) => code.replace(/\/site\//g, `/${country_code}/`));

// // const asset_AsWasCodes = asWasCodes
// //   .filter((code) => code.trim().startsWith("//"))
// //   .map((code) => code.replace(/\/site\//g, `/${country_code}/`));


  
  
//   return (
//     <div className="qa_page">
     
//       <div className="flex gap-14 p-10 justify-between bg-white shadow-xl rounded-b-[20px] ml-16 mr-16">
//         <div className="flex w-full justify-center items-center">
//           <SettingDropdown
//             _inputProps={{ placeholder: "S24" }}
//             _title="프로젝트명"
//             _onChange={() => {}}
//             _value={projectName}
//             _setValue={setProjectName}
//             _url="projects"
//           />
//           <SettingDropdown
//             _inputProps={{ placeholder: "Feature" }}
//             _title="PDP"
//             _onChange={() => {}}
//             _value={PDP}
//             _setValue={setPDP}
//             _url="pdps"
//           />
//           <SettingDropdown
//             _inputProps={{ placeholder: "B5" }}
//             _title="Product Name"
//             _onChange={() => {}}
//             _value={productName}
//             _setValue={setProductName}
//             _url="products"
//           />
//           <Country_code
//             country_code={country_code}
//             setCountry_code={setCountry_code}
//           />
//         </div>
        
//         <div className="flex justify-center items-center">
//           <button
//             className="bg-black text-white font-semibold text-[14px] rounded-[20px] w-[150px] shadow-xl h-[35px]"
//             onClick={checkForExistingTemplate}
//           >
//             템플릿 조회
//           </button>
//         </div>
//       </div>
//       <div className="content-div">
//         <div className="file-upload-section">
//           {file ? (
//             ` ${file.name}`
//           ) : (
//             <label></label>
//           )}

//           <div className="file-upload-input-container">
//             <input
//               type="file"
//               id="file-upload"
//               onChange={handleFileChange}
//               accept=".js,.html,.css"
//               className="file-upload-input"
//             />
//             <button
//               type="button"
//               className="file-upload-button"
//               onClick={() => document.getElementById("file-upload").click()}
//             >
//               첨부 파일 업로드
//             </button>
            
//           </div>
//         </div>
//         <div className="filter_dropdown">
//           <Dropdown
//             value={selectedViewOption}
//             options={view_options}
//             onChange={(e) => setSelectedViewOption(e.value.name)}
//             optionLabel="name"
//             placeholder={selectedViewOption}
//             className="custom-dropdown"
//           />
//         </div>
//         <form>
//           {site_ToBeCodes.map((_, index) => {
//            const updatedAsWasCode = asWasCodes[index] 
//            ? asWasCodes[index].replace(/\/site\//g, `/${country_code}/`)
//            : "";
//             const updatedToBeCode = site_ToBeCodes[index];  // Use the correct value
//             const finalUpdatedToBeCode = updateToBeCodes(updatedToBeCode);
//             const occurrenceCount = countOccurrences(fileContent, finalUpdatedToBeCode);
            
//             const isApplied = occurrenceCount === 1;
//             const shouldDisplay =
//               selectedViewOption === "전체" ||
//               (selectedViewOption === "적용 완료" && isApplied) ||
//               (selectedViewOption === "적용 미완료" && !isApplied);

//             if (!shouldDisplay) {
//               return null;
//             }

//             return (
//               <div key={index} className="as_was_to_be_div">
//                 <div className="num_type">
//                   <div className="ppt_no_col">
//                     <label className="ppt_no">PPT NO.</label>
//                     <input
//                       type="text"
//                       className="ppt_no_text"
//                       value={pptNos[index]}
//                       onChange={(e) => {
//                         const newPptNos = [...pptNos];
//                         newPptNos[index] = e.target.value;
//                         setPptNos(newPptNos);
//                       }}
//                     />
//                   </div>
//                 </div>

//                 <div className="as_was_div">
//                   <textarea
//                     id={`asWasCode${index}`}
//                     rows="5"
//                     value={updatedAsWasCode}
//                     readOnly 
//                     placeholder="Enter the as-was code here"
//                     className="QA-textarea"
//                   />
//                 </div>

//                 <div className="to_be_div">
//                   <textarea
//                     id={`toBeCode${index}`}
//                     rows="5"
//                     value={updatedToBeCode}
//                     readOnly 
//                     placeholder="Enter the to-be code here"
//                     className="QA-textarea"
//                   />
//                   <div className="duplicate-count">
                      // <div className="text-xs">
                      //   <span className="ml-1 font-bold text-[#4b5563;]">[AS-WAS] 일치하는 코드 출현 횟수 : </span>
                      // </div>
//                    {occurrenceCount}
//                   </div>
//                 </div>

//                 <div>
//                   {isApplied ? (
//                     <div className="check_true_div">
//                       <DoneIcon color="green" className="check_icon"/>
//                     </div>
//                   ) : (
//                     countOccurrences(fileContent, updatedToBeCode) > 1 ? (
//                       <div className="check_triangle_div">
//                         <ChangeHistoryIcon className="check_icon"/>
//                       </div>
//                     ) : (
//                       <div className="check_false_div">
//                         <CloseIcon className="check_icon"/>
//                       </div>
//                     )
//                   )}
//                 </div>

//               </div>
//             );
//           })}
//         </form>
//         {asWasCodes.length === 0 && call_template_fail && (
//         <>
//           <div className="nothing_rendered">
//             <h4>Try again!</h4>
//           </div>
//           <div className="nothing_rendered">
//             <img src={sad_face} />
//             <br />
//           </div>
//         </>
//       )}
//       {asWasCodes.length === 0 && !call_template_fail && (
//         <>
//           {/* <div className="nothing_rendered">
//             <h2 className= "nothing_rendered_text">원하는 템플릿을 불러오세요.</h2>
//           </div> */}
//           <div className="nothing_rendered">
//             <ContentPasteSearchIcon  sx={{ fontSize: 40 }} className="nothing_randered_img" />
//             <h2 className= "nothing_rendered_text">Select each option to call the Template</h2>
//             <br />
//           </div>
//         </>
//       )}
//       </div>
//     </div>
//   );
};

export default Qa_page;
import React, { useState } from "react";
import "./qa_page.scss";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Dropdown } from "primereact/dropdown";
import dayjs from "dayjs";
import SettingDropdown from "../../Components/ToBeApplied/SettingDropdown";
import Country_code from "../../Components/Template_detail_set/Country_code";

const Qa_page = () => {
  const [_value, _setValue] = useState("");

  const [projectName, setProjectName] = useState("");
  const [PDP, setPDP] = useState("");
  const [productName, setProductName] = useState("");
  const [createDate, setCreateDate] = useState(dayjs());
  const [country_code, setCountry_code] = useState("");

  const [asWasCodes, setAsWasCodes] = useState([]);
  const [toBeCodes, setToBeCodes] = useState([]);
  const [pptNos, setPptNos] = useState([]);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [selectedViewOption, setSelectedViewOption] = useState("전체");

  const view_options = [
    { name: "전체", code: "all" },
    { name: "적용 완료", code: "true" },
    { name: "적용 미완료", code: "false" },
  ];

  const countOccurrences = (toBeCodes) => {
    if (!fileContent || !toBeCodes) return "null";

    const normalizedAsWasCode = normalizeCode(toBeCodes);
    const normalizedFileContent = normalizeCode(fileContent);

    let occurrenceCount = 0;
    let startIndex = 0;

    // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
    while (
      (startIndex = normalizedFileContent.indexOf(
        normalizedAsWasCode,
        startIndex
      )) !== -1
    ) {
      occurrenceCount++;
      startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
    }

    return occurrenceCount; // Return the total count of occurrences
  };

  function normalizeCode(code) {
    let normalized = ""; // Initialize an empty string to hold the normalized result

    for (let i = 0; i < code.length; i++) {
      // Ignore spaces, semicolons, and quotes
      if (/[\s;"']/.test(code[i])) {
        continue; // Skip these characters
      }
      normalized += code[i]; // Append the character to the normalized string
    }

    return normalized; // Return the normalized string
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const checkForExistingTemplate = async () => {
    try {
      // console.log("Current createDate:", createDate);
      // if (!createDate || !createDate.isValid()) {
      //   alert("Please select a valid create date.");
      //   return;
      // }
      // const formattedDate = createDate.format("YYYY-MM-DD");
      console.log("Sending data to /check-template:", {
        projectName,
        PDP,
        productName,
      });

      const response = await axios.post(
        //원하는 템플릿이 존재하는 지 여부 확인
        "http://localhost:5000/check-template",
        {
          projectName,
          PDP,
          productName,
        }
      );

      if (response.data.length > 0) {
        //원하는 템플릿이 존재함을 확인했을 때 템플릿 정보 호출

        const detailsResponse = await axios.post(
          "http://localhost:5000/get-template-details",
          {
            projectName,
            PDP,
            productName,
          }
        );

        const details = detailsResponse.data;
        setPptNos(details.map((item) => item.ppt_no));
        setAsWasCodes(details.map((item) => item.aswas_code));
        setToBeCodes(details.map((item) => item.tobe_code));
      } else {
        alert("해당 조건의 템플릿이 없습니다.");
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="qa_page">
      {/* <div className="template_detail_box">
        <div className="flex w-full">
          <SettingDropdown
            _inputProps={{ placeholder: "S24" }}
            _title="프로젝트명"
            _onChange={() => {}}
            _value={projectName}
            _setValue={setProjectName}
            _url="projects"
          />
        </div>

        <div className="flex w-full">
          <SettingDropdown
            _inputProps={{ placeholder: "Feature" }}
            _title="PDP"
            _onChange={() => {}}
            _value={PDP}
            _setValue={setPDP}
            _url="pdps"
          />
        </div>

        <div className="flex w-full">
          <SettingDropdown
            _inputProps={{ placeholder: "B5" }}
            _title="Product Name"
            _onChange={() => {}}
            _value={productName}
            _setValue={setProductName}
            _url="products"
          />
        </div>
        
        <Country_code
          country_code={country_code}
          setCountry_code={setCountry_code}
        />

        <button
          type="button"
          className="check_button"
          onClick={checkForExistingTemplate}
        >
          템플릿 조회
        </button>
      </div> */}

      <div className="flex gap-14 p-10 justify-between bg-white shadow-xl rounded-b-[20px]">
          <div className="flex w-full gap-14 justify-center items-center">
            <SettingDropdown
              _inputProps={{ placeholder: "S24" }}
              _title="프로젝트명"
              _onChange={() => {}}
              _value={projectName}
              _setValue={setProjectName}
              _url="projects"
            />
            <SettingDropdown
              _inputProps={{ placeholder: "Feature" }}
              _title="PDP"
              _onChange={() => {}}
              _value={PDP}
              _setValue={setPDP}
              _url="pdps"
            />
            <SettingDropdown
              _inputProps={{ placeholder: "B5" }}
              _title="Product Name"
              _onChange={() => {}}
              _value={productName}
              _setValue={setProductName}
              _url="products"
            />
              <Country_code
                country_code={country_code}
                setCountry_code={setCountry_code}
              />
          </div>
          <div className="flex justify-center items-center">
            <button
              className="bg-black text-white font-semibold text-[14px] rounded-[20px] w-[150px] shadow-xl h-[35px]"
              onClick={checkForExistingTemplate}
            >
              템플릿 조회
            </button>
          </div>
        </div>

        <div className="content-div">
            <div className="file-upload-section">
            {file ? (
              `uploaded file : ${file.name}`
            ) : (
              <label>QA 대상 파일 업로드</label>
            )}

            <div className="file-upload-input-container">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".js,.html,.css"
                className="file-upload-input"
              />
              <button
                type="button"
                className="file-upload-button"
                onClick={() => document.getElementById("file-upload").click()}
              >
                첨부 파일 업로드
              </button>
            </div>
          </div>
          <div className="filter_dropdown">
            <Dropdown
              value={selectedViewOption}
              options={view_options}
              onChange={(e) => setSelectedViewOption(e.value.name)}
              optionLabel="name"
              placeholder={selectedViewOption}
              className="custom-dropdown"
            />
          </div>
          <form>
            {asWasCodes.map((_, index) => {
              // Ensure country_code is available before replacement
              const updatedAsWasCode = asWasCodes[index].replace(
                /\/site\//g,
                `/${country_code}/`
              );
              const updatedToBeCode = toBeCodes[index].replace(
                /\/site\//g,
                `/${country_code}/`
              );

              const occurrenceCount = countOccurrences(updatedToBeCode);

              // Determine if it should be displayed based on the selected view option
              const isApplied = occurrenceCount === 1; // "적용 완료"
              const shouldDisplay =
                selectedViewOption === "전체" ||
                (selectedViewOption === "적용 완료" && isApplied) ||
                (selectedViewOption === "적용 미완료" && !isApplied);

              if (!shouldDisplay) {
                return null; // Skip rendering this item if it doesn't meet the filter criteria
              }

              return (
                <div key={index} className="as_was_to_be_div">
                  <div className="num_type">
                    <div className="ppt_no_col">
                      <label className="ppt_no">PPT NO.</label>
                      <input
                        type="text"
                        className="ppt_no_text"
                        value={pptNos[index]}
                        onChange={(e) => {
                          const newPptNos = [...pptNos];
                          newPptNos[index] = e.target.value;
                          setPptNos(newPptNos);
                        }}
                      />
                    </div>
                  </div>

                  <div className="as_was_div">
                    <textarea
                      id={`asWasCode${index}`}
                      rows="5"
                      value={updatedAsWasCode} // Use the updated code
                      onChange={(e) => {
                        const newCodes = [...asWasCodes];
                        newCodes[index] = e.target.value;
                        setAsWasCodes(newCodes);
                      }}
                      placeholder="Enter the as-was code here"
                      className="code-textarea"
                    />
                  </div>

                  <div className="to_be_div">
                    <textarea
                      id={`toBeCode${index}`}
                      rows="5"
                      value={updatedToBeCode} // Use the updated code
                      onChange={(e) => {
                        const newCodes = [...toBeCodes];
                        newCodes[index] = e.target.value;
                        setToBeCodes(newCodes);
                      }}
                      placeholder="Enter the to-be code here"
                      className="code-textarea"
                    />
                    <div className="duplicate-count">
                      중복 횟수: {occurrenceCount}
                    </div>
                  </div>
                  <div>
                    {isApplied ? (
                      <div className="check_true_div">
                        <DoneIcon color="green" />
                      </div>
                    ) : (
                      <div className="check_false_div">
                        <CloseIcon />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {asWasCodes == "" && ( // 아무 것도 없을 때 푸터가 위로 올라오는 것을 방지
              <div className="nothing_rendered">
                {" "}
                <br />
              </div>
            )}
          </form>
        </div>
    </div>
  );
};

export default Qa_page;

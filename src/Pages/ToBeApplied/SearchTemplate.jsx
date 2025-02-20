
import SettingDropdown from "../../Components/ToBeApplied/SettingDropdown";
import Country_code from "../../Components/ToBeApplied/CountryCode";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { templateSearch } from "../../apis/apis";
import { countryCodeState, productNameState } from "../../recoil/atoms/state";

const SearchTemplate = ({setTextareas, setCodePairs}) =>{
  const [projectName, setProjectName] = useState("");
  const [pdp, setPdp] = useState("");
  const [productName, setProductName] = useRecoilState(productNameState);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState)
  
  // 템플릿 조회
  const handleSetting = async () => {
    templateSearch(projectName, pdp, productName,setTextareas, setCodePairs);
  };
    
  return(
    <>
    <div className="flex p-10 bg-white rounded-[20px] ring-2 ring-black">
        <div className="flex w-full justify-center items-center gap-0">
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
              _value={pdp}
              _setValue={setPdp}
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
              className="bg-[#009900] text-white font-semibold text-[14px] rounded-[10px] w-[120px] h-[40px]"
              onClick={handleSetting}
            >
              불러오기
            </button>
          </div>
    </div>    
    </>
    );
}

export default SearchTemplate;
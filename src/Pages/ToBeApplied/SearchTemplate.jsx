import SettingDropdown from "@/Components/ToBeApplied/SettingDropdown";
import Country_code from "@/Components/ToBeApplied/CountryCode";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { templateSearch } from "@/apis/apis";
import { countryCodeState } from "@/recoil/atoms/state";
import { ticketUrlState } from "../../recoil/atoms/state";

const SearchTemplate = ({ setTextareas, setCodePairs }) => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketURL, setTicketURL] =  useRecoilState(ticketUrlState);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);

  // 템플릿 조회
  const handleSetting = async () => {
    templateSearch(ticketNum, ticketURL, setTextareas, setCodePairs);
  };

  return (
    <>
      <div className="flex flex-col p-8 bg-white rounded-[10px] border border-gray-300 text-[#32383E]">
        <h2 className="font-bold text-black mb-5 text-[16px]">템플릿 불러오기</h2>
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center px-2 overflow-x-auto">
              <SettingDropdown
                _inputProps={{ placeholder: "WSC20200078-9816" }}
                _title="Jira 티켓 번호"
                _onChange={() => {}}
                _value={ticketNum}
                _setValue={setTicketNum}
                _url="get-ticket-number"
              />
              <SettingDropdown
                _inputProps={{ placeholder: "/smartphones/galaxy-s24-ultra/compare/" }}
                _title="Page URL"
                _onChange={() => {}}
                _value={ticketURL}
                _setValue={setTicketURL}
                _url="get-ticket-url"
              />
              <Country_code
                country_code={country_code}
                setCountry_code={setCountry_code}
              />
            </div>
            <div className="flex justify-center">
              <button
                className="flex justify-center items-center bg-[#009900] text-white font-[600] text-[13px] rounded-[10px] h-[40px] w-[130px]"
                onClick={handleSetting}
              >
                불러오기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchTemplate;

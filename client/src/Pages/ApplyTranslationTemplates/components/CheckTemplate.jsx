import InputDrop from "@/Components/Common/InputDrop";
import Gap from "@/Components/Common/Gap";

import SiteCode from "./SiteCode";

const CheckTemplate = ({
  loading,
  ticketNumOptions,
  ticketUrlOptions,
  ticketNum,
  ticketUrl,
  handleTicketNumChange,
  handleTicketUrlChange,
  countryCode,
  handleCountryChange,
  handleSearchCountryTemplate,
  isEnglishCountry,
  templateId,
}) => {
  return (
    <>
      <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 justify-between">
        <div className="flex">
          <InputDrop
            options={ticketNumOptions}
            loading={loading}
            _wrapperProps={{ className: "w-[260px]" }}
            _title="Jira 티켓 번호"
            _value={ticketNum}
            _setValue={handleTicketNumChange}
          />
          <InputDrop
            options={ticketUrlOptions}
            loading={loading}
            _wrapperProps={{ className: "w-[400px] mx-auto" }}
            _title="AEM Url"
            _value={ticketUrl}
            _setValue={handleTicketUrlChange}
          />
        </div>
      </div>

      <SiteCode
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        isEnglishCountry={isEnglishCountry}
        isDisabled={!ticketNum || !ticketUrl}
        handleGetTemplate={handleSearchCountryTemplate}
      />

      <Gap gap={30} />

      <div>
        <div style={{ fontSize: "12px", color: "grey" }}>templateId: {templateId}</div>
      </div>

      <Gap gap={30} />
    </>
  );
};

export default CheckTemplate;

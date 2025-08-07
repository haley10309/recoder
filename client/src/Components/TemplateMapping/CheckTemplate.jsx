import { useEffect, useState } from "react";
import InputDrop from "../Common/InputDrop";
import { fetchTemplates } from "@/apis/apis";
import SiteCode from "@/Pages/TemplateMapping/SiteCode";
import Gap from "../Common/Gap";

const CheckTemplate = ({
  ticketNum,
  ticketUrl,
  setTicketNum,
  setTicketUrl,
  countryCode,
  handleCountryChange,
  handleSearchCountryTemplate,
  isEnglishCountry,
  templateId,
  templateByCountryId,
  handleDeleteCountryTemplate,
}) => {
  const [loading, setLoading] = useState(true);
  const [templatesData, setTemplatesData] = useState([]);

  const filterTemplatesData = () => {
    if (ticketNum && ticketUrl) {
      return templatesData.filter((item => item.ticket_num === ticketNum && item.ticket_url === ticketUrl));
    }

    if (ticketNum) {
      return templatesData.filter((item => item.ticket_num === ticketNum));
    }

    if (ticketUrl) {
      return templatesData.filter((item => item.ticket_url === ticketUrl));
    }

    return templatesData;
  };

  const filteredTemplatesData = filterTemplatesData();
  const ticketNumOptions = filteredTemplatesData.map((item) => ({ name: item.ticket_num }));
  const ticketUrlOptions = filteredTemplatesData.map((item) => ({ name: item.ticket_url }));

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await fetchTemplates();
        setTemplatesData(data);
      } catch (error) {
        console.error('failed fetch templates', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

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
            _setValue={setTicketNum}
          />
          <InputDrop
            options={ticketUrlOptions}
            loading={loading}
            _wrapperProps={{ className: "w-[400px] mx-auto" }}
            _title="AEM Url"
            _value={ticketUrl}
            _setValue={setTicketUrl}
          />
        </div>
      </div>

      <SiteCode
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        handleSearchCountryTemplate={handleSearchCountryTemplate}
        isEnglishCountry={isEnglishCountry}
        isDisabled={!ticketNum || !ticketUrl}
      />

      <Gap gap={30} />

      <div>
        <div style={{ fontSize: "12px", color: "grey" }}>templateId: {templateId} / templateByCountryId: {templateByCountryId}</div>
      </div>

      <Gap gap={30} />

      {!!(templateByCountryId && countryCode) ? (
        <button type="button" className="remove_button" onClick={handleDeleteCountryTemplate}>
          {`${countryCode} 국가 템플릿 삭제`}
        </button>
      ) : null}
    </>
  );
};

export default CheckTemplate;

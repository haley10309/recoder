import { useEffect, useState } from "react";

import { fetchTemplates } from "@/apis/apis";

import InputDrop from "@/Components/Common/InputDrop";

const CheckTemplate = ({
  ticketNum,
  ticketUrl,
  setTicketNum,
  setTicketUrl,
  onClick,
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

  // prefix 겹치는 경우, 오히려 꼬일 수 있음
  // useEffect(() => {
  //   if (ticketNum) {
  //     console.log("changed ticketNum", filteredTemplatesData)
  //     if (filteredTemplatesData.length === 1) {
  //       const option = filteredTemplatesData[0];
  //       setTicketUrl(option.ticket_url);
  //     }
  //   }
  // }, [ticketNum]);

  return (
    <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 min-h-[150px] justify-between shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
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
      {onClick ? (
        <button className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px]" onClick={onClick}>
          확인
        </button>
      ) : null}
    </div>
  );
};

export default CheckTemplate;

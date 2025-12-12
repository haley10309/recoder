import InputDrop from "@/Components/Common/InputDrop";

const CheckTemplate = ({
  loading,
  ticketNumOptions,
  ticketUrlOptions,
  ticketNum,
  ticketUrl,
  handleTicketNumChange,
  handleTicketUrlChange,
}) => {
  return (
    <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 min-h-[150px] justify-between shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
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
  );
};

export default CheckTemplate;

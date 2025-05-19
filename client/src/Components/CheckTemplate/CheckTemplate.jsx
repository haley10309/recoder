import InputDrop from "../Common/InputDrop";

const CheckTemplate = ({
  ticketNum,
  ticketURL,
  setTicketNum,
  setTicketURL,
  onClick,
}) => {

  return (
    <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 min-h-[150px] justify-between shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
      <div className="flex">
        <InputDrop _wrapperProps={{ className: "w-[260px]" }} _title="지라 티켓 번호" _value={ticketNum} _setValue={setTicketNum} _url="get-ticket-number" />
        <InputDrop _wrapperProps={{ className: "w-[400px] mx-auto" }} _title="URL" _value={ticketURL} _setValue={setTicketURL} _url="get-ticket-url" />
      </div>
      <button className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px]" onClick={onClick}>
        확인
      </button>
    </div>
  );
};

export default CheckTemplate;

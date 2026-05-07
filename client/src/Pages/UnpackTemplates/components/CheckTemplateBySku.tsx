import InputDrop from "./InputDrop";

const CheckTemplateBySku = ({
  sku,
  setSku,
  workDate,
  setWorkDate,
  skuOptions,
  dateOptions,
  loading,
  handleGetTemplate,
}) => {
  return (
    <div className="flex items-center bg-[#F9F9F9] rounded-[8px] p-6 min-h-[150px] justify-between shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
      
      {/* 입력 영역 */}
      <div className="flex gap-6">
        
        {/* SKU */}
        <InputDrop
          options={skuOptions}
          loading={loading}
          _wrapperProps={{ className: "w-[260px]" }}
          _title="SKU 번호"
          _value={sku}
          _setValue={setSku}
        />

        {/* 작업일자 */}
        <InputDrop
          options={dateOptions}
          loading={loading}
          _wrapperProps={{ className: "w-[260px] mx-auto" }}
          _title="작업 버전, 일자"
          _value={workDate}
          _setValue={setWorkDate}
          _divProps={{
            placeholder: "예: 260506",
          }}
        />
      </div>

      {/* 조회 버튼 */}
      <button
        onClick={handleGetTemplate}
        disabled={
          loading ||
          !String(sku || "").trim() ||
          !String(workDate || "").trim()
        }
        className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px] disabled:bg-gray-300"
      >
        {loading ? "불러오는 중..." : "템플릿 불러오기"}
      </button>
    </div>
  );
};

export default CheckTemplateBySku;
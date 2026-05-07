import InputDrop from "./InputDrop";

const CheckTemplateBySku = ({
  loading,
  skuOptions,
  dateOptions,
  sku,
  setSku,
  workDate,
  setWorkDate,
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
          _wrapperProps={{ className: "w-[260px]" }}
          _title="작업 버전, 일자"
          _value={workDate}
          _setValue={setWorkDate}
        />
      </div>
    </div>
  );
};

export default CheckTemplateBySku;
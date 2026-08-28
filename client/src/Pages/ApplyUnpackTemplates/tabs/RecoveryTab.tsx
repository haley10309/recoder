import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import { useRecovery, type RecoveryMode } from "../hooks/useRecovery";

const MODE_OPTIONS: { key: RecoveryMode; label: string; desc: string }[] = [
  {
    key: "remove_unmatched",
    label: "Excel에 없는 요소 삭제",
    desc: "HTML에는 있지만 Excel에 등록되지 않은 data-copy-set 요소를 삭제합니다.",
  },
  {
    key: "remove_matched",
    label: "Excel에 있는 요소 삭제",
    desc: "Excel에 등록된 data-copy-set 요소를 HTML에서 삭제합니다.",
  },
];

const RecoveryTab = () => {
  const {
    mode,
    setMode,
    htmlFile,
    excelFile,
    processing,
    report,
    handleHtmlUpload,
    handleExcelUpload,
    handleExecute,
  } = useRecovery();

  return (
    <div>
      <PageDescriptionText
        text={"Excel과 비교하여 HTML의 data-copy-set 요소를 삭제"}
      />

      <Gap gap={50} />

      {/* ========================= */}
      {/* MODE */}
      {/* ========================= */}
      <TitleLabel text="⚙️ 삭제 기준 선택" />

      <Gap gap={15} />

      <div className="flex flex-col gap-[10px]">
        {MODE_OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={`flex flex-col gap-[4px] rounded-[10px] border px-[16px] py-[12px] cursor-pointer ${
              mode === opt.key
                ? "border-[#FF782F] bg-[#FFF6F1]"
                : "border-gray-300"
            }`}
          >
            <div className="flex items-center gap-[8px]">
              <input
                type="radio"
                name="recovery-mode"
                checked={mode === opt.key}
                onChange={() => setMode(opt.key)}
              />
              <span className="text-[13px] font-[600] text-[#32383e]">
                {opt.label}
              </span>
            </div>
            <span className="pl-[24px] text-[12px] text-gray-500">
              {opt.desc}
            </span>
          </label>
        ))}
      </div>

      <Gap gap={50} />

      {/* ========================= */}
      {/* FILE UPLOAD */}
      {/* ========================= */}
      <TitleLabel text="📤 파일 업로드" />

      <Gap gap={15} />

      <div className="flex flex-col gap-[15px]">
        <div className="flex items-center gap-[12px]">
          <span className="w-[80px] text-[13px] text-[#32383e]">Excel</span>
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm"
            onChange={handleExcelUpload}
            className="text-[13px]"
          />
          {excelFile && (
            <span className="text-[12px] text-green-600">
              {excelFile.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[12px]">
          <span className="w-[80px] text-[13px] text-[#32383e]">HTML</span>
          <input
            type="file"
            accept=".html,.htm"
            onChange={handleHtmlUpload}
            className="text-[13px]"
          />
          {htmlFile && (
            <span className="text-[12px] text-green-600">{htmlFile.name}</span>
          )}
        </div>
      </div>

      <Gap gap={50} />

      {/* ========================= */}
      {/* EXECUTE */}
      {/* ========================= */}
      <button
        className="flex justify-center items-center gap-2 bg-black text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[220px] disabled:bg-gray-300"
        onClick={handleExecute}
        disabled={processing || !excelFile || !htmlFile}
      >
        {processing && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {processing ? "처리 중..." : "실행 후 다운로드"}
      </button>

      <Gap gap={30} />

      {/* ========================= */}
      {/* REPORT */}
      {/* ========================= */}
      {report && (
        <div className="rounded-[10px] border border-gray-300 bg-white p-[20px] text-[13px]">
          <h3 className="mb-[12px] font-[600] text-[14px] text-[#32383e]">
            처리 결과
          </h3>

          <div className="mb-[12px] flex flex-wrap gap-[20px] text-gray-600">
            <span>
                Excel 번호 {report.excelCount}개
                <span className="ml-[6px] text-[11px] text-gray-400">
                ({report.source.name} · {report.source.column}열)
                </span>
            </span>
            <span>HTML 번호 {report.htmlCount}개</span>
            <span className="font-[600] text-red-600">
                삭제 {report.removedCount}개
            </span>
        </div>

          {report.removed.length > 0 && (
            <div className="mb-[10px]">
              <div className="mb-[4px] text-[12px] text-red-600">삭제됨</div>
              <div className="flex flex-wrap gap-[6px]">
                {report.removed.map((v) => (
                  <span
                    key={`removed-${v}`}
                    className="rounded bg-red-50 px-[6px] py-[2px] text-[11px] text-red-600"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SKIPPED COUNT */}
          <span>HTML 번호 {report.htmlCount}개</span>

          {report.skippedCount > 0 && (
            <span className="text-amber-600">
              형식 불일치 {report.skippedCount}개 제외
            </span>
          )}

          <span className="font-[600] text-red-600">
            삭제 {report.removedCount}개
          </span>

          {report.kept.length > 0 && (
            <div>
              <div className="mb-[4px] text-[12px] text-gray-500">유지됨</div>
              <div className="flex flex-wrap gap-[6px]">
                {report.kept.map((v) => (
                  <span
                    key={`kept-${v}`}
                    className="rounded bg-gray-100 px-[6px] py-[2px] text-[11px] text-gray-500"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Gap gap={50} />
    </div>
  );
};

export default RecoveryTab;
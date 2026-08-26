import React from "react";
import type { ReportStatus, SchemaReport } from "../Pages/ApplyUnpackTemplates/hooks/useLocalizationApply";

const STATUS_STYLE: Record<ReportStatus, { icon: string; cls: string }> = {
  success: { icon: "✓", cls: "text-green-600" },
  warning: { icon: "⚠", cls: "text-amber-600" },
  error: { icon: "✕", cls: "text-red-600" },
};

interface Props {
  report: SchemaReport | null;
}

const SchemaReportPanel = ({ report }: Props) => {
  if (!report) return null;

  return (
    <div className="rounded-[10px] border border-gray-300 bg-white p-[20px] text-[13px]">
      <div className="mb-[12px] flex items-center justify-between">
        <h3 className="font-[600] text-[14px] text-[#32383e]">
          Schema 치환 결과
        </h3>
        <span className="text-gray-500">
          {report.countryCode} ({report.locale})
        </span>
      </div>

      <ul className="flex flex-col gap-[4px]">
        {report.entries.map((e, i) => {
          const s = STATUS_STYLE[e.status];

          return (
            <li key={`schema-entry-${i}`} className="flex gap-[8px]">
              <span className={`${s.cls} shrink-0`}>{s.icon}</span>

              <span className="shrink-0 text-gray-500">
                {e.schemaType !== "-" && `${e.schemaType} #${e.index} `}
                {e.field}
              </span>

              <span className="text-[#32383e] break-all">
                {e.before && e.after && `${e.before} → ${e.after}`}
                {e.before && !e.after && e.before}
                {e.message && <span className={s.cls}> {e.message}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-[12px] border-t border-gray-200 pt-[10px] text-gray-600">
        치환 {report.replacedCount} / {report.totalTargets}
        {report.warningCount > 0 && (
          <span className="ml-[12px] text-amber-600">
            경고 {report.warningCount}
          </span>
        )}
        {report.errorCount > 0 && (
          <span className="ml-[12px] text-red-600">
            오류 {report.errorCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default SchemaReportPanel;
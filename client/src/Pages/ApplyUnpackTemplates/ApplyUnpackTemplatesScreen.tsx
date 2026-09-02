import { useState } from "react";

import Gap from "@/Components/Common/Gap";

import ApplyTab from "./tabs/ApplyTab";
import RecoveryTab from "./tabs/RecoveryTab";

type TabKey = "apply" | "recovery";

const TABS: { key: TabKey; label: string }[] = [
  { key: "apply", label: "번역 적용" },
  { key: "recovery", label: "원복" },
];

const ApplyUnpackTemplatesScreen = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("apply");

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      {/* ========================= */}
      {/* SUB TABS */}
      {/* ========================= */}
      <div className="flex gap-[8px] border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-[20px] h-[42px] text-[13px] font-[600] border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[#FF782F] text-[#FF782F]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Gap gap={30} />

      {/* ========================= */}
      {/* TAB CONTENT */}
      {/* ========================= */}
      {activeTab === "apply" ? <ApplyTab /> : <RecoveryTab />}
    </div>
  );
};

export default ApplyUnpackTemplatesScreen;
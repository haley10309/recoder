import React, { useState } from "react";
import Rodal from "rodal";
import "rodal/lib/rodal.css";

/**
 * @param untranslatedCopies: { english_copy: string }[]
 * @param untranslatedLocalCopies: string[]
 */
const ShowDetail = ({
  untranslatedCopies = [],
  untranslatedLocalCopies = [],
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button
        className="px-4 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded hover:bg-blue-200 text-sm font-medium transition"
        onClick={() => setVisible(true)}
      >
        🔍 View Details
      </button>

      <Rodal
        visible={visible}
        onClose={() => setVisible(false)}
        width={900}
        height={600}
        customStyles={{
          padding: "0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div className="p-6 max-h-[540px] overflow-y-auto bg-white">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            📝 Localization Detail
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="w-full">
              <h3 className="text-base font-medium text-gray-700 mb-2">
                🇬🇧 영어 원문
              </h3>
              {untranslatedCopies.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {untranslatedCopies.map((item, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-50 border border-gray-200 p-2 rounded text-gray-800"
                    >
                      {item.english_copy}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No untranslated copies</p>
              )}
            </div>
            <div className="w-full">
              <h3 className="text-base font-medium text-gray-700 mb-2">
                🌐 Local 번역 X
              </h3>
              {untranslatedLocalCopies.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {untranslatedLocalCopies.map((copy, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-50 border border-gray-200 p-2 rounded text-gray-800"
                    >
                      {copy || "― (빈 값)"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No local copies</p>
              )}
            </div>
          </div>
        </div>
      </Rodal>
    </div>
  );
};

export default ShowDetail;

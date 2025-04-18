import React, { useState } from "react";
import ToBeCodeTable from "@LocalizationComponent/ToBeCodeTable";

const CountryRow = ({
  row,
  validCountries,
  translationData,
  removeCountryRow,
}) => {
  const [country, setCountry] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="border rounded p-4 mb-3 bg-gray-50">
      <div className="flex gap-4 items-center">
        <select
          className="border border-gray-300 rounded px-3 py-2 bg-white flex-1"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">국가 선택</option>
          {validCountries.map((code) => (
            <option key={code}>{code}</option>
          ))}
        </select>
        <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded px-3 py-1 cursor-pointer">
          HTML 업로드
        </button>
        <button
          className="bg-gray-100 hover:bg-gray-200 text-black-600 rounded px-3 py-1 cursor-pointer"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "코드 숨기기" : "코드 보기"}
        </button>
        <button
          className="bg-red-100 hover:bg-red-200 text-red-600 rounded px-3 py-1 cursor-pointer"
          onClick={() => removeCountryRow(row.id)}
        >
          삭제
        </button>
      </div>
      {showPreview && country && (
        <ToBeCodeTable codes={translationData[country] || []} />
      )}
    </div>
  );
};

export default CountryRow;

import React, { useState } from "react";
import CountryRow from "@LocalizationComponent/CountryRow";

const CountryRows = ({ validCountries, translationData }) => {
  const [rows, setRows] = useState([]);

  const addCountryRow = () => {
    setRows([...rows, { id: Date.now(), country: "" }]);
  };

  const removeCountryRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="mb-6 p-6 bg-white rounded shadow">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-lg">🌍 국가별 설정</h2>
        <button
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded px-3 py-1 cursor-pointer"
          onClick={addCountryRow}
        >
          국가 추가 +
        </button>
      </div>
      {rows.map((row) => (
        <CountryRow
          key={row.id}
          row={row}
          validCountries={validCountries}
          translationData={translationData}
          removeCountryRow={removeCountryRow}
        />
      ))}
    </div>
  );
};

export default CountryRows;

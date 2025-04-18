import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const ToBeCodeTable = ({ codes }) => (
  <table className="w-full border-collapse bg-white rounded">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="p-2 w-[10%]">PPT NO.</th>
        <th className="p-2 w-[40%]">로컬라이제이션 AS WAS</th>
        <th className="p-2 w-[40%]">로컬라이제이션 TO BE</th>
        <th className="p-2 w-[10%] text-center">적용 여부</th>
      </tr>
    </thead>
    <tbody>
      {codes.map((row, idx) => (
        <tr key={idx} className="border-t">
          <td className="p-2">{row.ppt}</td>
          <td className="p-2 bg-gray-50">
            <div dangerouslySetInnerHTML={{ __html: row.asWas }} />
          </td>
          <td className="p-2 bg-gray-50">
            <div dangerouslySetInnerHTML={{ __html: row.toBe }} />
          </td>
          <td className="p-2 text-center">
            {row.applied ? (
              <CheckIcon className="text-green-600" />
            ) : (
              <CloseIcon className="text-red-500" />
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ToBeCodeTable;

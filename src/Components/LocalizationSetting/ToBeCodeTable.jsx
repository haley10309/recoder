import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";

const ToBeCodeTable = ({ toBeCodes, onDelete }) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 className="font-semibold mb-4">TO-BE 코드 확인하기</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2 text-left">
              PPT NO.
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              To-Be Code
            </th>
            <th className="border border-gray-200 px-4 py-2 text-center">
              삭제
            </th>
          </tr>
        </thead>
        <tbody>
          {toBeCodes.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">{row.ppt}</td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="bg-gray-100 px-3 py-2 rounded">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: row.code.replace(
                        /upgrade/g,
                        `<span class='text-red-500 font-bold'>upgrade</span>`
                      ),
                    }}
                  />
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2 text-center">
                {row.code && (
`                  <button
                    onClick={() => onDelete(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <DeleteIcon />
                  </button>`
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default ToBeCodeTable;

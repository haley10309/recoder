import React from "react";

const TemplateSelect = ({
  project,
  pdp,
  product,
  setProject,
  setPdp,
  setProduct,
}) => (
  <div className="mb-6 p-6 bg-white rounded shadow">
    <h2 className="font-semibold text-lg mb-4">📑 로컬라이제이션 템플릿 불러오기</h2>
    <div className="grid grid-cols-4 gap-4">
      {[
        {
          value: project,
          setter: setProject,
          placeholder: "프로젝트 선택",
          options: ["Project 1"],
        },
        {
          value: pdp,
          setter: setPdp,
          placeholder: "PDP 선택",
          options: ["Features"],
        },
        {
          value: product,
          setter: setProduct,
          placeholder: "제품 선택",
          options: ["Product 1"],
        },
      ].map(({ value, setter, placeholder, options }, idx) => (
        <select
          key={idx}
          value={value}
          onChange={(e) => setter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 bg-white"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}
      <button className="bg-green-100 hover:bg-green-200 text-green-600 rounded px-3 py-1 cursor-pointer">
        템플릿 불러오기
      </button>
    </div>
  </div>
);

export default TemplateSelect;

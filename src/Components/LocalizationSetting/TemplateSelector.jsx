// components/TemplateSelector.jsx
import React from "react";
import { DUMMY_PROJECTS, DUMMY_PDPS, DUMMY_PRODUCTS } from "@DummyData/setting_dummy";

const TemplateSelector = ({
  selectedTemplate,
  onTemplateClick,
  showOptions,
  project,
  pdp,
  product,
  setProject,
  setPdp,
  setProduct,
}) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">템플릿 불러오기</h2>
        <div className="flex gap-3">
          {["1차 TO BE", "로컬라이제이션 적용"].map((tpl) => (
            <button
              key={tpl}
              onClick={() => onTemplateClick(tpl)}
              className={`px-4 py-2 rounded-md border ${
                selectedTemplate === tpl
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {tpl}
            </button>
          ))}
        </div>
      </div>

      {showOptions && (
        <div className="flex flex-wrap gap-4">
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="border px-4 py-2 rounded-md bg-white"
          >
            <option value="">프로젝트명</option>
            {DUMMY_PROJECTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={pdp}
            onChange={(e) => setPdp(e.target.value)}
            className="border px-4 py-2 rounded-md bg-white"
          >
            <option value="">PDP</option>
            {DUMMY_PDPS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="border px-4 py-2 rounded-md bg-white"
          >
            <option value="">Product Name</option>
            {DUMMY_PRODUCTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
            불러오기
          </button>
        </div>
      )}
    </section>
  );
};

export default TemplateSelector;
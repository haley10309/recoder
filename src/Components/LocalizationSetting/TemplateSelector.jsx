import React from "react";
import { DUMMY_PROJECTS, DUMMY_PDPS, DUMMY_PRODUCTS, DUMMY_TEMPLATES } from "@DummyData/setting_dummy";

const TemplateSelector = ({
  selectedTemplate,
  setSelectedTemplate,
  project,
  pdp,
  product,
  setProject,
  setPdp,
  setProduct,
  handleApply,
}) => {
  return (
    <section className="bg-gray-50 border rounded-lg shadow-sm px-8 py-6 mb-8">
      <div className="grid grid-cols-5 gap-6 items-end">
        {/* 템플릿 종류 */}
        <div>
          <label className="block font-semibold mb-2">템플릿 종류</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-white border-orange-400 outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">선택</option>
            {DUMMY_TEMPLATES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* 프로젝트 */}
        <div>
          <label className="block font-semibold mb-2">프로젝트</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-white border-orange-400 outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">선택</option>
            {DUMMY_PROJECTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* PDP */}
        <div>
          <label className="block font-semibold mb-2">PDP</label>
          <select
            value={pdp}
            onChange={(e) => setPdp(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-white border-orange-400 outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">선택</option>
            {DUMMY_PDPS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* 제품명 */}
        <div>
          <label className="block font-semibold mb-2">제품명</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-white border-orange-400 outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">선택</option>
            {DUMMY_PRODUCTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* 확인 버튼 */}
        <div className="flex items-end justify-end">
          <button
            onClick={handleApply}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-md"
          >
            확인
          </button>
        </div>
      </div>
    </section>
  );
};

export default TemplateSelector;

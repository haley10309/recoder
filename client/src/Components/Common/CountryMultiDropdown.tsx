import { useState, useRef, useEffect, useMemo } from "react";

const COUNTRY_OPTIONS = ["AE", "AE_AR", "AFRICA_EN", "AFRICA_FR", "AFRICA_PT", "AL", "AR", "AT", "AU", "AZ", "BA", "BD",
"BE", "BE_FR", "BG", "BR", "CA", "CA_FR", "CH", "CH_FR", "CL", "CN", "CO", "CZ", "DE", "DK", "EE",
"EG", "ES", "FI", "FR", "GE", "GR", "HK", "HR", "HU", "ID", "IE", "IL", "IN", "IQ_AR", "IQ_KU",
"IRAN", "IT", "JP", "KZ_KZ", "KZ_RU", "LATIN", "LB", "LATIN_EN", "LEVANT", "LEVANT_AR", "LT",
"LV", "MK", "MM", "MN", "MX", "MY", "N_AFRICA", "NL", "NO", "NZ", "PE", "PH", "PK", "PL", "PS",
"PT", "PY", "RO", "RS", "RU", "SA", "SA_EN", "SE", "SG", "SI", "SK", "TH", "TR", "TW", "UA", "US",
"UK", "UY", "UZ_RU", "UZ_UZ", "VN", "VN_ZA", "ZA"];

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function CountryMultiDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 필터
  const filteredOptions = useMemo(() => {
    return COUNTRY_OPTIONS.filter((country) =>
      country.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleCountry = (country: string) => {
    const exists = value.includes(country);

    const updated = exists
      ? value.filter((c) => c !== country)
      : [...value, country];

    onChange(updated);
  };

  const selectAll = () => {
    onChange(COUNTRY_OPTIONS);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div ref={wrapperRef} className="relative w-full text-sm">
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="border rounded px-3 py-2 bg-white cursor-pointer flex justify-between items-center hover:border-gray-400"
      >
        <span className={value.length === 0 ? "text-gray-400" : ""}>
          {value.length === 0 ? "기본 적용" : value.join(", ")}
        </span>
        <span className="text-xs">▼</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg p-3">
          {/* 검색창 */}
          <input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />

          {/* 액션 버튼 */}
          <div className="flex justify-between mb-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="text-blue-600 hover:underline"
            >
              전체 선택
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-gray-500 hover:underline"
            >
              선택 해제
            </button>
          </div>

          {/* 체크 목록 */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <div className="text-gray-400 text-xs">검색 결과 없음</div>
            )}

            {filteredOptions.map((country) => (
              <label
                key={country}
                className="flex items-center mb-1 cursor-pointer hover:bg-gray-50 px-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={value.includes(country)}
                  onChange={() => toggleCountry(country)}
                  className="mr-2"
                />
                {country}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
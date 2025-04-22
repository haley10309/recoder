import React from "react";
import { twMerge } from "tailwind-merge";
import { Dropdown } from "primereact/dropdown";

const divWrapperClasses = {
  dropdown:
    "ring-[#747D7E] flex h-[35px] gap-2 text-[12px] w-full flex flex-col",
};
const divClasses = {
  default:
    "focus-within:bg-none w-48 h-full p-4 ring-1 ring-black flex justify-center align-center items-center font-medium",
};

const CountryCode = ({ country_code, setCountry_code }) => {
  const countryOptions = [
    { name: "AE", code: "ae" },
    { name: "AE_AR", code: "ae_ar" },
    { name: "AFRICA_EN", code: "africa_en" },
    { name: "AFRICA_FR", code: "africa_fr" },
    { name: "AFRICA_PT", code: "africa_pt" },
    { name: "AL", code: "al" },
    { name: "AR", code: "ar" },
    { name: "AT", code: "at" },
    { name: "AU", code: "au" },
    { name: "AZ", code: "az" },
    { name: "BA", code: "ba" },
    { name: "BD", code: "bd" },
    { name: "BE", code: "be" },
    { name: "BE_FR", code: "be_fr" },
    { name: "BG", code: "bg" },
    { name: "BR", code: "br" },
    { name: "CA", code: "ca" },
    { name: "CA_FR", code: "ca_fr" },
    { name: "CH", code: "ch" },
    { name: "CH_FR", code: "ch_fr" },
    { name: "CL", code: "cl" },
    { name: "CN", code: "cn" },
    { name: "CO", code: "co" },
    { name: "CZ", code: "cz" },
    { name: "DE", code: "de" },
    { name: "DK", code: "dk" },
    { name: "EE", code: "ee" },
    { name: "EG", code: "eg" },
    { name: "ES", code: "es" },
    { name: "FI", code: "fi" },
    { name: "FR", code: "fr" },
    { name: "GE", code: "ge" },
    { name: "GR", code: "gr" },
    { name: "HK", code: "hk" },
    { name: "HR", code: "hr" },
    { name: "HU", code: "hu" },
    { name: "ID", code: "id" },
    { name: "IE", code: "ie" },
    { name: "IL", code: "il" },
    { name: "IN", code: "in" },
    { name: "IQ_AR", code: "iq_ar" },
    { name: "IQ_KU", code: "iq_ku" },
    { name: "IRAN", code: "iran" },
    { name: "IT", code: "it" },
    { name: "JP", code: "jp" },
    { name: "KZ_KZ", code: "kz_kz" },
    { name: "KZ_RU", code: "kz_ru" },
    { name: "LATIN", code: "latin" },
    { name: "LB", code: "lb" },
    { name: "LEVANT", code: "levant" },
    { name: "LEVANT_AR", code: "levant_ar" },
    { name: "LATIN_EN", code: "latin_en" },
    { name: "LB", code: "lb" },
    { name: "LT", code: "lt" },
    { name: "LV", code: "lv" },
    { name: "MK", code: "mk" },
    { name: "MM", code: "mm" },
    { name: "MN", code: "mn" },
    { name: "MX", code: "mx" },
    { name: "MY", code: "my" },
    { name: "N_AFRICA", code: "n_africa" },
    { name: "NL", code: "nl" },
    { name: "NO", code: "no" },
    { name: "NZ", code: "nz" },
    { name: "PE", code: "pe" },
    { name: "PH", code: "ph" },
    { name: "PK", code: "pk" },
    { name: "PL", code: "pl" },
    { name: "PS", code: "ps" },
    { name: "PT", code: "pt" },
    { name: "PY", code: "py" },
    { name: "RO", code: "ro" },
    { name: "RS", code: "rs" },
    { name: "RU", code: "ru" },
    { name: "SA", code: "sa" },
    { name: "SA_EN", code: "sa_en" },
    { name: "SE", code: "se" },
    { name: "SG", code: "sg" },
    { name: "SI", code: "si" },
    { name: "SK", code: "sk" },
    { name: "TH", code: "th" },
    { name: "TR", code: "tr" },
    { name: "TW", code: "tw" },
    { name: "UA", code: "ua" },
    { name: "US", code: "us" },
    { name: "UK", code: "uk" },
    { name: "UY", code: "uy" },
    { name: "UZ_RU", code: "uz_ru" },
    { name: "UZ_UZ", code: "uz_uz" },
    { name: "VN", code: "vn" },
    { name: "VN_ZA", code: "vn_za" },
    { name: "ZA", code: "za" },
  ];

  const selectedCountryTemplate = (option) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.name}</div>
        </div>
      );
    }
    return <span>선택</span>;
  };

  const countryOptionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <div
      className={twMerge(
        divWrapperClasses.dropdown,
        "flex items-start justify-center"
      )}
    >
      <div className="flex gap-2 justify-center items-start">
        <div className="flex items-start font-[600] gap-2">국가코드</div>
      </div>
      <div className={twMerge(divClasses.default)}>
        <Dropdown
          value={countryOptions.find((option) => option.code === country_code)}
          options={countryOptions}
          onChange={(e) => setCountry_code(e.value.code)}
          optionLabel="name"
          placeholder="선택"
          filter
          valueTemplate={selectedCountryTemplate}
          itemTemplate={countryOptionTemplate}
          className="dropdown"
        />
      </div>
    </div>
  );
};

export default CountryCode;

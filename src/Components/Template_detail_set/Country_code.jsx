import { useState } from "react";
import "./Country_code.scss";
import CheckIcon from "@mui/icons-material/Check";
import { Dropdown } from "primereact/dropdown";

const Country_code = ({ country_code, setCountry_code }) => {
  const coutry_code = [
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
    { name: "CL", code: "cl" },
    { name: "CN", code: "cn" },
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
    { name: "HK_EN", code: "hk_en" },
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
    { name: "JF", code: "jf" },
    { name: "KZ_KZ", code: "kz_kz" },
    { name: "KZ_RU", code: "kz_ru" },
    { name: "LATIN", code: "latin" },
    { name: "LATIN_EN", code: "latin_en" },
    { name: "LEVANT", code: "levant" },
    { name: "LEVANT_AR", code: "levant_ar" },
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
    { name: "SEC", code: "sec" },
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
    { name: "VN_ZA", code: "vn_za" },
  ];
  return (
    <div className="country_code_button">
      <div className="segment-start">
        <div className="container">
          <div className="state-layer">
            <CheckIcon className="check-icon" />
            <div className="label-text">국가 코드</div>
          </div>
        </div>
      </div>
      <div className="segment-end">
        <div className="container2">
          <Dropdown
            value={country_code} // This should be the country code object
            options={coutry_code}
            onChange={(e) => setCountry_code(e.value.code)} // Set the code directly
            optionLabel="name" // Display the 'name' in the dropdown
            placeholder={country_code}
            className="dropdown"
          />
        </div>
      </div>
    </div>
  );
};

export default Country_code;

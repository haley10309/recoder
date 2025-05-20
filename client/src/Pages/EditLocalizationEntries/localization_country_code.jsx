import React from "react";
import { Dropdown } from "primereact/dropdown";
import { twMerge } from "tailwind-merge";

const localization_country_code = ({ countryCode, validCountries, onChange }) => {

    const countryOptions = validCountries.map((code) => ({ name: code, code }));

    return (
        <div className={twMerge("w-48")}>
            <Dropdown
                value={countryOptions.find((option) => option.code === countryCode)}
                options={countryOptions}
                onChange={(e) => onChange(e.value.code)}
                optionLabel="name"
                placeholder="Select Country Code"
                filter
                className={twMerge("w-full p-2 border border-gray-300 rounded-md shadow-sm")}
            />
        </div>
    );
};

export default localization_country_code;

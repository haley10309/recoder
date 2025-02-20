import { useState, useEffect } from "react";
import axios from "axios";
import { twMerge } from "tailwind-merge";
import { Dropdown } from "primereact/dropdown";
import Check from "../../assets/check.png";
import { templateOption } from "../../apis/apis";

const divWrapperClasses = {
  dropdown:
    "ring-[#747D7E] flex h-[35px] gap-2 text-[12px] mr-10 flex flex-col",
};
const divClasses = {
  default:"focus-within:bg-none h-full p-4 ring-1 ring-black flex justify-center align-center items-center font-[500]",
};

const SettingDropdown = ({
  _wrapperProps,
  _divProps,
  _state,
  _title,
  _value,
  _setValue,
  _url,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOptions = (option) => {
    return (
      <div className="flex align-items-center">
        <div>{option.name}</div>
      </div>
    );
  };

  useEffect(() => {
    const fetchProducts = async() => {
      try {
        const response = await axios.get(`http://localhost:5000/${_url}`);
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching product names:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      {..._wrapperProps}
      className={twMerge(
        divWrapperClasses.dropdown,
        _state ? divWrapperClasses[_state] : "",
        _wrapperProps?.className,
        "flex items-start justify-center"
      )}
    >
      <div className="flex gap-2 justify-center items-start">
        {/* <img
          className="w-[14px] h-[12px] align-center"
          src={Check}
          alt="check"
        /> */}
        {_title && (
          <div className="flex items-start font-[600] gap-2">
            {_title}
          </div>
        )}
      </div>
      {loading ? (
        <p>Loading ...</p>
      ) : (
        <div
          {..._divProps}
          className={twMerge(
            divClasses.default,
            _divProps?.className
          )}
        >
          <Dropdown
            value={options.find((option) => option.name === _value)}
            options={options}
            onChange={(e) => _setValue(e.value.name)}
            optionLabel="name"
            placeholder="선택"
            className="px-10 gap-4"
            filter
            itemTemplate={handleOptions}
          />
        </div>
      )}
    </div>
  );
};

export default SettingDropdown;

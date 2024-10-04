import { useState, useEffect } from "react";
import axios from "axios";
import { twMerge } from "tailwind-merge";
import { Dropdown } from "primereact/dropdown";
import Check from "../../assets/check.png";

const divWrapperClasses = {
  dropdown:
    "bg-[#DEE1F8] rounded-[20px] ring-1 ring-[#747D7E] flex h-[35px] gap-2 text-[10px] w-full",
};
const divClasses = {
  default:
    "focus-within:bg-none w-full bg-white focus:outline-none focus:ring-0",
  "default-font":
    "font-noto placeholder:text-[#787878] text-[12px] font-normal leading-normal",
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
  const [isValidFormat, setIsValidFormat] = useState(true);
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
    const fetchProducts = async () => {
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
        //   isValidFormat ? "" : divWrapperClasses.default,
        "flex items-center"
      )}
    >
      <div className="flex flex-[0.5] gap-2 justify-center">
        <img
          className="w-[14px] h-[12px] align-center "
          src={Check}
          alt="check"
        />
        {_title && (
          <div className="flex items-center font-medium px-4 gap-2">
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
            divClasses["default-font"],
            "flex justify-center align-center items-center flex-[0.5] h-full rounded-tr-[20px] rounded-br-[20px] font-medium border-l border-[#747D7E]",
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

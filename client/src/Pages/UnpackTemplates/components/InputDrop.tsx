import { useState } from "react";
import { AutoComplete } from "primereact/autocomplete";
import { twMerge } from "tailwind-merge";

interface OptionType {
  name: string;
}

const InputDrop = ({
  options = [],
  loading,
  _wrapperProps,
  _divProps,
  _title,
  _value,
  _setValue,
}: any) => {
  const [filtered, setFiltered] = useState<OptionType[]>([]);

  const search = (e: any) => {
    const query = (e.query || "").toLowerCase();

    if (!query) {
      setFiltered(options);
      return;
    }

    setFiltered(
      options.filter((o: OptionType) =>
        o.name.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div
      {..._wrapperProps}
      className={twMerge(
        "flex flex-col gap-1 text-[12px]",
        _wrapperProps?.className
      )}
    >
      {_title && <div className="font-semibold">{_title}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <AutoComplete
          value={_value || ""}
          suggestions={filtered}
          completeMethod={search}
          field="name"
          dropdown
          dropdownMode="blank"

          onDropdownClick={() => setFiltered(options)}
          // onFocus={() => setFiltered(options)}

          onChange={(e) => _setValue?.(e.target.value)}
          onSelect={(e) => _setValue?.(e.value.name)}

          placeholder="입력 또는 선택"

          className={twMerge(
            "w-full h-[42px] px-3 border border-[#FF782F] rounded-[10px] bg-white",
            _divProps?.className
          )}

          panelClassName="shadow-xl border rounded-[10px] bg-white max-h-[220px] overflow-auto"

          itemTemplate={(item: OptionType) => (
            <div className="px-3 py-2 hover:bg-orange-100 cursor-pointer">
              {item.name}
            </div>
          )}
        />
      )}
    </div>
  );
};

export default InputDrop;
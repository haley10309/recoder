const ApplyEntryItem = ({ entry, index, onChange }) => {
  return (
    <div className="flex gap-[20px] p-[20px] bg-[#f9f9f9] rounded-[10px] shadow-sm">
      
      {/* 좌측 */}
      <div className="w-[250px] text-[13px] text-gray-700">
        <p><b>attr:</b></p>
        <p className="ml-2">{entry.target}</p>

        <p className="mt-2"><b>type:</b></p>
        <p className="ml-2">{entry.applyType}</p>

        <p className="mt-2"><b>Sup:</b></p>
        <p className="ml-2">{entry.excludeSup || "X"}</p>

        <p className="mt-2"><b>enable-text-transform:</b></p>
        <p className="ml-2">{entry.enableTextTransform || "X"}</p>
      </div>

      {/* 우측 */}
      <div className="flex-1 flex flex-col gap-[10px]">
        
        {/* Origin Copy */}
        <div>
          <p className="text-[12px] font-[600] mb-1">Origin Copy</p>
          <textarea
            value={entry.originCopy}
            readOnly
            className="w-full h-[80px] p-[10px] bg-[#e9e9e9] rounded border text-[13px]"
          />
        </div>

        {/* Deck + 적용 카피 (가로 배치) */}
        <div className="flex gap-[10px]">
            
            {/* Deck Copy */}
            <div className="flex-1">
            <p className="text-[12px] font-[600] mb-1">Deck Copy</p>
            <textarea
                value={entry.deckCopy}
                readOnly
                className="w-full h-[100px] p-[10px] bg-[#e9e9e9] rounded border text-[13px]"
            />
            </div>

            {/* 적용 카피 */}
            <div className="flex-1">
            <p className="text-[12px] font-[600] mb-1">적용 카피</p>
            <textarea
                value={entry.appliedCopy}
                onChange={(e) => onChange(index, e.target.value)}
                className="w-full h-[100px] p-[10px] bg-white rounded border text-[14px]"
            />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyEntryItem;
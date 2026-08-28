import Gap from "@/Components/Common/Gap";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

const RecoveryTab = () => {
  return (
    <div className="bg-[#FFFFFF] p-10">
      <PageDescriptionText text={"변환된 HTML을 원본 상태로 복구"} />

      <Gap gap={50} />

      <div className="flex justify-center items-center h-[300px] text-[13px] text-gray-400">
        작업 중
      </div>
    </div>
  );
};

export default RecoveryTab;
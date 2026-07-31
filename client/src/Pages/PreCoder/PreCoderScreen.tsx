import React, { useState } from "react";
import styled from "styled-components";

import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import Gap from "@/Components/Common/Gap";

import PreCoderRunTab from "./components/PreCoderRunTab";
import PreCoderHistoryTab from "./components/PreCoderHistoryTab";
import ScrollToTopButton from "./components/ScrollToTopButton";

type PreCoderTabKey = "run" | "history";

// pre-coder: wwpd 작업 전 recoder에 넣기 위한 파일(html) 최적화 검사 화면.
// "검사 실행" 탭과 "결과 열람" 탭으로 분리해, 검사 결과가 한 화면에 계속 쌓이지 않도록 한다.
const PreCoderScreen = () => {
  const [activeTab, setActiveTab] = useState<PreCoderTabKey>("run");

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText
        text={
          "wwpd 작업 전 recoder에 넣기 위한 파일 최적화 검사입니다. 사업부에서 제공하는 .html 파일과 영문 카피덱이 recoder에 입력할 만한 조건을 갖추었는지 확인 및 정제합니다."
        }
      />
      <Gap gap={30} />

      <TabBar>
        <TabButton $active={activeTab === "run"} onClick={() => setActiveTab("run")}>
          검사 실행
        </TabButton>
        <TabButton $active={activeTab === "history"} onClick={() => setActiveTab("history")}>
          결과 열람
        </TabButton>
      </TabBar>
      <Gap gap={30} />

      {activeTab === "run" ? <PreCoderRunTab /> : <PreCoderHistoryTab />}

      <ScrollToTopButton />

      <Gap gap={50} />
    </div>
  );
};

export default PreCoderScreen;

const TabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #eeeeee;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.7rem 1.1rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? "#ff782f" : "#9ca3af")};
  border-bottom: 2px solid ${({ $active }) => ($active ? "#ff782f" : "transparent")};
  margin-bottom: -1px;
`;

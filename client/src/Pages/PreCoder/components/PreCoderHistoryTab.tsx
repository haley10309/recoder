import React, { useMemo, useState } from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";

import PreCoderHistoryPanel from "./PreCoderHistoryPanel";
import PreCoderSummary from "./PreCoderSummary";
import {
  DuplicateSection,
  ScopeSection,
  TypeMismatchSection,
  OrderSection,
  UntaggedCopySection,
} from "./PreCoderResultSections";

import { usePreCoderHistory } from "../hooks/usePreCoderHistory";

const normalize = (v: string) => v.toLowerCase().trim();

// "결과 열람" 탭: 저장된 검사 결과를 검색하고, 누가/언제/어떤 파일로 만들었는지 함께 보여준다.
const PreCoderHistoryTab = () => {
  const {
    historyList,
    historyLoadStatus,
    loadedResult,
    detailLoadStatus,
    loadResultDetail,
  } = usePreCoderHistory();

  const [keyword, setKeyword] = useState("");

  const filteredList = useMemo(() => {
    const q = normalize(keyword);
    if (!q) return historyList;
    return historyList.filter((item) => {
      const haystack = normalize(
        [item.title, item.html_filename, item.excel_filename, item.created_by_name || ""].join(" ")
      );
      return haystack.includes(q);
    });
  }, [historyList, keyword]);

  return (
    <div>
      <TitleLabel text="🗂 저장된 검사 결과" />
      <Gap gap={15} />
      <SearchInput
        type="text"
        placeholder="제목 / 파일명 / 저장자로 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Gap gap={12} />
      <ResultCount>
        총 {historyList.length}건 {keyword && `중 ${filteredList.length}건 검색됨`}
      </ResultCount>
      <Gap gap={10} />
      <PreCoderHistoryPanel
        historyList={filteredList}
        historyLoadStatus={historyLoadStatus}
        onSelect={loadResultDetail}
        selectedId={loadedResult?.id}
      />
      <Gap gap={40} />

      {detailLoadStatus === "loading" && <StatusText>결과 불러오는 중...</StatusText>}

      {loadedResult && (
        <>
          <MetaCard>
            <MetaTitle>{loadedResult.title}</MetaTitle>
            <MetaGrid>
              <MetaItem>
                <MetaLabel>저장자</MetaLabel>
                <MetaValue>{loadedResult.createdByName || "알 수 없음"}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>저장 일시</MetaLabel>
                <MetaValue>{new Date(loadedResult.createdAt).toLocaleString("ko-KR")}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>html 파일</MetaLabel>
                <MetaValue>{loadedResult.htmlFilename}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>카피덱 파일</MetaLabel>
                <MetaValue>{loadedResult.excelFilename}</MetaValue>
              </MetaItem>
            </MetaGrid>
          </MetaCard>
          <Gap gap={30} />

          <TitleLabel text="🔎 검사 결과 요약" />
          <Gap gap={15} />
          <PreCoderSummary result={loadedResult.result} />
          <Gap gap={50} />

          <WhiteBox>
            <DuplicateSection issues={loadedResult.result.duplicateIssues} />
            <Gap gap={40} />
            <ScopeSection issues={loadedResult.result.scopeIssues} />
            <Gap gap={40} />
            <TypeMismatchSection issues={loadedResult.result.typeMismatchIssues} />
            <Gap gap={40} />
            <OrderSection
              issues={loadedResult.result.orderIssues}
              sequence={loadedResult.result.orderSequence}
            />
            <Gap gap={40} />
            <UntaggedCopySection issues={loadedResult.result.untaggedCopyIssues} />
          </WhiteBox>
        </>
      )}
    </div>
  );
};

export default PreCoderHistoryTab;

const SearchInput = styled.input`
  width: 100%;
  max-width: 26rem;
  height: 2.4rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 0.9rem;
  font-size: 0.83rem;
`;

const ResultCount = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatusText = styled.div`
  font-size: 13px;
  color: #4b5563;
`;

const MetaCard = styled.div`
  border: 1px solid #eeeeee;
  border-radius: 0.6rem;
  padding: 1rem 1.2rem;
  background: #f9f9f9;
`;

const MetaTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.8rem;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetaLabel = styled.span`
  font-size: 0.7rem;
  color: #9ca3af;
`;

const MetaValue = styled.span`
  font-size: 0.8rem;
  color: #32383e;
  font-weight: 600;
  word-break: break-all;
`;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;

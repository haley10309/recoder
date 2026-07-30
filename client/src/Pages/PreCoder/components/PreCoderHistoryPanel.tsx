import React from "react";
import styled from "styled-components";

import type { PreCoderResultSummary } from "@/apis/preCoderApis";

const PreCoderHistoryPanel = ({
  historyList,
  historyLoadStatus,
  onSelect,
  selectedId,
}: {
  historyList: PreCoderResultSummary[];
  historyLoadStatus: string;
  onSelect: (id: number) => void;
  selectedId?: number | null;
}) => {
  if (historyLoadStatus === "loading") {
    return <EmptyText>불러오는 중...</EmptyText>;
  }

  if (historyList.length === 0) {
    return <EmptyText>저장된 검사 결과가 없습니다. 검사를 실행한 뒤 저장해보세요.</EmptyText>;
  }

  return (
    <List>
      {historyList.map((item) => (
        <ListItem
          key={item.id}
          $active={item.id === selectedId}
          onClick={() => onSelect(item.id)}
        >
          <TitleRow>
            <ItemTitle>{item.title}</ItemTitle>
            <ItemDate>{new Date(item.created_at).toLocaleString("ko-KR")}</ItemDate>
          </TitleRow>
          <MetaRow>
            <span>📄 {item.html_filename}</span>
            <span>📊 {item.excel_filename}</span>
            {item.created_by_name && <span>👤 {item.created_by_name}</span>}
          </MetaRow>
        </ListItem>
      ))}
    </List>
  );
};

export default PreCoderHistoryPanel;

const EmptyText = styled.div`
  padding: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 16rem;
  overflow-y: auto;
`;

const ListItem = styled.div<{ $active: boolean }>`
  border: 1px solid ${({ $active }) => ($active ? "#ff782f" : "#eeeeee")};
  background: ${({ $active }) => ($active ? "#fff5eb" : "#ffffff")};
  border-radius: 0.5rem;
  padding: 0.7rem 0.9rem;
  cursor: pointer;

  &:hover {
    border-color: #ff782f;
  }
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const ItemTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #111827;
`;

const ItemDate = styled.div`
  font-size: 0.7rem;
  color: #9ca3af;
  white-space: nowrap;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 0.3rem;
  font-size: 0.72rem;
  color: #6b7280;
  flex-wrap: wrap;
`;

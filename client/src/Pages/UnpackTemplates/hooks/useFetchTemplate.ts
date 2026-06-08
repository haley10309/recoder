import { useEffect, useMemo, useState } from "react";
import { fetchTemplates } from "@/apis/apis";

interface TemplateItem {
  ticket_num: string;
  ticket_url: string;
  [key: string]: any;
}

interface Props {
  shouldFetchOnMount?: boolean;
  ticketNum?: string;
  ticketUrl?: string;
}

export const useFetchTemplate = ({
  shouldFetchOnMount = true,
  ticketNum,
  ticketUrl,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [templatesData, setTemplatesData] = useState<TemplateItem[]>([]);

  // =========================
  // 1️⃣ FETCH
  // =========================
  const fetch = async () => {
    try {
      setLoading(true);

      const data = await fetchTemplates();

      setTemplatesData(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("fetchTemplates error:", err);
      setTemplatesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetchOnMount) {
      fetch();
    }
  }, [shouldFetchOnMount]);

  // =========================
  // 2️⃣ FILTERED DATA
  // 제작 페이지:
  // SKU 선택 시 작업일자 좁히기
  // 작업일자 선택 시 SKU 좁히기
  // =========================
  const filteredTemplatesData = useMemo(() => {
    return templatesData.filter((item) => {
      const matchTicketNum = ticketNum
        ? item.ticket_num === ticketNum
        : true;

      const matchTicketUrl = ticketUrl
        ? item.ticket_url === ticketUrl
        : true;

      return matchTicketNum && matchTicketUrl;
    });
  }, [templatesData, ticketNum, ticketUrl]);

  // =========================
  // 3️⃣ SKU OPTIONS
  // =========================
  const ticketNumOptions = useMemo(() => {
    const base = ticketUrl
      ? templatesData.filter(
          (item) => item.ticket_url === ticketUrl
        )
      : templatesData;

    const set = new Set(
      base.map((item) => item.ticket_num)
    );

    return Array.from(set)
      .filter(Boolean)
      .map((v) => ({
        name: String(v),
      }));
  }, [templatesData, ticketUrl]);

  // =========================
  // 4️⃣ 작업일자 OPTIONS
  // =========================
  const ticketUrlOptions = useMemo(() => {
    const base = ticketNum
      ? templatesData.filter(
          (item) => item.ticket_num === ticketNum
        )
      : templatesData;

    const set = new Set(
      base.map((item) => item.ticket_url)
    );

    return Array.from(set)
      .filter(Boolean)
      .map((v) => ({
        name: String(v),
      }));
  }, [templatesData, ticketNum]);

  // =========================
  // RETURN
  // =========================
  return {
    loading,

    // raw
    templatesData,

    // filtered
    filteredTemplatesData,

    // dropdown
    ticketNumOptions,
    ticketUrlOptions,

    // actions
    fetch,
  };
};
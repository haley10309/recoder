import { useEffect, useState } from "react";

import { fetchTemplates } from "@/apis/apis";

export const useFetchTemplate = ({ shouldFetchOnMount, ticketNum, ticketUrl }) => {
  const [loading, setLoading] = useState(true);
  const [templatesData, setTemplatesData] = useState([]);

  const filterTemplatesData = () => {
    if (ticketNum && ticketUrl) {
      return templatesData.filter((item => item.ticket_num === ticketNum && item.ticket_url === ticketUrl));
    }

    if (ticketNum) {
      return templatesData.filter((item => item.ticket_num === ticketNum));
    }

    if (ticketUrl) {
      return templatesData.filter((item => item.ticket_url === ticketUrl));
    }

    return templatesData;
  };

  const filteredTemplatesData = filterTemplatesData();

  const ticketNumOptions = filteredTemplatesData.map((item) => ({ name: item.ticket_num }));
  const ticketUrlOptions = filteredTemplatesData.map((item) => ({ name: item.ticket_url }));


  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await fetchTemplates();
        setTemplatesData(data);
      } catch (error) {
        console.error('failed fetch templates', error);
      } finally {
        setLoading(false);
      }
    };

    if (shouldFetchOnMount) {
      fetch();
    }
  }, []);

  return {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  }
}
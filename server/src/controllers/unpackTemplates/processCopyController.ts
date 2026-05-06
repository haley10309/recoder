import { Request, Response } from "express";

import { ProcessCopyBody, ProcessCopyResponse, UnpackRow } from "../../types/unpack.types";

const processTranslatedCopy = (row: UnpackRow): string => {
  // TODO: translated_copy 가공 로직 구현
  return row.translated_copy ?? "";
};

export const processCopy = async (
  req: Request<{}, {}, ProcessCopyBody>,
  res: Response<ProcessCopyResponse>
): Promise<void> => {
  const { row_list } = req.body;

  try {
    if (!row_list || !Array.isArray(row_list)) {
      res.status(400).json({ success: false, error: "row_list is required." });
      return;
    }

    const processed_row_list: UnpackRow[] = row_list.map((row) => ({
      ...row,
      processed_translated_copy: processTranslatedCopy(row),
    }));

    res.json({ success: true, row_list: processed_row_list });
  } catch (err) {
    console.error("Error processing copy:", err);
    res.status(500).json({ success: false, error: "Failed to process copy" });
  }
};
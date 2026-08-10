import sys
import json
import xlwings as xw


def norm(v):
    if v is None:
        return ""
    return str(v).strip()


def load_faq_copydeck_rows(sheet):
    """
    FAQ 카피덱 헤더 구조 (2행 헤더):
    1행: Key | Copy1 | Copy2 | Copy3 | Copy4      (형식용 라벨)
    2행: Key | Category | Item | Copy | Remark    (실제 컬럼명)
    3행부터 데이터 시작

    Category는 Questions/Answer 행에 걸쳐 병합되어 있을 수 있어(merged cell),
    병합된 셀은 좌상단 셀에만 값이 들어오고 나머지는 빈 값으로 온다.
    (forward-fill은 서버가 아닌 클라이언트에서 처리)
    """
    used = sheet.used_range.value

    if not used:
        raise ValueError("시트에 데이터가 없습니다.")

    if not isinstance(used, list):
        raise ValueError("시트 데이터 형식이 올바르지 않습니다.")

    if used and not isinstance(used[0], list):
        used = [used]

    if len(used) < 3:
        raise ValueError("헤더 또는 데이터가 부족합니다. (2행 헤더 + 데이터 필요)")

    # 2번째 행(index 1)이 실제 헤더
    header = [norm(v).lower() for v in used[1]]
    header_map = {name: idx for idx, name in enumerate(header) if name}

    required_cols = ["key", "category", "item", "copy"]
    missing = [col for col in required_cols if col not in header_map]
    if missing:
        raise ValueError(f"필수 컬럼이 없습니다: {', '.join(missing)}")

    remark_idx = header_map.get("remark")

    rows = []
    for r in range(2, len(used)):
        row = used[r]
        if not row:
            continue

        key = norm(row[header_map["key"]] if header_map["key"] < len(row) else None)
        category = norm(row[header_map["category"]] if header_map["category"] < len(row) else None)
        item = norm(row[header_map["item"]] if header_map["item"] < len(row) else None)
        copy = norm(row[header_map["copy"]] if header_map["copy"] < len(row) else None)
        remark = norm(row[remark_idx] if remark_idx is not None and remark_idx < len(row) else None)

        # key, item, copy가 전부 비어있으면(완전 빈 행) 건너뜀
        if not key and not item and not copy:
            continue

        rows.append({
            "key": key,
            "category": category,
            "item": item,
            "copy": copy,
            "remark": remark,
        })

    return rows


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 2:
        print(json.dumps({
            "errorMsg": "Usage: python extract_faq_copydeck.py <input_excel_path>",
            "statusCode": 400,
        }, ensure_ascii=False))
        sys.exit(1)

    input_excel_path = sys.argv[1]

    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    wb = None

    try:
        wb = app.books.open(input_excel_path)
        sht = wb.sheets[0]

        rows = load_faq_copydeck_rows(sht)
        print(json.dumps({"row_list": rows}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            "errorMsg": str(e),
            "statusCode": 500,
        }, ensure_ascii=False))
        sys.exit(1)

    finally:
        if wb:
            try:
                wb.close()
            except:
                pass

        try:
            app.quit()
        except:
            pass


if __name__ == "__main__":
    main()

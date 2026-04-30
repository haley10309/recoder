import sys
import json
import xlwings as xw


def norm(v):
    if v is None:
        return ""
    return str(v).strip()


def load_translation_rows(sheet, country_code):
    """

    정형화된 헤더 구조:
    row_order | target_selector | apply_type | exclude_sup | enable_text_transform | original_copy | {country_code} (eg. CA_FR) | ...

    country_code에 해당하는 번역 컬럼까지 포함하여 각 row를 dict로 반환
    
    """
    used = sheet.used_range.value

    if not used:
        raise ValueError("시트에 데이터가 없습니다.")

    if not isinstance(used, list):
        raise ValueError("시트 데이터 형식이 올바르지 않습니다.")

    if used and not isinstance(used[0], list):
        used = [used]

    if len(used) < 2:
        raise ValueError("헤더 또는 데이터가 부족합니다.")

    header = [norm(v).lower() for v in used[0]]
    header_map = {name: idx for idx, name in enumerate(header) if name}

    country_key = norm(country_code).lower()

    required_cols = ["row_order", "target_selector", "apply_type", "exclude_sup", "enable_text_transform", "original_copy", country_key]
    missing = [col for col in required_cols if col not in header_map]
    if missing:
        raise ValueError(f"필수 컬럼이 없습니다: {', '.join(missing)}")

    rows = []

    for r in range(1, len(used)):
        row = used[r]
        if not row:
            continue

        row_order = norm(row[header_map["row_order"]] if header_map["row_order"] < len(row) else None)
        target_selector = norm(row[header_map["target_selector"]] if header_map["target_selector"] < len(row) else None)
        apply_type = norm(row[header_map["apply_type"]] if header_map["apply_type"] < len(row) else None)
        exclude_sup = norm(
            row[header_map["exclude_sup"]]
            if "exclude_sup" in header_map and header_map["exclude_sup"] < len(row)
            else None
        )
        enable_text_transform = norm(
            row[header_map["enable_text_transform"]]
            if "enable_text_transform" in header_map and header_map["enable_text_transform"] < len(row)
            else None
        )
        original_copy = norm(row[header_map["original_copy"]] if header_map["original_copy"] < len(row) else None)
        translated_copy = norm(row[header_map[country_key]] if header_map[country_key] < len(row) else None)

        if not target_selector or not apply_type or not original_copy:
            continue

        rows.append({
            "row_order": row_order,
            "target_selector": target_selector,
            "apply_type": apply_type,
            "exclude_sup": exclude_sup,
            "enable_text_transform": enable_text_transform,
            "original_copy": original_copy,
            "translated_copy": translated_copy,
        })

    return rows


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 3:
        print(json.dumps({
            "errorMsg": "Usage: python extract_copy.py <input_excel_path> <country_code>",
            "statusCode": 400,
        }, ensure_ascii=False))
        sys.exit(1)

    input_excel_path = sys.argv[1]
    country_code = sys.argv[2]

    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    wb = None

    try:
        wb = app.books.open(input_excel_path)
        sht = wb.sheets[0]

        rows = load_translation_rows(sht, country_code)
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
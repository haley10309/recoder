import sys
import json
import xlwings as xw


def norm(v):
    if v is None:
        return ""
    return str(v).strip()


def load_translation_rows(sheet, country_code):
    """
    정형화된 헤더 구조 (1행, 1행에 없으면 2행):
    key | row_order | target_selector | apply_type | exclude_sup | enable_text_transform
        | category | item | original_copy | {country_code} (eg. CA_FR) | ...
    (category / item 대신 Copy1 / Copy2 컬럼을 쓰는 카피덱도 있다)

    key가 SCHEMA- 로 시작하는 행은 셀렉터가 없으므로 별도로 취급한다.
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

    country_key = norm(country_code).lower()

    required_cols = ["target_selector", "apply_type", "exclude_sup",
                     "enable_text_transform", "original_copy", country_key]

    def build_header_map(row):
        header = [norm(v).lower() for v in row]
        return {name: idx for idx, name in enumerate(header) if name}

    # 헤더는 1행이 기본이지만, 1행에서 필수 컬럼을 못 찾으면 2행까지만 한 번 더 확인한다.
    # (카피덱 맨 위에 제목 행이 한 줄 붙어 있는 경우)
    header_row_idx = 0
    header_map = build_header_map(used[0])
    missing = [col for col in required_cols if col not in header_map]
    if missing and len(used) >= 3:
        second_header_map = build_header_map(used[1])
        if all(col in second_header_map for col in required_cols):
            header_row_idx = 1
            header_map = second_header_map
            missing = []
    if missing:
        raise ValueError(f"필수 컬럼이 없습니다 (1~2행 확인): {', '.join(missing)}")

    def cell(row, name):
        """헤더명으로 셀 값을 안전하게 읽는다."""
        if name not in header_map:
            return ""
        idx = header_map[name]
        return norm(row[idx]) if idx < len(row) else ""

    # category / item 컬럼이 없는 카피덱은 Copy1(예: "FAQ 1") / Copy2(예: "Questions")에 같은 값이 들어 있다.
    category_col = "category" if "category" in header_map else "copy1"
    item_col = "item" if "item" in header_map else "copy2"

    rows = []

    for r in range(header_row_idx + 1, len(used)):
        row = used[r]
        if not row:
            continue

        key = cell(row, "key")
        row_order = cell(row, "row_order")
        target_selector = cell(row, "target_selector")
        apply_type = cell(row, "apply_type")
        exclude_sup = cell(row, "exclude_sup")
        enable_text_transform = cell(row, "enable_text_transform")
        category = cell(row, category_col)
        item = cell(row, item_col)
        original_copy = cell(row, "original_copy")
        translated_copy = cell(row, country_key)

        is_schema = key.upper().startswith("SCHEMA-")

        # 영문 원문이 없으면 어느 유형이든 처리 대상이 아니다
        if not original_copy:
            continue

        # SCHEMA 행은 셀렉터가 없으므로 셀렉터 검사에서 제외한다
        if not is_schema and (not target_selector or not apply_type):
            continue

        rows.append({
            "key": key,
            "row_order": row_order if row_order else None,
            "target_selector": target_selector,
            "apply_type": apply_type,
            "exclude_sup": exclude_sup,
            "enable_text_transform": enable_text_transform,
            "category": category,
            "item": item,
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
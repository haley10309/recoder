import sys
import json
import xlwings as xw


def norm(v):
    if v is None:
        return ""
    return str(v).strip()


def find_locale_start_col(marker_row):
    """'V' 표시가 있는 컬럼을 찾는다. 그 컬럼부터가 로컬 국가 컬럼이다."""
    if marker_row is None:
        return None
    for idx, v in enumerate(marker_row):
        if norm(v).upper() == "V":
            return idx
    return None


# 필수 컬럼과 그 별칭.
# 카피덱 종류마다 컬럼명이 조금씩 다르다.
#  - FAQ 카피덱          : Key | Category | Item | Copy | Remark
#  - schema 카피덱        : Key | ... | Category | Item | original_copy | Remark
#    (Pre Coder의 "Schema 카피덱 추출"이 내보내는 포맷)
# 그래서 표준 이름 하나가 아니라 허용 별칭 목록으로 찾는다.
REQUIRED_COL_ALIASES = {
    "key": ["key"],
    "category": ["category"],
    "item": ["item"],
    "copy": ["copy", "original_copy", "originalcopy", "original copy"],
}


def resolve_required_cols(header_map):
    """
    header_map(컬럼명 -> index)에서 필수 컬럼을 별칭까지 고려해 찾는다.
    전부 찾으면 {표준명: index} 딕셔너리를, 하나라도 없으면 None을 반환한다.
    """
    resolved = {}
    for std_name, aliases in REQUIRED_COL_ALIASES.items():
        found = None
        for alias in aliases:
            if alias in header_map:
                found = header_map[alias]
                break
        if found is None:
            return None
        resolved[std_name] = found
    return resolved


def find_header_row(used, max_scan=10):
    """
    헤더 행의 위치는 카피덱 종류(FAQ / schema 등)마다 다르다.
    (FAQ는 보통 3행, schema 카피덱은 1행 등)
    그래서 행 위치를 고정하지 않고, 위에서부터 훑으며 필수 컬럼이 모두 있는 행을 헤더로 삼는다.
    """
    limit = min(len(used), max_scan)
    for r in range(limit):
        row = used[r]
        if not isinstance(row, list):
            continue
        header = [norm(v).lower() for v in row]
        header_map = {name: idx for idx, name in enumerate(header) if name}
        resolved = resolve_required_cols(header_map)
        if resolved is not None:
            return r, header, resolved
    return None, None, None


def load_faq_copydeck_rows(sheet):
    """
    카피덱 헤더 구조 (예시 - FAQ 카피덱, 3행 헤더):
    1행: (대부분 비어있음) ... V ...                              (V 표시부터 오른쪽 = 로컬 국가 컬럼 시작점)
    2행: Key | Copy1 | Copy2 | Copy3 | Copy4 | CA_FR | CA | MX | BR   (형식/국가 코드 라벨)
    3행: Key | Category | Item | Copy | Remark | French | English | Spanish | Portuguese (실제 컬럼명)
    4행부터 데이터 시작

    단, schema 카피덱 등은 헤더 행 위치가 다를 수 있어 행을 고정하지 않고
    find_header_row로 필수 컬럼(Key/Category/Item/Copy)이 있는 행을 자동 탐색한다.

    V 표시 오른쪽의 로컬 국가 컬럼들은 내용을 해석하지 않고 그대로(raw) 보존해서
    각 행의 "locales" 딕셔너리에 담아 돌려준다. (코드 라벨을 key로 사용)

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

    header_row_idx, header, header_map = find_header_row(used)

    if header_row_idx is None:
        # 어떤 행에서도 필수 컬럼을 찾지 못한 경우, 디버깅에 도움이 되도록
        # 실제로 읽힌 상단 행들을 함께 알려준다.
        preview = []
        for r in range(min(len(used), 5)):
            row = used[r] if isinstance(used[r], list) else [used[r]]
            preview.append(f"{r + 1}행: {[norm(v) for v in row][:10]}")
        raise ValueError(
            "필수 컬럼(Key / Category / Item / Copy)을 가진 헤더 행을 찾지 못했습니다. "
            "Copy 컬럼은 'Copy' 또는 'original_copy' 이름을 사용할 수 있습니다. "
            "상단 10행 내에 해당 컬럼명이 모두 있어야 합니다. 읽어들인 상단 행: "
            + " | ".join(preview)
        )

    if header_row_idx + 1 >= len(used):
        raise ValueError("헤더 행은 찾았지만 데이터 행이 없습니다.")

    # 로컬 국가 컬럼 시작점(V 마커)은 헤더 행보다 위쪽 행 어딘가에 있다.
    locale_start_col = None
    for r in range(header_row_idx):
        found = find_locale_start_col(used[r] if isinstance(used[r], list) else None)
        if found is not None:
            locale_start_col = found
            break

    # 코드 라벨 행: 헤더 바로 윗 행 (없으면 빈 리스트)
    code_row = []
    if header_row_idx >= 1 and isinstance(used[header_row_idx - 1], list):
        code_row = [norm(v) for v in used[header_row_idx - 1]]

    remark_idx = header_map.get("remark")

    locale_columns = []
    if locale_start_col is not None:
        max_col = max(len(code_row), len(header))
        for c in range(locale_start_col, max_col):
            code = code_row[c] if c < len(code_row) else ""
            label = norm(used[header_row_idx][c]) if c < len(used[header_row_idx]) else ""
            if not code and not label:
                continue
            locale_columns.append({"code": code or label, "label": label or code, "col": c})

    rows = []
    for r in range(header_row_idx + 1, len(used)):
        row = used[r]
        if not row:
            continue
        if not isinstance(row, list):
            row = [row]

        key = norm(row[header_map["key"]] if header_map["key"] < len(row) else None)
        category = norm(row[header_map["category"]] if header_map["category"] < len(row) else None)
        item = norm(row[header_map["item"]] if header_map["item"] < len(row) else None)
        copy = norm(row[header_map["copy"]] if header_map["copy"] < len(row) else None)
        remark = norm(row[remark_idx] if remark_idx is not None and remark_idx < len(row) else None)

        # key, item, copy가 전부 비어있으면(완전 빈 행) 건너뜀
        if not key and not item and not copy:
            continue

        locales = {}
        for lc in locale_columns:
            col_idx = lc["col"]
            locales[lc["code"]] = norm(row[col_idx]) if col_idx < len(row) else ""

        rows.append({
            "key": key,
            "category": category,
            "item": item,
            "copy": copy,
            "remark": remark,
            "locales": locales,
        })

    locale_columns_out = [{"code": lc["code"], "label": lc["label"]} for lc in locale_columns]
    return rows, locale_columns_out


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

        rows, locale_columns = load_faq_copydeck_rows(sht)
        print(json.dumps({"row_list": rows, "locale_columns": locale_columns}, ensure_ascii=False))

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

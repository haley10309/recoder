import sys
import json
import re
import xlwings as xw


# 셀 안에 data-copy-set="XXX" 형태로 들어있는 경우 (target_selector 컬럼)
ATTR_PATTERN = re.compile(r'data-copy-set\s*=\s*["\']([^"\']+)["\']', re.I)

# 셀 값 자체가 copy-set 번호인 경우 (C04-031, SHA-001 등)
BARE_PATTERN = re.compile(r'^[A-Za-z]{1,8}\d*-\d+[A-Za-z0-9\-]*$')

# 대상 컬럼으로 인정하는 헤더명
HEADER_NAMES = ("data-copy-set", "target_selector")

# 헤더를 탐색할 최대 행 수 (기능2는 3행에 헤더가 있음)
HEADER_SCAN_ROWS = 10


def norm(v):
    if v is None:
        return ""
    return str(v).strip()


def column_letter(index):
    """0-based 컬럼 인덱스를 엑셀 열 문자로 변환 (0 -> A)"""
    letter = ""
    n = index
    while True:
        letter = chr(ord("A") + n % 26) + letter
        n = n // 26 - 1
        if n < 0:
            break
    return letter


def find_header(used):
    """
    상단 몇 행을 스캔하여 data-copy-set / target_selector 헤더 위치를 찾는다.
    카피덱마다 헤더 행이 달라(1행 또는 3행) 고정할 수 없다.
    """
    limit = min(HEADER_SCAN_ROWS, len(used))

    for r in range(limit):
        row = used[r]
        if not row:
            continue

        for c, cell in enumerate(row):
            name = norm(cell).lower()
            if name in HEADER_NAMES:
                return {"row": r, "col": c, "name": name}

    return None


def extract_value(text):
    """셀에서 copy-set 번호를 추출한다. 형식에 맞지 않으면 None."""
    if not text:
        return None

    # data-copy-set="XXX" 래핑 형태
    m = ATTR_PATTERN.search(text)
    if m:
        return m.group(1).strip()

    # 맨값 형태
    if BARE_PATTERN.match(text):
        return text

    return None


def collect_copy_sets(sheet):
    used = sheet.used_range.value

    if not used:
        raise ValueError("시트에 데이터가 없습니다.")

    if not isinstance(used, list):
        used = [[used]]

    if used and not isinstance(used[0], list):
        used = [used]

    header = find_header(used)

    if not header:
        raise ValueError(
            "data-copy-set 또는 target_selector 컬럼을 찾지 못했습니다. "
            "카피덱 헤더를 확인해주세요."
        )

    col = header["col"]
    found = []
    seen = set()
    skipped = 0

    # 헤더 다음 행부터 해당 컬럼만 읽는다
    for r in range(header["row"] + 1, len(used)):
        row = used[r]
        if not row or col >= len(row):
            continue

        text = norm(row[col])
        if not text:
            continue

        value = extract_value(text)

        if value is None:
            skipped += 1
            continue

        if value not in seen:
            seen.add(value)
            found.append(value)

    return {
        "copy_set_list": found,
        "header": {
            "name": header["name"],
            "row": header["row"] + 1,          # 1-based
            "column": column_letter(col),
        },
        "skipped_count": skipped,
    }


def main():
    sys.stdout.reconfigure(encoding='utf-8')

    if len(sys.argv) < 2:
        print(json.dumps({
            "errorMsg": "Usage: python extract_copy_set.py <input_excel_path>",
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

        result = collect_copy_sets(sht)
        print(json.dumps(result, ensure_ascii=False))

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
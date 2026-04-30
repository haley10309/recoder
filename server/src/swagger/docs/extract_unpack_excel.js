/**
 * @swagger
 * components:
 *   schemas:
 *     UnpackRow:
 *       type: object
 *       required:
 *         - target_selector
 *         - apply_type
 *         - exclude_sup
 *         - enable_text_transform
 *       properties:
 *         row_order:
 *           type: number
 *           nullable: true
 *           example: 1
 *         target_selector:
 *           type: string
 *           description: HTML attribute 기반 selector (CSS selector 형태로 변환 가능)
 *           example: "[data-copy-set='C01-001']"
 *         apply_type:
 *           type: string
 *           description: 적용 방식 (innerText, alt, aria-label 등)
 *           example: "innerText"
 *         exclude_sup:
 *           type: boolean
 *           description: "O → true, 그 외 → false"
 *           example: false
 *         enable_text_transform:
 *           type: boolean
 *           description: "O → true, 그 외 → false"
 *           example: true
 *         original_copy:
 *           type: string
 *           nullable: true
 *           example: "Ultra High Quality Audio with <strong>24-bit / 96 kHz</strong> reveals every layer"
 *         translated_copy:
 *           type: string
 *           nullable: true
 *           example: "Un rendu audio de très haute qualité avec <strong>24 bits / 96 kHz</strong>"
 *
 *     ExtractUnpackExcelResponse:
 *       oneOf:
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             row_list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnpackRow'
 *           example:
 *             success: true
 *             row_list:
 *               - row_order: 1
 *                 target_selector: "[data-copy-set='C01-001']"
 *                 apply_type: "alt"
 *                 exclude_sup: false
 *                 enable_text_transform: false
 *                 original_copy: "A pair of white Galaxy Buds4 Pro hover with the left earbud slightly lower than the right."
 *                 translated_copy: ""
 *
 *               - row_order: 2
 *                 target_selector: "[data-copy-set='C02-003']"
 *                 apply_type: "innerText"
 *                 exclude_sup: false
 *                 enable_text_transform: false
 *                 original_copy: "From deeper, richer lows powered by a <strong>wider woofer</strong>..."
 *                 translated_copy: ""
 *
 *               - row_order: 5
 *                 target_selector: "[data-copy-set='C02-009']"
 *                 apply_type: "innerText"
 *                 exclude_sup: true
 *                 enable_text_transform: true
 *                 original_copy: "Ultra High Quality Audio with <strong>24-bit / 96 kHz</strong>..."
 *                 translated_copy: ""
 *
 *               - row_order: 7
 *                 target_selector: "[data-sup='sup-1']"
 *                 apply_type: "text_disclaimer"
 *                 exclude_sup: false
 *                 enable_text_transform: true
 *                 original_copy: "Devices sold separately."
 *                 translated_copy: ""
 *
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             error:
 *               type: string
 *               example: "필수 컬럼이 없습니다: target_selector"
 */

/**
 * @swagger
 * /unpack-templates/extract:
 *   post:
 *     tags:
 *       - UnpackTemplates
 *     summary: 엑셀 업로드 후 unpack row 추출
 *     description: |
 *       Excel 파일을 업로드하면 Python(xlwings) 스크립트를 통해 데이터를 파싱합니다.
 *
 *       ### 📌 엑셀 필수 컬럼
 *       - row_order
 *       - target_selector
 *       - apply_type
 *       - exclude_sup
 *       - enable_text_transform
 *       - original_copy
 *       - {country_code} (예: CA_FR)
 *
 *       ### 📌 데이터 처리 규칙
 *       - exclude_sup / enable_text_transform:
 *         "O" → true
 *         "X" 또는 공백 → false
 *
 *       - target_selector:
 *         `data-copy-set="C01-001"` 형태 → 내부적으로 selector로 사용 가능
 *
 *       - original_copy / translated_copy:
 *         HTML 태그 포함 가능 (예: `<strong>`)
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtractUnpackExcelResponse'
 *
 *       400:
 *         description: 파일 누락 또는 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtractUnpackExcelResponse'
 *
 *       500:
 *         description: 서버 오류 또는 Python 처리 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtractUnpackExcelResponse'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     GetUnpackTemplateDetailsWithExcelBody:
 *       type: object
 *       required:
 *         - ticket_num
 *         - ticket_url
 *         - country_code
 *         - file
 *       properties:
 *         ticket_num:
 *           type: string
 *           example: "TICKET-1234"
 *         ticket_url:
 *           type: string
 *           example: "https://example.com/ticket/1234"
 *         country_code:
 *           type: string
 *           description: 번역 대상 국가 코드 (대소문자 무관, 내부에서 대문자 처리)
 *           example: "CA_FR"
 *         file:
 *           type: string
 *           format: binary
 *
 *     GetUnpackTemplateDetailsWithExcelResponse:
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
 *
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             error:
 *               type: string
 *               example: "Template not found"
 */

/**
 * @swagger
 * /unpack-templates/get-details-with-excel:
 *   post:
 *     tags:
 *       - UnpackTemplates
 *     summary: 엑셀 업로드 후 unpack template 상세 조회 (DB + 엑셀 병합)
 *     description: |
 *       ticket_num + ticket_url로 DB에서 template을 조회한 후,
 *       업로드된 Excel 파일에서 추출한 translated_copy를 병합하여 반환합니다.
 *
 *       ### 병합 기준
 *       - `target_selector` + `apply_type` 이 일치하는 row끼리 매칭
 *       - 매칭된 경우 엑셀의 `translated_copy`를 채워 반환
 *       - 매칭 실패 시 `translated_copy`는 빈 문자열
 *
 *       ### 엑셀 필수 컬럼
 *       - row_order, target_selector, apply_type
 *       - exclude_sup, enable_text_transform ("O" → true, 그 외 → false)
 *       - original_copy, {country_code} (translated_copy 컬럼명)
 *
 *       - 인증 필요 (JWT Bearer Token)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/GetUnpackTemplateDetailsWithExcelBody'
 *
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsWithExcelResponse'
 *             example:
 *               success: true
 *               row_list:
 *                 - id: 1
 *                   row_order: 1
 *                   target_selector: "[data-copy-set='C01-001']"
 *                   apply_type: "alt"
 *                   exclude_sup: false
 *                   enable_text_transform: false
 *                   original_copy: "A pair of white Galaxy Buds4 Pro..."
 *                   translated_copy: "Une paire de Galaxy Buds4 Pro blancs..."
 *
 *                 - id: 2
 *                   row_order: 5
 *                   target_selector: "[data-copy-set='C02-009']"
 *                   apply_type: "innerText"
 *                   exclude_sup: true
 *                   enable_text_transform: true
 *                   original_copy: "Ultra High Quality Audio..."
 *                   translated_copy: "Audio de très haute qualité..."
 *
 *       400:
 *         description: 파일 누락 또는 필수 파라미터 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsWithExcelResponse'
 *
 *       401:
 *         description: 인증 실패 (토큰 없음 또는 만료)
 *
 *       404:
 *         description: 템플릿 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsWithExcelResponse'
 *             example:
 *               success: false
 *               error: "Template not found"
 *
 *       409:
 *         description: 중복 템플릿
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsWithExcelResponse'
 *             example:
 *               success: false
 *               error: "Multiple templates found"
 *
 *       500:
 *         description: 서버 오류 또는 Python 처리 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsWithExcelResponse'
 */
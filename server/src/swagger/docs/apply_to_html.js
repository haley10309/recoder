/**
 * @swagger
 * components:
 *   schemas:
 *     ApplyToHtmlBody:
 *       type: object
 *       required:
 *         - file
 *         - row_list
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: 변환 대상 HTML 파일
 *         row_list:
 *           type: string
 *           description: JSON.stringify(UnpackRow[]) — multipart이므로 string으로 전송
 *           example: '[{"id":1,"target_selector":"[data-copy-set=\"C01-001\"]","apply_type":"alt","exclude_sup":false,"enable_text_transform":false,"translated_copy":"Une paire de Galaxy Buds4 Pro blancs...","processed_translated_copy":"Une paire de Galaxy Buds4 Pro blancs..."}]'
 */

/**
 * @swagger
 * /unpack-templates/apply-to-html:
 *   post:
 *     tags:
 *       - UnpackTemplates
 *     summary: HTML에 UnpackRow 적용 후 변환된 HTML 다운로드
 *     description: |
 *       HTML 파일과 UnpackRow[]를 입력받아,
 *       각 row의 processed_translated_copy를 target_selector 기준으로 HTML에 적용한 후
 *       변환된 HTML 파일을 다운로드로 반환합니다.
 *
 *       ### 주의사항
 *       - `row_list`는 multipart/form-data 특성상 JSON string으로 전송해야 합니다.
 *       - 응답이 JSON이 아닌 HTML 파일(binary)입니다.
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
 *             $ref: '#/components/schemas/ApplyToHtmlBody'
 *
 *     responses:
 *       200:
 *         description: 변환된 HTML 파일 다운로드
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename="index_converted.html"
 *
 *       400:
 *         description: 파일 누락, row_list 누락 또는 잘못된 형식
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *             examples:
 *               no_file:
 *                 summary: 파일 없음
 *                 value:
 *                   success: false
 *                   error: "No file uploaded."
 *               no_row_list:
 *                 summary: row_list 없음
 *                 value:
 *                   success: false
 *                   error: "row_list is required."
 *               invalid_json:
 *                 summary: row_list JSON 파싱 실패
 *                 value:
 *                   success: false
 *                   error: "row_list must be a valid JSON string."
 *
 *       401:
 *         description: 인증 실패 (토큰 없음 또는 만료)
 *
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to apply to html"
 */
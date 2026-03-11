/**
 * @swagger
 * tags:
 *   - name: Guides
 *     description: Guide 파일 업로드/파싱 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GuideUploadResponse:
 *       type: object
 *       properties:
 *         pptNos:
 *           type: array
 *           items:
 *             type: string
 *           example: ["1", "1", "2"]
 *         asWasCodes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["<div>aswas1</div>", "<div>aswas2</div>", "<div>aswas3</div>"]
 *         toBeCodes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["<div>tobe1</div>", "<div>tobe2</div>", "<div>tobe3</div>"]
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "AS-WAS / TO-BE File이 필요합니다."
 */
/**
 * @swagger
 * /parse-guide-file:
 *   post:
 *     tags:
 *       - Guides
 *     summary: 가이드 파일 업로드 및 파싱
 *     description: |
 *       각각 업로드된 AS-WAS, TO-BE 텍스트 파일을 읽어서 파싱합니다.
 *       파싱 결과로 pptNos, asWasCodes, toBeCodes 배열을 반환합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - asWasFile
 *               - toBeFile
 *             properties:
 *               asWasFile:
 *                 type: string
 *                 format: binary
 *                 description: AS-WAS 파일
 *               toBeFile:
 *                 type: string
 *                 format: binary
 *                 description: TO-BE 파일
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuideUploadResponse'
 *       400:
 *         description: 파일이 업로드되지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "파일이 업로드되지 않았습니다."
 */
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
 *           example: "파일이 업로드되지 않았습니다."
 */
/**
 * @swagger
 * /parse-guide-file:
 *   post:
 *     tags:
 *       - Guides
 *     summary: 가이드 파일 업로드 및 파싱
 *     description: |
 *       업로드된 텍스트 파일을 읽어서 "슬라이드 N [AS-WAS] ... [TO-BE] ..." 형식을 파싱합니다.
 *       파싱 결과로 pptNos/asWasCodes/toBeCodes 배열을 반환합니다.
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
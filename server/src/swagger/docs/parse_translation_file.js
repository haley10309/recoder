/**
 * @swagger
 * components:
 *   schemas:
 *     ParseTranslationFileResponse:
 *       type: object
 *       properties:
 *         validCountries:
 *           type: array
 *           items:
 *             type: string
 *         invalidCountries:
 *           type: array
 *           items:
 *             type: string
 *         translations:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *         englishCopyList:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /parse-translation-file:
 *   post:
 *     tags:
 *       - Localization
 *     summary: 번역 TSV 파일 파싱
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
 *               $ref: '#/components/schemas/ParseTranslationFileResponse'
 *       400:
 *         description: 파일 형식 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleErrorResponse'
 */
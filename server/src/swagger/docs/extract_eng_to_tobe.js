/**
 * @swagger
 * components:
 *   schemas:
 *     ExtractEnglishCopyResponse:
 *       type: object
 *       properties:
 *         englishCopyList:
 *           type: array
 *           items:
 *             type: string
 *
 *     SimpleErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /extract-english-copy-list:
 *   post:
 *     tags:
 *       - Localization
 *     summary: 번역 파일에서 영어 COPY 목록 추출
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
 *               $ref: '#/components/schemas/ExtractEnglishCopyResponse'
 *       400:
 *         description: 파일 누락 또는 잘못된 요청
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
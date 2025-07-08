/**
 * @swagger
 * /upload-guide:
 *   post:
 *     summary: PPT 가이드에서 추출한 텍스트 파일 업로드 후, PPTNos / AsWasCode / TobeCode로 데이터 처리
 *     tags:
 *       - Guide
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               txtfile:
 *                 type: string
 *                 format: binary
 *                 description: PPT 가이드에서 추출한 .txt 파일
 *     responses:
 *       200:
 *         description: 업로드 및 처리 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */


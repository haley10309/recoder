/**
 * @swagger
 * components:
 *   schemas:
 *     CodeVariationInput:
 *       type: object
 *       properties:
 *         aswas_code_variation:
 *           type: string
 *           example: "<div>aswas KR</div>"
 *         tobe_code_variation:
 *           type: string
 *           example: "<div>tobe KR</div>"
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *           example: ["KR"]
 *
 *     CodeChangePairInput:
 *       type: object
 *       required:
 *         - asWasCode
 *         - toBeCode
 *       properties:
 *         asWasCode:
 *           type: string
 *           example: "<div>old</div>"
 *         toBeCode:
 *           type: string
 *           example: "<div>new</div>"
 *         variations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CodeVariationInput'
 *
 *     ConvertCodesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         filename:
 *           type: string
 *           example: "ticket_KR_tobe_260223120000.html"
 *         fileContent:
 *           type: string
 *           example: "<html>...</html>"
 *         changeResults:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pairIndex:
 *                 type: number
 *                 example: 0
 *               changed:
 *                 type: boolean
 *                 example: true
 *               matchedPart:
 *                 type: string
 *                 nullable: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error processing file."
 */

/**
 * @swagger
 * /convert-aswas-to-tobe:
 *   post:
 *     tags:
 *       - Templates
 *     summary: AS-WAS 코드를 TO-BE 코드로 변환
 *     description: |
 *       업로드된 HTML 파일을 기준으로 codeChanges를 순차 적용하여
 *       국가별 variation을 반영한 TO-BE 결과를 반환합니다.
 *       결과는 파일 다운로드용 메타데이터와 함께 JSON으로 반환됩니다.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - codeChanges
 *               - ticket_url
 *               - countryCode
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               codeChanges:
 *                 type: string
 *                 description: CodeChangePair 배열(JSON 문자열)
 *                 example: '[{"asWasCode":"<div>a</div>","toBeCode":"<div>b</div>","variations":[{"aswas_code_variation":"a-kr","tobe_code_variation":"b-kr","countries":["KR"]}]}]'
 *               ticket_url:
 *                 type: string
 *                 example: "my-ticket-url"
 *               countryCode:
 *                 type: string
 *                 example: "KR"
 *     responses:
 *       200:
 *         description: 변환 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConvertCodesResponse'
 *       400:
 *         description: 필수 값 누락 또는 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 파일 처리 중 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
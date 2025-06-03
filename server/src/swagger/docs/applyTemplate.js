/**
 * @swagger
 * /process-file:
 *   post:
 *     summary: HTML 파일에 As-Was To-Be 코드를 적용하여 변경된 파일 내용 반환
 *     tags: [Apply_Template]
 *     consumes:
 *       - multipart/form-data
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
 *                 description: 원본 HTML 파일
 *               codeChanges:
 *                 type: string
 *                 description: JSON 문자열 형식의 코드 치환 목록
 *                 example: '[{"asWasCode": "old code", "toBeCode": "new code"}]'
 *               ticket_url:
 *                 type: string
 *                 description: ticket_url
 *               countryCode:
 *                 type: string
 *                 description: 국가 코드
 *                 example: KR
 *     responses:
 *       200:
 *         description: 변경된 HTML 코드와 결과 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 changeResults:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pairIndex:
 *                         type: integer
 *                       changed:
 *                         type: boolean
 *                         example: true
 *                       matchedPart:
 *                         type: string
 *                 filename:
 *                   type: string
 *                 fileContent:
 *                   type: string
 *                   description: 수정된 HTML 코드 내용
 *       400:
 *         description: 필수 필드 누락 또는 유효하지 않은 형식
 *       500:
 *         description: 서버 내부 오류
 */


/**
 * @swagger
 * /template:
 *   post:
 *     summary: 템플릿 정보 조회
 *     tags: [Apply_Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_num
 *               - ticket_url
 *             properties:
 *               ticket_num:
 *                 type: string
 *               ticket_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 템플릿 정보 조회 성공
 *       500:
 *         description: 서버 내부 에러
 */
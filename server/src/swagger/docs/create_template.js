/**
 * @swagger
 * components:
 *   schemas:
 *     TemplateVariationInput:
 *       type: object
 *       properties:
 *         aswas_code_variation:
 *           type: string
 *           example: "<div>aswas variation</div>"
 *         tobe_code_variation:
 *           type: string
 *           example: "<div>tobe variation</div>"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "설명(optional)"
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *           example: ["KR", "US"]
 *
 *     CodeChangeInput:
 *       type: object
 *       required:
 *         - ppt_no
 *         - aswas_code
 *         - tobe_code
 *       properties:
 *         ppt_no:
 *           type: string
 *           example: "12"
 *         aswas_code:
 *           type: string
 *           example: "<div>as-is code</div>"
 *         tobe_code:
 *           type: string
 *           example: "<div>to-be code</div>"
 *         variations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TemplateVariationInput'
 *
 *     CreateTemplateRequest:
 *       type: object
 *       required:
 *         - ticket_num
 *         - ticket_url
 *         - code_changes
 *       properties:
 *         ticket_num:
 *           type: string
 *           example: "TICKET-1234"
 *         ticket_url:
 *           type: string
 *           example: "https://example.com/tickets/1234"
 *         code_changes:
 *           type: string
 *           description: |
 *             CodeChange 배열(JSON)을 문자열로 인코딩한 값입니다.
 *             서버에서 JSON.parse(code_changes)로 파싱합니다.
 *           example: '[{"ppt_no":"12","aswas_code":"<div>a</div>","tobe_code":"<div>b</div>","variations":[{"aswas_code_variation":"a1","tobe_code_variation":"b1","description":"v1","countries":["KR","US"]}]}]'
 *
 *     CreateTemplateSuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Template, CodeChanges, Variations, Countries가 성공적으로 저장되었습니다."
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Template 저장 실패"
 */

/**
 * @swagger
 * /create-template:
 *   post:
 *     tags:
 *       - Templates
 *     summary: 템플릿 생성
 *     description: |
 *       Templates → TemplateCodeChanges → TemplateCodeChangeVariations → TemplateCodeChangeVariationCountries 순서로 트랜잭션 내 저장합니다.
 *       code_changes는 JSON 문자열로 전달되어 서버에서 JSON.parse로 파싱됩니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplateRequest'
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTemplateSuccessResponse'
 *       400:
 *         description: 잘못된 요청 (code_changes 누락 또는 JSON 파싱 실패)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingCodeChanges:
 *                 value:
 *                   error: "code_changes가 없습니다."
 *               invalidFormat:
 *                 value:
 *                   error: "Invalid codeChanges format"
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       500:
 *         description: 서버 내부 오류 (트랜잭션 롤백)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Template 저장 실패"
 */
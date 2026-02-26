/**
 * @swagger
 * components:
 *   schemas:
 *     VariationWithIdInput:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           nullable: true
 *           example: 101
 *         aswas_code_variation:
 *           type: string
 *           example: "<div>aswas variation</div>"
 *         tobe_code_variation:
 *           type: string
 *           nullable: true
 *           example: "<div>tobe variation</div>"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "optional description"
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *           example: ["KR", "US"]
 *
 *     CodeChangeWithIdInput:
 *       type: object
 *       required:
 *         - ppt_no
 *         - aswas_code
 *         - tobe_code
 *       properties:
 *         id:
 *           type: number
 *           nullable: true
 *           example: 55
 *         ppt_no:
 *           type: string
 *           example: "12"
 *         aswas_code:
 *           type: string
 *           example: "<div>as-was code</div>"
 *         tobe_code:
 *           type: string
 *           example: "<div>to-be code</div>"
 *         variations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VariationWithIdInput'
 *
 *     UpdateTemplateRequest:
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
 *             CodeChangeWithId 배열(JSON)을 문자열로 인코딩한 값입니다.
 *             서버에서 JSON.parse(code_changes)로 파싱합니다.
 *             - 각 item의 id가 있으면 UPDATE, 없으면 INSERT (upsert)
 *             - DB에 있었는데 incoming에 없는 id는 soft-delete 처리됩니다.
 *           example: '[{"id":55,"ppt_no":"12","aswas_code":"<div>a</div>","tobe_code":"<div>b</div>","variations":[{"id":101,"aswas_code_variation":"a1","tobe_code_variation":"b1","description":"v1","countries":["KR","US"]},{"aswas_code_variation":"a2","tobe_code_variation":"b2","countries":["JP"]}]}]'
 *
 *     UpdateTemplateSuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Template updated successfully (upsert handled)"
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Template not found"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Failed to update template"
 */

/**
 * @swagger
 * /update-template:
 *   post:
 *     tags:
 *       - Templates
 *     summary: 템플릿 업데이트 (CodeChanges/Variations upsert + 삭제 처리)
 *     description: |
 *       ticket_num + ticket_url로 template을 찾은 뒤, code_changes를 기반으로 다음을 수행합니다.
 *       - CodeChanges: id 있으면 UPDATE, 없으면 INSERT
 *       - DB에 존재하지만 요청에 없는 CodeChange id는 soft-delete
 *       - Variations: id 있으면 UPDATE, 없으면 INSERT
 *       - DB에 존재하지만 요청에 없는 Variation id는 soft-delete
 *       - Countries는 variation_id 기준으로 전체 교체(DELETE 후 bulk INSERT)
 *       code_changes는 JSON 문자열로 전달되며 서버에서 JSON.parse로 파싱합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTemplateRequest'
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTemplateSuccessResponse'
 *       400:
 *         description: 잘못된 요청 (ticket_num/ticket_url 누락 또는 code_changes JSON 파싱 실패)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingTicket:
 *                 value:
 *                   error: "ticket_num and ticket_url are required for updating."
 *               invalidCodeChanges:
 *                 value:
 *                   error: "Invalid format for code_changes"
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 템플릿을 찾을 수 없음 또는 다중 템플릿 발견
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   message: "Template not found"
 *               multipleFound:
 *                 value:
 *                   message: "Multiple templates found"
 *       500:
 *         description: 서버 내부 오류 (트랜잭션 롤백)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Failed to update template"
 */
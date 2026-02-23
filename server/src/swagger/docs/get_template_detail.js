/**
 * @swagger
 * tags:
 *   - name: Templates
 *     description: Template 관련 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetTemplateDetailsRequest:
 *       type: object
 *       required:
 *         - ticket_num
 *         - ticket_url
 *       properties:
 *         ticket_num:
 *           type: string
 *           example: "TICKET-1234"
 *         ticket_url:
 *           type: string
 *           example: "https://example.com/tickets/1234"
 *
 *     TemplateVariation:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 101
 *         aswas_code_variation:
 *           type: string
 *           example: "old code variation"
 *         tobe_code_variation:
 *           type: string
 *           example: "new code variation"
 *         description:
 *           type: string
 *           nullable: true
 *           example: "variation 설명"
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *           example: ["KR", "US"]
 *
 *     TemplateCodeChange:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 55
 *         ppt_no:
 *           type: string
 *           example: "PPT-12"
 *         aswas_code:
 *           type: string
 *           example: "<div>as-is</div>"
 *         tobe_code:
 *           type: string
 *           example: "<div>to-be</div>"
 *         variations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TemplateVariation'
 *
 *     TemplateLocalizationEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 9
 *         code_context:
 *           type: string
 *           example: "localization context..."
 *
 *     GetTemplateDetailsResponse:
 *       type: object
 *       properties:
 *         templateId:
 *           type: number
 *           example: 1
 *         codeChanges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TemplateCodeChange'
 *         localizationEntries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TemplateLocalizationEntry'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Failed to fetch template details"
 */
/**
 * @swagger
 * /get-template-details:
 *   post:
 *     tags:
 *       - Templates
 *     summary: 템플릿 상세 조회
 *     description: |
 *       ticket_num + ticket_url로 Templates에서 templateId를 찾고,
 *       해당 templateId 기준으로 codeChanges(variations + countries 포함)와 localizationEntries를 반환합니다.
 *       - 인증 필요 (authenticate)
 *       - 권한(role) 필요: author, qaer, pm (authorize)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetTemplateDetailsRequest'
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetTemplateDetailsResponse'
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Template not found"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Failed to fetch template details"
 */
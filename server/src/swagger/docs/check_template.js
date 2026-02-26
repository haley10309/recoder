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
 *     CheckTemplateExistRequest:
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
 *     CheckTemplateExistResponse:
 *       type: object
 *       properties:
 *         isTemplateExist:
 *           type: boolean
 *           example: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Failed to fetch templates"
 */


/**
 * @swagger
 * /check-template-exsist:
 *   post:
 *     tags:
 *       - Templates
 *     summary: 템플릿 존재 여부 확인
 *     description: |
 *       ticket_num + ticket_url 기준으로 Templates 테이블에서 조회하여 존재 여부를 반환합니다.
 *       - 인증 필요 (authenticate)
 *       - 권한(role) 필요: author, qaer, pm (authorize)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckTemplateExistRequest'
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckTemplateExistResponse'
 *       400:
 *         description: 요청값 누락/형식 오류
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
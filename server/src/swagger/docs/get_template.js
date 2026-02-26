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
 *     TemplateListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         ticket_num:
 *           type: string
 *         ticket_url:
 *           type: string
 */

/**
 * @swagger
 * /get-templates:
 *   get:
 *     summary: 템플릿 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TemplateListItem'
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       500:
 *         description: 서버 내부 오류
 */

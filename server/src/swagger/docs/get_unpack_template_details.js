/**
 * @swagger
 * components:
 *   schemas:
 *     GetUnpackTemplateDetailsBody:
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
 *           example: "https://example.com/ticket/1234"
 *
 *     GetUnpackTemplateDetailsResponse:
 *       oneOf:
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             templateId:
 *               type: number
 *               example: 123
 *             row_list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnpackRow'
 *
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             error:
 *               type: string
 *               example: "Template not found"
 */

/**
 * @swagger
 * /unpack-templates/get-details:
 *   post:
 *     tags:
 *       - UnpackTemplates
 *     summary: unpack template 상세 조회
 *     description: |
 *       ticket_num + ticket_url을 기반으로 template을 조회한 후,
 *       TemplateUnpackSpecs 테이블의 row_list 데이터를 반환합니다.
 *
 *       - 인증 필요 (JWT Bearer Token)
 *       - id 필드 포함 (update 시 사용)
 *       - exclude_sup / enable_text_transform → boolean 변환된 값
 *       - translated_copy는 빈 값으로 반환
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetUnpackTemplateDetailsBody'
 *
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsResponse'
 *             example:
 *               success: true
 *               templateId: 123
 *               row_list:
 *                 - id: 1
 *                   row_order: 1
 *                   target_selector: "[data-copy-set='C01-001']"
 *                   apply_type: "alt"
 *                   exclude_sup: false
 *                   enable_text_transform: false
 *                   original_copy: "A pair of white Galaxy Buds4 Pro..."
 *                   translated_copy: ""
 *
 *                 - id: 2
 *                   row_order: 5
 *                   target_selector: "[data-copy-set='C02-009']"
 *                   apply_type: "innerText"
 *                   exclude_sup: true
 *                   enable_text_transform: true
 *                   original_copy: "Ultra High Quality Audio..."
 *                   translated_copy: ""
 *
 *       401:
 *         description: 인증 실패 (토큰 없음 또는 만료)
 *
 *       404:
 *         description: 템플릿 없음
 *
 *       409:
 *         description: 중복 템플릿
 *
 *       500:
 *         description: 서버 오류
 */
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
 *             type: object
 *             required:
 *               - ticket_num
 *               - ticket_url
 *             properties:
 *               ticket_num:
 *                 type: string
 *                 example: "TICKET-1234"
 *               ticket_url:
 *                 type: string
 *                 example: "https://example.com/ticket/1234"
 *
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUnpackTemplateDetailsResponse'
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
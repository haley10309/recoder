/**
 * @swagger
 * components:
 *   schemas:
 *     LocalizationEntryInput:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           nullable: true
 *         code_context:
 *           type: string
 *
 *     UpdateLocalizationEntriesRequest:
 *       type: object
 *       required:
 *         - ticket_num
 *         - ticket_url
 *       properties:
 *         ticket_num:
 *           type: string
 *         ticket_url:
 *           type: string
 *         localization_entries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LocalizationEntryInput'
 *         delete_ids:
 *           type: array
 *           items:
 *             type: number
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *
 *     MessageErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /update-localization-entries:
 *   post:
 *     tags:
 *       - Localization
 *     summary: Localization entries 생성/수정/삭제
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLocalizationEntriesRequest'
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 필수 값 누락
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       404:
 *         description: Template 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       500:
 *         description: DB 처리 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UnpackRow:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           nullable: true
 *           example: 1
 *         row_order:
 *           type: number
 *           nullable: true
 *           example: 1
 *         target_selector:
 *           type: string
 *           example: "[data-copy-set='C01-001']"
 *         apply_type:
 *           type: string
 *           example: "innerText"
 *         exclude_sup:
 *           type: boolean
 *           example: true
 *         enable_text_transform:
 *           type: boolean
 *           example: false
 *         original_copy:
 *           type: string
 *           nullable: true
 *           example: "Ultra High Quality Audio"
 *         translated_copy:
 *           type: string
 *           nullable: true
 *           example: ""
 *
 *     SaveUnpackTemplateBody:
 *       type: object
 *       required:
 *         - ticket_num
 *         - ticket_url
 *         - row_list
 *       properties:
 *         ticket_num:
 *           type: string
 *           example: "TICKET-1234"
 *         ticket_url:
 *           type: string
 *           example: "https://example.com/ticket/1234"
 *         row_list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UnpackRow'
 *
 *     SaveUnpackTemplateResponse:
 *       oneOf:
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             error:
 *               type: string
 *               example: "Failed to save unpack template"
 */

/**
 * @swagger
 * /unpack-templates/save:
 *   post:
 *     tags:
 *       - UnpackTemplates
 *     summary: unpack template 저장 (create/update)
 *     description: |
 *       unpack template 데이터를 생성 또는 수정하는 API입니다.
 *
 *       이 API는 create와 update를 모두 지원합니다.
 *
 *       - template이 존재하지 않으면 새로 생성됩니다. (create)
 *       - template이 존재하면 기존 데이터를 기준으로 업데이트됩니다. (update)
 *       - 전달된 row_list 기준으로 전체 데이터를 동기화합니다.
 *         - id가 있는 row → UPDATE
 *         - id가 없는 row → INSERT
 *         - 기존에 존재하지만 전달되지 않은 row → soft delete 처리
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveUnpackTemplateBody'
 *
 *     responses:
 *       200:
 *         description: 저장 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaveUnpackTemplateResponse'
 *             example:
 *               success: true
 *
 *       400:
 *         description: 잘못된 요청 (필수값 누락 등)
 *
 *       409:
 *         description: 중복 template
 *
 *       500:
 *         description: 서버 오류
 */
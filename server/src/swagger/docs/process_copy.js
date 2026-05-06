/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessCopyBody:
 *       type: object
 *       required:
 *         - row_list
 *       properties:
 *         row_list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UnpackRow'
 *
 *     ProcessCopyResponse:
 *       oneOf:
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
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
 *               example: "row_list is required."
 */

/**
 * @swagger
 * /unpack-templates/process-copy:
 *   post:
 *     tags:
 *       - UnpackTemplates
 *     summary: translated_copy 가공 후 processed_translated_copy 반환
 *     description: |
 *       UnpackRow[] 를 입력받아 각 row의 translated_copy를 가공한 후
 *       processed_translated_copy 필드에 채워서 반환합니다.
 *
 *       - 인증 필요 (JWT Bearer Token)
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessCopyBody'
 *           example:
 *             row_list:
 *               - id: 1
 *                 row_order: 1
 *                 target_selector: "[data-copy-set='C01-001']"
 *                 apply_type: "alt"
 *                 exclude_sup: false
 *                 enable_text_transform: false
 *                 original_copy: "A pair of white Galaxy Buds4 Pro..."
 *                 translated_copy: "Une paire de Galaxy Buds4 Pro blancs..."
 *
 *               - id: 2
 *                 row_order: 5
 *                 target_selector: "[data-copy-set='C02-009']"
 *                 apply_type: "innerText"
 *                 exclude_sup: true
 *                 enable_text_transform: true
 *                 original_copy: "Ultra High Quality Audio..."
 *                 translated_copy: "Audio de très haute qualité..."
 *
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessCopyResponse'
 *             example:
 *               success: true
 *               row_list:
 *                 - id: 1
 *                   row_order: 1
 *                   target_selector: "[data-copy-set='C01-001']"
 *                   apply_type: "alt"
 *                   exclude_sup: false
 *                   enable_text_transform: false
 *                   original_copy: "A pair of white Galaxy Buds4 Pro..."
 *                   translated_copy: "Une paire de Galaxy Buds4 Pro blancs..."
 *                   processed_translated_copy: "Une paire de Galaxy Buds4 Pro blancs..."
 *
 *                 - id: 2
 *                   row_order: 5
 *                   target_selector: "[data-copy-set='C02-009']"
 *                   apply_type: "innerText"
 *                   exclude_sup: true
 *                   enable_text_transform: true
 *                   original_copy: "Ultra High Quality Audio..."
 *                   translated_copy: "Audio de très haute qualité..."
 *                   processed_translated_copy: "Audio de très haute qualité..."
 *
 *       400:
 *         description: row_list 누락 또는 잘못된 형식
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessCopyResponse'
 *             example:
 *               success: false
 *               error: "row_list is required."
 *
 *       401:
 *         description: 인증 실패 (토큰 없음 또는 만료)
 *
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessCopyResponse'
 *             example:
 *               success: false
 *               error: "Failed to process copy"
 */
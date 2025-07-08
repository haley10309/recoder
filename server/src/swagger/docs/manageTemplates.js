/**
 * // TODO: 250519 이후 업데이트 필요
 * @swagger
 * /check-template-exist:
 *   post:
 *     summary: 템플릿 존재 여부 확인
 *     tags: [Template]
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
 *                 description: ticket_num
 *               ticket_url:
 *                 type: string
 *                 description: ticket_url
 *          
 *     responses:
 *       200:
 *         description: 템플릿 존재 여부 반환 (isTemplateExist)
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */


/**
 * @swagger
 * /create-template:
 *   post:
 *     summary: 템플릿 생성 및 DB 저장
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_num
 *               - ticket_url
 *               - aswas_tobe_list
 *             properties:
 *               ticket_num:
 *                 type: string
 *               ticket_url:
 *                 type: string
 *               aswas_tobe_list:
 *                 type: string
 *                 example: '[{"ppt_no": "1", "aswas_code": "old code", "tobe_code": "new code"}]'
 *     responses:
 *       200:
 *         description: 템플릿 저장 성공
 *       400:
 *         description: 필수 필드 누락 또는 잘못된 형식
 *       500:
 *         description: 서버 내부 오류
 */


/**
 * @swagger
 * /get-template-details:
 *   post:
 *     summary: 템플릿 세부 정보 조회 (local_code 포함)
 *     tags: [Template]
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
 *               ticket_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 템플릿 세부 정보 조회 성공
 *       404:
 *         description: 필수 필드 누락 또는 잘못된 형식
 *       500:
 *          description: 서버 내부 오류류
 */

/**
 * @swagger
 * /update-template:
 *      post:
 *          summary: 템플릿 수정하기
 *          tags: [Template]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - templateId
 *                              - ticket_num
 *                              - ticket_url
 *                              - aswas_tobe_list
 *                          properties:
 *                              templateId:
 *                                  type: integer
 *                              ticket_num:
 *                                  type: string
 *                              ticket_url:
 *                                  type: string
 *                              aswas_tobe_list:
 *                                  type: string
 *                                  example: '[{"ppt_no": "1", "aswas_code": "old code", "tobe_code": "new code"}]'
 *          responses:
 *              200:
 *                  description: 템플릿 수정 완료
 *              400:
 *                  description: 필수 필드 누락 또는 잘못된 형식
 *              500:
 *                  description: 서버 내부 오류류
 *                              
 *          
 */




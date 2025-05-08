/**
 * @swagger
 * /check-template:
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
 *         description: 템플릿 존재 여부 및 데이터 반환
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */


/**
 * @swagger
 * /create:
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


/**
 * @swagger
 * /get-ticket-number:
 *   get:
 *     summary: 저장된 ticket-number 목록 조회
 *     tags: [Template]
 *     responses:
 *       200:
 *         description: ticket-number 리스트 반환 성공
 *       500:
 *         description: 서버 내부 오류
 */

/**
 * @swagger
 * /get-ticket-url:
 *      get:
 *          summary: 저장된 ticket-url 목록 조회
 *          tags: [Template]
 *          responses:
 *              200:
 *                  description: ticket-url 목록 조회 성공
 *              500:
 *                  description: 서버 내부 오류
 */





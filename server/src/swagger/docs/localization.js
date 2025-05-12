/**
 * @swagger
 * /translation_upload:
 *   post:
 *     summary: 번역 파일 업로드 및 국가별 번역 리스트 반환
 *     tags: [Localization]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 번역 TxT 파일
 *     responses:
 *       200:
 *         description: 번역 파일 처리 성공
 *       400:
 *         description: 파일이 없거나 데이터가 부족한 경우
 *       500:
 *         description: 서버 내부 오류
 */




/**
 * @swagger
 * /localization/english-copy-list:
 *   post:
 *     summary: 업로드된 텍스트 파일에서 영어 원문만 추출
 *     tags:
 *       - Localization
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 영어 원문이 포함된 텍스트 파일 (.txt)
 *     responses:
 *       200:
 *         description: 영어 원문 추출 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 englishCopyList:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: 추출된 영어 문장 배열
 *       400:
 *         description: 파일이 업로드되지 않았거나 파일 형식이 올바르지 않음
 *       500:
 *         description: 서버 내부 오류
 */


/**
 * @swagger
 * /localization/tobe-code-list:
 *   post:
 *     summary: tobe_code 조회
 *     tags:
 *       - Localization
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
 *                 description: 티켓 번호
 *               ticket_url:
 *                 type: string
 *                 description: 티켓 URL
 *     responses:
 *       200:
 *         description: 해당 템플릿의 tobe_code 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 templateId:
 *                   type: integer
 *                 tobe_code_list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ppt_no:
 *                         type: string
 *                       tobe_code:
 *                         type: string
 *       400:
 *         description: ticket_num 또는 ticket_url이 누락된 경우
 *       404:
 *         description: 해당 템플릿을 찾을 수 없는 경우
 *       500:
 *         description: 서버 에러
 */


/**
 * @swagger
 * /localization/template:
 *   put:
 *     summary: local_code 삽입, 수정, 삭제
 *     tags:
 *       - Localization
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
 *                 example: "test_ticket"
 *               ticket_url:
 *                 type: string
 *                 example: "test_url"
 *               localization_list:
 *                 type: array
 *                 description: 수정 또는 삽입할 항목 리스트
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     local_code:
 *                       type: string
 *                       example: "<div>수정 또는 추가할 코드</div>"
 *                 example: [
 *                   { "id": 3, "local_code": "<div>기존 번역 수정</div>" },
 *                   { "local_code": "<div>신규 번역 추가</div>" }
 *                 ]
 *               delete_ids:
 *                 type: array
 *                 description: 삭제할 localization ID 리스트
 *                 items:
 *                   type: integer
 *                 example: [7, 8]
 *     responses:
 *       200:
 *         description: 삽입, 수정, 삭제 결과 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 inserted:
 *                   type: integer
 *                   example: 1
 *                 updated:
 *                   type: integer
 *                   example: 1
 *                 deleted:
 *                   type: integer
 *                   example: 2
 */

/**
 * @swagger
 * /localization/get-local-details:
 *   post:
 *     summary: 로컬라이제이션 템플릿 세부 정보 조회
 *     tags:
 *          - Localization
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
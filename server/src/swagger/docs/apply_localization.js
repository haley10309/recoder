/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatedTextareaItem:
 *       type: object
 *       properties:
 *         toBeCode:
 *           type: string
 *         matchingEnglishCopies:
 *           type: array
 *           description: toBeCode 안에 포함된 영어 카피 후보 목록 (길이 내림차순 정렬)
 *           items:
 *             type: string
 *         selectedEnglishCopies:
 *           type: array
 *           description: 실제 번역에 사용된 영어 카피 목록
 *           items:
 *             type: string
 *         localizedToBeCode:
 *           type: string
 *           description: 번역이 적용된 결과 코드. HTML 파일 내 출현 횟수가 1이 아니면 빈 문자열.
 *         errorState:
 *           type: boolean
 *           description: 번역 후에도 영어 카피가 남아있으면 true
 *     ApplyLocalizationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         updatedTextareas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UpdatedTextareaItem'
 */

/**
 * @swagger
 * /apply-localization:
 *   post:
 *     tags:
 *       - Localization
 *     summary: To-Be 코드에 번역 적용
 *     description: |
 *       업로드된 To-Be HTML 파일을 기준으로 각 textarea 블록의 영어 카피를 번역본으로 치환합니다.
 *
 *       **동작 방식:**
 *       - HTML 파일 내 출현 횟수가 정확히 1회인 블록만 번역 적용 (아니면 localizedToBeCode = "")
 *       - `selectedEnglishCopies`가 명시적으로 넘어오면 그대로 사용 (빈 배열 `[]` = 번역 안함)
 *       - `selectedEnglishCopies`가 없으면(undefined) `matchingEnglishCopies` 자동 매칭으로 fallback
 *       - 영어 카피는 **길이 내림차순**으로 정렬 후 치환 (긴 문자열 먼저 치환하여 부분 겹침 방지)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - textareas
 *               - translationMap
 *               - englishCopyList
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: To-Be HTML 파일 (countOccurrences 검증용)
 *               textareas:
 *                 type: string
 *                 description: |
 *                   JSON string — TextareaItem[]
 *                   예시: [{"toBeCode": "<p>Hello</p>", "selectedEnglishCopies": ["Hello"]}]
 *                   selectedEnglishCopies가 빈 배열([])이면 해당 블록은 번역을 적용하지 않습니다.
 *                   selectedEnglishCopies가 없으면(undefined) 자동 매칭(matchingEnglishCopies)을 사용합니다.
 *               translationMap:
 *                 type: string
 *                 description: |
 *                   JSON string — Record<string, string>
 *                   예시: {"Hello": "안녕하세요", "Now with AirDrop": "AirDrop과 함께"}
 *               englishCopyList:
 *                 type: string
 *                 description: |
 *                   JSON string — string[]
 *                   예시: ["Now with AirDrop", "Hello"]
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplyLocalizationResponse'
 *       400:
 *         description: 필수 파라미터 누락 또는 JSON 파싱 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimpleErrorResponse'
 */
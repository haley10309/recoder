// 사용안함, ASWAS 코드와 TOBE 코드를 하나의 TXT 파일에 넣은 가이드용
// 가이드 업로드 후, 처리 로직 (ppt 번호별 AS-WAS와 TO-BE 매칭)

export const guideUploadData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
  }

  const text = req.file.buffer.toString('utf-8');
  const lines = text.split(/\r?\n/); // 파일을 줄단위로 쪼개기기

  let mode = null; 
  const asWasMap = {}; // ppt번호 별 AsWas 코드를 저장하는 객체
  const toBeMap = {};  
  let currentPptNo = null; 
  let buffer = ''; // 임시 저장

  // 버퍼에 쌓인 텍스트를 현재 pptNo 목록에 추가하는 함수
  const pushBuffer = () => {

    if (!currentPptNo) return; // pptNo 없으면 종료 

    const cleaned = buffer; 
    if (!cleaned.trim()) return;

    if (mode === 'AS-WAS') { // 해당하는 pptNo의 asWasMap 배열에 텍스트 추가가
      if (!asWasMap[currentPptNo]) asWasMap[currentPptNo] = [];
      asWasMap[currentPptNo].push(cleaned);
    } else if (mode === 'TO-BE') {
      if (!toBeMap[currentPptNo]) toBeMap[currentPptNo] = [];
      toBeMap[currentPptNo].push(cleaned);
    }
    buffer = ''; // 버퍼 초기화 
  };

  for (let line of lines) {

    line = line.replace(/\r$/, ''); // 줄 앞뒤 공백 제거
    if (!line.trim()) continue;  // 빈줄이면 무시하고 다음줄로

    // 모드 변경
    if (line === '[AS-WAS]') {
      mode = 'AS-WAS';
      continue;
    }
    if (line === '[TO-BE]') {
      mode = 'TO-BE';
      continue;
    }

    // -- FEATURES -- 같은 거 무시
    if (line.startsWith('--') && line.endsWith('--')) {
      continue;
    }

    // ppt 번호 발견
    const pptMatch = line.match(/^[-\s]*PPT\s*(\d+)/i);
    if (pptMatch) {
      pushBuffer(); // 기존 내용 저장
      currentPptNo = pptMatch[1];
      continue;
    }

    // 긴 하이픈 만나면 한 항목 끝이라고 판단 
    if (/^[\-—]{5,}\s*$/.test(line)) {
      pushBuffer();
      continue;
    }

    // 나머지는 buffer에 이어붙이기
    buffer += (buffer ? '\n' : '') + line;
  }

  // 마지막 buffer 저장장
  pushBuffer();

  // 매칭 결과 생성
  const pptNos = [];
  const asWasCodes = [];
  const toBeCodes = [];

  const allPptNos = new Set([...Object.keys(asWasMap), ...Object.keys(toBeMap)]);

  for (let pptNo of allPptNos) {
    const asWasList = asWasMap[pptNo] || [];
    const toBeList = toBeMap[pptNo] || [];

    // ppt 번호를 중복 없이 모음
    const maxLen = Math.max(asWasList.length, toBeList.length);

    for (let i = 0; i < maxLen; i++) {
      pptNos.push(pptNo);
      asWasCodes.push(asWasList[i] ?? null);
      toBeCodes.push(toBeList[i] ?? null);
    } // 해당 pptNo에 있는 asWas, toBe 리스트 가져오고 없으면 빈 배열로 
  }

  res.json({
    pptNos,
    asWasCodes,
    toBeCodes
  });
};

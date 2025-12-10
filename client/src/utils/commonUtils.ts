export const getMotivationText = (lastLoggedInAt, name) => {
  const messages = [
    `항상 감사합니다, ${name}!`,
    `조금만 더 힘내요, ${name}!`,
    `무리하지 말고 쉬엄쉬엄 해요~`,
    `잘하고 있어요, ${name}!`,
    `꾸준함이 멋져요.`,
    `응원해요, ${name}!`,
    `힘냅시다 파이팅!!!`,
    `혼자가 아닌 우리~ 모두 파이팅!`,
    `작은 디테일이 큰 차이를 만듭니다, ${name}!`,
    `최선을 다해, 그리고 또 한 번 점검해요, ${name}!`,
    `마음은 급해도, 손은 차분하게!`,
    `완성도 높은 결과물이 곧 실력입니다, ${name}!`,
    `멋지게 달려가는 중이에요, ${name}!`,
    `열심히 하는 그 자체가 가치입니다, ${name}!`,
  ];

  
  const now = new Date();
  const elapsedMs = now.getTime() - lastLoggedInAt.getTime(); // ms 차이
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60)); // 시간 차이 (정수)
  const index = elapsedHours % messages.length; // 1시간마다 메세지가 바뀜
  
  // const elapsedMs = now.getTime() - lastLoggedInAt.getTime(); // ms 차이
  // const elapsed5Seconds = Math.floor(elapsedMs / 5000); // 5초 단위로 나눔
  // const index = elapsed5Seconds % messages.length; // 5초마다 메세지가 바뀜

  return messages[index];
};
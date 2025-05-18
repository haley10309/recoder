### Todo soon
- [ ] edit localization entries 기능 구현 마무리
- [ ] 2개 이상 찾아지면, 2개가 다 바뀌는건지 1개만 바뀌는건지.
back to location 참고. 리코더에서는 1개만 바뀌는데, N개 바뀌도록 수정해야함. / 근데 2개가 다 바뀌는건지를 먼저 알아야되긴 함. -> 덴버에게 항상 문의해야됨.
- [ ] 1이 아니어도 진행가능하도록. 경고문구만 확실히 인지하도록 하기!
- [ ] edit localization entries 페이지에서는 원본코드 업로드랑 비교를 선택으로.
- [ ] 코드수정사항: TemplateSetting unique(프론트 상에서 막기)
- [ ] Tobeapplied 기능 구현, 파악 마무리
- [ ] localization 템플릿을 만들 때, 
-- Zoom
-- Optical Zoom 3x, Optical Quality Zoom 2x, Digital Zoom up to 30x
이런거 분리해야됨. 지금은 오류.
- [ ] TODO 주석 다 해결하기
- [ ] 비영문국의 번역 작업은 사실 수기가 더 편해서, 아예 막아두는 것도...

===
- [ ] client/jsconfig.json 경로들 손보기
- [ ] asset도 컨벤션 통일 필요
- [ ] 폴더,파일 컨벤션 맞추기: page는 url 기준으로 폴더 싹 바꾸기.
- [ ] asset 일단 지우기
- [ ] 템플릿이 수정됐으면 수정이 필요하다는걸 알려주기: 각 테이블에 c,u,d 컬럼 넣고 비교
- [ ] 영문국: 20개국 비영문국: 50여개국 나누기 기준. 그리고 항상 볼 수 있게 readme 만들어두기

### Todo later
- [ ] 서버에서 할수있는건 다 서버에 짜기? apply template에서 클라에 있는 코드 서버로~ db에 저장되는게 없어서 어떻게 할지는 보기.
- [ ] 템플릿 최종저장한 사람 기능 (후순위) 누가/언제/가능여부/메모 / 로그인 하고
- [ ] 관리자페이지 (다 쓴 템플릿은 지운다던지~)
- [ ] exe 실행파일? or 언팩팀은 직접 로컬로 다 띄워서. (제이스 여쭤보기) -> 화인,재택에서만 쓸 수 있음
- [ ] QA 기능
- [ ] scss,tailwind,styled-components 통일.
- asset도 적용해야하면 관련코드 모두 수정 필요

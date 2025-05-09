### 도커 재배포 명령어

```cmd
> ssh seoul_center@121.252.183.22 -p 10022 # pw : Jack12!@
> cd ../rawcode_auto
> cd {본인이 재배포하려는 폴더명}
> ls #확인용
> docker ps # 지금 실행 중인 이미지 확인
> docker compose down # 컨테이너 멈추고 삭제 (무중단 배포 아님)
> git pull --rebase origin {브랜치명}
> docker compose up -d --build # 컨테이너 빌드 -> 서버 재배포
```
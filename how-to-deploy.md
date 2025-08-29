### 도커 재배포 명령어

```cmd
> ssh seoul_center@121.252.183.22 -p 10022
> 비밀번호 # PASSWORD=Jack12!@

> cd rawcode_auto/rawcode_auto_monorepo
> (참고) 전체 path: /home/seoul_center/rawcode_auto/...

> git pull origin main
> git log # 최신 커밋 한번더 확인

*서버배포
> cd server # 저장소 루트디렉토리에서 실행
> docker rm -f raw_auto_server
> docker compose up -d --build # 컨테이너 빌드 -> 재배포

*클라배포
> cd client # 저장소 루트디렉토리에서 실행
> docker rm -f raw_auto_client
> docker compose up -d --build # 컨테이너 빌드 -> 재배포
```


### 배포용 환경변수

- `server/.env`
    ```
    DB_HOST=raw_auto_db
    DB_PORT=3306
    DB_USER=seoul_center
    DB_PASSWORD=0000
    DB_NAME=testDB // (250519기준) recoder_db로 변경해야하는데 아직은 문제 있어 추후 수정 예정
    CLIENT=http://121.252.183.22:8088
    PORT=8080
    ```

- `client/.env`
    ```
    VITE_API=http://121.252.183.22:8089
    ```

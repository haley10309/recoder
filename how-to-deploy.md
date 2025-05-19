### 도커 재배포 명령어

```cmd
> ssh seoul_center@121.252.183.22 -p 10022 # PASSWORD=Jack12!@

> cd ../rawcode_auto/rawcode_auto_monorepo

> git pull origin main

> cd server
or
> cd client

> docker ps # 지금 실행 중인 이미지 확인

> docker compose down # 컨테이너 멈추고 삭제 (무중단 배포 아님)
or
> docker rm -f raw_auto_server
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

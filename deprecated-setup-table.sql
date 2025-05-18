-- local에서 초기 sql 세팅 시 한번만 사용

create database testdb;

use testdb;

CREATE TABLE `TemplateSetting` (
    `id` int NOT NULL AUTO_INCREMENT,
    `ticket_num` varchar(255) NOT NULL,
    `ticket_url` varchar(255) NOT NULL,
    `create_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `AsWasToBe` (
    `id` int NOT NULL AUTO_INCREMENT,
    `ppt_no` varchar(255) NOT NULL,
    `aswas_code` text NOT NULL,
    `tobe_code` text NOT NULL,
    `hotfix_id` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `hotfix_id` (`hotfix_id`),
    CONSTRAINT `aswastobe_ibfk_1` FOREIGN KEY (`hotfix_id`) REFERENCES `TemplateSetting` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 141 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;


CREATE TABLE `localization` (
    `id` int NOT NULL AUTO_INCREMENT,
    `local_code` text NOT NULL,
    `hotfix_id` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_localization_hotfix` (`hotfix_id`),
    CONSTRAINT `fk_localization_hotfix` FOREIGN KEY (`hotfix_id`) REFERENCES `TemplateSetting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 32 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
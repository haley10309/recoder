-- local에서 초기 sql 세팅 시 한번만 사용

create database recoder_db;

use recoder_db;

CREATE TABLE Templates (
    id INT NOT NULL AUTO_INCREMENT,
    ticket_num VARCHAR(255) NOT NULL,
    ticket_url VARCHAR(255) NOT NULL,
    archived_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE TemplateCodeChanges (
    id int NOT NULL AUTO_INCREMENT,
    ppt_no varchar(255) NOT NULL,
    aswas_code text NOT NULL,
    tobe_code text NOT NULL,
    template_id int NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT fk_template_codechanges_to_templates 
        FOREIGN KEY (`template_id`) 
        REFERENCES `Templates` (`id`) 
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE TemplateCodeChangeVariations (
    id INT NOT NULL AUTO_INCREMENT,
    code_change_id INT NOT NULL,
    aswas_code_variation TEXT NOT NULL,
    tobe_code_variation TEXT NOT NULL,
    description TEXT NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX idx_code_change_id (`code_change_id`),
    CONSTRAINT fk_variation_to_code_change
        FOREIGN KEY (`code_change_id`)
        REFERENCES `TemplateCodeChanges` (`id`)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE TemplateCodeChangeVariationCountries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variation_id INT NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    INDEX idx_country_code (country_code),
    FOREIGN KEY (variation_id)
        REFERENCES TemplateCodeChangeVariations(id)
        ON DELETE CASCADE
);

CREATE TABLE TemplateLocalizationEntries (
    id int NOT NULL AUTO_INCREMENT,
    code_context text NOT NULL,
    template_id int NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT fk_template_localization_entries_to_templates
        FOREIGN KEY (`template_id`)
        REFERENCES `Templates` (`id`)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE TemplateTransformSpecs (
    id int NOT NULL AUTO_INCREMENT,
    target_selector TEXT NOT NULL,
    apply_type TEXT NOT NULL,
    exclude_sup BOOLEAN NOT NULL DEFAULT FALSE,
    enable_text_transform BOOLEAN NOT NULL DEFAULT FALSE,
    original_copy TEXT NULL,
    row_order INT NULL,
    template_id int NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX idx_template_id (template_id),
    CONSTRAINT fk_template_transform_specs_to_templates 
        FOREIGN KEY (`template_id`) 
        REFERENCES `Templates` (`id`) 
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE AdminUsers (
  id INT AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name_en VARCHAR(20),
  role VARCHAR(20) DEFAULT 'author',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL DEFAULT NULL,
  last_logged_in_at DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
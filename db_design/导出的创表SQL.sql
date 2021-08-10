-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema yilabaodb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema yilabaodb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `yilabaodb` DEFAULT CHARACTER SET utf8mb4 ;
USE `yilabaodb` ;

-- -----------------------------------------------------
-- Table `yilabaodb`.`product`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yilabaodb`.`product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `yilabaodb`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yilabaodb`.`category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT '类别名称',
  `product_id` INT NULL COMMENT '所属产品',
  `parent_id` INT NULL COMMENT '父类别',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `id_idx` (`product_id` ASC) INVISIBLE,
  INDEX `category_name_idx` (`name` ASC) VISIBLE,
  CONSTRAINT `fk_category_product_id`
    FOREIGN KEY (`product_id`)
    REFERENCES `yilabaodb`.`product` (`id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `yilabaodb`.`product_item`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yilabaodb`.`product_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `product_id` INT NULL,
  `category_list` JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'JSON列表',
  `main_pic` VARCHAR(255) NULL COMMENT '目前直接存储图片地址，后期可能会存储别的。',
  `link_url` VARCHAR(255) NULL COMMENT '源链接',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `fk_product_id_idx` (`product_id` ASC) VISIBLE,
  CONSTRAINT `fk_product_item_product_id`
    FOREIGN KEY (`product_id`)
    REFERENCES `yilabaodb`.`product` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `yilabaodb`.`product_item_info`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `yilabaodb`.`product_item_info` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `item_id` INT NULL,
  `title` VARCHAR(255) NULL,
  `description` VARCHAR(255) NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_item_id_idx` (`item_id` ASC) VISIBLE,
  CONSTRAINT `fk_info_item_id`
    FOREIGN KEY (`item_id`)
    REFERENCES `yilabaodb`.`product_item` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

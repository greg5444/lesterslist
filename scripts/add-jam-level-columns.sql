-- Add jam level columns to LocalJams table
-- Run this in phpMyAdmin SQL tab or via script

ALTER TABLE `LocalJams` 
ADD COLUMN `AllWelcome` TINYINT(1) DEFAULT 0 AFTER `Schedule`,
ADD COLUMN `BeginnersWelcome` TINYINT(1) DEFAULT 0 AFTER `AllWelcome`,
ADD COLUMN `AdvancedOnly` TINYINT(1) DEFAULT 0 AFTER `BeginnersWelcome`;

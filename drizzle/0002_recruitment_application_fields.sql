ALTER TABLE `membership_applications`
  ADD COLUMN `recruitmentLocalCouncil` varchar(255) NULL,
  ADD COLUMN `recruitmentPosition` varchar(255) NULL,
  ADD COLUMN `motivationLetter` text NULL,
  ADD COLUMN `planOfAction` text NULL,
  ADD COLUMN `cvUrl` varchar(500) NULL;
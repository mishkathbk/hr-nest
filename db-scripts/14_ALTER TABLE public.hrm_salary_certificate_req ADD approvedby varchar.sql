ALTER TABLE hrm_salary_certificate_req
DROP COLUMN IF EXISTS reqfor;

ALTER TABLE hrm_salary_certificate_req
ADD COLUMN reqforcd int4 NULL;
--adding fk and relation to table hrm_salaryadjustment
ALTER TABLE hrm_salaryadjustment
ADD CONSTRAINT fk_salaryadjustment_salarytype
FOREIGN KEY (salarytypeid) REFERENCES hrm_salarytype(salarytypeid);
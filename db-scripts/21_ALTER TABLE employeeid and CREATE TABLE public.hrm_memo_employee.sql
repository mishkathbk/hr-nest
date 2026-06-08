ALTER TABLE hrm_memo
DROP COLUMN employeeid;
-- public.hrm_memo_employee definition

-- Drop table

-- DROP TABLE public.hrm_memo_employee;

CREATE TABLE public.hrm_memo_employee (
	memoid int4 NOT NULL,
	employeeid int4 NOT NULL
);


-- public.hrm_memo_employee foreign keys

ALTER TABLE public.hrm_memo_employee ADD CONSTRAINT fk_memo_employee_memo FOREIGN KEY (memoid) REFERENCES public.hrm_memo(memoid);
-- public.hrm_payrollgenerationdet definition

-- Drop table

-- DROP TABLE public.hrm_payrollgenerationdet;

CREATE TABLE public.hrm_payrollgenerationdet (
	payrollgenerationdetid serial4 NOT NULL,
	payrollgenerationid int4 NOT NULL,
	salarytypeid int4 NOT NULL,
	addamount numeric(14, 4) NULL,
	dedamount numeric(14, 4) NULL,
	notes1 varchar(500) NULL,
	companyid int4 NULL,
	isactive bool DEFAULT true NOT NULL,
	createdby int4 NULL,
	createddate timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	modifiedby int4 NULL,
	modifieddate timestamp NULL,
	isdeleted bool NULL,
	deleteby int4 NULL,
	deletedate timestamp(6) NULL,
	CONSTRAINT hrm_payrollgenerationdet_pkey PRIMARY KEY (payrollgenerationdetid)
);


-- public.hrm_payrollgenerationdet foreign keys

ALTER TABLE public.hrm_payrollgenerationdet ADD CONSTRAINT fk_payrollgenerationdet_payrollgeneration FOREIGN KEY (payrollgenerationid) REFERENCES public.hrm_payrollgeneration(payrollgenerationid);
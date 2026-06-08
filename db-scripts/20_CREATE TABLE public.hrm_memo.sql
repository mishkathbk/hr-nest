-- public.hrm_memo definition

-- Drop table

-- DROP TABLE public.hrm_memo;

CREATE TABLE public.hrm_memo (
	memoid serial4 NOT NULL,
	memocode varchar(50) NOT NULL,
	employeeid int4 NOT NULL,
	memotypecd int4 NULL,
	memosubject varchar(200) NULL,
	memotext text NULL,
	documentgroupid int4 NULL,
	statuscd int4 NULL,
	companyid int4 NULL,
	isactive bool DEFAULT true NOT NULL,
	createdby int4 NULL,
	createddate timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	modifiedby int4 NULL,
	modifieddate timestamp NULL,
	isdeleted bool NULL,
	deleteby int4 NULL,
	deletedate timestamp(6) NULL,
	CONSTRAINT hrm_memo_pkey PRIMARY KEY (memoid),
	CONSTRAINT uq_hrm_memo_company_code UNIQUE (companyid, memocode)
);
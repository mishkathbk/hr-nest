-- public.hrm_leavetype definition

-- Drop table

-- DROP TABLE public.hrm_leavetype;

CREATE TABLE public.hrm_leavetype (
	leavetypeid serial4 NOT NULL,
	leavetypecode varchar(10) NULL,
	leavetypename varchar(100) NULL,
	leavetypecd int4 NULL,
	leavetypecategorycd int4 NULL,
	maximumleavedays int4 NULL,
	daysbeforeleave int4 NULL,
	isdocumentmandatory bool NULL,
	companyid int4 NULL,
	isactive bool DEFAULT true NOT NULL,
	createdby int4 NULL,
	createddate timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	modifiedby int4 NULL,
	modifieddate timestamp NULL,
	isdeleted bool NULL,
	deleteby int4 NULL,
	deletedate timestamp(6) NULL,
	statuscd int4 NULL
);


-- public.hrm_leavetype foreign keys
-- public.hrm_employeewarning definition

-- Drop table

-- DROP TABLE public.hrm_employeewarning;

CREATE TABLE public.hrm_employeewarning (
	employeewarningid serial4 NOT NULL,
	employeeid int4 NOT NULL,
	subject varchar(200) NULL,
	warningmessage text NULL,
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
	CONSTRAINT hrm_employeewarning_pkey PRIMARY KEY (employeewarningid)
);
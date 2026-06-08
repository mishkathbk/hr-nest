-- public.hrm_policy definition

-- Drop table

-- DROP TABLE public.hrm_policy;

CREATE TABLE public.hrm_policy (
	policyid serial4 NOT NULL,
	policyno varchar(50) NULL,
	policymessage text NULL,
	regulationmessage text NULL,
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
	CONSTRAINT hrm_policy_pkey PRIMARY KEY (policyid),
	CONSTRAINT uq_hrm_policy_company_no UNIQUE (companyid, policyno)
);
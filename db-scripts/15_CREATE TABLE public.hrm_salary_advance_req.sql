-- public.hrm_salary_advance_req definition

-- Drop table

-- DROP TABLE public.hrm_salary_advance_req;

CREATE TABLE public.hrm_salary_advance_req (
	reqid serial4 NOT NULL,
	reqno varchar(50) NOT NULL,
	requestingfor varchar(100) NULL,
	reason text NULL,
	grosssalary numeric(18, 2) NULL,
	salaryadvanceamountreq numeric(18, 2) NULL,
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
	CONSTRAINT hrm_salary_advance_req_pkey PRIMARY KEY (reqid),
	CONSTRAINT uq_hrm_salary_advance_req_company_reqno UNIQUE (companyid, reqno)
);
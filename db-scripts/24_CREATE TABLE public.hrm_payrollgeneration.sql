-- public.hrm_payrollgeneration definition

-- Drop table

-- DROP TABLE public.hrm_payrollgeneration;

CREATE TABLE public.hrm_payrollgeneration (
	payrollgenerationid serial4 NOT NULL,
	employeeid int4 NOT NULL,
	payrollyear int4 NOT NULL,
	payrollmonth int4 NOT NULL,
	totaldays numeric(10, 2) NULL,
	totalhours numeric(10, 2) NULL,
	totalamount numeric(14, 4) NULL,
	isapprove bool DEFAULT false NOT NULL,
	approvedby int4 NULL,
	approveddate timestamp NULL,
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
	CONSTRAINT hrm_payrollgeneration_pkey PRIMARY KEY (payrollgenerationid),
	CONSTRAINT uq_payrollgeneration_employee_month UNIQUE (employeeid, payrollyear, payrollmonth)
);
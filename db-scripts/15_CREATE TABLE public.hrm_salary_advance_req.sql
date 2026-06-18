-- public.hrm_salary_advance_req definition

-- Drop table

-- DROP TABLE public.hrm_salary_advance_req;

CREATE TABLE public.hrm_salary_advance_req (
    salaryadvancereqid serial4 NOT NULL,

    reqno varchar(50) NOT NULL,

    employeeid int4 NOT NULL,

    reqforcd int4 NULL,

    reason varchar(500) NULL,

    grosssalary numeric(14,4) NULL,

    salaryadvanceamountreq numeric(14,4) NULL,

    approvedamount numeric(14,4) NULL,

    noofdeductions int4 NULL,

    amountdeductiblepermonth numeric(14,4) NULL,

    deductionstartdate date NULL,

    approvedby int4 NULL,
    approveddate timestamp NULL,

    statuscd int4 NULL,

    companyid int4 NULL,

    isactive bool NOT NULL DEFAULT true,

    createdby int4 NULL,
    createddate timestamp DEFAULT CURRENT_TIMESTAMP NULL,

    modifiedby int4 NULL,
    modifieddate timestamp NULL,

    isdeleted bool NULL,
    deleteby int4 NULL,
    deletedate timestamp(6) NULL,

    CONSTRAINT hrm_salary_advance_req_pkey
        PRIMARY KEY (salaryadvancereqid),

    CONSTRAINT uq_hrm_salary_advance_req_company_reqno
        UNIQUE (companyid, reqno)
);
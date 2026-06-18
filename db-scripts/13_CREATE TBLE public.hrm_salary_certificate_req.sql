-- public.hrm_salary_certificate_req definition

-- Drop table

-- DROP TABLE public.hrm_salary_certificate_req;

CREATE TABLE public.hrm_salary_certificate_req (
    reqid serial4 NOT NULL,
    reqno varchar(50) NOT NULL,

    reqfor varchar(100) NULL,
    passportno varchar(50) NULL,

    issuedto varchar(100) NULL,

    reason varchar(500) NULL,

    approvedby varchar(100) NULL,

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

    CONSTRAINT hrm_salary_certificate_req_pkey
        PRIMARY KEY (reqid),

    CONSTRAINT uq_hrm_salary_certificate_req_company_reqno
        UNIQUE (companyid, reqno)
);
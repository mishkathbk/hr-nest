ALTER TABLE hrm_memo
DROP COLUMN employeeid;
-- public.hrm_memo_employee definition

-- Drop table

-- DROP TABLE public.hrm_memo_employee;

CREATE TABLE public.hrm_memo_employee (
    memoemployeeid serial4 NOT NULL,

    memoid int4 NOT NULL,
    employeeid int4 NOT NULL,

    companyid int4 NULL,

    statuscd int4 NULL,

    isactive bool NOT NULL DEFAULT true,

    createdby int4 NULL,
    createddate timestamp DEFAULT CURRENT_TIMESTAMP NULL,

    modifiedby int4 NULL,
    modifieddate timestamp NULL,

    isdeleted bool NULL,
    deleteby int4 NULL,
    deletedate timestamp(6) NULL,

    CONSTRAINT hrm_memo_employee_pkey
        PRIMARY KEY (memoemployeeid),

    CONSTRAINT uq_memo_employee
        UNIQUE (memoid, employeeid),

    CONSTRAINT fk_memo_employee_memo
        FOREIGN KEY (memoid)
        REFERENCES public.hrm_memo(memoid)
);
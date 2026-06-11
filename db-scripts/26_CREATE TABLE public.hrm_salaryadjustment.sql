CREATE TABLE public.hrm_salaryadjustment (
    salaryadjustmentid serial4 NOT NULL,

    employeeid int4 NOT NULL,
    salarytypeid int4 NOT NULL,

    payrollyear int4 NOT NULL,
    payrollmonth int4 NOT NULL,

    amount numeric(14,4) NULL,
    remarks varchar(500) NULL,

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

    CONSTRAINT hrm_salaryadjustment_pkey
        PRIMARY KEY (salaryadjustmentid)
);

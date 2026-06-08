DROP TABLE hrm_memo_employee;

CREATE TABLE public.hrm_memo_employee (
    memoid int4 NOT NULL,
    employeeid int4 NOT NULL,

    CONSTRAINT hrm_memo_employee_pkey
        PRIMARY KEY (memoid, employeeid),

    CONSTRAINT fk_memo_employee_memo
        FOREIGN KEY (memoid)
        REFERENCES hrm_memo(memoid)
);
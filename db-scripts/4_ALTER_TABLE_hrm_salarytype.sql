ALTER TABLE public.hrm_salarytype ADD salarytypecategorycd int4 NULL;

ALTER TABLE public.hrm_salarytype ADD salarytypecd int4 NULL;

ALTER TABLE public.hrm_salarytype ADD sortorder int4 NULL;

ALTER TABLE public.hrm_salarytype ADD isdeleted bool NULL;

ALTER TABLE public.hrm_salarytype ADD deleteby int4 NULL;

ALTER TABLE public.hrm_salarytype ADD deletedate timestamp(6) NULL;
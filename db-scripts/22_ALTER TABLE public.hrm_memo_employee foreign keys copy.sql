
-- public.hrm_memo_employee foreign keys

ALTER TABLE public.hrm_memo_employee ADD CONSTRAINT fk_memo_employee_memo FOREIGN KEY (memoid) REFERENCES public.hrm_memo(memoid);
-- 기존 문항과 퀴즈 기록을 보존하면서 객관식 준비 필드를 추가합니다.
alter table public.questions add column if not exists question_type text not null default 'text';
alter table public.questions add column if not exists choices jsonb not null default '[]'::jsonb;
alter table public.questions add column if not exists mcq_published boolean not null default false;

alter table public.questions drop constraint if exists questions_question_type_check;
alter table public.questions add constraint questions_question_type_check check (question_type in ('text','choice'));

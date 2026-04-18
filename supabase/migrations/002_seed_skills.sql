insert into public.skills (title, description)
select 'Web development', 'HTML, CSS, JavaScript, and building real projects.'
where not exists (select 1 from public.skills where title = 'Web development');

insert into public.skills (title, description)
select 'Guitar', 'Chords, rhythm, songs, and practice routines.'
where not exists (select 1 from public.skills where title = 'Guitar');

insert into public.skills (title, description)
select 'Design', 'Visual hierarchy, typography, and UI fundamentals.'
where not exists (select 1 from public.skills where title = 'Design');

insert into public.skills (title, description)
select 'Writing', 'Clear structure, editing, and consistent voice.'
where not exists (select 1 from public.skills where title = 'Writing');

insert into `aladdin`.user (email, password) values ('dummy@dummy.com', 'dummy');

insert into `aladdin`.`process_job_status_lookup` (description, name) values ('Job has not started yet', 'NOT_STARTED');
insert into `aladdin`.`process_job_status_lookup` (description, name) values ('Job is running', 'RUNNING');
insert into `aladdin`.`process_job_status_lookup` (description, name) values ('Job is finished', 'FINISHED');

insert into `aladdin`.`pipeline` (description, name) values ('dense sift', 'DenseSIFT');

DROP TABLE IF EXISTS users;

CREATE TABLE  users (
    user_id             serial PRIMARY KEY,
    user_name           varchar(50),
    faculty_status      boolean
);

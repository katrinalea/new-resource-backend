DROP TABLE IF EXISTS comments;

CREATE TABLE  comments (
    comment_id          serial PRIMARY KEY,
    user_id             integer,
    resource_id         integer,
    comment             text,
  	FOREIGN KEY(user_id) REFERENCES users(user_id),
  	FOREIGN KEY(resource_id) REFERENCES resources(resource_id)
);
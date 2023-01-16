DROP TABLE IF EXISTS likes;

CREATE TABLE  likes (
    like_id             serial PRIMARY KEY,
    user_id             integer,
    resource_id         integer,
    is_liked             boolean,
    UNIQUE(user_id, resource_id),
  	FOREIGN KEY(user_id) REFERENCES users(user_id),
  	FOREIGN KEY(resource_id) REFERENCES resources(resource_id)
);
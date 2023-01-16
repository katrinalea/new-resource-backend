DROP TABLE IF EXISTS to_do_list;

CREATE TABLE  to_do_list (
    user_id             integer ,
    resource_id         integer ,
    to_do_item_id       serial PRIMARY KEY,
    UNIQUE(user_id, resource_id),
  	FOREIGN KEY(user_id) REFERENCES users(user_id),
  	FOREIGN KEY(resource_id) REFERENCES resources(resource_id)
);
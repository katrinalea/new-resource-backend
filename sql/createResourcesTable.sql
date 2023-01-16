DROP TABLE IF EXISTS resources;

CREATE TABLE  resources (
    resource_id        serial PRIMARY KEY,
    resource_url       text NOT NULL UNIQUE,
    author_name        varchar(100),
    resource_name       varchar(255) UNIQUE,
    resource_description text,
    tags                text[],
    content_type        varchar(255),
    selene_week         varchar(255),
    time_of_post        date DEFAULT NOW(),
    usage_status        varchar(255),
    recommendation_reason   text,
  	user_id				integer,
  	FOREIGN KEY(user_id) REFERENCES users(user_id)
);
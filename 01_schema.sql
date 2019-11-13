create table user (
  id serial integer not null primary key,
  name varchar(255),
  email varchar(255),
  password varchar(255)
);

create table properties (
  id serial not null primary key,
  owner_id integer not null references user(id),
  title, varchar(255),
  description text,
  thumbnail_photo_url varchar(255),
  cover_photo_url varchar(255);
  cost_per_night integer,
  street varchar(255),
  parking_spaces integer,
  number_of_bathrooms integer,
  number_of_bedrooms integer,
  country varchar(255),
  city varchar(255),
  province varchar(255),
  post_code varchar(255),
  active boolean,
)

create table reservations (
  id serial not null primary key,
  start_date date,
  end_date date,
  property_id integer references properties(id),
  guest_id
)

create table rates (
  id serial not null primary key,
  start_date date
  end_date date,
  cost_per_night integer,
  property_id integer references properties(id)
);


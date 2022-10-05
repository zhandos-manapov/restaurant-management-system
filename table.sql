create table user(
  id int primary key auto_increment,
  name varchar(250),
  contactNumber varchar(20),
  email varchar(50),
  password varchar(250),
  status varchar(20),
  role varchar(20),
  UNIQUE ( email )
);


insert into user(name, contactNumber, email, password, status, role) 
values ('Admin', '12345678', 'admin@gmail.com', 'admin', 'true', 'admin');


create table category(
  id int not null auto_increment,
  name varchar(255) not null,
  primary key(id)
);


create table product(
  id int not null auto_increment,
  name varchar(255) not null,
  categoryId integer not null,
  description varchar(255),
  price integer, 
  status varchar(20),
  primary key(id)
);
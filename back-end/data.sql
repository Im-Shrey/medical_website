create database my_database;
use my_database;
create table users (
    id int auto_increment primary key,
    name varchar(100) not null,
    age int not null,
    gender enum('Male', 'Female') not null,
    email varchar(100) unique not null,
    mobile varchar(15) unique not null,
    password varchar(255) not null,
    profile_photo varchar(255) default null
);

create table sessions (
	id int auto_increment primary key,
    user_id int not null,
    token varchar(255) not null,
    created_at timestamp default current_timestamp,
    foreign key (user_id) references users(id)
);
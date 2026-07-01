CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    faculty_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    department_id INT REFERENCES departments(department_id)
);

CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    student_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    department_id INT REFERENCES departments(department_id)
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100),
    course_code VARCHAR(20) UNIQUE,
    faculty_id INT REFERENCES faculty(faculty_id)
);

CREATE TABLE course_packets (
    packet_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id),
    title VARCHAR(200),
    file_path TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT REFERENCES faculty(faculty_id)
);

CREATE TABLE tracking_logs (
    log_id SERIAL PRIMARY KEY,
    packet_id INT REFERENCES course_packets(packet_id),
    student_id INT REFERENCES students(student_id),
    action VARCHAR(50),
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
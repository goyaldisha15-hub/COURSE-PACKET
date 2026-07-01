INSERT INTO departments (department_name)
VALUES ('Computer Science');

INSERT INTO faculty (faculty_name,email,department_id)
VALUES ('Love Porwal','love@college.com',1);

INSERT INTO students (student_name,email,department_id)
VALUES
('Akash Kumar','akash@college.com',1),
('Rohit Verma','rohit@college.com',1);

INSERT INTO courses (course_name,course_code,faculty_id)
VALUES ('Web Development','WD101',1);

INSERT INTO course_packets
(course_id,title,file_path,uploaded_by)
VALUES
(1,'Web Development Notes','notes.pdf',1);
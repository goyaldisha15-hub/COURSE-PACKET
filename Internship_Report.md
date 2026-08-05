# Summer Internship Report

**Project Title:** Centralized Course Packet Management System

**Program:** B.Tech in Computer Science and Engineering (Artificial Intelligence & Machine Learning)

---

## 1. Introduction

A college campus handles hundreds of course documents every semester. Syllabi, lecture notes, lab manuals, assignments, and reference materials are created by faculty members and need to reach the right set of students at the right time. In many institutions this process still runs on scattered channels. Faculty members share files through personal emails, messaging groups, or pen drives, and students often end up with outdated or incomplete material. Some students are missed entirely because the message did not reach their particular section. Keeping track of which documents were shared, with whom, and whether they were even opened is practically impossible with this approach.

During my summer internship, I was given the task of designing and building a solution to this problem. The project I developed is the Centralized Course Packet Management System, a full-stack web application that gives colleges a single, organized platform for managing and distributing course packets. The system is structured the way colleges actually operate: it is department-wise and section-wise. A course packet is simply a document, usually a PDF, that a faculty member prepares for a subject. It can be lecture notes, a lab manual, an assignment sheet, or any other academic resource.

The core idea behind the application is controlled access. Faculty members log in and upload course packets through their dashboard. They attach metadata to each upload, such as the course, subject code, department, semester, section, academic year, and packet type. Once a packet is submitted, it does not go live immediately. An administrator reviews it and either approves, rejects, or returns it with remarks. This approval workflow ensures that only verified, quality content reaches students. Students log in and see only the packets that are approved and assigned to their own department, semester, and section. A student in the AI & ML department, semester five, section AI/ML, will not see packets meant for the CSE department or for a different section. This filtering is enforced both in the user interface and in the backend queries, so the restriction holds even if someone tries to call the API directly.

The application is a full-stack project built with a React frontend and an Express.js backend, with SQLite as the database. The frontend is a modern single-page application developed using React with Vite as the build tool and Tailwind CSS for styling. It includes separate dashboards for administrators, faculty members, and students. Students can browse approved packets, search them, download them, bookmark important ones, and view their download history. They can also request access to courses from other sections, and track the status of their requests. Faculty members can submit packets, edit them, delete them, view remarks from the administrator, and review requests from students. Administrators have the widest set of tools: they manage users, review and approve packets, export reports, manage the list of departments and subjects, and view analytical dashboards showing packet distribution and download statistics.

Beyond simple file sharing, the system includes features that make it genuinely useful for a college administration. Every download is recorded in the database, so faculty members can see how many times their packets were downloaded. The administrator can see analytics such as the number of packets per department, per section, per semester, and per packet type, along with the most and least downloaded resources. User accounts are protected with bcrypt password hashing, and role-based access control is applied at the API level so that students cannot access faculty functions and faculty cannot access administrative functions. Notifications are generated automatically when a packet is approved, rejected, or downloaded, keeping everyone in the loop.

The project gave me exposure to the complete software development lifecycle. I worked on database design, backend API development, frontend component development, authentication, file uploads, responsive design, debugging, and deployment preparation. I also used Git and GitHub throughout the development to track my work, which taught me the importance of version control in a real project. This report documents the objectives of the project, the step-by-step development process, the skills I gained, the technologies I used, the challenges I encountered, the final results, and my overall conclusion.

## 2. Objectives

The following objectives were set for this project:

1. To design a centralized web platform where all course packets for a college can be stored, managed, and distributed from one place.
2. To implement secure registration and login with role-based authentication for administrators, faculty members, and students.
3. To enforce department-wise access control so that students only see packets belonging to their own department.
4. To enforce section-wise and semester-wise packet distribution so that each student receives only the material intended for their batch.
5. To provide faculty members with a dashboard to upload PDF course packets, edit them, delete them, and track their approval status.
6. To provide students with a dashboard to view, search, download, and bookmark approved packets relevant to them.
7. To implement an administrative approval workflow where faculty submissions are reviewed before becoming visible to students.
8. To record download activity and generate statistical reports for administrators.
9. To build a responsive, user-friendly interface that works on desktops, tablets, and mobile devices.
10. To follow good software engineering practices, including modular code organization, REST API design, database normalization, and version control with Git and GitHub.

## 3. Work Done

The development of the project was carried out in clear, sequential phases. I describe each phase below.

### 3.1 Requirement Analysis and Planning

The first step was to understand the problem clearly. I studied how course material is currently distributed in colleges and identified the main pain points: no central repository, no control over who sees what, no review process, and no usage statistics. From this analysis I defined the three user roles that the system would serve: administrator, faculty, and student. I then listed the features each role needs, which became the roadmap for development. I also decided on the technology stack at this stage: React for the frontend, Express.js for the backend, SQLite for the database, and Multer for file uploads.

### 3.2 Database Design

I started the actual implementation with the database because everything else depends on it. I designed an SQLite database with a `users` table for storing accounts with their role, section, department, semester, and profile fields. The `packets` table stores course packet records including title, course, subject code, description, the faculty member who submitted it, its approval status, remarks, and the metadata used for filtering such as department, section, semester, and academic year. I also created tables for `courses`, `departments`, `subjects`, `bookmarks`, `downloads`, `notifications`, `password_resets`, `requests`, and `approval_history`.

One important design decision was automatic migration. Since I kept adding fields during development, I wrote logic that checks the existing columns of each table using `PRAGMA table_info` and adds any missing columns with `ALTER TABLE`. This meant the database could be upgraded safely without losing existing data. I also wrote a seeding routine that populates the database with sample departments, subjects, default users, courses, packets, and notifications, which made testing easy from day one.

### 3.3 Backend API Development

Next I built the Express.js backend following a layered structure. Routes define the API endpoints, controllers handle the request logic, and models contain the SQL queries. This separation kept the code clean and made it easy to extend.

I implemented authentication endpoints for login, registration, forgot password, reset password, and change password. Passwords are hashed using bcrypt before being stored. The frontend sends the user's role and email in custom headers, and role-based middleware functions on the backend check these headers to protect the endpoints. For example, a route that creates a new department requires the `admin` role, while a route that submits a packet requires the `faculty` role. If a student tries to call an admin endpoint directly, the middleware rejects the request with a 403 response.

I used Multer for file uploads. Packet uploads accept only PDF files, with a 10 MB size limit, and profile photo uploads accept only image files. The uploaded file path and original filename are stored in the packet record, so the file itself is served from the uploads folder while the metadata lives in the database.

### 3.4 Approval Workflow and Notifications

The approval workflow was an important part of the project. When a faculty member submits a packet, its status is set to `pending`. The admin can then approve it, reject it, or return it with remarks. Each action is recorded in the `approval_history` table and a notification is created for the faculty member. Only packets with status `approved` are shown to students. I also added bulk approve and reject functionality on the admin side, plus CSV export of pending packets.

### 3.5 Frontend Development

For the frontend, I created a React single-page application using Vite. I organized the code into feature folders such as `auth`, `admin`, `faculty`, `student`, `profile`, and `notifications`, with shared components in a `common` folder. Axios was configured in a central API client with proper error handling that converts backend error responses into readable messages.

I built the login, registration, and forgot password pages first, along with a React context for managing the authenticated user and persisting the session in localStorage. A protected route component checks the user's role and redirects unauthorized visitors. I then built the three dashboards. The student dashboard shows approved packets, the faculty dashboard shows packet submissions with their status, and the admin dashboard shows overall statistics such as total users, pending packets, approved packets, and rejected packets, along with a priority queue of pending reviews. All dashboards refresh data every ten seconds.

The user interface was styled with Tailwind CSS. I made a consistent design with a sidebar layout, cards, tables with status badges, loading skeletons, and toast notifications for user feedback. The layout is responsive, with a slide-in sidebar on mobile devices.

### 3.6 Additional Features

After the core functionality was working, I added supporting features. Students can search approved packets, bookmark them, and view their download history. Faculty members can view the total number of downloads their packets have received and see remarks from the admin. Students can request access to courses in other sections, and the admin or faculty can review these requests. I also built a reporting module for the admin showing packets grouped by department, section, semester, and type, monthly submission trends, and the most and least downloaded packets.

### 3.7 Testing and Debugging

Testing was done continuously. I tested every API endpoint using the browser and direct requests, and verified the database behavior with custom query scripts. I paid special attention to the role-based access rules, making sure a student could not access faculty or admin endpoints. I also tested the file upload flow thoroughly, including the error cases like uploading a non-PDF file or a file larger than the limit. Debugging was a constant part of this process. I used console logging on the backend and the browser developer tools on the frontend to trace issues.

### 3.8 Version Control with Git and GitHub

Throughout the project I used Git for version control and pushed my work to a GitHub repository. I made commits in logical steps, which meant I could always go back to a working version if something broke. Working with Git taught me how to manage a real codebase and how important clear commit messages are for understanding the history of a project.

## 4. Skills Learned

This internship helped me grow as a developer in several important ways:

1. **Full-stack development.** I learned to build a complete application from the database up to the user interface. I now understand how the frontend, backend, and database communicate with each other, and how a REST API ties the whole system together.

2. **Backend development with Node.js and Express.** I learned to design RESTful routes, write controllers and models, handle request bodies and query parameters, implement middleware, and structure a backend project properly. I also learned how to handle file uploads and serve static files.

3. **Frontend development with React.** I learned to build reusable components, manage state with React hooks, use context for global state such as authentication, handle routing with React Router, and make API calls with Axios.

4. **Database design and SQL.** I learned to design normalized tables with foreign keys, write complex queries with joins and aggregations, and build automatic migration logic. I also learned how SQLite works as an embedded database.

5. **Authentication and security.** I learned how passwords are hashed and compared securely, how role-based access control is implemented at the API level, and why authorization checks on the backend are essential even when the frontend hides certain options.

6. **Debugging and problem solving.** I got a lot of practice tracing errors, reading stack traces, inspecting network requests, and checking database contents. I learned to break big problems into smaller pieces and test each piece systematically.

7. **Version control with Git and GitHub.** I learned to commit changes in logical steps, write meaningful commit messages, push to a remote repository, and use Git to recover from mistakes.

8. **UI/UX and responsive design.** I learned to build interfaces with Tailwind CSS, create a consistent design system with cards, badges, and buttons, and make layouts work on both large screens and mobile devices.

9. **Project organization.** Working on a project of this size taught me the value of modular code, clear naming, and separating concerns between routes, controllers, models, and components.

## 5. Tools & Technologies

The project was built using the following technologies, each of which served a specific purpose.

1. **React.js.** React is a JavaScript library for building user interfaces. I used it to create the frontend of the application, including the login pages, the three role-based dashboards, and all supporting screens. React's component-based model let me reuse elements like cards, tables, and status badges across the application. I used hooks such as `useState`, `useEffect`, and `useContext` to manage data and global state.

2. **JavaScript (ES6+).** JavaScript was the language used for both the frontend and backend. I used modern features such as arrow functions, destructuring, template literals, async/await, and ES modules.

3. **HTML5 and CSS3.** HTML provided the structure of the pages, while CSS handled styling. I paired CSS with Tailwind CSS for utility-based styling, which made the design process much faster.

4. **Node.js.** Node.js is the JavaScript runtime that allowed me to run JavaScript on the server. It powers the Express.js backend and handles incoming HTTP requests.

5. **Express.js.** Express is a lightweight web framework for Node.js. I used it to define the REST API endpoints, mount middleware, handle routing, serve uploaded files, and process JSON request bodies.

6. **SQLite.** SQLite is an embedded relational database. It stores all the application data in a single file. I chose it because it requires no separate database server, which makes setup simple and ideal for a college-scale project. The `sqlite3` npm package was used to connect to it from Node.js.

7. **Vite.** Vite is a modern build tool for frontend projects. I used it to scaffold the React project, run a fast development server with hot module replacement, and build optimized production assets.

8. **Axios.** Axios is an HTTP client for making API requests from the browser. I used it to call the backend REST endpoints and configured a shared instance with the base URL and consistent error handling.

9. **Multer.** Multer is an Express middleware for handling file uploads. I used it to accept PDF packets and profile images, with validation for file type and size limits.

10. **bcrypt.** bcrypt is a password hashing library. I used it to hash passwords before storing them in the database and to verify them during login.

11. **Tailwind CSS.** Tailwind is a utility-first CSS framework. I used it for responsive layout, spacing, colors, and component styling without writing large amounts of custom CSS.

12. **React Router.** React Router is the routing library for the frontend. I used it to define protected routes for the different roles and navigate between pages.

13. **Git and GitHub.** Git was used for version control during development, and GitHub hosted the remote repository.

## 6. Challenges Faced and How They Were Overcome

Building this system came with several challenges. The most significant ones are described below.

1. **Designing the access control properly.** The main requirement was that students must see only packets meant for their department, semester, and section. Getting this right required care. If the filtering was done only in the frontend, a student could bypass it by calling the API directly. My solution was to enforce the filtering in the backend query itself. When a student requests approved packets, the controller reads the student's department, section, and semester from their profile and passes them into the SQL query, so the database only returns matching records.

2. **Protecting routes by role.** The application has three roles with different privileges, and endpoints had to be protected accordingly. I initially wrote the checks inline, but this became repetitive. I solved this by creating middleware functions such as `requireAdminRole` and `requireFacultyRole` that inspect the role header and either allow the request or return a 403 error. This made the code cleaner and reduced the chance of forgetting a check.

3. **Handling file uploads safely.** Uploading files brought several concerns: wrong file types, oversized files, and cleaning up files when they were no longer needed. I restricted packet uploads to PDF files only and profile uploads to images, with explicit size limits in the Multer configuration. I also made sure that when a faculty member deletes a packet, the file is removed from the filesystem along with the database record.

4. **Keeping the database in sync during development.** I added new columns and tables many times during development. Simply recreating the database would have lost test data. I solved this with a startup routine that checks the existing schema using `PRAGMA table_info` and applies `ALTER TABLE` statements only for missing columns, so the schema upgrades in place.

5. **Managing CORS and API connectivity.** When the frontend and backend run on different ports, the browser blocks cross-origin requests unless the server allows them. I encountered this early in development. I fixed it by configuring the CORS middleware on the Express server to allow the frontend requests, and by centralizing the API base URL in one configuration file so it is easy to change.

6. **Providing useful error messages.** At first, failed API calls returned generic errors that were hard for users to understand. I built an error-handling layer in the Axios client that reads the backend message and maps common status codes to clear, readable messages, such as "Invalid email or password" or "Access denied". This greatly improved the user experience during testing.

7. **Keeping the interface responsive.** The dashboards contain tables and cards that can be hard to view on small screens. I used Tailwind's responsive classes so that tables scroll horizontally on mobile, the sidebar becomes a slide-in drawer, and the cards stack vertically. Testing in the browser's responsive mode helped me refine the layouts.

8. **Organizing a growing codebase.** As the project grew, it became easy to lose track of files. I refactored the structure early, grouping frontend code into feature folders and backend code into routes, controllers, and models. This made it much easier to find and modify code later.

9. **Debugging data issues.** At several points, packets appeared missing or with wrong statuses. I used direct SQL queries against the database to inspect the data, which helped me identify issues such as records inserted with the wrong default status or filters returning nothing because the metadata was empty. Writing a small query script for the database made this debugging much faster.

## 7. Results

The final system is a complete, working full-stack application that successfully manages the lifecycle of course packets in a college.

On the authentication side, the system provides secure registration and login for all three roles. Passwords are stored as bcrypt hashes, forget-password and reset-password flows work, and users can change their password and update their profile, including uploading a profile photo. The session is persisted in the browser using localStorage.

On the faculty side, a faculty member logs in and lands on a dashboard showing their packet statistics: how many packets are pending review, how many are approved, and how many were rejected. They can submit a new packet by filling in details and uploading a PDF, and the file is validated and stored. Faculty members can edit or delete their own packets, view remarks given by the admin, and see the total number of downloads their packets have received. When the admin takes action on a packet, the faculty member receives a notification.

On the student side, a student sees only the packets that are approved and match their own department, section, and semester. They can search through the packets, download them, bookmark important ones, and view their download history. Each download is recorded, and the download count for the packet increases. Students can also request access to courses from other sections and track the status of their requests.

On the admin side, the administrator has full visibility and control. The dashboard shows total users and packet counts by status. Pending packets can be reviewed and approved, rejected, or returned individually or in bulk, with optional remarks and CSV export of the pending list. The admin can manage users, add or edit departments and subjects, review student access requests, and view a reports page with packet counts grouped by department, section, semester, and type, plus monthly submission trends and lists of the most and least downloaded packets.

The system runs as two servers: an Express.js backend on port 5000 and a Vite development server for the React frontend. The database is a single SQLite file that is automatically created, migrated, and seeded with sample data on first startup. The application was tested from the perspective of all three roles, and the access control rules were verified to work correctly: students cannot reach faculty endpoints, and faculty cannot reach admin endpoints.

The project is hosted on GitHub, with a commit history showing the gradual construction of the system. The final codebase is cleanly organized into backend and frontend folders, making it easy for anyone to run and continue developing the project.

## 8. Conclusion

This internship project gave me the opportunity to design and build a complete full-stack web application from scratch. The Centralized Course Packet Management System solves a real problem that colleges face: distributing course material in an organized, controlled, and trackable way. The application provides separate experiences for administrators, faculty, and students, with role-based authentication, department-wise and section-wise access control, PDF upload and download, an approval workflow, notifications, bookmarks, download tracking, and analytical reporting.

What I learned during this internship goes far beyond the individual technologies I used. I learned how to think about a problem from the perspective of its users, how to break a large system into manageable pieces, and how to make design decisions that keep the code maintainable as it grows. I learned the importance of testing small components as they are built rather than waiting until the end, and I learned how to debug systematically when things went wrong. Working with Git and GitHub showed me how version control protects a project and supports collaboration.

The experience also strengthened my confidence as a software developer. Building the backend taught me about REST API design, middleware, file uploads, and database management. Building the frontend taught me about component design, state management, routing, and responsive layouts. Most importantly, integrating the two halves taught me how a real web application works end to end.

This project represents a meaningful step in my journey toward becoming a professional software engineer. In the future, I would like to extend the system with features such as email notifications, a public announcement board, integration with the college's existing authentication system, and deployment to a live server so the application can be used by a real institution. I am grateful for the opportunity to work on this project, and the skills and experience I gained will stay with me in all my future work.
-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS HISTORY;
DROP TABLE IF EXISTS HAS;
DROP TABLE IF EXISTS STUDENT;
DROP TABLE IF EXISTS GUARDIAN;
DROP TABLE IF EXISTS PARENT;
DROP TABLE IF EXISTS FEE_DETAILS;
DROP TABLE IF EXISTS CLASS;
DROP TABLE IF EXISTS COURSE;


-- Create tables 
CREATE TABLE GUARDIAN (
  Guardian_ID VARCHAR(255) NOT NULL PRIMARY KEY,
  Guardian_Name VARCHAR(255),
  CNIC VARCHAR(255),
  Phone_No VARCHAR(255),
  Address VARCHAR(255),
  Gender VARCHAR(255),
  Email VARCHAR(255),
  Relation VARCHAR(255)
);

CREATE TABLE FEE_DETAILS (
  Challan_No VARCHAR(255) NOT NULL PRIMARY KEY,
  Amount VARCHAR(255),
  Discount VARCHAR(255),
  Status VARCHAR(255),
  Due_Date DATE,
  Net_Amount VARCHAR(255)
);

CREATE TABLE COURSE (
  Course_Id VARCHAR(255) NOT NULL PRIMARY KEY,
  Course_title VARCHAR(255),
  Grade VARCHAR(255),
  Instructor VARCHAR(255)
);

CREATE TABLE PARENT (
  Parent_ID VARCHAR(255) NOT NULL PRIMARY KEY,
  Parent_Name VARCHAR(255),
  CNIC VARCHAR(255),
  Phone_No VARCHAR(255),
  Address VARCHAR(255),
  Gender VARCHAR(255),
  Email VARCHAR(255),
  P_JOB VARCHAR(255),
  Spouse VARCHAR(255)
);

CREATE TABLE CLASS (
  Class_ID VARCHAR(255) NOT NULL,
  Section VARCHAR(255) NOT NULL,
  Class_Title VARCHAR(255),
  C_Total_Students VARCHAR(255),
  Age_Group VARCHAR(255),
  Gender_Group VARCHAR(255),
  PRIMARY KEY (Class_ID, Section)
);

CREATE TABLE STUDENT (
  Student_ID VARCHAR(255) NOT NULL PRIMARY KEY,
  Student_Name VARCHAR(255),
  DOB DATE NOT NULL,
  Gender VARCHAR(255),
  Age INT,
  Admission_Date DATE,
  Course_Id VARCHAR(255),
  Parent_ID VARCHAR(255),
  Guardian_ID VARCHAR(255),
  Class_ID VARCHAR(255),
  Challan_No VARCHAR(255),
  Section VARCHAR(255),
  CONSTRAINT STUDENT_Course_ID_Fk FOREIGN KEY (Course_ID) REFERENCES COURSE(Course_Id),
  CONSTRAINT STUDENT_Parent_ID_Fk FOREIGN KEY (Parent_ID) REFERENCES PARENT(Parent_ID),
  CONSTRAINT STUDENT_Guardian_ID_Fk FOREIGN KEY (Guardian_ID) REFERENCES GUARDIAN(Guardian_ID),
  CONSTRAINT STUDENT_Class_ID_Fk FOREIGN KEY (Class_ID, Section) REFERENCES CLASS(Class_ID, Section),
  CONSTRAINT STUDENT_Challan_No_Fk FOREIGN KEY (Challan_No) REFERENCES FEE_DETAILS(Challan_No)
);

CREATE TABLE HISTORY (
  Hist_ID VARCHAR(255) NOT NULL PRIMARY KEY,
  Old_Class VARCHAR(255),
  New_Class VARCHAR(255),
  New_Admission VARCHAR(255),
  Enrollment_Date DATE,
  Student_ID VARCHAR(255),
  CONSTRAINT HISTORY_Student_ID_Fk FOREIGN KEY (Student_ID) REFERENCES STUDENT(Student_ID)
);

CREATE TABLE HAS (
  Parent_ID VARCHAR(255),
  Student_ID VARCHAR(255),
  PRIMARY KEY (Parent_ID, Student_ID),
  CONSTRAINT HAS_Parent_ID_Fk FOREIGN KEY (Parent_ID) REFERENCES PARENT(Parent_ID),
  CONSTRAINT HAS_Student_ID_Fk FOREIGN KEY (Student_ID) REFERENCES STUDENT(Student_ID)
);

INSERT INTO GUARDIAN (Guardian_ID, Guardian_Name, CNIC, Phone_No, Address, Gender, Email, Relation)
VALUES
    ('G21', 'Mr. Kareem', '1234567890123', '03011223344', '123 Main St, City', 'M', 'kareem@example.com', 'Father'),
    ('G22', 'Ms. Ayesha', '2345678901234', '03111223344', '456 Elm St, City', 'F', 'ayesha@example.com', 'Mother'),
    ('G23', 'Mr. Ahmed', '3456789012345', '03211223344', '789 Oak St, City', 'M', 'ahmed@example.com', 'Father'),
    ('G24', 'Ms. Fatima', '4567890123456', '03311223344', '901 Pine St, City', 'F', 'fatima@example.com', 'Mother'),
    ('G25', 'Mr. Zaid', '5678901234567', '03411223344', '234 Maple St, City', 'M', 'zaid@example.com', 'Father'),
    ('G26', 'Ms. Sara', '6789012345678', '03511223344', '567 Cedar St, City', 'F', 'sara@example.com', 'Mother'),
    ('G27', 'Mr. Ali', '7890123456789', '03611223344', '890 Birch St, City', 'M', 'ali@example.com', 'Father'),
    ('G28', 'Ms. Laila', '8901234567890', '03711223344', '123 Walnut St, City', 'F', 'laila@example.com', 'Mother'),
    ('G29', 'Mr. Imran', '9012345678901', '03811223344', '456 Redwood St, City', 'M', 'imran@example.com', 'Father'),
    ('G30', 'Ms. Zara', '0123456789012', '03911223344', '789 Sycamore St, City', 'F', 'zara@example.com', 'Mother');
INSERT INTO FEE_DETAILS (Challan_No, Amount, Discount, Status, Due_Date, Net_Amount)
VALUES
    ('F21', '15000', '2000', 'Paid', '2023-01-10', '13000'),
    ('F22', '16000', '2500', 'UnPaid', '2023-01-12', '13500'),
    ('F23', '14000', '1500', 'Paid', '2023-01-14', '12500'),
    ('F24', '18000', '3000', 'Paid', '2023-01-16', '15000'),
    ('F25', '17000', '2800', 'UnPaid', '2023-01-18', '14200'),
    ('F26', '15500', '2200', 'UnPaid', '2023-01-20', '13300'),
    ('F27', '16500', '2600', 'Paid', '2023-01-22', '13900'),
    ('F28', '14500', '1800', 'Paid', '2023-01-24', '12700'),
    ('F29', '17500', '2700', 'UnPaid', '2023-01-26', '14800'),
    ('F30', '15800', '2300', 'Paid', '2023-01-28', '13500');
INSERT INTO COURSE (Course_Id, Course_title, Grade, Instructor)
VALUES
    ('C21', 'English Literature', 'A', 'Mr. Salman'),
    ('C22', 'Computer Science', 'A', 'Ms. Warda'),
    ('C23', 'Economics', 'A', 'Mr. Moazzam'),
    ('C24', 'Business Management', 'A', 'Ms. Mahibah'),
    ('C25', 'Chemistry', 'A', 'Mr. Waqas'),
    ('C26', 'Fine Arts', 'A', 'Ms. Maham'),
    ('C27', 'Music', 'A', 'Mr. Daud'),
    ('C28', 'Psychology', 'A', 'Ms. Saira'),
    ('C29', 'Sociology', 'A', 'Mr. Hussain'),
    ('C30', 'Health Education', 'A', 'Ms. Aleena');
INSERT INTO PARENT (Parent_ID, Parent_Name, CNIC, Phone_No, Address, Gender, Email, P_JOB, Spouse)
VALUES
    ('P21', 'Mr. Kareem', '1234567890123', '03011223344', '123 Main St, City', 'M', 'kareem@example.com', 'Engineer', 'Ayesha'),
    ('P22', 'Ms. Ayesha', '2345678901234', '03111223344', '456 Elm St, City', 'F', 'ayesha@example.com', 'Doctor', 'Kareem'),
    ('P23', 'Mr. Ahmed', '3456789012345', '03211223344', '789 Oak St, City', 'M', 'ahmed@example.com', 'Lawyer', 'Fatima'),
    ('P24', 'Ms. Fatima', '4567890123456', '03311223344', '901 Pine St, City', 'F', 'fatima@example.com', 'Artist', 'Ahmed'),
    ('P25', 'Mr. Zaid', '5678901234567', '03411223344', '234 Maple St, City', 'M', 'zaid@example.com', 'Professor', 'Sara'),
    ('P26', 'Ms. Sara', '6789012345678', '03511223344', '567 Cedar St, City', 'F', 'sara@example.com', 'Pilot', 'Zaid'),
    ('P27', 'Mr. Ali', '7890123456789', '03611223344', '890 Birch St, City', 'M', 'ali@example.com', 'Journalist', 'Laila'),
    ('P28', 'Ms. Laila', '8901234567890', '03711223344', '123 Walnut St, City', 'F', 'laila@example.com', 'Architect', 'Ali'),
    ('P29', 'Mr. Imran', '9012345678901', '03811223344', '456 Redwood St, City', 'M', 'imran@example.com', 'Engineer', 'Zara'),
    ('P30', 'Ms. Zara', '0123456789012', '03911223344', '789 Sycamore St, City', 'F', 'zara@example.com', 'Doctor', 'Imran');
INSERT INTO CLASS (Class_ID, Section, Class_Title, C_Total_Students, Age_Group, Gender_Group)
VALUES
    ('11', 'A', 'Grade 1', '20', '6-7', 'Mixed'),
    ('12', 'B', 'Grade 2', '22', '7-8', 'Mixed'),
    ('13', 'C', 'Grade 3', '24', '8-9', 'Mixed'),
    ('14', 'D', 'Grade 4', '25', '9-10', 'Mixed'),
    ('15', 'E', 'Grade 5', '26', '10-11', 'Mixed'),
    ('16', 'F', 'Grade 6', '28', '11-12', 'Mixed'),
    ('17', 'G', 'Grade 7', '30', '12-13', 'Mixed'),
    ('18', 'H', 'Grade 8', '32', '13-14', 'Mixed'),
    ('19', 'I', 'Grade 9', '34', '14-15', 'Mixed'),
    ('20', 'J', 'Grade 10', '36', '15-16', 'Mixed');
INSERT INTO STUDENT (Student_ID, Student_Name, DOB, Gender, Age, Admission_Date, Course_Id, Parent_ID, Guardian_ID, Class_ID, Challan_No, Section)
VALUES
    ('S21', 'Ali', '2015-03-01', 'M', '9', '2023-01-01', 'C21', 'P21', 'G21', '11', 'F21', 'A'),
    ('S22', 'Sara', '2014-05-10', 'F', '10', '2023-01-01', 'C22', 'P22', 'G22', '12', 'F22', 'B'),
    ('S23', 'Arslan', '2013-08-15', 'M', '11', '2023-01-01', 'C23', 'P23', 'G23', '13', 'F23', 'C'),
    ('S24', 'Fatima', '2012-11-20', 'F', '12', '2023-01-01', 'C24', 'P24', 'G24', '14', 'F24', 'D'),
    ('S25', 'Zaid', '2011-02-25', 'M', '13', '2023-01-01', 'C25', 'P25', 'G25', '15', 'F25', 'E'),
    ('S26', 'Ayesha', '2010-04-30', 'F', '14', '2023-01-01', 'C26', 'P26', 'G26', '16', 'F26', 'F'),
    ('S27', 'Salman', '2009-07-05', 'M', '15', '2023-01-01', 'C27', 'P27', 'G27', '17', 'F27', 'G'),
    ('S28', 'Laila', '2008-09-10', 'F', '16', '2023-01-01', 'C28', 'P28', 'G28', '18', 'F28', 'H'),
    ('S29', 'Imran', '2007-12-15', 'M', '17', '2023-01-01', 'C29', 'P29', 'G29', '19', 'F29', 'I'),
    ('S30', 'Zara', '2006-02-20', 'F', '18', '2023-01-01', 'C30', 'P30', 'G30', '20', 'F30', 'J');
INSERT INTO HISTORY (Hist_ID, Old_Class, New_Class, New_Admission, Enrollment_Date, Student_ID)
VALUES
    ('H21', '11', '12', 'S22', '2023-01-01', 'S21'),
    ('H22', '12', '13', 'S23', '2023-01-01', 'S22'),
    ('H23', '13', '14', 'S24', '2023-01-01', 'S23'),
    ('H24', '14', '15', 'S25', '2023-01-01', 'S24'),
    ('H25', '15', '16', 'S26', '2023-01-01', 'S25'),
    ('H26', '16', '17', 'S27', '2023-01-01', 'S26'),
    ('H27', '17', '18', 'S28', '2023-01-01', 'S27'),
    ('H28', '18', '19', 'S29', '2023-01-01', 'S28'),
    ('H29', '19', '20', 'S30', '2023-01-01', 'S29'),
    ('H30', '20', '11', 'S21', '2023-01-01', 'S30');
INSERT INTO HAS (Parent_ID, Student_ID)
VALUES
    ('P21', 'S21'),
    ('P22', 'S22'),
    ('P23', 'S23'),
    ('P24', 'S24'),
    ('P25', 'S25'),
    ('P26', 'S26'),
    ('P27', 'S27'),
    ('P28', 'S28'),
    ('P29', 'S29'),
    ('P30', 'S30');
--Queries Using operator

SELECT * FROM STUDENT WHERE Gender = 'M' AND Age > 15 OR Age < 10;

SELECT * FROM PARENT WHERE NOT Gender = 'M';

SELECT * FROM COURSE WHERE Course_Id IN ('C21', 'C22', 'C23');

SELECT * FROM GUARDIAN WHERE Guardian_ID NOT IN ('G21', 'G22', 'G23');

SELECT * FROM FEE_DETAILS WHERE Due_Date BETWEEN '2023-01-01' AND '2023-06-30';

SELECT * FROM STUDENT WHERE Student_Name LIKE 'A%';

SELECT DISTINCT Grade FROM COURSE;

SELECT Class_ID, COUNT(*) AS Total_Students FROM STUDENT GROUP BY Class_ID;

SELECT COUNT(Parent_ID) AS Total_Parents FROM PARENT WHERE Spouse LIKE 'A%';

SELECT COUNT(Student_ID) AS Total_Students FROM STUDENT WHERE Student_Name LIKE '%m%';


--Queries Using Joins

SELECT s.Student_Name, p.Parent_Name FROM STUDENT s INNER JOIN PARENT p ON s.Parent_ID= p.Parent_ID;

SELECT s.Student_Name, f.Amount FROM STUDENT s LEFT JOIN FEE_DETAILS f ON s.Challan_No = f.Challan_No;

SELECT s.Student_Name, c.Course_title FROM STUDENT s INNER JOIN COURSE c ON s.Course_Id = c.Course_Id;

SELECT g.Guardian_Name, s.Student_Name FROM GUARDIAN g RIGHT JOIN STUDENT s ON g.Guardian_ID = s.Guardian_ID;

SELECT s.Student_Name, c.Class_Title FROM STUDENT s FULL OUTER JOIN CLASS c ON s.Class_ID = c.Class_ID;

SELECT s.Student_Name, h.Old_Class, h.New_Class FROM STUDENT s LEFT JOIN HISTORY h ON s.Student_ID = h.Student_ID; 

SELECT s.Student_Name, g.Guardian_Name FROM STUDENT s INNER JOIN GUARDIAN g ON s.Guardian_ID = g.Guardian_ID WHERE g.Relation = 'Father';

SELECT c.Course_title, s.Student_Name FROM COURSE c LEFT JOIN STUDENT s ON c.Course_Id = s.Course_Id;

SELECT s.Student_Name, p.Parent_Name, p.P_JOB FROM STUDENT s INNER JOIN PARENT p ON s.Parent_ID = p.Parent_ID;

SELECT c.Class_Title, COUNT(s.Student_ID) AS Number_Of_Students FROM CLASS c LEFT JOIN STUDENT s ON c.Class_ID = s.Class_ID AND c.Section = s.Section GROUP BY c.Class_Title; 


--Queries Using Nested

SELECT Student_Name FROM STUDENT
WHERE Course_Id IN (
    SELECT Course_Id FROM COURSE WHERE Instructor = 'Ms. Mahibah'
);

SELECT Student_Name FROM STUDENT
WHERE Challan_No IN (
    SELECT Challan_No FROM FEE_DETAILS WHERE CAST(Discount AS INT) > 2000
);


SELECT Parent_Name FROM PARENT
WHERE Parent_ID IN (
    SELECT Parent_ID FROM STUDENT WHERE Class_ID = '15'
);


SELECT Student_Name FROM STUDENT
WHERE Guardian_ID IN (
    SELECT Guardian_ID FROM GUARDIAN WHERE Gender='M'
);


SELECT Student_Name FROM STUDENT
WHERE Challan_No IN (
    SELECT Challan_No FROM FEE_DETAILS WHERE Status = 'Paid'
);


SELECT Student_Name FROM STUDENT
WHERE Challan_No IN (
    SELECT Challan_No FROM FEE_DETAILS WHERE Status = 'UnPaid'
);


SELECT Class_Title FROM CLASS 
   WHERE Class_ID IN (
    SELECT Class_ID FROM CLASS WHERE CAST(C_Total_Students AS INT) > 25
);


SELECT Guardian_Name FROM GUARDIAN
WHERE Guardian_ID IN (
    SELECT Guardian_ID FROM STUDENT WHERE Class_ID = '16'
) AND Relation = 'Mother';


SELECT Student_Name FROM STUDENT s
WHERE EXISTS (
    SELECT 1
    FROM CLASS c WHERE c.Class_ID = s.Class_ID AND c.Class_ID = '13'
);


SELECT Student_Name FROM STUDENT
WHERE Class_ID IN (
    SELECT Class_ID
    FROM STUDENT GROUP BY Class_ID HAVING AVG(Age) > 12
);


--Bonus Queries


CREATE VIEW StudentParentView AS
SELECT s.Student_Name, p.Parent_Name FROM STUDENT s
JOIN PARENT p ON s.Parent_ID = p.Parent_ID;


CREATE VIEW StudentFeeView AS
SELECT s.Student_Name, f.Amount, f.Discount, f.Net_Amount FROM STUDENT s JOIN FEE_DETAILS f ON s.Challan_No = f.Challan_No;


CREATE VIEW CourseStudentCountView AS
SELECT c.Course_title, COUNT(s.Student_ID) AS Student_Count FROM COURSE c
JOIN STUDENT s ON c.Course_Id = s.Course_Id GROUP BY c.Course_title;


CREATE VIEW StudentHistoryView AS
SELECT s.Student_Name, h.Old_Class, h.New_Class, h.Enrollment_Date
FROM STUDENT s JOIN HISTORY h ON s.Student_ID = h.Student_ID;


CREATE VIEW GuardianStudentView AS
SELECT g.Guardian_Name, s.Student_Name
FROM GUARDIAN g JOIN STUDENT s ON g.Guardian_ID = s.Guardian_ID;


CREATE OR ALTER PROCEDURE GetStudentDetails
    @Student_ID VARCHAR(255)
AS
BEGIN
    SELECT *
    FROM STUDENT
    WHERE Student_ID = @Student_ID;
END;

EXEC GetStudentDetails @Student_ID = 'S23';


CREATE OR ALTER PROCEDURE GetClassEnrollmentHistory
    @Student_ID VARCHAR(255)
AS
BEGIN
    SELECT *
    FROM HISTORY
    WHERE Student_ID = @Student_ID;
END;

EXEC GetClassEnrollmentHistory @Student_ID = 'S23';


CREATE PROCEDURE GetGuardianInfoByStudentID
    @student_id VARCHAR(255)
AS
BEGIN
    SELECT G.*
    FROM GUARDIAN G
    JOIN STUDENT S ON G.Guardian_ID = S.Guardian_ID
    WHERE S.Student_ID = @student_id;
END;

EXEC GetGuardianInfoByStudentID @Student_ID = 'S23';


CREATE TRIGGER trgAfterInsertStudent
ON STUDENT
AFTER INSERT
AS
BEGIN
    INSERT INTO HAS (Parent_ID, Student_ID)
    SELECT i.Parent_ID, i.Student_ID
    FROM inserted i;
END;


CREATE TRIGGER trgAfterUpdateStudentParent
ON STUDENT
AFTER UPDATE
AS
BEGIN
    IF UPDATE(Parent_ID)
    BEGIN
        UPDATE H
        SET H.Parent_ID = i.Parent_ID
        FROM HAS H
        JOIN inserted i ON H.Student_ID = i.Student_ID;
    END;
END;

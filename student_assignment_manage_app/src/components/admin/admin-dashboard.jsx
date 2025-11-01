"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import AdminHeader from "./admin-header";
import StudentManagement from "./student-management";
import DashboardCharts from "./dashboard-charts";
import CreateStudentForm from "./create-student-form";
import CreateAssignmentForm from "./create-assignment-form";
import AssignmentList from "./assignment-list";
import SubmissionTrackingTable from "./submission-tracking-table";
import EditAssignmentModal from "./edit-assignment-modal";
import AssignmentReviewTab from "./assignment-review-tab";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }

    const storedAssignments = localStorage.getItem("assignments");
    if (storedAssignments) {
      setAssignments(JSON.parse(storedAssignments));
    }

    const storedSubmissions = localStorage.getItem("assignmentSubmissions");
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }
  }, []);

  const handleAddStudent = (newStudent) => {
    const updatedStudents = [
      ...students,
      { ...newStudent, id: Date.now().toString() },
    ];
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setShowForm(false);
  };

  const handleDeleteStudent = (studentId) => {
    const updatedStudents = students.filter((s) => s.id !== studentId);
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
  };

  const handleCreateAssignment = (formData) => {
    const newAssignment = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      assignedTo: formData.assignedTo,
      createdAt: new Date().toISOString(),
      attachments: formData.attachments,
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

    // Create submission records for assigned students
    const newSubmissions = formData.assignedTo.map((studentId) => ({
      id: `${newAssignment.id}-${studentId}`,
      assignmentId: newAssignment.id,
      studentId,
      submitted: false,
    }));

    const updatedSubmissions = [...submissions, ...newSubmissions];
    setSubmissions(updatedSubmissions);
    localStorage.setItem(
      "assignmentSubmissions",
      JSON.stringify(updatedSubmissions)
    );

    setShowAssignmentForm(false);
  };

  const handleDeleteAssignment = (assignmentId) => {
    const updatedAssignments = assignments.filter((a) => a.id !== assignmentId);
    setAssignments(updatedAssignments);
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

    const updatedSubmissions = submissions.filter(
      (sub) => sub.assignmentId !== assignmentId
    );
    setSubmissions(updatedSubmissions);
    localStorage.setItem(
      "assignmentSubmissions",
      JSON.stringify(updatedSubmissions)
    );
  };

  const handleEditAssignment = (updatedAssignment) => {
    const updatedAssignments = assignments.map((a) =>
      a.id === updatedAssignment.id ? updatedAssignment : a
    );
    setAssignments(updatedAssignments);
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    setEditingAssignment(null);
  };

  const handleFeedbackSubmit = (submissionId, feedback, approved) => {
    const updatedSubmissions = submissions.map((sub) => {
      if (sub.id === submissionId) {
        const studentSubmission = sub;
        const student = students.find(
          (s) => s.id === studentSubmission.studentId
        );
        const assignment = assignments.find(
          (a) => a.id === studentSubmission.assignmentId
        );

        return {
          ...sub,
          feedback: {
            approved,
            message: feedback,
            feedbackDate: new Date().toISOString(),
          },
        };
      }
      return sub;
    });

    setSubmissions(updatedSubmissions);
    localStorage.setItem(
      "assignmentSubmissions",
      JSON.stringify(updatedSubmissions)
    );

    const submission = updatedSubmissions.find((s) => s.id === submissionId);
    if (submission) {
      const notifications = JSON.parse(
        localStorage.getItem("assignmentNotifications") || "[]"
      );
      const notificationType = approved ? "approved" : "rejected";
      const notificationTitle = approved
        ? "Assignment Approved"
        : "Assignment Needs Revision";
      const notificationMessage = approved
        ? `Your assignment has been approved with the following feedback: ${feedback}`
        : `Your assignment has been returned for revision. Feedback: ${feedback}`;

      const newNotification = {
        id: `notif-${Date.now()}`,
        studentId: submission.studentId,
        submissionId: submissionId,
        assignmentId: submission.assignmentId,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        createdAt: new Date().toISOString(),
        seen: false,
      };
      notifications.push(newNotification);
      localStorage.setItem(
        "assignmentNotifications",
        JSON.stringify(notifications)
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="review">Assignment Review</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
              <DashboardCharts students={students} />
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Assignment Management</h2>
              <Button
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                size="lg"
              >
                {showAssignmentForm ? "Cancel" : "Create Assignment"}
              </Button>
            </div>

            {showAssignmentForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Assignment</CardTitle>
                  <CardDescription>
                    Set assignment details and assign to students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateAssignmentForm
                    students={students}
                    onSubmit={handleCreateAssignment}
                  />
                </CardContent>
              </Card>
            )}

            <EditAssignmentModal
              isOpen={editingAssignment !== null}
              assignment={editingAssignment}
              students={students}
              onClose={() => setEditingAssignment(null)}
              onSave={handleEditAssignment}
            />

            <AssignmentList
              assignments={assignments}
              students={students}
              submissions={submissions}
              onDelete={handleDeleteAssignment}
              onEdit={setEditingAssignment}
            />
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <h2 className="text-3xl font-bold">Assignment Review & Approval</h2>
            <AssignmentReviewTab
              assignments={assignments}
              submissions={submissions}
              students={students}
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <h2 className="text-3xl font-bold">Submission Tracking</h2>
            <SubmissionTrackingTable
              assignments={assignments}
              submissions={submissions}
              students={students}
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Student Management</h2>
              <Button onClick={() => setShowForm(!showForm)} size="lg">
                {showForm ? "Cancel" : "Add Student"}
              </Button>
            </div>

            {showForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Student</CardTitle>
                  <CardDescription>
                    Fill in the student details below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateStudentForm onSubmit={handleAddStudent} />
                </CardContent>
              </Card>
            )}

            <StudentManagement
              students={students}
              onDelete={handleDeleteStudent}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

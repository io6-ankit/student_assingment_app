"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "../../context/auth-context";
// import { useRouter } from "next/navigation";
import AssignmentsView from "./assignments-view";
import NotificationPanel from "./notification-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";

export default function StudentDashboard() {
  const { currentUser, handleLogout } = useAuth();
  // const router = useRouter();
  const [studentData, setStudentData] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    // Check if current logged-in student has data created by admin
    const allStudents = localStorage.getItem("students");
    const storedSubmissions = localStorage.getItem("assignmentSubmissions");

    if (allStudents) {
      const students = JSON.parse(allStudents);
      const found = students.find((s) => s.email === currentUser?.email);
      if (found) {
        setStudentData(found);
      }
    }

    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }
  }, [currentUser]);

  const handleLogoutClick = () => {
    handleLogout();
    // router.refresh();
  };

  const handleSubmissionsUpdate = (updatedSubmissions) => {
    setSubmissions(updatedSubmissions);
  };

  const getStudentStats = () => {
    if (!studentData)
      return {
        submitted: 0,
        inProgress: 0,
        completed: 0,
        percentageGrade: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      };

    const studentSubmissions = submissions.filter(
      (sub) => sub.studentId === studentData.id
    );
    const submitted = studentSubmissions.filter((sub) => sub.submitted).length;
    const inProgress = studentSubmissions.filter(
      (sub) => !sub.submitted
    ).length;
    const approved = studentSubmissions.filter(
      (sub) => sub.feedback?.approved
    ).length;
    const rejected = studentSubmissions.filter(
      (sub) => sub.feedback && !sub.feedback.approved
    ).length;
    const pending = submitted - approved - rejected;
    const percentageGrade = studentData.gpa
      ? Math.round((studentData.gpa / 4.0) * 100)
      : 0;

    return {
      submitted,
      inProgress,
      completed: submitted,
      percentageGrade,
      approved,
      pending,
      rejected,
    };
  };

  const stats = getStudentStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Portal</h1>
            <p className="text-sm opacity-90">Welcome, {currentUser?.email}</p>
          </div>
          <Button onClick={handleLogoutClick} variant="secondary">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {studentData && <NotificationPanel studentId={studentData.id} />}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            {/* Student Profile - Only Their Data */}
            {studentData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    Your personal academic information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="text-lg font-semibold">
                        {studentData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-lg font-semibold">
                        {studentData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="text-lg font-semibold">{studentData.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GPA</p>
                      <p
                        className={`text-lg font-semibold ${
                          studentData.gpa >= 3.5
                            ? "text-green-600"
                            : studentData.gpa >= 3.0
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {studentData.gpa.toFixed(2)} / 4.0
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Enrollment Date
                      </p>
                      <p className="text-lg font-semibold">
                        {new Date(
                          studentData.enrollmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Percentage Grade
                      </p>
                      <p className="text-lg font-semibold">
                        {stats.percentageGrade}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    No profile data found. Your profile will appear here when an
                    admin creates it.
                  </p>
                </CardContent>
              </Card>
            )}

            {studentData && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Your Assignment Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Assignments Submitted
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">
                        {stats.submitted}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total submitted
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Approved
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.approved}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepted submissions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pending Approval
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">
                        {stats.pending}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Awaiting review
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        In Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">
                        {stats.inProgress}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Not yet submitted
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Overall Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Submitted</span>
                        <span className="font-semibold text-blue-600">
                          {stats.submitted}/{stats.submitted + stats.inProgress}
                        </span>
                      </div>
                      <Progress
                        value={
                          (stats.submitted /
                            (stats.submitted + stats.inProgress)) *
                            100 || 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Approved</span>
                        <span className="font-semibold text-green-600">
                          {stats.approved}/{stats.submitted}
                        </span>
                      </div>
                      <Progress
                        value={
                          (stats.approved / (stats.submitted || 1)) * 100 || 0
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {studentData ? (
              <AssignmentsView
                studentId={studentData.id}
                onUpdateSubmissions={handleSubmissionsUpdate}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Create a student profile first to see assignments.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

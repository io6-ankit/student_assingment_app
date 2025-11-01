"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardCharts({ students }) {
  // Calculate statistics
  const totalStudents = students.length;
  const averageGPA =
    students.length > 0
      ? (
          students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length
        ).toFixed(2)
      : "0";
  const averageAge =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + (s.age || 0), 0) / students.length
        )
      : 0;

  // Data for GPA distribution chart
  const gpaDistribution = [
    { range: "3.5-4.0", count: students.filter((s) => s.gpa >= 3.5).length },
    {
      range: "3.0-3.5",
      count: students.filter((s) => s.gpa >= 3.0 && s.gpa < 3.5).length,
    },
    {
      range: "2.5-3.0",
      count: students.filter((s) => s.gpa >= 2.5 && s.gpa < 3.0).length,
    },
    { range: "Below 2.5", count: students.filter((s) => s.gpa < 2.5).length },
  ];

  // Data for age distribution
  const ageDistribution = [
    {
      age: "18-20",
      count: students.filter((s) => s.age >= 18 && s.age <= 20).length,
    },
    {
      age: "21-23",
      count: students.filter((s) => s.age >= 21 && s.age <= 23).length,
    },
    {
      age: "24-26",
      count: students.filter((s) => s.age >= 24 && s.age <= 26).length,
    },
    { age: "27+", count: students.filter((s) => s.age > 26).length },
  ];

  // Monthly enrollment data
  const enrollmentData = [
    { month: "Jan", enrolled: Math.floor(students.length * 0.1) },
    { month: "Feb", enrolled: Math.floor(students.length * 0.15) },
    { month: "Mar", enrolled: Math.floor(students.length * 0.2) },
    { month: "Apr", enrolled: Math.floor(students.length * 0.25) },
    { month: "May", enrolled: Math.floor(students.length * 0.3) },
    { month: "Jun", enrolled: students.length },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground mt-1">Active students</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{averageGPA}</div>
          <p className="text-xs text-muted-foreground mt-1">Out of 4.0</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Average Age</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{averageAge}</div>
          <p className="text-xs text-muted-foreground mt-1">Years</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalStudents > 0 ? "100%" : "0%"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Current</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>GPA Distribution</CardTitle>
          <CardDescription>Student distribution by GPA ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={gpaDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, count }) => `${name}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>Student distribution by age ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Enrollment Trend</CardTitle>
          <CardDescription>Monthly enrollment progression</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="enrolled"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

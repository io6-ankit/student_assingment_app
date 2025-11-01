"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { AlertCircle, Trash2 } from "lucide-react";

export default function StudentManagement({ students, onDelete }) {
  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle
              className="mx-auto mb-4 text-muted-foreground"
              size={48}
            />
            <p className="text-muted-foreground">
              No students added yet. Create your first student to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student List</CardTitle>
        <CardDescription>{students.length} students registered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Age</th>
                <th className="text-left py-3 px-4 font-semibold">GPA</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Enrollment Date
                </th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.email}</td>
                  <td className="py-3 px-4">{student.age}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.gpa >= 3.5
                          ? "bg-green-100 text-green-800"
                          : student.gpa >= 3.0
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(student.id)}
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

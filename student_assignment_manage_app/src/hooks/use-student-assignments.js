"use client";

import { useState, useCallback, useEffect } from "react";
import { assignmentStorage } from "../lib/assignment-storage";

export function useStudentAssignments(studentId) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allAssignments = assignmentStorage.getAssignments();
    const studentAssignments = allAssignments.filter((a) =>
      a.assignedTo.includes(studentId)
    );
    setAssignments(studentAssignments);

    const allSubmissions = assignmentStorage.getSubmissions();
    const studentSubmissions = allSubmissions.filter(
      (s) => s.studentId === studentId
    );
    setSubmissions(studentSubmissions);

    setIsLoading(false);
  }, [studentId]);

  const submitAssignment = useCallback(
    (assignmentId) => {
      const updated = assignmentStorage.markSubmitted(assignmentId, studentId);
      const studentSubmissions = updated.filter(
        (s) => s.studentId === studentId
      );
      setSubmissions(studentSubmissions);
    },
    [studentId]
  );

  const getSubmissionStatus = useCallback(
    (assignmentId) => {
      return submissions.find(
        (s) => s.assignmentId === assignmentId && s.studentId === studentId
      );
    },
    [submissions, studentId]
  );

  const getProgressStats = useCallback(() => {
    const submitted = submissions.filter((s) => s.submitted).length;
    const total = assignments.length;
    const percentage = total > 0 ? (submitted / total) * 100 : 0;

    const overdue = assignments.filter((a) => {
      const submission = submissions.find(
        (s) => s.assignmentId === a.id && s.studentId === studentId
      );
      return !submission?.submitted && new Date(a.dueDate) < new Date();
    }).length;

    return { submitted, total, percentage, overdue };
  }, [assignments, submissions, studentId]);

  return {
    assignments,
    submissions,
    isLoading,
    submitAssignment,
    getSubmissionStatus,
    getProgressStats,
  };
}

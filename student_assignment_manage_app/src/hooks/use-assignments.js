"use client";

import { useState, useCallback, useEffect } from "react";
import { assignmentStorage } from "../lib/assignment-storage";

export function useAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage
  useEffect(() => {
    setAssignments(assignmentStorage.getAssignments());
    setSubmissions(assignmentStorage.getSubmissions());
    setIsLoading(false);
  }, []);

  // Assignment operations
  const createAssignment = useCallback((assignment) => {
    const updated = assignmentStorage.addAssignment(assignment);
    setAssignments(updated);
    return assignment;
  }, []);

  const updateAssignment = useCallback((id, updates) => {
    const updated = assignmentStorage.updateAssignment(id, updates);
    setAssignments(updated);
  }, []);

  const deleteAssignment = useCallback(
    (id) => {
      const updated = assignmentStorage.deleteAssignment(id);
      setAssignments(updated);
      // Also remove related submissions
      const updatedSubmissions = submissions.filter(
        (s) => s.assignmentId !== id
      );
      assignmentStorage.saveSubmissions(updatedSubmissions);
      setSubmissions(updatedSubmissions);
    },
    [submissions]
  );

  const getStudentAssignments = useCallback(
    (studentId) => {
      return assignments.filter((a) => a.assignedTo.includes(studentId));
    },
    [assignments]
  );

  // Submission operations
  const markSubmitted = useCallback((assignmentId, studentId) => {
    const updated = assignmentStorage.markSubmitted(assignmentId, studentId);
    setSubmissions(updated);
  }, []);

  const getStudentSubmissions = useCallback(
    (studentId) => {
      return submissions.filter((s) => s.studentId === studentId);
    },
    [submissions]
  );

  const getAssignmentSubmissions = useCallback(
    (assignmentId) => {
      return submissions.filter((s) => s.assignmentId === assignmentId);
    },
    [submissions]
  );

  const getSubmissionStatus = useCallback(
    (assignmentId, studentId) => {
      return submissions.find(
        (s) => s.assignmentId === assignmentId && s.studentId === studentId
      );
    },
    [submissions]
  );

  return {
    assignments,
    submissions,
    isLoading,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getStudentAssignments,
    markSubmitted,
    getStudentSubmissions,
    getAssignmentSubmissions,
    getSubmissionStatus,
  };
}

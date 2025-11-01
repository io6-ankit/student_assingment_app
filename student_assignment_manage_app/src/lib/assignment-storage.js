const ASSIGNMENTS_KEY = "assignments";
const SUBMISSIONS_KEY = "assignmentSubmissions";

export const assignmentStorage = {
  // Assignments management
  getAssignments: () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ASSIGNMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveAssignments: (assignments) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  },

  addAssignment: (assignment) => {
    const assignments = assignmentStorage.getAssignments();
    const updated = [...assignments, assignment];
    assignmentStorage.saveAssignments(updated);
    return updated;
  },

  updateAssignment: (id, updates) => {
    const assignments = assignmentStorage.getAssignments();
    const updated = assignments.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    assignmentStorage.saveAssignments(updated);
    return updated;
  },

  deleteAssignment: (id) => {
    const assignments = assignmentStorage.getAssignments();
    const updated = assignments.filter((a) => a.id !== id);
    assignmentStorage.saveAssignments(updated);
    return updated;
  },

  getAssignmentsByStudent: (studentId) => {
    const assignments = assignmentStorage.getAssignments();
    return assignments.filter((a) => a.assignedTo.includes(studentId));
  },

  // Submissions management
  getSubmissions: () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(SUBMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveSubmissions: (submissions) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  },

  addSubmission: (submission) => {
    const submissions = assignmentStorage.getSubmissions();
    const updated = [...submissions, submission];
    assignmentStorage.saveSubmissions(updated);
    return updated;
  },

  updateSubmission: (id, updates) => {
    const submissions = assignmentStorage.getSubmissions();
    const updated = submissions.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    assignmentStorage.saveSubmissions(updated);
    return updated;
  },

  markSubmitted: (assignmentId, studentId) => {
    const submissions = assignmentStorage.getSubmissions();
    const updated = submissions.map((s) =>
      s.assignmentId === assignmentId && s.studentId === studentId
        ? { ...s, submitted: true, submittedAt: new Date().toISOString() }
        : s
    );
    assignmentStorage.saveSubmissions(updated);
    return updated;
  },

  getStudentSubmissions: (studentId) => {
    const submissions = assignmentStorage.getSubmissions();
    return submissions.filter((s) => s.studentId === studentId);
  },

  getAssignmentSubmissions: (assignmentId) => {
    const submissions = assignmentStorage.getSubmissions();
    return submissions.filter((s) => s.assignmentId === assignmentId);
  },

  getSubmissionStats: (assignmentId) => {
    const submissions =
      assignmentStorage.getAssignmentSubmissions(assignmentId);
    const submitted = submissions.filter((s) => s.submitted).length;
    const total = submissions.length;

    return {
      total,
      submitted,
      pending: total - submitted,
      percentage: total > 0 ? (submitted / total) * 100 : 0,
    };
  },

  // Data export for backup
  exportAllData: () => {
    return {
      assignments: assignmentStorage.getAssignments(),
      submissions: assignmentStorage.getSubmissions(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Data import for restore
  importData: (data) => {
    if (data.assignments) {
      assignmentStorage.saveAssignments(data.assignments);
    }
    if (data.submissions) {
      assignmentStorage.saveSubmissions(data.submissions);
    }
  },

  // Clear all assignment data
  clearAllData: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ASSIGNMENTS_KEY);
    localStorage.removeItem(SUBMISSIONS_KEY);
  },
};

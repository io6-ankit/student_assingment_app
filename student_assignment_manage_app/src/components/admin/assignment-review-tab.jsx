"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  LinkIcon,
  Filter,
} from "lucide-react";
import SubmissionReviewModal from "./submission-review-modal";

export default function AssignmentReviewTab({
  assignments,
  submissions,
  students,
  onFeedbackSubmit,
}) {
  const [filterStatus, setFilterStatus] = useState("pending");
  const [reviewingSubmission, setReviewingSubmission] = useState(null);

  const getSubmissionStats = (assignmentId) => {
    const assignmentSubmissions = submissions.filter(
      (sub) => sub.assignmentId === assignmentId
    );
    const submitted = assignmentSubmissions.filter(
      (sub) => sub.submitted
    ).length;
    const approved = assignmentSubmissions.filter(
      (sub) => sub.feedback?.approved
    ).length;
    const rejected = assignmentSubmissions.filter(
      (sub) => sub.feedback && !sub.feedback.approved
    ).length;
    const pending = submitted - approved - rejected;
    return {
      submitted,
      approved,
      rejected,
      pending,
      total: assignmentSubmissions.length,
    };
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  const handleFeedbackSubmit = (submissionId, feedback, approved) => {
    onFeedbackSubmit(submissionId, feedback, approved);
    setReviewingSubmission(null);
  };

  const pendingReviewSubmissions = submissions.filter(
    (sub) => sub.submitted && !sub.feedback
  );

  const filteredSubmissions = submissions.filter((sub) => {
    if (!sub.submitted) return false;
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return !sub.feedback;
    if (filterStatus === "approved") return sub.feedback?.approved;
    if (filterStatus === "rejected")
      return sub.feedback && !sub.feedback.approved;
    return false;
  });

  const stats = {
    total: submissions.filter((s) => s.submitted).length,
    pending: pendingReviewSubmissions.length,
    approved: submissions.filter((s) => s.feedback?.approved).length,
    rejected: submissions.filter((s) => s.feedback && !s.feedback.approved)
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Submissions received
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting feedback
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

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need revision</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Sort */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4" />
            Filter by Status
          </label>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No submissions to display.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => {
            const assignment = assignments.find(
              (a) => a.id === submission.assignmentId
            );
            const studentName = getStudentName(submission.studentId);

            if (!assignment) return null;

            return (
              <Card key={submission.id} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold">{assignment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {studentName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="w-fit flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          <Clock className="w-3 h-3" />
                          Submitted
                        </Badge>

                        {submission.feedback && (
                          <Badge
                            className={`w-fit flex items-center gap-1 ${
                              submission.feedback.approved
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}
                          >
                            {submission.feedback.approved ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Rejected
                              </>
                            )}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          Submitted:{" "}
                          {new Date(
                            submission.submittedAt || ""
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attachments Preview */}
                  {submission.attachments &&
                    submission.attachments.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-semibold mb-2">
                          Submitted Work ({submission.attachments.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {submission.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.type === "link" ? att.value : "#"}
                              onClick={(e) => {
                                if (att.type === "image") {
                                  e.preventDefault();
                                  window.open(att.value, "_blank");
                                }
                              }}
                              target={
                                att.type === "link" ? "_blank" : undefined
                              }
                              rel={
                                att.type === "link"
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded text-xs hover:underline"
                            >
                              {att.type === "image" ? (
                                <Upload className="w-3 h-3" />
                              ) : (
                                <LinkIcon className="w-3 h-3" />
                              )}
                              {att.name ||
                                (att.type === "link" ? "Link" : "File")}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Existing Feedback */}
                  {submission.feedback && (
                    <div
                      className={`border-t pt-3 p-2 rounded ${
                        submission.feedback.approved
                          ? "bg-green-50 dark:bg-green-950/30 border-green-200"
                          : "bg-orange-50 dark:bg-orange-950/30 border-orange-200"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">
                        {submission.feedback.approved
                          ? "✓ Approved"
                          : "✗ Rejected"}
                      </p>
                      <p className="text-xs">{submission.feedback.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(
                          submission.feedback.feedbackDate
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="border-t pt-3 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        setReviewingSubmission({
                          submission,
                          studentName,
                          assignmentTitle: assignment.title,
                        })
                      }
                    >
                      {submission.feedback
                        ? "Update Feedback"
                        : "Review & Provide Feedback"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {reviewingSubmission && (
        <SubmissionReviewModal
          submission={reviewingSubmission.submission}
          studentName={reviewingSubmission.studentName}
          assignmentTitle={reviewingSubmission.assignmentTitle}
          isOpen={true}
          onClose={() => setReviewingSubmission(null)}
          onSubmitFeedback={(feedback, approved) =>
            handleFeedbackSubmit(
              reviewingSubmission.submission.id,
              feedback,
              approved
            )
          }
        />
      )}
    </div>
  );
}

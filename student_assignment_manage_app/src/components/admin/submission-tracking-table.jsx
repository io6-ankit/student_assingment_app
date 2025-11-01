"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
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
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Upload,
  LinkIcon,
  AlertCircle,
} from "lucide-react";
import { Progress } from "../ui/progress";
import SubmissionReviewModal from "./submission-review-modal";

export default function SubmissionTrackingTable({
  assignments,
  submissions,
  students,
  onFeedbackSubmit,
}) {
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [reviewingSubmission, setReviewingSubmission] = useState(null);

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  const getAssignmentStats = (assignmentId) => {
    const assignmentSubmissions = submissions.filter(
      (sub) => sub.assignmentId === assignmentId
    );
    const submitted = assignmentSubmissions.filter(
      (sub) => sub.submitted
    ).length;
    const total = assignmentSubmissions.length;
    return {
      submitted,
      total,
      percentage: total > 0 ? (submitted / total) * 100 : 0,
    };
  };

  const getStudentSubmission = (assignmentId, studentId) => {
    return submissions.find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    );
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  const handleFeedbackSubmit = (submissionId, feedback, approved) => {
    onFeedbackSubmit(submissionId, feedback, approved);
    setReviewingSubmission(null);
  };

  const sortedAssignments = [...assignments];
  if (sortBy === "submissions") {
    sortedAssignments.sort((a, b) => {
      const statsA = getAssignmentStats(a.id);
      const statsB = getAssignmentStats(b.id);
      return statsB.percentage - statsA.percentage;
    });
  } else {
    sortedAssignments.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No assignments to track.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Filter by Status</label>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">Sort by</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="submissions">Submission Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {sortedAssignments.map((assignment) => {
          const stats = getAssignmentStats(assignment.id);
          const isExpanded = expandedAssignmentId === assignment.id;
          const isOverdueAssignment = isOverdue(assignment.dueDate);

          return (
            <Card key={assignment.id} className="overflow-hidden">
              <div
                className="cursor-pointer hover:bg-muted/50 p-4 flex items-center justify-between transition-colors"
                onClick={() =>
                  setExpandedAssignmentId(isExpanded ? null : assignment.id)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{assignment.title}</h4>
                    <Badge
                      variant={
                        isOverdueAssignment ? "destructive" : "secondary"
                      }
                    >
                      {isOverdueAssignment ? "Overdue" : "Active"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {stats.submitted}/{stats.total} submitted
                      </span>
                      <Progress
                        value={stats.percentage}
                        className="flex-1 h-2"
                      />
                      <span className="text-sm font-semibold text-muted-foreground">
                        {Math.round(stats.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/30 space-y-2 p-4">
                  <div className="space-y-2">
                    {submissions
                      .filter((sub) => sub.assignmentId === assignment.id)
                      .map((submission) => {
                        const statusFilter =
                          filterStatus === "all" ||
                          (filterStatus === "submitted" &&
                            submission.submitted) ||
                          (filterStatus === "pending" && !submission.submitted);

                        if (!statusFilter) return null;

                        const daysDifference = submission.submittedAt
                          ? Math.floor(
                              (new Date(submission.submittedAt).getTime() -
                                new Date(assignment.dueDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;

                        const isSubmissionExpanded =
                          expandedSubmissionId === submission.id;

                        return (
                          <div key={submission.id}>
                            <div
                              className="p-3 bg-background rounded border hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() =>
                                setExpandedSubmissionId(
                                  isSubmissionExpanded ? null : submission.id
                                )
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {getStudentName(submission.studentId)}
                                    </span>
                                    <Badge
                                      variant={
                                        submission.submitted
                                          ? "default"
                                          : "outline"
                                      }
                                      className="flex w-fit items-center gap-1"
                                    >
                                      {submission.submitted ? (
                                        <>
                                          <CheckCircle className="w-3 h-3" />
                                          Submitted
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3" />
                                          Pending
                                        </>
                                      )}
                                    </Badge>
                                    {submission.feedback && (
                                      <Badge
                                        variant="outline"
                                        className={`flex w-fit items-center gap-1 ${
                                          submission.feedback.approved
                                            ? "text-green-600 border-green-300"
                                            : "text-orange-600 border-orange-300"
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
                                            Needs Revision
                                          </>
                                        )}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {submission.submittedAt
                                      ? `Submitted: ${new Date(
                                          submission.submittedAt
                                        ).toLocaleDateString()}`
                                      : "Not submitted"}
                                  </div>
                                  {daysDifference !== null && (
                                    <div
                                      className={`text-xs font-semibold mt-1 ${
                                        daysDifference <= 0
                                          ? "text-green-600"
                                          : "text-orange-600"
                                      }`}
                                    >
                                      {daysDifference <= 0
                                        ? `${Math.abs(
                                            daysDifference
                                          )} days early`
                                        : `${daysDifference} days late`}
                                    </div>
                                  )}
                                </div>
                                {submission.attachments &&
                                  submission.attachments.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ChevronDown
                                        className={`w-4 h-4 transition-transform ${
                                          isSubmissionExpanded
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      />
                                    </Button>
                                  )}
                              </div>
                            </div>

                            {isSubmissionExpanded &&
                              submission.attachments &&
                              submission.attachments.length > 0 && (
                                <div className="mt-2 ml-4 p-4 bg-background rounded border border-dashed space-y-3">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground mb-2">
                                      Student's Submitted Work:
                                    </p>
                                    <div className="space-y-2">
                                      {submission.attachments.map(
                                        (att, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200"
                                          >
                                            <a
                                              href={
                                                att.type === "link"
                                                  ? att.value
                                                  : "#"
                                              }
                                              onClick={(e) => {
                                                if (att.type === "image") {
                                                  e.preventDefault();
                                                  window.open(
                                                    att.value,
                                                    "_blank"
                                                  );
                                                }
                                              }}
                                              target={
                                                att.type === "link"
                                                  ? "_blank"
                                                  : undefined
                                              }
                                              rel={
                                                att.type === "link"
                                                  ? "noopener noreferrer"
                                                  : undefined
                                              }
                                              className="flex items-center gap-3 text-sm text-blue-600 hover:underline flex-1"
                                            >
                                              {att.type === "image" ? (
                                                <Upload className="w-4 h-4 flex-shrink-0" />
                                              ) : (
                                                <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                              )}
                                              <span className="truncate">
                                                {att.name ||
                                                  att.value.substring(0, 40)}
                                              </span>
                                            </a>
                                            <Badge
                                              variant="outline"
                                              className="text-xs ml-2"
                                            >
                                              {att.type === "image"
                                                ? "Image"
                                                : "Link"}
                                            </Badge>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReviewingSubmission({
                                        submission,
                                        studentName: getStudentName(
                                          submission.studentId
                                        ),
                                        assignmentTitle: assignment.title,
                                      });
                                    }}
                                    className="w-full"
                                  >
                                    {submission.feedback
                                      ? "Update Feedback"
                                      : "Add Feedback"}
                                  </Button>
                                </div>
                              )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

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

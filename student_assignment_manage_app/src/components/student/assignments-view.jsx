"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  LinkIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import SubmissionConfirmationModal from "./submission-confirmation-modal";

export default function AssignmentsView({ studentId, onUpdateSubmissions }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [linkInput, setLinkInput] = useState("");

  useEffect(() => {
    const storedAssignments = localStorage.getItem("assignments");
    const storedSubmissions = localStorage.getItem("assignmentSubmissions");

    if (storedAssignments) {
      const allAssignments = JSON.parse(storedAssignments);
      const studentAssignments = allAssignments.filter((a) =>
        a.assignedTo.includes(studentId)
      );
      setAssignments(studentAssignments);
    }

    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }
  }, [studentId]);

  useEffect(() => {
    if (onUpdateSubmissions) {
      onUpdateSubmissions(submissions);
    }
  }, [submissions, onUpdateSubmissions]);

  const getSubmissionStatus = (assignmentId) => {
    return submissions.find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    );
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadingAttachments((prev) => [
              ...prev,
              {
                type: "image",
                value: event.target.result,
                name: file.name,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      setUploadingAttachments((prev) => [
        ...prev,
        {
          type: "link",
          value: linkInput.trim(),
          name: linkInput.trim(),
        },
      ]);
      setLinkInput("");
    }
  };

  const removeAttachment = (index) => {
    setUploadingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmission = () => {
    if (!selectedAssignmentId) return;

    const existingSubmission = submissions.find(
      (sub) =>
        sub.assignmentId === selectedAssignmentId && sub.studentId === studentId
    );

    const newSubmission = {
      id: existingSubmission?.id || `submission-${Date.now()}`,
      assignmentId: selectedAssignmentId,
      studentId,
      submitted: true,
      submittedAt: new Date().toISOString(),
      attachments:
        uploadingAttachments.length > 0 ? uploadingAttachments : undefined,
      resubmitted:
        existingSubmission?.feedback?.approved === false ? true : false,
      resubmittedAt:
        existingSubmission?.feedback?.approved === false
          ? new Date().toISOString()
          : undefined,
      feedback: existingSubmission?.feedback,
    };

    let updatedSubmissions;
    if (existingSubmission) {
      updatedSubmissions = submissions.map((sub) =>
        sub.id === existingSubmission.id ? newSubmission : sub
      );
    } else {
      updatedSubmissions = [...submissions, newSubmission];
    }

    setSubmissions(updatedSubmissions);
    localStorage.setItem(
      "assignmentSubmissions",
      JSON.stringify(updatedSubmissions)
    );
    setConfirmModalOpen(false);
    setSelectedAssignmentId(null);
    setUploadingAttachments([]);
    setLinkInput("");
  };

  const submittedCount = submissions.filter(
    (sub) => sub.studentId === studentId && sub.submitted
  ).length;
  const totalCount = assignments.length;
  const progressPercentage =
    totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

  const pendingAssignments = assignments.filter((a) => {
    const submission = getSubmissionStatus(a.id);
    return !submission?.submitted;
  });

  const completedAssignments = assignments.filter((a) => {
    const submission = getSubmissionStatus(a.id);
    return submission?.submitted;
  });

  const approvedAssignments = completedAssignments.filter((a) => {
    const submission = getSubmissionStatus(a.id);
    return submission?.feedback?.approved;
  });

  const rejectedAssignments = completedAssignments.filter((a) => {
    const submission = getSubmissionStatus(a.id);
    return submission?.feedback && !submission.feedback.approved;
  });

  const pendingApprovalAssignments = completedAssignments.filter((a) => {
    const submission = getSubmissionStatus(a.id);
    return submission?.submitted && !submission?.feedback;
  });

  const overdueAssignments = pendingAssignments.filter((a) =>
    isOverdue(a.dueDate)
  );
  const needsRevisionAssignments = rejectedAssignments;

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No assignments assigned to you yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {Math.round(progressPercentage)}%
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {submittedCount} of {totalCount} submitted
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {approvedAssignments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted submissions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                {pendingApprovalAssignments.length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                {pendingAssignments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {overdueAssignments.length > 0 && (
                  <span className="text-destructive font-semibold">
                    {overdueAssignments.length} overdue
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Revision Alert */}
      {needsRevisionAssignments.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-base">
                Assignments Need Revision
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsRevisionAssignments.map((assignment) => {
                const submission = getSubmissionStatus(assignment.id);
                return (
                  <div
                    key={assignment.id}
                    className="p-3 bg-background rounded border border-orange-200"
                  >
                    <p className="font-semibold text-sm mb-2">
                      {assignment.title}
                    </p>
                    {submission?.feedback && (
                      <p className="text-sm text-foreground mb-3 italic">
                        "{submission.feedback.message}"
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(assignment.id)}
                      className="w-full"
                    >
                      Resubmit Assignment
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Alerts */}
      {overdueAssignments.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-base">Overdue Assignments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{assignment.title}</span>
                  <span className="text-destructive font-semibold">
                    Due{" "}
                    {Math.floor(
                      (Date.now() - new Date(assignment.dueDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Pending Assignments ({pendingAssignments.length})
          </h3>
          {pendingAssignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate);

            return (
              <Card key={assignment.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {assignment.title}
                        </CardTitle>
                        <Badge variant={overdue ? "destructive" : "secondary"}>
                          {overdue ? "Overdue" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {assignment.description}
                    </p>
                  </div>

                  {assignment.attachments &&
                    assignment.attachments.length > 0 && (
                      <div className="bg-muted p-3 rounded space-y-2">
                        <p className="text-sm font-semibold">
                          Assignment Resources:
                        </p>
                        <div className="space-y-1">
                          {assignment.attachments.map((att, idx) => (
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
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              {att.type === "image" ? (
                                <Upload className="w-4 h-4" />
                              ) : (
                                <LinkIcon className="w-4 h-4" />
                              )}
                              {att.name || att.value.substring(0, 30)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-semibold">Your Submission</p>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground px-3 py-2 rounded text-sm w-fit hover:bg-primary/90 transition">
                        <Upload className="w-4 h-4" />
                        Upload Files
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </Label>

                      <div className="flex gap-2">
                        <Input
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          placeholder="Paste link (GitHub, Drive, etc)..."
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddLink())
                          }
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleAddLink}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 bg-transparent"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {uploadingAttachments.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded space-y-1">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                          Ready to submit:
                        </p>
                        {uploadingAttachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-background p-1 rounded text-xs"
                          >
                            <div className="flex items-center gap-1">
                              {att.type === "image" ? (
                                <Upload className="w-3 h-3" />
                              ) : (
                                <LinkIcon className="w-3 h-3" />
                              )}
                              <span className="truncate">{att.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="p-0.5 hover:bg-muted rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => handleSubmit(assignment.id)}
                      size="sm"
                      variant={overdue ? "destructive" : "default"}
                      className="w-full"
                      // disabled={uploadingAttachments.length === 0}
                    >
                      Submit Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Assignments Section */}
      {completedAssignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Completed Assignments ({completedAssignments.length})
          </h3>

          {approvedAssignments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-green-600">
                Approved ({approvedAssignments.length})
              </h4>
              {approvedAssignments.map((assignment) => {
                const submission = getSubmissionStatus(assignment.id);

                return (
                  <Card
                    key={assignment.id}
                    className="overflow-hidden bg-green-50 dark:bg-green-950/20 border-green-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {assignment.title}
                            </CardTitle>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Submitted on{" "}
                          {new Date(
                            submission?.submittedAt || ""
                          ).toLocaleDateString()}
                        </span>
                        {submission &&
                        submission.submittedAt &&
                        new Date(submission.submittedAt) <=
                          new Date(assignment.dueDate) ? (
                          <Badge variant="outline" className="text-green-600">
                            On Time
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">
                            Late
                          </Badge>
                        )}
                      </div>

                      {submission?.feedback && (
                        <div className="p-3 rounded border-2 border-green-200 bg-white dark:bg-background">
                          <p className="text-sm font-semibold mb-2 text-green-700 dark:text-green-400">
                            Admin Feedback:
                          </p>
                          <p className="text-sm">
                            {submission.feedback.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(
                              submission.feedback.feedbackDate
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {submission?.attachments &&
                        submission.attachments.length > 0 && (
                          <div className="bg-muted p-3 rounded space-y-2">
                            <p className="text-sm font-semibold">
                              Your Submission:
                            </p>
                            <div className="space-y-1">
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
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                  {att.type === "image" ? (
                                    <Upload className="w-4 h-4" />
                                  ) : (
                                    <LinkIcon className="w-4 h-4" />
                                  )}
                                  {att.name || att.value.substring(0, 30)}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {pendingApprovalAssignments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-orange-600">
                Pending Approval ({pendingApprovalAssignments.length})
              </h4>
              {pendingApprovalAssignments.map((assignment) => {
                const submission = getSubmissionStatus(assignment.id);

                return (
                  <Card
                    key={assignment.id}
                    className="overflow-hidden bg-orange-50 dark:bg-orange-950/20 border-orange-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {assignment.title}
                            </CardTitle>
                            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                              <Clock className="w-3 h-3 mr-1" />
                              Awaiting Review
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Submitted on{" "}
                          {new Date(
                            submission?.submittedAt || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {submission?.attachments &&
                        submission.attachments.length > 0 && (
                          <div className="bg-muted p-3 rounded space-y-2">
                            <p className="text-sm font-semibold">
                              Your Submission:
                            </p>
                            <div className="space-y-1">
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
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                  {att.type === "image" ? (
                                    <Upload className="w-4 h-4" />
                                  ) : (
                                    <LinkIcon className="w-4 h-4" />
                                  )}
                                  {att.name || att.value.substring(0, 30)}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submission Confirmation Modal */}
      <SubmissionConfirmationModal
        assignmentTitle={
          assignments.find((a) => a.id === selectedAssignmentId)?.title ||
          "Assignment"
        }
        isOpen={confirmModalOpen}
        onConfirm={handleConfirmSubmission}
        onCancel={() => {
          setConfirmModalOpen(false);
          setSelectedAssignmentId(null);
        }}
        hasAttachments={uploadingAttachments.length > 0}
      />
    </div>
  );
}

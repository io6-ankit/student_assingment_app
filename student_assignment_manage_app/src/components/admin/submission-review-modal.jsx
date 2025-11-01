"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Upload, LinkIcon, X, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SubmissionReviewModal({
  submission,
  studentName,
  assignmentTitle,
  isOpen,
  onClose,
  onSubmitFeedback,
}) {
  const [feedback, setFeedback] = useState("");
  const [approved, setApproved] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = (isApproved) => {
    if (!feedback.trim()) {
      alert("Please enter feedback");
      return;
    }
    onSubmitFeedback(feedback, isApproved);
    setFeedback("");
    setApproved(false);
  };

  const handleBackdropClick = () => {
    setFeedback("");
    setApproved(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review Submission</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {studentName} - {assignmentTitle}
              </p>
            </div>
            <button
              onClick={handleBackdropClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Submitted Attachments */}
          {submission.attachments && submission.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Student Submission Attachments
              </h3>
              <div className="space-y-2 bg-muted p-4 rounded-lg">
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
                    target={att.type === "link" ? "_blank" : undefined}
                    rel={
                      att.type === "link" ? "noopener noreferrer" : undefined
                    }
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline p-2 bg-background rounded hover:bg-muted transition-colors"
                  >
                    {att.type === "image" ? (
                      <Upload className="w-4 h-4" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    <span className="truncate">
                      {att.name || att.value.substring(0, 50)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Existing Feedback */}
          {submission.feedback && (
            <div
              className={`p-4 rounded-lg border-2 ${
                submission.feedback.approved
                  ? "border-green-200 bg-green-50 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:bg-red-950/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {submission.feedback.approved ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">
                    {submission.feedback.approved
                      ? "Approved"
                      : "Rejected - Needs Revision"}
                  </p>
                  <p className="text-sm mb-2">{submission.feedback.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      submission.feedback.feedbackDate
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          <div className="space-y-3">
            <h3 className="font-semibold">Provide Feedback</h3>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback for the student. If not approved, they will need to resubmit."
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleSubmit(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!feedback.trim()}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Assignment
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              variant="destructive"
              className="flex-1"
              disabled={!feedback.trim()}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Reject & Request Changes
            </Button>
            <Button onClick={handleBackdropClick} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

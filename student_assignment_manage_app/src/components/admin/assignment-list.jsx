"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Upload,
  LinkIcon,
} from "lucide-react";

export default function AssignmentList({
  assignments,
  students,
  submissions,
  onDelete,
  onEdit,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const getSubmissionStats = (assignmentId, assignedStudentIds) => {
    const assignmentSubmissions = submissions.filter(
      (sub) => sub.assignmentId === assignmentId
    );
    const submitted = assignmentSubmissions.filter(
      (sub) => sub.submitted
    ).length;
    const total = assignedStudentIds.length;
    return { submitted, total };
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No assignments created yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const stats = getSubmissionStats(assignment.id, assignment.assignedTo);
        const isExpanded = expandedId === assignment.id;
        const assignedStudentNames = students
          .filter((s) => assignment.assignedTo.includes(s.id))
          .map((s) => s.name);

        return (
          <Card key={assignment.id} className="overflow-hidden">
            <div
              className="cursor-pointer hover:bg-muted/50 p-6 flex items-center justify-between"
              onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{assignment.title}</h3>
                  <Badge
                    variant={
                      isOverdue(assignment.dueDate)
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {isOverdue(assignment.dueDate) ? "Overdue" : "Active"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  <span>Assigned: {assignedStudentNames.length} students</span>
                  <span className="font-semibold text-foreground">
                    Submitted: {stats.submitted}/{stats.total}
                  </span>
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
              <>
                <div className="border-t px-6 py-4 bg-muted/30">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>

                {assignment.attachments &&
                  assignment.attachments.length > 0 && (
                    <div className="border-t px-6 py-4 bg-blue-50 dark:bg-blue-950/20">
                      <h4 className="font-semibold mb-3">
                        Assignment Resources
                      </h4>
                      <div className="space-y-2">
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
                            target={att.type === "link" ? "_blank" : undefined}
                            rel={
                              att.type === "link"
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline p-2 bg-background rounded hover:bg-muted transition"
                          >
                            {att.type === "image" ? (
                              <Upload className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <LinkIcon className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="truncate">
                              {att.name || att.value.substring(0, 50)}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="border-t px-6 py-4">
                  <h4 className="font-semibold mb-4">
                    Student Submission Status
                  </h4>
                  <div className="space-y-3">
                    {students
                      .filter((s) => assignment.assignedTo.includes(s.id))
                      .map((student) => {
                        const submission = submissions.find(
                          (sub) =>
                            sub.assignmentId === assignment.id &&
                            sub.studentId === student.id
                        );
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {student.email}
                              </p>
                            </div>
                            <Badge
                              variant={
                                submission?.submitted ? "default" : "outline"
                              }
                            >
                              {submission?.submitted
                                ? `Submitted - ${new Date(
                                    submission.submittedAt
                                  ).toLocaleDateString()}`
                                : "Pending"}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="border-t px-6 py-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(assignment)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(assignment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}

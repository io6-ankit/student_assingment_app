"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Upload, LinkIcon } from "lucide-react";

export default function CreateAssignmentForm({ students, onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [linkInput, setLinkInput] = useState("");

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachments((prev) => [
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
      setAttachments((prev) => [
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
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    if (selectedStudents.length === 0)
      newErrors.students = "Select at least one student";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title,
      description,
      dueDate,
      assignedTo: selectedStudents,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setSelectedStudents([]);
    setErrors({});
    setAttachments([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Assignment Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Mathematics Chapter 5 Problems"
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-destructive text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter assignment details and instructions"
          rows={4}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-destructive text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date *</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={errors.dueDate ? "border-destructive" : ""}
        />
        {errors.dueDate && (
          <p className="text-destructive text-sm mt-1">{errors.dueDate}</p>
        )}
      </div>

      <Card className="bg-muted/30 border border-dashed">
        <CardHeader>
          <CardTitle className="text-base">
            Attach Resources (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-lg w-fit hover:bg-primary/90 transition">
              <Upload className="w-4 h-4" />
              Upload Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Label>
          </div>

          <div className="flex gap-2">
            <Input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Paste link or URL..."
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddLink())
              }
            />
            <Button
              type="button"
              onClick={handleAddLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <LinkIcon className="w-4 h-4" />
              Add Link
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-semibold">Attached Resources:</p>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-background p-2 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      {attachment.type === "image" ? (
                        <Upload className="w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm truncate">
                        {attachment.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Label className="mb-4 block">Assign to Students *</Label>
        {errors.students && (
          <p className="text-destructive text-sm mb-2">{errors.students}</p>
        )}
        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => handleStudentToggle(student.id)}
                />
                <Label
                  htmlFor={`student-${student.id}`}
                  className="cursor-pointer font-normal"
                >
                  {student.name} ({student.email})
                </Label>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">
              No students available. Create students first.
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Create Assignment
      </Button>
    </form>
  );
}

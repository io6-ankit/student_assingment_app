"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AlertCircle } from "lucide-react";

export default function SubmissionConfirmationModal({
  assignmentTitle,
  isOpen,
  onConfirm,
  onCancel,
  hasAttachments,
}) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <CardTitle>Confirm Submission</CardTitle>
          </div>
          <CardDescription>
            {step === 1 ? "Initial confirmation" : "Final submission"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-semibold">{assignmentTitle}</p>
            {hasAttachments && (
              <p className="text-xs text-muted-foreground mt-1">
                With attachments
              </p>
            )}
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to submit this assignment? You can still
                edit it after submission if needed.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button onClick={() => setStep(2)} className="flex-1">
                  Yes, I have submitted
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-green-600">
                Ready for final submission?
              </p>
              <p className="text-sm">
                This will mark your assignment as officially submitted. Confirm
                to proceed.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    onConfirm();
                    setStep(1);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Final Submission
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

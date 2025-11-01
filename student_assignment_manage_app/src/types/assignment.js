export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  assignedTo: string[] // Student IDs
  createdAt: string
  attachments?: {
    type: "image" | "link"
    value: string // base64 for images, URL for links
    name?: string
  }[]
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  submitted: boolean
  submittedAt?: string
  attachments?: {
    type: "image" | "link"
    value: string // base64 for images, URL for links
    name?: string
  }[]
  feedback?: {
    approved: boolean
    message: string
    feedbackDate: string
  }
  resubmitted?: boolean
  resubmittedAt?: string
  notificationSeen?: boolean
}

export interface AssignmentNotification {
  id: string
  studentId: string
  submissionId: string
  assignmentId: string
  title: string
  message: string
  type: "approved" | "revision_requested" | "rejected"
  createdAt: string
  seen: boolean
}

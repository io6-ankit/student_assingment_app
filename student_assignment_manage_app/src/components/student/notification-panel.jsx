"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle, AlertCircle, X, Bell } from "lucide-react";

export default function NotificationPanel({ studentId }) {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [studentId]);

  const loadNotifications = () => {
    const stored = localStorage.getItem("assignmentNotifications");
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const studentNotifications = allNotifications.filter(
        (n) => n.studentId === studentId
      );
      setNotifications(studentNotifications);
    }
  };

  const handleMarkAsSeen = (notificationId) => {
    const stored = localStorage.getItem("assignmentNotifications");
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const updated = allNotifications.map((n) =>
        n.id === notificationId ? { ...n, seen: true } : n
      );
      localStorage.setItem("assignmentNotifications", JSON.stringify(updated));
      loadNotifications();
    }
  };

  const handleDismiss = (notificationId) => {
    const stored = localStorage.getItem("assignmentNotifications");
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const filtered = allNotifications.filter((n) => n.id !== notificationId);
      localStorage.setItem("assignmentNotifications", JSON.stringify(filtered));
      loadNotifications();
    }
  };

  const unseenCount = notifications.filter((n) => !n.seen).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Notifications</CardTitle>
            {unseenCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unseenCount} new
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded border-2 ${
              notification.type === "approved"
                ? "border-green-200 bg-green-50 dark:bg-green-950/30"
                : "border-red-200 bg-red-50 dark:bg-red-950/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                {notification.type === "approved" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm ${
                      notification.type === "approved"
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="p-1 hover:bg-white/50 rounded flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {!notification.seen && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 text-xs bg-transparent"
                onClick={() => handleMarkAsSeen(notification.id)}
              >
                Mark as Seen
              </Button>
            )}
          </div>
        ))}
        {notifications.length > 3 && !showAll && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs bg-transparent"
            onClick={() => setShowAll(true)}
          >
            Show {notifications.length - 3} more notifications
          </Button>
        )}
        {showAll && notifications.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs bg-transparent"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

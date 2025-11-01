export function useNotifications(studentId) {
  const getNotifications = (filterStudentId) => {
    const stored = localStorage.getItem("assignmentNotifications");
    if (!stored) return [];
    const notifications = JSON.parse(stored);
    return filterStudentId
      ? notifications.filter((n) => n.studentId === filterStudentId)
      : notifications;
  };

  const addNotification = (notification) => {
    const notifications = getNotifications();
    notifications.push({
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      seen: false,
    });
    localStorage.setItem(
      "assignmentNotifications",
      JSON.stringify(notifications)
    );
  };

  const markAsSeen = (notificationId) => {
    const notifications = getNotifications();
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, seen: true } : n
    );
    localStorage.setItem("assignmentNotifications", JSON.stringify(updated));
  };

  const getUnseenCount = (filterStudentId) => {
    const notifications = getNotifications(filterStudentId);
    return notifications.filter((n) => !n.seen).length;
  };

  return { getNotifications, addNotification, markAsSeen, getUnseenCount };
}

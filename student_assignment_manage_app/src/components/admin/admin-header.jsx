"use client";

import { useAuth } from "../../context/auth-context";
import { Button } from "../ui/button";
// import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const { currentUser, handleLogout } = useAuth();
  // const router = useRouter();

  const handleLogoutClick = () => {
    handleLogout();
    // router.refresh();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm opacity-90">Welcome, {currentUser?.email}</p>
        </div>
        <Button onClick={handleLogoutClick} variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
}

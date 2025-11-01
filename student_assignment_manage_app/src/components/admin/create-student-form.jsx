"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function CreateStudentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gpa: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.age) newErrors.age = "Age is required";
    else if (
      Number.parseInt(formData.age) < 15 ||
      Number.parseInt(formData.age) > 65
    )
      newErrors.age = "Age must be between 15 and 65";

    if (!formData.gpa) newErrors.gpa = "GPA is required";
    else if (
      Number.parseFloat(formData.gpa) < 0 ||
      Number.parseFloat(formData.gpa) > 4
    )
      newErrors.gpa = "GPA must be between 0 and 4";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        age: Number.parseInt(formData.age),
        gpa: Number.parseFloat(formData.gpa),
      });
      setFormData({
        name: "",
        email: "",
        age: "",
        gpa: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="20"
          />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            name="gpa"
            type="number"
            step="0.01"
            value={formData.gpa}
            onChange={handleChange}
            placeholder="3.5"
          />
          {errors.gpa && <p className="text-red-500 text-sm">{errors.gpa}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="enrollmentDate">Enrollment Date</Label>
          <Input
            id="enrollmentDate"
            name="enrollmentDate"
            type="date"
            value={formData.enrollmentDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Create Student
        </Button>
      </div>
    </form>
  );
}

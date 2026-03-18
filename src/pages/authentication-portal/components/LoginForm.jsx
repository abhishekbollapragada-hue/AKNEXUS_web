import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { Checkbox } from "../../../components/ui/Checkbox";
import Icon from "../../../components/AppIcon";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../../firebase/firebase";

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      rememberMe: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // ✅ Set persistence
      const persistence = formData.rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistence);

      // ✅ Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);

      // 🔥 THIS IS THE KEY FIX (ACTIVE STATUS)
      await setDoc(
        userRef,
        {
          email: user.email,
          active: true, // ✅ CONNECTS TO MENTOR TEAM STATUS
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );

      // ✅ Read role & redirect
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "mentor") {
          navigate("/mentor/dashboard");
        } else {
          navigate("/employee-self-service-portal");
        }
      } else {
        navigate("/employee-self-service-portal");
      }
    } catch (error) {
      console.error("Login error:", error);

      setLoginAttempts((prev) => prev + 1);
      setErrors({
        submit:
          "Invalid credentials. Please check your email and password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyPress={handleKeyPress}
      className="space-y-4 md:space-y-5 lg:space-y-6"
    >
      <Input
        type="email"
        name="email"
        label="Email Address"
        placeholder="Enter your work email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        required
        disabled={isLoading}
      />

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px]"
        >
          <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
        </button>
      </div>

      {errors.submit && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors.submit}</p>
        </div>
      )}

      {loginAttempts >= 3 && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning">
            Multiple failed attempts detected.
          </p>
        </div>
      )}

      <Checkbox
        label="Remember me"
        checked={formData.rememberMe}
        onChange={handleCheckboxChange}
        disabled={isLoading}
      />

      <Button
        type="submit"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        iconName="LogIn"
        iconPosition="right"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};

export default LoginForm;

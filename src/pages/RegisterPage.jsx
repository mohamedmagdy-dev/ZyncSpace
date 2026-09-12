import AppLogo from "../components/AppLogo";

import FormInputs, { Button, AuthWith } from "../components/FormInputs";

import useAuthStore from "../store/useAuthStore";

// Lib
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register: createAccount,
    loading,
    error: authError,
    clearError,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await createAccount(data.username, data.email, data.password);
    if (res.success) {
      navigate("/chat");
    }
  };

  useEffect(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="register-page flex items-center justify-center flex-col min-h-screen py-8 gap-5 bg-background p-3">
      <AppLogo />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-md bg-white p-6 md:w-xl"
      >
        <h1 className="text-title text-xl font-semibold mb-4">
          Create Account
        </h1>

        <div className="flex flex-col md:flex-row gap-0 md:gap-6">
          <FormInputs
            id="username"
            placeholder="yourname"
            type="text"
            label="Username"
            registration={register("username", {
              required: "Username Is Required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
            })}
            error={errors.username}
          />
          <FormInputs
            id="email"
            placeholder="youremail@example.com"
            type="email"
            label="Email Address"
            registration={register("email", {
              required: "Email Is Required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
            error={errors.email}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-0 md:gap-6">
          <FormInputs
            id="password"
            placeholder="password"
            type="password"
            label="Password"
            registration={register("password", {
              required: "Password Is Required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={errors.password}
          />
          <FormInputs
            id="passwordRepeat"
            placeholder="password again"
            type="password"
            label="Password Repeat"
            registration={register("passwordRepeat", {
              required: "Password Is Required",
              validate: (val) =>
                val === watch("password") || "Passwords do not match",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={errors.passwordRepeat}
          />
        </div>

        <div className="flex gap-2 items-center mb-4 text-sm">
          <input
            type="checkbox"
            name="accept-terms"
            id="accept-terms"
            {...register("terms", {
              required: "You must accept terms and conditions",
            })}
          />
          <label htmlFor="accept-terms" className="text-title ">
            I agree with privacy{" "}
            <a href="#" className="text-blue-background font-bold">
              policy & terms
            </a>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {errors.terms.message}
          </p>
        )}

        <Button
          type="submit"
          loading={loading}
          title="Account Register"
          loadingTitle="Creating..."
        />
        {authError && (
          <p className="text-red-500 text-sm my-4 text-center">{authError}</p>
        )}
        <AuthWith title="Or Signup With" />
      </form>
      <p className="text-light-title text-sm text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-title">
          Login
        </Link>
      </p>
    </div>
  );
}

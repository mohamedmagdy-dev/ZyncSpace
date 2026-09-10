import AppLogo from "../components/AppLogo";

import FormInputs, {
  PasswordInputWithForgot,
  SubmitButton,
  AuthWith,
} from "../components/FormInputs";

import useAuthStore from "../store/useAuthStore";

// Lib
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data.email, data.password);
    if (res.success) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="login-page flex items-center justify-center flex-col h-screen gap-5 bg-background ">
      <AppLogo />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-md bg-white p-6 md:w-95"
      >
        <h1 className="text-title text-xl font-semibold mb-4">Login</h1>
        {authError && <p className="text-red-500 text-sm">{authError}</p>}
        <FormInputs
          id="email"
          name="email"
          placeholder="youremail@exmaple.com"
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
        <PasswordInputWithForgot
          registration={register("password", {
            required: "Password Is Required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={errors.password}
        />
        <SubmitButton loading={loading} title="Login" />
        <AuthWith />
      </form>
      <p className="text-light-title text-sm text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-title">
          Register here
        </Link>
      </p>
    </div>
  );
}

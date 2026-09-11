// Component
import AppLogo from "../components/AppLogo";
import FormInputs, { Button } from "../components/FormInputs";

// Store
import useAuthStore from "../store/useAuthStore";

// Lib
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { resetPassword, loading } = useAuthStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await resetPassword(data.email);
    if (res.success) {
      reset();
      toast.success("Password reset email sent successfully");
    }
  };

  return (
    <div className="reset-password-page flex items-center justify-center flex-col h-screen gap-5 bg-background ">
      <AppLogo />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-md bg-white p-6 md:w-95"
      >
        <h1 className="text-title text-xl font-semibold mb-4">
          Reset Password
        </h1>
        <FormInputs
          id="email"
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
        <Button
          type="submit"
          loading={loading}
          title="Reset Password"
          loadingTitle="Sending..."
        />
      </form>
      <p className="text-light-title text-sm text-center">
        Suddenly remembered?{" "}
        <Link to="/login" className="text-blue-title">
          Login here
        </Link>
      </p>
    </div>
  );
}

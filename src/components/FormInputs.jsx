import { Link } from "react-router";

export default function FormInputs({
  id,
  placeholder,
  type,
  label,
  error,
  registration,
}) {
  return (
    <div className="mb-4 flex flex-col">
      <label htmlFor={id} className="mb-2 text-title  text-sm">
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        {...registration}
        className="text-light-title font-medium text-sm border border-[#cbd5e1] rounded-md h-10 pl-2"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
    </div>
  );
}

export function PasswordInputWithForgot({ error, registration }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="password" className="text-title  text-sm ">
          Password
        </label>
        <Link
          to="/reset-password"
          className="text-blue-background text-[12px] font-semibold"
        >
          Forgot ?
        </Link>
      </div>
      <input
        type="password"
        id="password"
        placeholder="Password"
        {...registration}
        className="w-full text-light-title font-medium text-sm border border-[#cbd5e1] rounded-md h-10 pl-2"
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}

export function Button({ loading, title, type, loadingTitle }) {
  return (
    <button
      disabled={loading}
      type={type}
      className="w-full h-10 bg-blue-background font-bold rounded-md text-white  cursor-pointer"
    >
      {loading ? loadingTitle : title}
    </button>
  );
}

export function AuthWith({ onGoogleClick, onFacebookClick, loading }) {
  return (
    <div className="pt-6 border-t border-gray-background mt-4">
      <h2 className="text-center mb-2 text-light-title text-[11px] font-bold">
        OR USE WITH
      </h2>
      <div className="flex justify-between items-center gap-3">
        <button
          disabled={loading}
          onClick={onGoogleClick}
          type="button"
          className="w-full px-4 py-2 h-10 font-medium text-title rounded-md bg-gray-background cursor-pointer"
        >
          Google
        </button>
        <button
          disabled={loading}
          onClick={onFacebookClick}
          type="button"
          className="w-full px-4 py-2 h-10 font-medium text-title rounded-md bg-gray-background cursor-pointer"
        >
          Facebook
        </button>
      </div>
    </div>
  );
}

import AppLogo from "../components/AppLogo";
import AuthWith from "../components/AuthWith";

export default function LoginPage() {
  return (
    <div className="login-page flex items-center justify-center flex-col h-screen gap-5 bg-background ">
      <AppLogo />
      <form className="rounded-md bg-white p-6 md:w-95">
        <h1 className="text-title text-xl font-semibold mb-4">Login</h1>
        <div className="mb-4 flex flex-col">
          <label htmlFor="email" className="mb-2 text-title  text-sm">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="youremail@exmaple.com"
            className="text-light-title font-medium text-sm border border-[#cbd5e1] rounded-md h-10 pl-2"
          />
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="text-title  text-sm ">
              Password
            </label>
            <a
              href="#"
              className="text-blue-background text-[12px] font-semibold"
            >
              Forgot ?
            </a>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            className="w-full text-light-title font-medium text-sm border border-[#cbd5e1] rounded-md h-10 pl-2"
          />
        </div>
        <button
          type="submit"
          className="w-full h-10 bg-blue-background font-bold rounded-md text-white mb-6 cursor-pointer"
        >
          Login
        </button>
        <AuthWith />
      </form>
      <p className="text-light-title text-sm text-center">
        Don't have an account?{" "}
        <a href="#" className="text-blue-title">
          Register here
        </a>
      </p>
    </div>
  );
}

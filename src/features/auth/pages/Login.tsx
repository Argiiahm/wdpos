import { useState } from "react";
import { supabase } from "../../../lib/supabase/client";

import * as v from "valibot";
import { useNavigate } from "react-router";

// type login
type Login = {
  email: string;
  password: string;
};

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.minLength(1, "email is required..")),
  password: v.pipe(v.string(), v.minLength(1, "password is required..")),
});

const Login = () => {
  const [form, setForm] = useState<Login>({
    email: "",
    password: "",
  });

  // state error
  const [isError, setIsError] = useState<string[]>([]);
  // use Navigate
  const navigate = useNavigate();

  //handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  //function login
  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = v.safeParse(LoginSchema, form, {
      abortPipeEarly: true,
    });
    if (!result.success) {
      const errors = result.issues.map((issue) => issue.message);
      setIsError(errors);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setIsError([error.message]);
      return;
    }

    console.log(data);
    navigate("/", { replace: true });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded-xl border border-zinc-200">
        {isError.length > 0 && (
          <div className="mb-3 text-red-500 text-sm">
            {isError.map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}
        <form onSubmit={signIn}>
          <input
            name="email"
            className="w-full bg-transparent border my-3 border-gray-500/30 outline-none rounded-full py-2.5 px-4"
            type="email"
            placeholder="Enter your email"
            onChange={handleChange}
          />
          <input
            name="password"
            className="w-full bg-transparent border mt-1 border-gray-500/30 outline-none rounded-full py-2.5 px-4"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full my-3 bg-indigo-500 py-2.5 rounded-full text-white"
          >
            Log in
          </button>
        </form>
        {/* <button
          type="button"
          className="w-full flex items-center gap-2 justify-center my-3 bg-white border border-gray-500/30 py-2.5 rounded-full text-gray-800"
        >
          <img
            className="h-4 w-4"
            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png"
            alt="googleFavicon"
          />
          Log in with Google
        </button> */}
      </div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { Loader2, Lock, Mail } from "lucide-react";
import * as v from "valibot";
import { useNavigate } from "react-router";

// type login
type Login = {
  email: string;
  password: string;
};

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.minLength(1, "Email is required")),
  password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

const Login = () => {
  const [form, setForm] = useState<Login>({
    email: "",
    password: "",
  });

  // state error
  const [isError, setIsError] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    setIsError([]);
    setLoading(true);

    const result = v.safeParse(LoginSchema, form, {
      abortPipeEarly: true,
    });
    if (!result.success) {
      const errors = result.issues.map((issue) => issue.message);
      setIsError(errors);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setIsError([error.message]);
      setLoading(false);
      return;
    }

    console.log(data);
    setLoading(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl flex flex-col items-center">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <img src="/image/wd.png" alt="Logo WarungDadakan" className="w-16 h-16 object-contain rounded-2xl shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Selamat Datang</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5 max-w-[280px]">
            Masuk ke akun WarungDadakan untuk melayani pelanggan anda
          </p>
        </div>

        {/* Error message */}
        {isError.length > 0 && (
          <div className="w-full mb-5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-xs text-red-600 dark:text-red-400">
            {isError.map((err, index) => (
              <p key={index} className="font-medium">{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={signIn} className="w-full space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-4.5 w-4.5" />
              <input
                name="email"
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
                type="email"
                placeholder="nama@email.com"
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 h-4.5 w-4.5" />
              <input
                name="password"
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 py-2.5 rounded-xl text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Masuk...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

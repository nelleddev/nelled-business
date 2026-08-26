import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default function AdminLoginPage() {
  async function login(formData: FormData) {
    "use server";

    const email = String(
      formData.get("email") ?? "",
    ).trim();

    const password = String(
      formData.get("password") ?? "",
    );

    if (!email || !password) {
      redirect(
        "/admin/login?error=Preencha email e senha",
      );
    }

    const supabase = await createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      redirect(
        "/admin/login?error=Email ou senha inválidos",
      );
    }

    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            Nelled Business
          </p>

          <h1 className="mt-2 text-2xl font-bold text-white">
            Painel administrativo
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Entre com sua conta para administrar
            seu site.
          </p>
        </div>

        <form
          action={login}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Senha
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
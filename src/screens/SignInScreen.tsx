import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { useAccessLogs } from "@/hooks/useAccessLogs";
import { useAuthStore } from "@/store/authStore";

const SignInScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      useAccessLogs(user);
    } catch (err) {
      toast.error("Falha na autenticação");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Iniciar sessão
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background dark:bg-foreground/[0.05] py-8 px-4 shadow-md rounded-lg sm:px-10 border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Endereço de email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Palavra-passe
              </label>
              <div className="mt-1">
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e)}
                  className="bg-background"
                />
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm">
                Ocorreu um erro ao tentar iniciar sessão. Por favor, verifique
                as suas credenciais e tente novamente.
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "A carregar..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2  bg-background text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-4">
              <Link
                to="/auth/signup"
                className="text-sm text-primary hover:text-primary/90 text-center"
              >
                Criar nova conta
              </Link>
              <Link
                to="/auth/recover"
                className="text-sm text-primary hover:text-primary/90 text-center"
              >
                Esqueceu a palavra-passe?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;

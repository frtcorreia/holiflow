import React, { useState } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const PasswordRecoveryScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { resetPassword, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, introduza o seu email");
      return;
    }
    try {
      await resetPassword(email);
      toast.success("Email de recuperação enviado");
      navigate("/auth/signin");
    } catch (err) {
      toast.error("Falha ao enviar email de recuperação");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Recuperar Palavra-passe
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Introduza o seu email e enviaremos um link para redefinir a sua
          palavra-passe.
        </p>
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
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {error && <div className="text-destructive text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "A enviar..." : "Enviar email de recuperação"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <Link
              to="/auth/signin"
              className="flex items-center justify-center text-sm text-primary hover:text-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryScreen;

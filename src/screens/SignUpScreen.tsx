import React, { useState, useEffect } from "react";
import { Calendar, EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Role } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

const AVAILABLE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#EF4444", // red
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6366F1", // indigo
  "#06B6D4", // cyan
];

const SignUpScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Role | undefined>(Role?.collaborator);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading, error, user } = useAuthStore();

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * AVAILABLE_COLORS.length);
    return AVAILABLE_COLORS[randomIndex];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!firstName?.trim() || !lastName?.trim()) {
        toast.error("Por favor, preencha nome e sobrenome");
        return;
      }
      await signUp(email, password, {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        color: getRandomColor(),
        role: role,
      });
    } catch (err) {
      toast.error("Falha no registro");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Criar nova conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background dark:bg-foreground/[0.05] py-8 px-4 shadow-md rounded-lg sm:px-10 border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-foreground"
                >
                  Nome
                </label>
                <div className="mt-1">
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-foreground"
                >
                  Sobrenome
                </label>
                <div className="mt-1">
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

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

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-foreground"
              >
                Cargo
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="appearance-none bg-background block w-full px-3 py-2 border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value={Role.collaborator}>Colaborador</option>
                  <option value={Role.teamLeader}>Team Leader</option>
                </select>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {role === "team_leader"
                  ? "Como Team Leader, poderá criar e gerenciar uma equipa."
                  : "Como Colaborador, poderá ser adicionado a uma equipa por um Team Leader."}
              </p>
            </div>

            {error && (
              <div className="text-destructive text-sm">
                Ocorreu um erro ao tentar concluir o registo. Por favor,
                verifique os dados inseridos e tente novamente.
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? "A carregar..." : "Registar"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background  text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/auth/signin"
                className="text-sm text-primary hover:text-primary/90"
              >
                Já tem uma conta? Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;

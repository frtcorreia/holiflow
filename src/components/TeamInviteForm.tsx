import React, { useState } from "react";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  teamName: string;
  onClose: () => void;
}

const TeamInviteForm = ({ teamName, onClose }: Props) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      formData.append("_subject", `Convite para equipa ${teamName}`);
      formData.append("_template", "table");
      formData.append("_captcha", "false");

      formData.append("_next", `${window.location.origin}/team/manage`);

      await fetch("https://formsubmit.co/frtcorreia@gmail.com", {
        method: "POST",
        body: formData,
      });

      toast.success("Convite enviado com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao enviar convite. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Convidar para {teamName}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="_template" value="table" />
          <input
            type="hidden"
            name="_subject"
            value={`Convite para equipa ${teamName}`}
          />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="hidden"
            name="_next"
            value={`${window.location.origin}/team/manage`}
          />

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email do colaborador
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 sm:text-sm dark:bg-slate-800 dark:text-white"
              placeholder="colaborador@exemplo.com"
            />
          </div>

          <input type="hidden" name="team_name" value={teamName} />

          <input
            type="hidden"
            name="invite_link"
            value={`${window.location.origin}/auth/signup?email=${email}`}
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Enviar Convite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamInviteForm;

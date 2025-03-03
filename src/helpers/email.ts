import emailjs from "@emailjs/browser";
import { Role, RoleTranslation, Team } from "../types";
import { roleTranslation } from "./global";

export const sendEmailInvitation = async (
  team: Team | null,
  email: string,
  role?: Role
) => {
  const templateParams = {
    to_email: email,
    team_name: team?.name,
    role: roleTranslation(role),
  };
  emailjs
    .send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      import.meta.env.VITE_EMAIL_SIGNIN_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAIL_PUBLIC_KEY
    )
    .then(
      (result) => {
        console.log("Email enviado com sucesso:", result.text);
      },
      (error) => {
        console.error("Erro ao enviar email:", error.text);
      }
    );
};

export const sendEmailRegisterInvitation = async (
  team: Team | null,
  email: string,
  role?: Role
) => {
  const customUrl = `https://holiflow.pt/auth/signup`;
  const templateParams = {
    to_email: email,
    url: customUrl,
    team_name: team?.name,
    role: roleTranslation(role),
  };
  emailjs
    .send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      import.meta.env.VITE_EMAIL_SIGNUP_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAIL_PUBLIC_KEY
    )
    .then(
      (result) => {
        console.log("Email enviado com sucesso:", result.text);
      },
      (error) => {
        console.error("Erro ao enviar email:", error.text);
      }
    );
};

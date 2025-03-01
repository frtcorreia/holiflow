import React from "react";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          Política de Privacidade
        </h1>
      </div>

      <div className="space-y-8 text-muted-foreground">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            1. Introdução
          </h2>
          <p>
            A Holi Flow está comprometida em proteger a privacidade dos nossos
            usuários. Esta política de privacidade explica como coletamos,
            usamos e protegemos suas informações pessoais.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            2. Informações Coletadas
          </h2>
          <p>Coletamos as seguintes informações:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Informações de perfil (nome, email, cargo)</li>
            <li>Dados de ausências e férias</li>
            <li>Informações da equipe</li>
            <li>Logs de acesso ao sistema</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            3. Uso das Informações
          </h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gerenciar ausências e férias</li>
            <li>Facilitar a comunicação entre equipas</li>
            <li>Melhorar nossos serviços</li>
            <li>Gerar relatórios e análises</li>
            <li>Gerir a equipa</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            4. Proteção de Dados
          </h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais para
            proteger suas informações, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Criptografia de dados</li>
            <li>Controle de acesso</li>
            <li>Monitoramento de segurança</li>
            <li>Backups regulares</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            5. Os seus Direitos
          </h2>
          <p>Tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Aceder aos seus dados pessoais</li>
            <li>Corrigir informações incorretas</li>
            <li>Solicitar exclusão de dados</li>
            <li>Exportar os seus dados</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Contato</h2>
          <p>
            Para questões sobre privacidade, entre em contato através do email:
            <a
              href="mailto:privacy@holiflow.pt"
              className="text-primary hover:underline"
            >
              privacy@holiflow.pt
            </a>
          </p>
        </section>

        <footer className="pt-8 border-t">
          <p className="text-sm">
            Última atualização: {new Date().toLocaleDateString("pt-PT")}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Privacy;

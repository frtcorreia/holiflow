import React from "react";
import { Calendar, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Gestão Simplificada",
      description:
        "Gerencie férias e ausências da sua equipe de forma intuitiva e eficiente.",
      icon: Calendar,
    },
    {
      title: "Visão em Tempo Real",
      description:
        "Acompanhe em tempo real quem está ausente e pode planear com antecedência.",
      icon: CheckCircle,
    },
    {
      title: "Conformidade Legal",
      description:
        "Sistema atualizado com feriados nacionais e gestão de feriados locais.",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="bg-background">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-accent" />
              <span className="ml-2 text-xl font-bold text-foreground">
                HoliManager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => navigate("/auth/signin")}
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/auth/signup")}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
              <span className="block">Simplifique a Gestão</span>
              <span className="block text-accent">de Férias da sua Equipe</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Gerencie férias e ausências de forma eficiente, mantenha a sua
              equipa organizada e garanta conformidade legal.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <button
                  onClick={() => navigate("/auth/signup")}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10 transition-colors"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-accent font-semibold tracking-wide uppercase">
              Funcionalidades
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
              Tudo que precisa para gerir ausências
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <div className="h-full rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg transition-shadow">
                    <div>
                      <feature.icon className="h-8 w-8 text-accent" />
                      <h3 className="mt-4 text-lg font-medium text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-base text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-accent">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-accent-foreground sm:text-4xl">
            <span className="block">Pronto para começar?</span>
            <span className="block text-primary-foreground">
              Experimente agora.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => navigate("/auth/signup")}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-accent bg-background hover:bg-background/90 transition-colors"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

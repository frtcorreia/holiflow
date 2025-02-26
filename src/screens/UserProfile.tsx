import React, { useState } from "react";
import { Settings } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [firstName, setFirstName] = useState<string | undefined>();
  const [lastName, setLastName] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [showPicker, setShowPicker] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFirstName(user?.firstName);
      setLastName(user?.lastName);
      setSelectedColor(user?.color || "#3B82F6");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        firstName,
        lastName,
        color: selectedColor,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  const getInitials = () => {
    const firstInitial = firstName?.charAt(0) || "";
    const lastInitial = lastName?.charAt(0) || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-background shadow-md rounded-lg border border-muted">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">
              Configurações do Perfil
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div
                  className="h-24 w-24 rounded-full flex items-center justify-center mb-4 text-primary-foreground text-2xl font-semibold shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowPicker(!showPicker)}
                >
                  {getInitials() || "?"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 p-2 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 p-2 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Cor do Avatar
                </label>
                <div className="relative">
                  {showPicker && (
                    <div className="absolute z-10 top-0 left-1/2 -translate-x-1/2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowPicker(false)}
                      />
                      <div className="relative bg-background p-4 rounded-lg shadow-xl border">
                        <div className="dark:invert dark:hue-rotate-180">
                          <HexColorPicker
                            color={selectedColor}
                            onChange={setSelectedColor}
                          />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {selectedColor?.toUpperCase()}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPicker(false)}
                            className="text-sm text-primary hover:text-primary/90"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowPicker(!showPicker)}
                      className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent/10"
                    >
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: selectedColor }}
                      />
                      Escolher Cor
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 border-0 rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

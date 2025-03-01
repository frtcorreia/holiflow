import React, { useEffect, useState } from "react";
import {
  collection,
  getFirestore,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  path: string;
  timestamp: any;
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: {
    width: number;
    height: number;
  };
}

const AccessLogs = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsQuery = query(
          collection(db, "access_logs"),
          orderBy("timestamp", "desc"),
          limit(100)
        );

        const querySnapshot = await getDocs(logsQuery);
        const logsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AccessLog[];

        setLogs(logsData);
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Logs de Acesso
      </h1>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Página
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dispositivo
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {log.timestamp?.toDate()
                      ? format(log.timestamp.toDate(), "dd/MM/yyyy HH:mm:ss", {
                          locale: ptBR,
                        })
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {log.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {log.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    <div className="space-y-1">
                      <p>{log.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.screenResolution.width}x
                        {log.screenResolution.height}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;

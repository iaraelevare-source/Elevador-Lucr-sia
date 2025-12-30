/**
 * 🔐 Página de Configurações LGPD
 * Permite ao usuário exercer seus direitos conforme Lei 13.709/2018
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Download, Trash2, Shield, FileText, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function SettingsLGPD() {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  // Queries
  const privacyInfo = trpc.lgpd.getPrivacyInfo.useQuery();
  const exportData = trpc.lgpd.exportData.useQuery(undefined, { enabled: false });

  // Mutations
  const deleteAccount = trpc.lgpd.deleteAccount.useMutation({
    onSuccess: () => {
      alert("Conta deletada com sucesso. Você será redirecionado.");
      window.location.href = "/";
    },
    onError: (error) => {
      alert(`Erro ao deletar conta: ${error.message}`);
    },
  });

  const handleExportData = async () => {
    try {
      const data = await exportData.refetch();
      if (data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meus-dados-elevare-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert("Erro ao exportar dados. Tente novamente.");
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETAR MINHA CONTA") {
      alert("Por favor, digite exatamente 'DELETAR MINHA CONTA' para confirmar.");
      return;
    }
    deleteAccount.mutate({ confirmacao: "DELETAR MINHA CONTA" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Privacidade e Dados
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Gerencie seus dados conforme a Lei Geral de Proteção de Dados (LGPD)
          </p>
        </div>

        {/* Seus Direitos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Seus Direitos (Art. 18 LGPD)
            </CardTitle>
            <CardDescription>
              A LGPD garante a você diversos direitos sobre seus dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {privacyInfo.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : privacyInfo.data ? (
              <ul className="space-y-2">
                {privacyInfo.data.rights.map((right, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{right}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>

        {/* Exportar Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar Meus Dados
            </CardTitle>
            <CardDescription>
              Baixe todos os seus dados em formato JSON (Art. 18, V - Portabilidade)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleExportData}
              disabled={exportData.isFetching}
              className="w-full sm:w-auto"
            >
              {exportData.isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Meus Dados
                </>
              )}
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              O arquivo incluirá: dados pessoais, conteúdos gerados, leads, agendamentos e histórico.
            </p>
          </CardContent>
        </Card>

        {/* Dados Coletados */}
        {privacyInfo.data && (
          <Card>
            <CardHeader>
              <CardTitle>Dados que Coletamos</CardTitle>
              <CardDescription>
                Transparência sobre quais dados armazenamos e para quê
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacyInfo.data.dataCollected.map((item, index) => (
                  <div key={index} className="border-l-4 border-amber-500 pl-4 py-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.type}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Exemplos:</strong> {item.examples}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>Finalidade:</strong> {item.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deletar Conta */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Deletar Minha Conta
            </CardTitle>
            <CardDescription>
              Exclua permanentemente sua conta e todos os dados (Art. 18, VI - Eliminação)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteForm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteForm(true)}
              >
                Quero Deletar Minha Conta
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção! Esta ação é irreversível</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Todos os seus dados serão anonimizados</li>
                      <li>Sua assinatura será cancelada (sem reembolso)</li>
                      <li>Você perderá acesso a todos os conteúdos gerados</li>
                      <li>Leads e agendamentos serão anonimizados</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Digite <strong>DELETAR MINHA CONTA</strong> para confirmar:
                  </label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETAR MINHA CONTA"
                    className="max-w-md"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteAccount.isPending || deleteConfirmation !== "DELETAR MINHA CONTA"}
                  >
                    {deleteAccount.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deletando...
                      </>
                    ) : (
                      "Confirmar Exclusão"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteForm(false);
                      setDeleteConfirmation("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/privacy" className="text-amber-600 hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/terms" className="text-amber-600 hover:underline">
            Termos de Uso
          </Link>
          {privacyInfo.data && (
            <a
              href={`mailto:${privacyInfo.data.dpoContact}`}
              className="text-amber-600 hover:underline"
            >
              Contato DPO: {privacyInfo.data.dpoContact}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

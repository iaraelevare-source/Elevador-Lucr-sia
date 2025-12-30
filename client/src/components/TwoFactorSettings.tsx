/**
 * 🔐 TWO-FACTOR AUTHENTICATION - Admin Settings Component
 * Interface para configurar 2FA (QR code + backup codes)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2, AlertCircle, Shield, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Step = "status" | "setup" | "verify" | "backup" | "done";

export function TwoFactorSettings() {
  const [step, setStep] = useState<Step>("status");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");

  // Queries & Mutations
  const { data: statusData, isLoading: checkingStatus } =
    trpc.twoFactor.status.useQuery();

  const setupMutation = trpc.twoFactor.setup.useMutation({
    onSuccess: (data) => {
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      setStep("setup");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const enableMutation = trpc.twoFactor.enable.useMutation({
    onSuccess: () => {
      setStep("backup");
      toast.success("2FA ativado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
      setCode("");
    },
  });

  const disableMutation = trpc.twoFactor.disable.useMutation({
    onSuccess: () => {
      setStep("status");
      toast.success("2FA desativado");
      setCode("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const handleEnable = () => {
    if (!code || code.length !== 6) {
      toast.error("Digite um código válido com 6 dígitos");
      return;
    }
    enableMutation.mutate({
      secret,
      code,
      backupCodes,
    });
  };

  const handleDisable = () => {
    if (!code) {
      toast.error("Digite o código para desativar");
      return;
    }
    disableMutation.mutate({
      code,
      isBackupCode: false,
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadBackupCodes = () => {
    const text = `Códigos de Backup 2FA - Elevare AI
Gerado em: ${new Date().toLocaleString()}
GUARDE ESTES CÓDIGOS EM LOCAL SEGURO

${backupCodes.join("\n")}

Se perder acesso ao seu autenticador, use um desses códigos para fazer login.
Cada código pode ser usado uma única vez.`;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", "2fa-backup-codes.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (checkingStatus) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </Card>
    );
  }

  // STATUS: 2FA NOT ENABLED
  if (!statusData?.enabled && step === "status") {
    return (
      <Card className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Autenticação de Dois Fatores</h2>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
            Você precisará de um autenticador como Google Authenticator ou Authy para fazer login.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSetup}
          disabled={setupMutation.isPending}
          className="w-full"
          size="lg"
        >
          {setupMutation.isPending ? "Configurando..." : "Ativar 2FA"}
        </Button>
      </Card>
    );
  }

  // SETUP: SHOW QR CODE
  if (step === "setup") {
    return (
      <Card className="p-8 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Configurar 2FA</h2>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Passo 1: Escanear QR Code
            </Label>
            <p className="text-gray-600 mb-4">
              Use Google Authenticator, Authy ou Microsoft Authenticator para escanear este código:
            </p>
            <div className="bg-white p-4 border-2 border-gray-200 rounded-lg inline-block">
              <img
                src={qrCode}
                alt="QR Code para 2FA"
                className="w-48 h-48"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-4 block">
              Passo 2: Verificar Código
            </Label>
            <p className="text-gray-600 mb-4">
              Digite o código de 6 dígitos do seu autenticador:
            </p>
            <Input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl font-mono tracking-widest max-w-40"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setStep("status");
                setCode("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnable}
              disabled={enableMutation.isPending || code.length !== 6}
            >
              {enableMutation.isPending ? "Verificando..." : "Verificar & Continuar"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // BACKUP: SAVE BACKUP CODES
  if (step === "backup") {
    return (
      <Card className="p-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Códigos de Backup</h2>
        </div>

        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Guarde estes códigos em um local seguro. Cada código pode ser usado uma vez para
            fazer login se perder acesso ao seu autenticador.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 font-mono text-sm space-y-2">
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border"
            >
              <span className="text-gray-700">{code}</span>
              <button
                onClick={() => copyToClipboard(code, index)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedIndex === index ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            onClick={downloadBackupCodes}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Códigos
          </Button>
        </div>

        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Autenticação de dois fatores ativada com sucesso!
          </AlertDescription>
        </Alert>

        <Button onClick={() => window.location.reload()} className="w-full">
          Concluir
        </Button>
      </Card>
    );
  }

  // STATUS: 2FA ENABLED
  if (statusData?.enabled) {
    return (
      <Card className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">2FA Ativado</h2>
        </div>

        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Sua conta está protegida com autenticação de dois fatores.
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <Label className="text-base font-semibold mb-4 block">
            Desativar 2FA
          </Label>
          <p className="text-gray-600 mb-4">
            Digite um código do seu autenticador ou um código de backup para desativar:
          </p>
          <Input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-2xl font-mono tracking-widest max-w-40"
          />
        </div>

        <Button
          variant="destructive"
          onClick={handleDisable}
          disabled={disableMutation.isPending || code.length < 6}
        >
          {disableMutation.isPending ? "Desativando..." : "Desativar 2FA"}
        </Button>
      </Card>
    );
  }

  return null;
}

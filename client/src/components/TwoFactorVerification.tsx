/**
 * 🔐 TWO-FACTOR VERIFICATION - Login Component
 * Modal para validar código 2FA durante login
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface TwoFactorVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
}

export function TwoFactorVerification({
  onVerified,
  onCancel,
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);

  const verifyMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: () => {
      toast.success("Código verificado!");
      onVerified();
    },
    onError: (error) => {
      toast.error(error.message || "Código inválido");
      setCode("");
    },
  });

  const handleVerify = () => {
    if (!code || (isBackupCode && code.length < 6) || (!isBackupCode && code.length !== 6)) {
      toast.error("Digite um código válido");
      return;
    }

    verifyMutation.mutate({
      code,
      isBackupCode,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Autenticação de Dois Fatores</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Digite o código do seu autenticador para continuar:
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <Input
              type="text"
              maxLength={isBackupCode ? 8 : 6}
              placeholder={isBackupCode ? "ABCD1234" : "000000"}
              value={code}
              onChange={(e) =>
                setCode(
                  isBackupCode
                    ? e.target.value.toUpperCase()
                    : e.target.value.replace(/\D/g, "")
                )
              }
              className="text-center text-2xl font-mono tracking-widest"
              autoFocus
              disabled={verifyMutation.isPending}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsBackupCode(!isBackupCode);
              setCode("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {isBackupCode ? "Usar código de autenticador" : "Usar código de backup"}
          </button>
        </div>

        {isBackupCode && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Cada código de backup pode ser usado apenas uma vez.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={verifyMutation.isPending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleVerify}
            disabled={
              verifyMutation.isPending ||
              (isBackupCode ? code.length < 6 : code.length !== 6)
            }
            className="flex-1"
          >
            {verifyMutation.isPending ? "Verificando..." : "Verificar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { Card } from "@/components/ui/card";

export function VideoExamplesSection() {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-white mb-6">📽️ Exemplos de Uso</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/30 border-slate-700 p-4">
          <h4 className="font-semibold text-white mb-2">Harmonização Facial</h4>
          <p className="text-slate-400 text-sm">
            Vídeo cinematográfico mostrando o procedimento com luz suave e foco nos detalhes técnicos.
          </p>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700 p-4">
          <h4 className="font-semibold text-white mb-2">Antes e Depois</h4>
          <p className="text-slate-400 text-sm">
            Comparativo dramático com transições elegantes e música emocional.
          </p>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700 p-4">
          <h4 className="font-semibold text-white mb-2">Tour pela Clínica</h4>
          <p className="text-slate-400 text-sm">
            Apresentação premium do espaço para transmitir sofisticação e confiança.
          </p>
        </Card>
      </div>
    </div>
  );
}

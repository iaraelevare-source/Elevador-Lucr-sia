import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

type Agendamento = {
  id: number;
  data: string;
  status: string;
  valor: number;
};

type WeekCalendarProps = {
  weekDays: Date[];
  selectedDate: string;
  hoje: string;
  agendamentos: Agendamento[];
  onSelectDate: (date: string) => void;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onGoToToday: () => void;
};

export function WeekCalendar({
  weekDays,
  selectedDate,
  hoje,
  agendamentos,
  onSelectDate,
  onNavigateWeek,
  onGoToToday,
}: WeekCalendarProps) {
  return (
    <>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigateWeek("prev")} 
            className="border-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium">
            {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} -{' '}
            {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigateWeek("next")} 
            className="border-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onGoToToday}
          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
        >
          Hoje
        </Button>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayAgendamentos = agendamentos.filter(
            (a) => a.data === dateStr && a.status !== "cancelado"
          );
          const dayTotal = dayAgendamentos.reduce((acc, a) => acc + a.valor, 0);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === hoje;

          return (
            <Card 
              key={dateStr}
              className={`cursor-pointer transition-all p-3 ${
                isSelected 
                  ? 'bg-violet-500/20 border-violet-500' 
                  : isToday 
                    ? 'bg-slate-800/70 border-violet-500/50' 
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => onSelectDate(dateStr)}
            >
              <p className={`text-xs ${isToday ? 'text-violet-400' : 'text-slate-400'}`}>
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </p>
              <p className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {day.getDate()}
              </p>
              <div className="mt-2">
                <p className="text-xs text-slate-500">{dayAgendamentos.length} agend.</p>
                <p className={`text-sm font-medium ${dayTotal > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                  {dayTotal > 0 ? formatCurrency(dayTotal) : '-'}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

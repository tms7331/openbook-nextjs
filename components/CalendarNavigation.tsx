import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

interface CalendarNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export default function CalendarNavigation({
  currentDate,
  onDateChange,
}: CalendarNavigationProps) {
  function navigateDate(days: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    onDateChange(newDate);
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center justify-between p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-white">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigateDate(-1)}
          size="icon"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <h1 className="text-lg font-semibold text-purple-900 min-w-[200px] text-center">
          {formatDate(currentDate)}
        </h1>

        <Button
          onClick={() => navigateDate(1)}
          size="icon"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={() => onDateChange(new Date())}
        variant={isToday ? "outline" : "default"}
        className={isToday 
          ? "border-purple-300 text-purple-700 hover:bg-purple-50" 
          : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
        }
      >
        <CalendarDays className="w-4 h-4 mr-2" />
        {isToday ? 'Today' : 'Go to Today'}
      </Button>
    </div>
  );
}
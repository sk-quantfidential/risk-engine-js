'use client';

import { useMarketData } from '@/components/common/MarketDataProvider';
import { useMemo } from 'react';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export default function CalendarPage() {
  const { portfolio } = useMarketData();

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Collect loan events
  const events = useMemo(() => {
    if (!portfolio) return [];

    const allEvents: Array<{
      date: Date;
      type: 'roll' | 'interest' | 'origination';
      loan: any;
    }> = [];

    portfolio.loans.forEach(loan => {
      // Roll dates
      allEvents.push({
        date: loan.terms.rollDate,
        type: 'roll',
        loan,
      });

      // Interest payment dates (monthly)
      for (let i = 0; i < 12; i++) {
        const interestDate = addDays(loan.originationDate, i * 30);
        if (interestDate >= monthStart && interestDate <= monthEnd) {
          allEvents.push({
            date: interestDate,
            type: 'interest',
            loan,
          });
        }
      }
    });

    return allEvents;
  }, [portfolio, monthStart, monthEnd]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  if (!portfolio) {
    return <div className="text-center text-text-secondary font-mono">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold text-primary">
          EVENT CALENDAR
        </h1>
        <p className="text-sm text-text-secondary font-mono mt-1">
          Loan rolls, interest payments, and key financial events
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="panel">
        <h2 className="panel-header">{format(today, 'MMMM yyyy').toUpperCase()}</h2>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="text-center text-xs font-mono font-bold text-text-secondary py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[100px] p-2 border rounded
                  ${isToday ? 'border-primary bg-background-tertiary' : 'border-border bg-background-secondary'}
                  ${!isSameMonth(day, today) ? 'opacity-50' : ''}
                `}
              >
                <div className={`text-sm font-mono font-bold mb-2 ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className={`
                        text-xs font-mono px-2 py-1 rounded
                        ${event.type === 'roll' ? 'bg-primary text-background' : ''}
                        ${event.type === 'interest' ? 'bg-info text-background' : ''}
                        ${event.type === 'origination' ? 'bg-warning text-background' : ''}
                      `}
                    >
                      {event.type === 'roll' && '🔄 Roll'}
                      {event.type === 'interest' && '💰 Int'}
                      {event.type === 'origination' && '🆕 New'}
                      <div className="truncate text-[10px]">{event.loan.borrowerName.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="panel">
        <h2 className="panel-header">UPCOMING ROLL DATES</h2>
        <div className="space-y-2">
          {portfolio.loans
            .sort((a, b) => a.terms.rollDate.getTime() - b.terms.rollDate.getTime())
            .slice(0, 10)
            .map(loan => (
              <div key={loan.id} className="flex items-center justify-between p-3 bg-background-tertiary rounded">
                <div>
                  <div className="text-sm font-mono font-bold text-text-primary">{loan.borrowerName}</div>
                  <div className="text-xs text-text-muted font-mono">{loan.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-primary">
                    {format(loan.terms.rollDate, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-text-secondary font-mono">
                    ${(loan.terms.principalUSD / 1_000_000).toFixed(1)}M principal
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
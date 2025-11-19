
import React, { useState, useMemo, useEffect } from 'react';
import type { FormData } from '../../types';

interface SchedulingModalProps {
    formData: FormData;
    onClose: () => void;
    onConfirm: (data: { dates: { date: string, times: string }[]; notes: string }) => void;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({ formData, onClose, onConfirm }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<Record<string, string[]>>({});
    const [notes, setNotes] = useState('');
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const calendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid: (Date | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(year, month, i));
        }
        return grid;
    }, [currentMonth]);

    const handleDateSelect = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const newSelectedDates = [...selectedDates];
        const dateIndex = newSelectedDates.indexOf(dateStr);

        if (dateIndex > -1) {
            newSelectedDates.splice(dateIndex, 1);
            const newSelectedTimes = {...selectedTimes};
            delete newSelectedTimes[dateStr];
            setSelectedTimes(newSelectedTimes);
        } else if (newSelectedDates.length < 3) {
            newSelectedDates.push(dateStr);
            setSelectedTimes(prev => ({...prev, [dateStr]: []}));
        }
        setSelectedDates(newSelectedDates.sort());
    };

    const handleTimeSelect = (dateStr: string, time: string) => {
        const currentTimes = selectedTimes[dateStr] || [];
        const newTimes = currentTimes.includes(time)
            ? currentTimes.filter(t => t !== time)
            : [...currentTimes, time];
        setSelectedTimes(prev => ({...prev, [dateStr]: newTimes.sort()}));
    };
    
    useEffect(() => {
        const hasSelection = selectedDates.length > 0;
        const allDatesHaveTimes = selectedDates.every(date => selectedTimes[date]?.length > 0);
        setIsConfirmEnabled(hasSelection && allDatesHaveTimes);
    }, [selectedDates, selectedTimes]);

    const handleConfirmClick = () => {
        const dates = selectedDates.map(dateStr => {
            const date = new Date(dateStr + 'T12:00:00');
            const formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
            const times = (selectedTimes[dateStr] || []).join(', ');
            return { date: formattedDate, times };
        });
        onConfirm({ dates, notes });
    };

    const renderDay = (date: Date | null, index: number) => {
        if (!date) return <div key={`empty-${index}`}></div>;
        const dateStr = date.toISOString().split('T')[0];
        const isPast = date < today;
        const isSelected = selectedDates.includes(dateStr);

        let classes = "text-center p-3 rounded-lg text-sm font-medium transition-all cursor-pointer";
        if (isPast) classes += " bg-gray-200 text-gray-400 cursor-not-allowed";
        else if (isSelected) classes += " bg-blue-600 text-white ring-2 ring-blue-400";
        else classes += " bg-white hover:bg-blue-100 text-gray-700 border border-gray-300";

        return (
            <button key={dateStr} onClick={() => !isPast && handleDateSelect(date)} disabled={isPast} className={classes}>
                {date.getDate()}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-600">📅 Agendar Visita Técnica</h2>
                    <p className="text-gray-600 text-base">Escolha até 3 dias e horários para a visita.</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-bold text-lg">←</button>
                    <h3 className="font-bold text-xl text-gray-800">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-bold text-lg">→</button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold text-gray-500 mb-2">
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>
                <div className="grid grid-cols-7 gap-2">{calendarGrid.map(renderDay)}</div>

                {selectedDates.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <h4 className="font-bold text-base text-gray-800 mb-3">🗓️ Datas e Turnos Selecionados:</h4>
                        <div className="space-y-3">
                            {selectedDates.map(dateStr => (
                                <div key={dateStr} className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-semibold text-sm mb-2">{new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Manhã', 'Tarde', 'Noite'].map(time => (
                                            <button key={time} onClick={() => handleTimeSelect(dateStr, time)} className={`p-2 rounded-lg text-sm font-medium border-2 transition-all ${(selectedTimes[dateStr] || []).includes(time) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-6">
                    <label htmlFor="notes" className="block text-base font-medium text-gray-700 mb-2">Observações (opcional)</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-3 text-base border border-gray-300 rounded-lg" placeholder="Ex: Acesso por portão lateral, melhor horário, etc."></textarea>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-base">Cancelar</button>
                    <button onClick={handleConfirmClick} disabled={!isConfirmEnabled} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed text-base">Confirmar Agendamento</button>
                </div>
            </div>
        </div>
    );
};

export default SchedulingModal;


import React, { useCallback, useEffect } from 'react';
import type { SystemType } from '../../types';
import { calculateBatteryConfig, calculateOffGridConfig } from '../../services/solarCalculator';
import { BATTERY_DATABASE } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const SystemOption: React.FC<{ 
    title: string; 
    type: SystemType; 
    selectedType: SystemType; 
    onSelect: (type: SystemType) => void; 
    advantages: string[]; 
    considerations: string[]; 
    icon: string;
}> = ({ title, type, selectedType, onSelect, advantages, considerations, icon }) => {
    const isSelected = selectedType === type;
    
    const colorMap = {
        ongrid: { 
            border: 'border-blue-500', 
            bg: 'bg-blue-50', 
            text: 'text-blue-700', 
            ring: 'ring-blue-200',
            badge: 'bg-blue-500',
            hoverBorder: 'hover:border-blue-300',
            hoverBg: 'hover:bg-blue-50'
        },
        hybrid: { 
            border: 'border-green-500', 
            bg: 'bg-green-50', 
            text: 'text-green-700', 
            ring: 'ring-green-200',
            badge: 'bg-green-500',
            hoverBorder: 'hover:border-green-300',
            hoverBg: 'hover:bg-green-50'
        },
        offgrid: { 
            border: 'border-orange-500', 
            bg: 'bg-orange-50', 
            text: 'text-orange-700', 
            ring: 'ring-orange-200',
            badge: 'bg-orange-500',
            hoverBorder: 'hover:border-orange-300',
            hoverBg: 'hover:bg-orange-50'
        }
    };

    const colors = colorMap[type];

    return (
        <div 
            onClick={() => onSelect(type)} 
            className={`
                relative rounded-xl p-6 border-2 cursor-pointer transition-all duration-300 flex flex-col h-full
                ${isSelected 
                    ? `${colors.border} ${colors.bg} shadow-xl ring-4 ${colors.ring} transform scale-105 z-10` 
                    : `border-gray-200 bg-white ${colors.hoverBorder} ${colors.hoverBg} hover:shadow-lg opacity-90 hover:opacity-100`
                }
            `}
        >
            {isSelected && (
                <div className={`absolute -top-3 -right-3 ${colors.badge} text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm text-lg font-bold animate-bounce-small`}>
                    ✓
                </div>
            )}
            
            <div className="flex items-center gap-3 mb-4 border-b pb-3 border-gray-200/50">
                <span className="text-3xl">{icon}</span>
                <h4 className={`font-bold text-xl ${isSelected ? colors.text : 'text-gray-800'}`}>{title}</h4>
            </div>

            <div className="space-y-4 flex-grow">
                <div>
                    <p className={`font-bold text-sm mb-2 flex items-center gap-1 ${isSelected ? colors.text : 'text-gray-700'}`}>
                        ✅ Vantagens:
                    </p>
                    <ul className="space-y-1">
                        {advantages.map(adv => (
                            <li key={adv} className="text-sm text-gray-600 flex items-start">
                                <span className="mr-1.5 mt-0.5 text-xs">•</span>
                                {adv}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p className="font-bold text-sm mb-2 flex items-center gap-1 text-amber-600">
                        ⚠️ Considerações:
                    </p>
                    <ul className="space-y-1">
                        {considerations.map(con => (
                            <li key={con} className="text-sm text-gray-500 flex items-start">
                                <span className="mr-1.5 mt-0.5 text-xs">•</span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {isSelected && (
                <div className={`mt-4 text-center text-xs font-bold uppercase tracking-widest ${colors.text} opacity-80`}>
                    Selecionado
                </div>
            )}
        </div>
    );
};

const Step3SystemConfig: React.FC = () => {
    const { formData, setFormData } = useAppContext();
    
    const handleSystemSelect = (type: SystemType) => {
        setFormData(prev => ({ ...prev, sistema: type }));
    };

    const handleBatteryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = name === 'autonomy' || name === 'load' || name === 'dod';
        setFormData(prev => ({
            ...prev,
            baterias: {
                ...prev.baterias,
                [name]: isNumeric ? Number(value) : value,
            }
        }));
    };
    
    const handleOffGridChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            offgrid: {
                ...prev.offgrid,
                [name]: Number(value)
            }
        }));
    };
    
    const updateCalculations = useCallback(() => {
        if (formData.sistema === 'hybrid') {
            const newBatteryConfig = calculateBatteryConfig(formData.consumo, formData.baterias);
            setFormData(prev => ({...prev, baterias: newBatteryConfig}));
        } else if (formData.sistema === 'offgrid') {
            const newOffGridConfig = calculateOffGridConfig(formData.consumo, formData.offgrid);
            setFormData(prev => ({...prev, offgrid: newOffGridConfig}));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.sistema, formData.consumo, formData.baterias.autonomy, formData.baterias.load, formData.baterias.type, formData.baterias.dod, formData.baterias.systemConfig, formData.offgrid.autonomyDays, formData.offgrid.dod, setFormData]);

    useEffect(() => {
        updateCalculations();
    }, [updateCalculations]);

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">🏠 Configuração do Sistema</h2>
                <p className="text-gray-600 text-base">Escolha a tecnologia ideal para sua necessidade energética.</p>
            </div>
            
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SystemOption 
                        title="On-Grid" 
                        type="ongrid" 
                        selectedType={formData.sistema} 
                        onSelect={handleSystemSelect} 
                        icon="🔌"
                        advantages={["Menor investimento inicial", "Retorno financeiro mais rápido", "Sem preocupação com baterias"]} 
                        considerations={["Desliga se a rede da rua cair (segurança)", "Depende da concessionária"]} 
                    />
                    <SystemOption 
                        title="Híbrido" 
                        type="hybrid" 
                        selectedType={formData.sistema} 
                        onSelect={handleSystemSelect} 
                        icon="🔋"
                        advantages={["Backup de energia em apagões", "Uso noturno da própria energia", "Maior independência energética"]} 
                        considerations={["Investimento inicial mais alto", "Manutenção periódica das baterias"]} 
                    />
                    <SystemOption 
                        title="Off-Grid" 
                        type="offgrid" 
                        selectedType={formData.sistema} 
                        onSelect={handleSystemSelect} 
                        icon="🏝️"
                        advantages={["Independência total da rede", "Ideal para locais isolados", "Conta de luz zero (exceto taxa mínima se ligado)"]} 
                        considerations={["Alto custo de baterias", "Requer dimensionamento rigoroso", "Energia limitada ao banco de baterias"]} 
                    />
                </div>

                {/* Configuração Híbrida */}
                {formData.sistema === 'hybrid' && (
                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 shadow-sm animate-fade-in">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-green-200">
                            <span className="text-3xl">🔋</span>
                            <div>
                                <h4 className="font-bold text-green-900 text-xl">Configuração do Banco de Baterias</h4>
                                <p className="text-green-700 text-sm">Personalize seu backup de energia.</p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                                <label className="block text-sm font-bold text-green-800 mb-2">Autonomia Desejada</label>
                                <select name="autonomy" value={formData.baterias.autonomy} onChange={handleBatteryChange} className="w-full p-3 text-base border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                                     <option value="4">4h - Básico (Essencial)</option>
                                     <option value="8">8h - Noite (Conforto)</option>
                                     <option value="12">12h - Estendido</option>
                                     <option value="24">24h - Dia Completo</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-green-800 mb-2">Carga de Backup</label>
                                <select name="load" value={formData.baterias.load} onChange={handleBatteryChange} className="w-full p-3 text-base border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                                     <option value="0.25">25% - Geladeira + Luzes</option>
                                     <option value="0.55">55% - + TV, Wi-Fi, Computador</option>
                                     <option value="0.75">75% - + 1 Ar Condicionado</option>
                                     <option value="1.0">100% - Casa Toda</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-green-800 mb-2">Tecnologia da Bateria</label>
                                 <select name="type" value={formData.baterias.type} onChange={handleBatteryChange} className="w-full p-3 text-base border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                                     {Object.entries(BATTERY_DATABASE).map(([key, {name}]) => <option key={key} value={key}>{name}</option>)}
                                 </select>
                             </div>
                         </div>
                         
                         <div className="mt-6 bg-white rounded-lg border border-green-200 p-4 shadow-sm">
                             <h5 className="font-bold text-gray-700 mb-3 border-b pb-2">Resumo do Banco de Baterias:</h5>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                 <div className="flex flex-col">
                                     <span className="text-gray-500">Quantidade</span>
                                     <span className="font-bold text-lg text-gray-800">{formData.baterias.count} unidades</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-500">Capacidade Útil</span>
                                     <span className="font-bold text-lg text-blue-600">{formData.baterias.usableCapacity.toFixed(1)} kWh</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-500">Investimento Adicional</span>
                                     <span className="font-bold text-lg text-green-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.baterias.cost)}</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                )}

                {/* Configuração Off-Grid */}
                 {formData.sistema === 'offgrid' && (
                    <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200 shadow-sm animate-fade-in">
                         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-200">
                            <span className="text-3xl">🏝️</span>
                            <div>
                                <h4 className="font-bold text-orange-900 text-xl">Dimensionamento Off-Grid</h4>
                                <p className="text-orange-700 text-sm">Sistema isolado sem conexão com a rede.</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-orange-800 mb-2">Autonomia (Dias sem Sol)</label>
                                <select name="autonomyDays" value={formData.offgrid.autonomyDays} onChange={handleOffGridChange} className="w-full p-3 text-base border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
                                    <option value="2">2 Dias (Padrão)</option>
                                    <option value="3">3 Dias (Recomendado/Seguro)</option>
                                    <option value="4">4 Dias (Crítico/Máxima)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-orange-800 mb-2">Ciclo de Bateria (DOD)</label>
                                <select name="dod" value={formData.offgrid.dod} onChange={handleOffGridChange} className="w-full p-3 text-base border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white">
                                    <option value="0.5">50% (Vida Útil Longa)</option>
                                    <option value="0.8">80% (Uso Intensivo)</option>
                                </select>
                            </div>
                         </div>

                         <div className="mt-6 bg-white rounded-lg border border-orange-200 p-4 shadow-sm">
                             <h5 className="font-bold text-gray-700 mb-3 border-b pb-2">Dimensionamento Estimado:</h5>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                 <div className="flex flex-col">
                                     <span className="text-gray-500">Baterias (5kWh)</span>
                                     <span className="font-bold text-lg text-gray-800">{formData.offgrid.batteryCount} unidades</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-500">Painéis Extras</span>
                                     <span className="font-bold text-lg text-gray-800">+{formData.offgrid.extraPanels} painéis</span>
                                     <span className="text-xs text-gray-400">(Para recarga rápida)</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-gray-500">Investimento Adicional</span>
                                     <span className="font-bold text-lg text-orange-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.offgrid.cost)}</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                )}
            </div>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                .animate-bounce-small { animation: bounceSmall 0.5s; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounceSmall { 
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default Step3SystemConfig;

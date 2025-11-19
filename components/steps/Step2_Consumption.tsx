
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LigacaoType, VehicleOption, Attachment } from '../../types';
import { VEHICLE_DATABASE } from '../../constants';
import { useAppContext } from '../../context/AppContext';


const ConsumptionExample: React.FC<{ icon: string; consumo: number; valor: number; label: string; onClick: () => void; isSelected: boolean }> = ({ icon, consumo, valor, label, onClick, isSelected }) => (
    <button 
        onClick={onClick} 
        type="button"
        className={`
            relative p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 w-full h-full
            ${isSelected 
                ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200 transform scale-105 z-10' 
                : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md'
            }
        `}
        aria-pressed={isSelected}
    >
        {isSelected && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-xs">
                ✓
            </div>
        )}
        <div className="text-2xl mb-1">{icon}</div>
        <div className={`font-bold text-sm ${isSelected ? 'text-green-800' : 'text-gray-700'}`}>{consumo} kWh</div>
        <div className="text-xs text-gray-500">R$ {valor}</div>
        <div className={`text-xs font-bold uppercase tracking-wide mt-1 ${isSelected ? 'text-green-700' : 'text-blue-600'}`}>{label}</div>
    </button>
);

const Step2Consumption: React.FC = () => {
    const { formData, setFormData, validationErrors: errors } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    
    // Local state to track which vehicle button was explicitly clicked for visual feedback
    const [selectedVehicleOption, setSelectedVehicleOption] = useState<VehicleOption>(
        formData.veiculo.hasVehicle ? 'tenho' : 'nao'
    );

    const handleConsumoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const consumo = Number(e.target.value);
        setFormData(prev => ({...prev, consumo }));
        
        let suggestedType: LigacaoType = 'monofasico';
        if (consumo > 1200) suggestedType = 'trifasico';
        else if (consumo > 600) suggestedType = 'bifasico';
        setFormData(prev => ({...prev, tipoLigacao: suggestedType}));
    };
    
    const handleValorContaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({...prev, valorConta: Number(value) / 100 }));
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    
    const setExample = (consumo: number, valor: number) => {
        setFormData(prev => ({ ...prev, consumo, valorConta: valor }));
    };
    
    const handleLigacaoSelect = (tipo: LigacaoType) => {
        setFormData(prev => ({ ...prev, tipoLigacao: tipo }));
    };
    
    const handleVehicleOptionSelect = (option: VehicleOption) => {
        setSelectedVehicleOption(option);
        setFormData(prev => ({...prev, veiculo: {...prev.veiculo, hasVehicle: option !== 'nao'}}));
    };

    const handleVehicleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, veiculo: {...prev.veiculo, [name]: name === 'consumption' || name === 'kmPerMonth' ? Number(value) : value }}));
    };
    
    const updateVehicleCalculations = useCallback(() => {
        if (!formData.veiculo.hasVehicle) {
             setFormData(prev => ({...prev, veiculo: {...prev.veiculo, monthlyConsumption: 0, savings: 0}}));
            return;
        }

        const vehicleData = VEHICLE_DATABASE[formData.veiculo.type];
        const consumption = vehicleData ? vehicleData.consumption : formData.veiculo.consumption;
        
        const monthlyConsumption = (formData.veiculo.kmPerMonth * consumption) / 100 * 0.9; // 90% carregado em casa
        
        const tarifaMedia = formData.consumo > 0 ? formData.valorConta / formData.consumo : 0.8;
        
        const fuelEfficiency = 12; // km/L
        const fuelPrice = 5.50; // R$/L
        const fuelCost = (formData.veiculo.kmPerMonth / fuelEfficiency) * fuelPrice;
        const electricCost = monthlyConsumption * tarifaMedia;
        const savings = fuelCost - electricCost;
        
        setFormData(prev => ({...prev, veiculo: {...prev.veiculo, monthlyConsumption, savings, consumption }}));

    }, [formData.veiculo.hasVehicle, formData.veiculo.type, formData.veiculo.kmPerMonth, formData.valorConta, formData.consumo, setFormData]);

    useEffect(() => {
        updateVehicleCalculations();
    }, [formData.veiculo.hasVehicle, formData.veiculo.type, formData.veiculo.kmPerMonth, updateVehicleCalculations]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const processFiles = (filesToProcess: File[]) => {
            let newFaturas: Attachment[] = [...formData.faturas];

            for (const file of filesToProcess) {
                if (newFaturas.length >= 3) {
                    alert('Você pode anexar no máximo 3 arquivos.');
                    break;
                }
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    alert(`O arquivo ${file.name} é muito grande (máximo 10MB).`);
                    continue;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        newFaturas.push({
                            name: file.name,
                            type: file.type,
                            data: event.target.result as string,
                        });
                         setFormData(prev => ({ ...prev, faturas: newFaturas }));
                    }
                };
                reader.readAsDataURL(file);
            }
        }
        processFiles(Array.from(files));
        e.target.value = '';
    };

    const handleRemoveFatura = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faturas: prev.faturas.filter((_, i) => i !== index),
        }));
    };

    const renderLigacaoOption = (type: LigacaoType, label: string, limit: string, color: string, icon: React.ReactNode) => {
        const isSelected = formData.tipoLigacao === type;
        
        const styles: Record<string, { selected: string, hover: string, badge: string, text: string }> = {
            blue: { selected: 'border-blue-500 bg-blue-50 ring-blue-200', hover: 'hover:border-blue-300 hover:bg-blue-50', badge: 'bg-blue-500', text: 'text-blue-700' },
            green: { selected: 'border-green-500 bg-green-50 ring-green-200', hover: 'hover:border-green-300 hover:bg-green-50', badge: 'bg-green-500', text: 'text-green-700' },
            purple: { selected: 'border-purple-500 bg-purple-50 ring-purple-200', hover: 'hover:border-purple-300 hover:bg-purple-50', badge: 'bg-purple-500', text: 'text-purple-700' },
            gray: { selected: 'border-gray-500 bg-gray-50 ring-gray-200', hover: 'hover:border-gray-300 hover:bg-gray-50', badge: 'bg-gray-500', text: 'text-gray-700' },
        };

        const s = styles[color] || styles.gray;

        return (
            <button 
                onClick={() => handleLigacaoSelect(type)}
                className={`
                    relative w-full p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2
                    ${isSelected 
                        ? `${s.selected} shadow-md ring-2 transform scale-105 z-10` 
                        : `border-gray-200 bg-white text-gray-500 ${s.hover}`
                    }
                `}
                type="button"
            >
                {isSelected && (
                    <div className={`absolute -top-2 -right-2 ${s.badge} text-white rounded-full p-1 shadow-sm transform scale-110`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                <div className={`text-3xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'grayscale opacity-60'}`}>{icon}</div>
                <div className="text-center">
                    <div className={`font-bold text-base leading-tight ${isSelected ? s.text : 'text-gray-600'}`}>{label}</div>
                    <div className="text-xs font-medium opacity-70 mt-1">{limit}</div>
                </div>
            </button>
        )
    };

    const renderVehicleOption = (option: VehicleOption, label: string, sublabel: string, color: string, icon: React.ReactNode) => {
        const isSelected = selectedVehicleOption === option;
        
        const styles: Record<string, { selected: string, hover: string, badge: string, text: string }> = {
            blue: { selected: 'border-blue-500 bg-blue-50 ring-blue-200', hover: 'hover:border-blue-300 hover:bg-blue-50', badge: 'bg-blue-500', text: 'text-blue-700' },
            green: { selected: 'border-green-500 bg-green-50 ring-green-200', hover: 'hover:border-green-300 hover:bg-green-50', badge: 'bg-green-500', text: 'text-green-700' },
            gray: { selected: 'border-gray-400 bg-gray-50 ring-gray-200', hover: 'hover:border-gray-300 hover:bg-gray-50', badge: 'bg-gray-400', text: 'text-gray-700' },
        };

        const s = styles[color] || styles.gray;

        return (
             <button 
                onClick={() => handleVehicleOptionSelect(option)}
                className={`
                    relative w-full p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2
                    ${isSelected 
                        ? `${s.selected} shadow-md ring-2 transform scale-105 z-10` 
                        : `border-gray-200 bg-white text-gray-500 ${s.hover}`
                    }
                `}
                type="button"
            >
                {isSelected && (
                     <div className={`absolute -top-2 -right-2 ${s.badge} text-white rounded-full p-1 shadow-sm transform scale-110`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                <div className={`text-3xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'grayscale opacity-60'}`}>{icon}</div>
                <div className="text-center">
                    <div className={`font-bold text-base leading-tight ${isSelected ? s.text : 'text-gray-600'}`}>{label}</div>
                    {sublabel && <div className="text-xs font-medium opacity-70 mt-1">{sublabel}</div>}
                </div>
            </button>
        );
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">💡 Análise de Consumo</h2>
                <p className="text-gray-600 text-base">Informe seu consumo para um cálculo preciso.</p>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
                {/* Inputs Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="consumo" className="block text-sm font-medium text-gray-700 mb-1">⚡ Consumo Mensal (kWh) <span className="text-red-500">*</span></label>
                        <input type="number" id="consumo" value={formData.consumo} onChange={handleConsumoChange} placeholder="Ex: 350" className={`w-full p-3 text-center text-xl font-bold border ${errors.consumo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-600 transition-shadow`} />
                        {errors.consumo && <p className="text-sm text-red-500 mt-1 text-center">{errors.consumo}</p>}
                    </div>
                    <div>
                        <label htmlFor="valor-conta" className="block text-sm font-medium text-gray-700 mb-1">💰 Valor Total da Conta (R$) <span className="text-red-500">*</span></label>
                        <input type="text" id="valor-conta" value={formatCurrency(formData.valorConta)} onChange={handleValorContaChange} placeholder="Ex: R$ 280,00" className={`w-full p-3 text-center text-xl font-bold border ${errors.valorConta ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-600 transition-shadow`} />
                        {errors.valorConta && <p className="text-sm text-red-500 mt-1 text-center">{errors.valorConta}</p>}
                    </div>
                </div>
                
                {/* Exemplos de Consumo */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 text-base text-center flex items-center justify-center gap-2">
                        📊 Exemplos de Consumo
                        <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Clique para selecionar</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <ConsumptionExample icon="🏠" consumo={200} valor={160} label="Pequena" onClick={() => setExample(200, 160)} isSelected={formData.consumo === 200} />
                        <ConsumptionExample icon="🏘️" consumo={350} valor={280} label="Média" onClick={() => setExample(350, 280)} isSelected={formData.consumo === 350} />
                        <ConsumptionExample icon="🏡" consumo={500} valor={400} label="Com Ar" onClick={() => setExample(500, 400)} isSelected={formData.consumo === 500} />
                        <ConsumptionExample icon="🏰" consumo={650} valor={520} label="Grande" onClick={() => setExample(650, 520)} isSelected={formData.consumo === 650} />
                        <ConsumptionExample icon="🏢" consumo={800} valor={640} label="Comércio" onClick={() => setExample(800, 640)} isSelected={formData.consumo === 800} />
                        <ConsumptionExample icon="🏭" consumo={1200} valor={960} label="Empresa" onClick={() => setExample(1200, 960)} isSelected={formData.consumo === 1200} />
                    </div>
                </div>

                {/* Faturas */}
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 space-y-4">
                     <h4 className="font-bold text-yellow-800 text-base flex items-center gap-2">
                        📄 Anexar Fatura de Energia <span className="text-xs font-normal bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Opcional</span>
                    </h4>
                    <p className="text-sm text-yellow-700">Para um orçamento mais preciso, anexe uma cópia da sua conta de luz.</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf" multiple style={{ display: 'none' }} />
                    <input type="file" ref={cameraInputRef} onChange={handleFileSelect} accept="image/*" capture="environment" style={{ display: 'none' }} />
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => cameraInputRef.current?.click()} className="flex-1 text-base bg-white border-2 border-blue-400 text-blue-600 p-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-sm font-bold">
                            <span>📷</span> Tirar Foto
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-base bg-white border-2 border-gray-400 text-gray-600 p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm font-bold">
                            <span>📎</span> Selecionar Arquivo
                        </button>
                    </div>
                    
                    {formData.faturas.length > 0 && (
                        <div className="bg-white rounded-lg border border-yellow-200 p-3 mt-3">
                            <h5 className="text-sm font-bold text-gray-700 mb-2">Arquivos Anexados ({formData.faturas.length}/3):</h5>
                            <ul className="space-y-2">
                                {formData.faturas.map((fatura, index) => (
                                    <li key={index} className="flex items-center justify-between bg-yellow-50 p-2 rounded text-sm border border-yellow-100">
                                        <div className="flex items-center overflow-hidden">
                                            <span className="mr-2">📄</span>
                                            <a href={fatura.data} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate" title={fatura.name}>
                                                {fatura.name}
                                            </a>
                                        </div>
                                        <button onClick={() => handleRemoveFatura(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors" aria-label={`Remover anexo ${fatura.name}`}>
                                            🗑️
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Tipo de Ligação & Veículo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">⚡ Tipo de Ligação <span className="text-gray-400 text-xs font-normal">(Automático)</span></h4>
                        <div className="grid grid-cols-3 gap-3">
                            {renderLigacaoOption('monofasico', 'Mono', '127v / 220v', 'blue', '⚡')}
                            {renderLigacaoOption('bifasico', 'Bifásico', '220v / 380v', 'green', '⚡⚡')}
                            {renderLigacaoOption('trifasico', 'Trifásico', 'Industrial', 'purple', '⚡⚡⚡')}
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                            <p className="font-bold mb-1">💡 Como descobrir?</p>
                            <ul className="space-y-1">
                                <li>📋 Na conta: "Tipo de Ligação"</li>
                                <li>🔌 Padrão: Conte os fios</li>
                                <li>🤖 Sugestão automática baseada no consumo</li>
                            </ul>
                        </div>
                    </div>
                     <div className="space-y-3">
                        <h4 className="font-bold text-gray-800 text-base">🚗 Possui Veículo Elétrico?</h4>
                        <div className="grid grid-cols-3 gap-3">
                             {renderVehicleOption('nao', 'Não', 'Sem VE', 'gray', '❌')}
                             {renderVehicleOption('tenho', 'Tenho', 'Já Possuo', 'green', '🔌')}
                             {renderVehicleOption('vou-comprar', 'Quero', 'Pretendo', 'blue', '🔜')}
                        </div>
                         <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-xs text-green-800">
                            <p className="font-bold mb-1">🌟 Benefícios</p>
                            <ul className="space-y-1">
                                <li>💰 R$ 0,15/km vs R$ 0,45/km</li>
                                <li>🌱 Zero emissões</li>
                                <li>🔧 70% menos manutenção</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Configuração Veículo */}
                {formData.veiculo.hasVehicle && (
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100 animate-fade-in">
                        <h4 className="font-bold text-green-800 text-base mb-4 flex items-center gap-2">
                            ⚙️ Configuração do Veículo
                        </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Veículo</label>
                                <select name="type" value={formData.veiculo.type} onChange={handleVehicleDataChange} className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                                    {Object.entries(VEHICLE_DATABASE).map(([key, {name, category}]) => <option key={key} value={key}>{name} ({category})</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem Mensal (km)</label>
                                <input type="number" name="kmPerMonth" value={formData.veiculo.kmPerMonth} onChange={handleVehicleDataChange} className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                             </div>
                         </div>
                         <div className="mt-4 p-4 bg-white rounded-lg border border-green-200 text-sm space-y-2 shadow-sm">
                             <div className="flex justify-between items-center">
                                 <span className="text-gray-600">Consumo adicional estimado:</span> 
                                 <span className="font-bold text-lg">{formData.veiculo.monthlyConsumption.toFixed(0)} kWh/mês</span>
                             </div>
                             <div className="flex justify-between items-center border-t pt-2">
                                 <span className="text-gray-600">Economia vs Combustível:</span> 
                                 <span className="font-bold text-green-600 text-lg">{formatCurrency(formData.veiculo.savings)}/mês</span>
                             </div>
                         </div>
                    </div>
                )}

            </div>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Step2Consumption;

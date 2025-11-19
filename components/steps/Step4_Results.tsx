
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import SchedulingModal from '../scheduling/SchedulingModal';
import Confetti from '../ui/Confetti';

const ResultCard: React.FC<{ icon: string; value: string; label: string; sublabel?: string, colorClass: string }> = ({ icon, value, label, sublabel, colorClass }) => (
    <div className={`text-white rounded-lg p-4 text-center ${colorClass}`}>
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium opacity-90">{label}</div>
        {sublabel && <div className="text-xs opacity-80 mt-0.5">{sublabel}</div>}
    </div>
);

const DetailRow: React.FC<{ label: string; value: string | number; valueClass?: string }> = ({ label, value, valueClass = '' }) => (
    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
        <span className="text-gray-600">{label}:</span>
        <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
);

const ConfirmationModal: React.FC<{ title: string; content: React.ReactNode; onClose: () => void }> = ({ title, content, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">{title}</h2>
            <div className="text-lg text-gray-700 font-medium">{content}</div>
            <button onClick={onClose} className="mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg text-lg font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 w-full">
                Fechar
            </button>
        </div>
        <style>{`
            @keyframes slide-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.3s ease; }
        `}</style>
    </div>
);

const WHATSAPP_PHONE_NUMBER = "5551991663470";

const Step4Results: React.FC = () => {
    const { formData, results, saveLeadToCloud } = useAppContext();
    const [confirmation, setConfirmation] = useState<{ title: string; content: React.ReactNode } | null>(null);
    const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (!results) {
        return <div className="text-center p-8 text-lg">Calculando resultados...</div>;
    }
    
    const generateReportText = (forWhatsApp: boolean): string => {
        const nl = forWhatsApp ? '%0A' : '\r\n';
        const boldStart = forWhatsApp ? '*' : '';
        const boldEnd = forWhatsApp ? '*' : '';
        const italicStart = forWhatsApp ? '_' : '';
        const italicEnd = forWhatsApp ? '_' : '';
        const divider = `${nl}--------------------------------------${nl}`;
    
        const formatTitle = (title: string) => {
            const upperTitle = title.toUpperCase();
            return forWhatsApp ? `*${upperTitle}*` : upperTitle;
        };
    
        let report = `☀️ ${boldStart}Solicitação de Orçamento Solar - SolarTek Pro${boldEnd} ☀️${nl}`;
        report += `${italicStart}Resumo da simulação realizada no site para ${formData.nome}.${italicEnd}${nl}`;
    
        report += divider;
    
        report += `👤 ${formatTitle("Dados do Cliente")}${nl}`;
        report += `   • ${boldStart}Nome:${boldEnd} ${formData.nome}${nl}`;
        if (formData.email) report += `   • ${boldStart}Email:${boldEnd} ${formData.email}${nl}`;
        if (formData.telefone) report += `   • ${boldStart}Telefone:${boldEnd} ${formData.telefone}${nl}`;
        report += `   • ${boldStart}Endereço:${boldEnd} ${formData.rua}, ${formData.numero} - ${formData.cidade}/${formData.estado}${nl}`;
    
        report += divider;
        
        report += `💡 ${formatTitle("Análise de Consumo")}${nl}`;
        report += `   • ${boldStart}Consumo Mensal:${boldEnd} ${formData.consumo} kWh${nl}`;
        report += `   • ${boldStart}Valor da Conta:${boldEnd} ${formatCurrency(formData.valorConta)}${nl}`;
        if (formData.veiculo.hasVehicle) {
            report += `   • ${boldStart}Veículo Elétrico:${boldEnd} Sim (+${formData.veiculo.monthlyConsumption.toFixed(0)} kWh/mês)${nl}`;
        }
        
        if (formData.faturas.length > 0) {
            report += `   • ${boldStart}Faturas Anexadas:${boldEnd} ${formData.faturas.length} arquivo(s)${nl}`;
        }
    
        report += divider;
    
        report += `⚙️ ${formatTitle("Sistema Solar Recomendado")}${nl}`;
        report += `   • ${boldStart}Tipo:${boldEnd} ${formData.sistema.charAt(0).toUpperCase() + formData.sistema.slice(1)}${nl}`;
        report += `   • ${boldStart}Potência:${boldEnd} ${results.potenciaReal.toFixed(1)} kWp (${results.numeroPaineis} painéis)${nl}`;
        report += `   • ${boldStart}Geração Estimada:${boldEnd} ~${results.geracaoMensal.toFixed(0)} kWh/mês${nl}`;
        
        report += divider;
    
        report += `📊 ${formatTitle("Análise Financeira")}${nl}`;
        report += `   • ${boldStart}Investimento Total:${boldEnd} ${boldStart}${formatCurrency(results.investimentoTotal)}${boldEnd}${nl}`;
        report += `   • ${boldStart}Nova Conta:${boldEnd} ${formatCurrency(results.novaContaMensal)} ${italicStart}(taxa mín.)${italicEnd}${nl}`;
        report += `   • ${boldStart}Economia Anual:${boldEnd} ${boldStart}${formatCurrency(results.economiaAnual)}${boldEnd}${nl}`;
        report += `   • ${boldStart}Retorno (Payback):${boldEnd} ~${results.payback.toFixed(1)} anos${nl}`;
        report += `   • ${boldStart}Lucro em 25 Anos:${boldEnd} ${formatCurrency(results.economia25Anos)}${nl}`;
        
        report += divider;
        report += `${nl}✅ ${boldStart}STATUS DO SISTEMA:${boldEnd}${nl}`;
        report += `Recebemos sua mensagem. Em breve um de nossos Especialistas irá entrar em contato.${nl}`;

        return report;
    };

    const handleWhatsAppClick = async () => {
        await saveLeadToCloud();
        const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${generateReportText(true)}`;
        
        // Confirmação Visual para o Cliente
        setConfirmation({ 
            title: "Sucesso!", 
            content: "Recebemos sua mensagem. Em breve um de nossos Especialistas irá entrar em contato." 
        });
        
        // Pequeno delay para garantir que o modal apareça antes de abrir a nova aba
        setTimeout(() => {
             window.open(url, '_blank');
        }, 1500);
    };

    const handleEmailClick = async () => {
        await saveLeadToCloud();
        const subject = `Solicitação de Orçamento Solar - ${formData.nome}`;
        const body = generateReportText(false);
        
        // Adiciona o e-mail do cliente em cópia (CC) para que ele receba o comprovante
        let url = `mailto:solartekpro@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (formData.email) {
            url += `&cc=${formData.email}`;
        }
        
        setConfirmation({ 
            title: "Sucesso!", 
            content: "Recebemos sua mensagem. Em breve um de nossos Especialistas irá entrar em contato." 
        });
        
        setTimeout(() => {
            window.location.href = url;
        }, 1500);
    };
    
    const handleScheduleConfirm = async (schedulingData: { dates: { date: string, times: string }[]; notes: string }) => {
        setIsSchedulingModalOpen(false);
        await saveLeadToCloud();
        const fullReport = generateReportText(true);
        const nl = '%0A';
        const divider = `${nl}--------------------------------------${nl}`;
        let schedulingRequest = `${nl}${divider}🗓️ *SOLICITAÇÃO DE VISITA TÉCNICA*${nl}Gostaria de agendar uma visita com base na simulação acima.${nl}${nl}*SUGESTÕES DE AGENDAMENTO:*${nl}`;
        schedulingData.dates.forEach(d => { schedulingRequest += `  • ${d.date}: ${d.times}${nl}`; });
        if (schedulingData.notes) { schedulingRequest += `${nl}*Observações:*${nl}${schedulingData.notes}${nl}`; }
        const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${fullReport + schedulingRequest}`;
        
        setConfirmation({ 
            title: "Agendamento Solicitado!", 
            content: "Recebemos sua mensagem. Em breve um de nossos Especialistas irá entrar em contato para confirmar o horário." 
        });
        
        setTimeout(() => {
            window.open(url, '_blank');
        }, 1500);
    };

    return (
        <div>
            <Confetti />
            {confirmation && <ConfirmationModal title={confirmation.title} content={confirmation.content} onClose={() => setConfirmation(null)} />}
            {isSchedulingModalOpen && <SchedulingModal formData={formData} onClose={() => setIsSchedulingModalOpen(false)} onConfirm={handleScheduleConfirm} />}

            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">🎉 Sua Simulação Solar Personalizada</h2>
                <p className="text-lg text-gray-600">Confira os resultados otimizados para você em {formData.cidade}, {formData.estado}.</p>
            </div>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <ResultCard icon="💰" value={formatCurrency(results.investimentoTotal)} label="Investimento Total" colorClass="bg-gradient-to-br from-green-500 to-green-600" />
                    <ResultCard icon="💸" value={formatCurrency(results.economiaAnual)} label="Economia Anual" colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
                    <ResultCard icon="📅" value={`${results.payback.toFixed(1)} anos`} label="Retorno do Investimento" sublabel="Payback Simples" colorClass="bg-gradient-to-br from-emerald-600 to-green-700" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-base font-bold text-gray-800 mb-4">💵 Resumo Financeiro Detalhado</h3>
                        <div className="space-y-2">
                            <DetailRow label="Painéis Solares (Estimado)" value={formatCurrency(results.custoPaineis)} />
                            <DetailRow label="Inversor (Estimado)" value={formatCurrency(results.custoInversor)} />
                            <DetailRow label="Estrutura e Montagem" value={formatCurrency(results.custoEstrutura)} />
                            <DetailRow label="Outras Despesas" value={formatCurrency(results.custoMaoDeObra)} />
                            {results.custoAdicional > 0 && (
                                <DetailRow label={`Adicionais (${formData.sistema})`} value={formatCurrency(results.custoAdicional)} valueClass="text-blue-600" />
                            )}
                            <div className="border-t my-3"></div>
                            <DetailRow label="Investimento Total Estimado" value={formatCurrency(results.investimentoTotal)} valueClass="font-extrabold text-green-700 text-lg" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-base font-bold text-gray-800 mb-4">📦 Equipamentos e Serviços Inclusos</h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-start"><span className="text-green-500 mr-2 mt-0.5">✔️</span> <div><strong>{results.numeroPaineis}x Painéis Solares</strong> de ~665W<br/><i className="text-gray-500">(Potência pode variar com a disponibilidade)</i></div></li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> <strong>1x Inversor Solar</strong> ({formData.sistema === 'ongrid' ? 'On-Grid' : formData.sistema === 'hybrid' ? 'Híbrido' : 'Off-Grid'})</li>
                            {formData.sistema !== 'ongrid' && (results.custoAdicional > 0) && (
                                <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> <strong>{formData.baterias.count || formData.offgrid.batteryCount}x Baterias</strong> ({formData.baterias.batteryData.name})</li>
                            )}
                            <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> Estrutura de Montagem Completa</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> Projeto Técnico e Aprovação (ART)</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> Instalação e Homologação na Concessionária</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> Cabeamento e Proteções (String Box)</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">✔️</span> Monitoramento do Sistema via App</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Pronto para o Próximo Passo?</h3>
                    <p className="text-gray-600 mb-6 text-base">Entre em contato para receber um orçamento formal ou agende uma visita técnica.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={handleWhatsAppClick} className="flex-1 bg-green-500 text-white px-5 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md">
                            <span>Orçamento via WhatsApp</span>
                        </button>
                        <button onClick={handleEmailClick} className="flex-1 bg-gray-700 text-white px-5 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md">
                           <span>Orçamento via E-mail</span>
                        </button>
                         <button onClick={() => setIsSchedulingModalOpen(true)} className="flex-1 bg-blue-600 text-white px-5 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md">
                            <span>Agendar Visita Técnica</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step4Results;

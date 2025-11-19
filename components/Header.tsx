
import React from 'react';
import { useAppContext } from '../context/AppContext';

const NavButton: React.FC<{ step: number; children: React.ReactNode }> = ({ step, children }) => {
    const { currentStep, completedSteps, handleGoToStep } = useAppContext();

    const isActive = currentStep === step;
    const isCompleted = completedSteps.includes(step) && !isActive;
    const isAccessible = currentStep > step || completedSteps.includes(step-1) || step === 1;

    const baseClasses = "step-nav px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0";
    const activeClasses = "bg-green-600 text-white shadow-md transform scale-105";
    const completedClasses = "bg-emerald-500 text-white";
    const defaultClasses = "bg-gray-100 text-gray-600 hover:bg-gray-200";
    const disabledClasses = "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400";

    const getClasses = () => {
        if (!isAccessible && !isActive) return `${baseClasses} ${disabledClasses}`;
        if (isActive) return `${baseClasses} ${activeClasses}`;
        if (isCompleted) return `${baseClasses} ${completedClasses}`;
        return `${baseClasses} ${defaultClasses}`;
    };

    return (
        <button onClick={() => handleGoToStep(step)} className={getClasses()} disabled={!isAccessible && !isActive}>
            {children}
        </button>
    );
};

const Header: React.FC = () => {
    const { currentStep, handleGoToStep, handlePrevStep, handleNextStep, handleResetForm } = useAppContext();
    const progress = (currentStep / 4) * 100;
    const nextButtonText = currentStep === 3 ? 'Calcular' : 'Continuar';

    if (currentStep === 0) {
        return null; // Don't render header on welcome screen
    }

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white text-white shadow-md transition-all duration-300">
                {/* Barra Superior Verde */}
                <div className="bg-gradient-to-r from-green-700 to-green-800 py-2 md:py-3 transition-all">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src="https://drive.google.com/thumbnail?id=1hlyKB3L9oHLtRSrCV-JNdQXpZELdML-p&sz=w1000" 
                                    alt="SolarTek Pro Logo" 
                                    className="h-10 md:h-12 w-auto object-contain transition-all duration-300" 
                                />
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-lg md:text-2xl font-bold leading-tight transition-all">SolarTek Pro</h1>
                                    <p className="text-green-100 text-xs md:text-sm hidden sm:block">Calculadora Solar Profissional</p>
                                </div>
                            </div>
                            
                            {/* Estatísticas - Apenas Desktop */}
                            <div className="hidden md:flex items-center space-x-6 opacity-90">
                                <div className="text-center"><div className="text-base font-bold leading-none">15+</div><div className="text-xs text-green-100">Anos</div></div>
                                <div className="text-center"><div className="text-base font-bold leading-none">5k+</div><div className="text-xs text-green-100">Projetos</div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra de Navegação Branca */}
                <div className="bg-white shadow-sm border-t border-green-200">
                    <div className="container mx-auto px-4 py-2 md:py-3">
                        {/* Barra de Progresso */}
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs md:text-sm font-medium text-gray-500">Progresso</span>
                            <span className="text-xs md:text-sm font-bold text-green-600">Etapa {currentStep} de 4</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 mb-3">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>

                        {/* Botões de Etapa - Com rolagem horizontal no mobile */}
                        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 md:justify-center scrollbar-hide mask-linear-fade">
                            <NavButton step={1}>1. Dados</NavButton>
                            <NavButton step={2}>2. Consumo</NavButton>
                            <NavButton step={3}>3. Sistema</NavButton>
                            <NavButton step={4}>4. Resultado</NavButton>
                        </div>

                        {/* Navegação Inferior (Voltar/Continuar) */}
                        {currentStep < 4 && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 md:hidden">
                                <button onClick={handlePrevStep} disabled={currentStep === 1} className="text-gray-500 px-3 py-1.5 rounded text-sm font-medium hover:text-gray-700 disabled:opacity-30">
                                    ← Voltar
                                </button>
                                <button onClick={handleNextStep} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-green-700 transition-colors flex items-center space-x-1">
                                    <span>{nextButtonText}</span> <span>→</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Espaçador para compensar o Header fixo - Altura dinâmica */}
            <div className="h-[150px] md:h-[180px]"></div>

            {/* Botão Flutuante 'Novo Orçamento' */}
            <div className="fixed bottom-6 right-6 z-[60]">
                {/* Desktop: Botão Estendido */}
                <button
                    onClick={handleResetForm}
                    className="hidden md:flex bg-yellow-400 text-green-900 px-5 py-3 rounded-full shadow-xl hover:bg-yellow-300 transition-all transform hover:scale-105 border-2 border-yellow-200 items-center space-x-2 font-bold"
                    title="Iniciar Novo Orçamento"
                >
                    <span className="text-xl">🔄</span>
                    <span>Novo Orçamento</span>
                </button>

                {/* Mobile: Botão Circular Compacto */}
                <button
                    onClick={handleResetForm}
                    className="md:hidden bg-yellow-400 text-green-900 w-14 h-14 rounded-full shadow-xl hover:bg-yellow-300 transition-all transform hover:scale-110 flex items-center justify-center border-2 border-yellow-200 active:scale-95"
                    title="Novo Orçamento"
                    aria-label="Iniciar Novo Orçamento"
                >
                    <span className="text-2xl">🔄</span>
                </button>
            </div>
        </>
    );
};

export default Header;

import React from 'react';
import { useAppContext } from '../../context/AppContext';

const WelcomeStep: React.FC = () => {
    const { handleGoToStep } = useAppContext();

    return (
        <div className="text-center animate-fade-in py-10">
             <div className="flex flex-col items-center justify-center space-y-4 mb-4">
                <img 
                    src="https://drive.google.com/thumbnail?id=1hlyKB3L9oHLtRSrCV-JNdQXpZELdML-p&sz=w1000" 
                    alt="SolarTek Pro Logo" 
                    className="h-32 w-auto object-contain drop-shadow-xl" 
                />
                <div>
                     <h1 className="text-3xl md:text-4xl font-extrabold text-green-800">Calculadora SolarTek Pro</h1>
                     <p className="text-gray-600 mt-1">Sua simulação completa em poucos passos.</p>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-700 mb-3">Descubra o potencial do sol na sua casa ou empresa!</h2>
                <p className="text-gray-600 mb-6">
                    Nossa calculadora interativa vai te mostrar o sistema ideal, o investimento necessário e, o mais importante,
                    <span className="font-bold text-green-600"> quanto você vai economizar</span> nos próximos anos.
                </p>
                <button
                    onClick={() => handleGoToStep(1)}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                >
                    Iniciar Simulação Gratuita →
                </button>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default WelcomeStep;
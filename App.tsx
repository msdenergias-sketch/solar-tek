
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Step0_Welcome from './components/steps/Step0_Welcome';
import Step1UserData from './components/steps/Step1_UserData';
import Step2Consumption from './components/steps/Step2_Consumption';
import Step3SystemConfig from './components/steps/Step3_SystemConfig';
import Step4Results from './components/steps/Step4_Results';

declare global {
    interface Window {
        data: {
            get: (key: string) => Promise<any>;
            set: (key: string, value: any) => Promise<void>;
        }
    }
}

const AppContent: React.FC = () => {
    const { currentStep } = useAppContext();

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <Step0_Welcome />;
            case 1: return <Step1UserData />;
            case 2: return <Step2Consumption />;
            case 3: return <Step3SystemConfig />;
            case 4: return <Step4Results />;
            default: return <div>Etapa desconhecida</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Header />
            <main className="container mx-auto px-4 pb-12 flex-grow w-full max-w-7xl">
                <div className="step-container">
                    {renderStep()}
                </div>
            </main>
            <Footer />
            <style>{`
                .step-container {
                    animation: fadeInStep 0.5s ease-in-out;
                }
                /* Esconde a barra de rolagem mas permite rolar */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes fadeInStep {
                    from {
                        opacity: 0;
                        transform: translateY(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;

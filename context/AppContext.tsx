import React, { createContext, useState, useCallback, useMemo, useEffect, useContext, ReactNode } from 'react';
import type { FormData, CalculationResults } from '../types';
import { INITIAL_FORM_DATA } from '../constants';
import { calculateResults } from '../services/solarCalculator';

interface AppContextType {
    currentStep: number;
    completedSteps: number[];
    formData: FormData;
    results: CalculationResults | null;
    validationErrors: Record<string, string>;
    visitorCount: number;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    handleNextStep: () => void;
    handlePrevStep: () => void;
    handleGoToStep: (step: number) => void;
    handleResetForm: () => void;
    saveLeadToCloud: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState<number>(0); // Start at Welcome screen
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [visitorCount, setVisitorCount] = useState<number>(0);

    useEffect(() => {
        const incrementAndFetchCount = async () => {
            if (window.data) {
                try {
                    const currentCount = await window.data.get('visitor_count');
                    const newCount = (typeof currentCount === 'number' ? currentCount : 0) + 1;
                    await window.data.set('visitor_count', newCount);
                    setVisitorCount(newCount);
                } catch (error) {
                    console.error("Failed to update visitor count:", error);
                     try {
                        await window.data.set('visitor_count', 1);
                        setVisitorCount(1);
                    } catch (set_error) {
                        console.error("Failed to initialize visitor count:", set_error);
                    }
                }
            }
        };
        incrementAndFetchCount();
    }, []);

    const results = useMemo(() => {
        if (completedSteps.includes(3)) {
            return calculateResults(formData);
        }
        return null;
    }, [formData, completedSteps]);

    const validateStep1 = useCallback(() => {
        const errors: Record<string, string> = {};
        if (!formData.nome) errors.nome = 'Nome é obrigatório.';
        if (!formData.email && !formData.telefone) errors.contato = 'E-mail ou Telefone é obrigatório.';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'E-mail inválido.';
        if (formData.telefone && formData.telefone.replace(/\D/g, '').length < 10) errors.telefone = 'Telefone inválido.';
        if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) errors.cep = 'CEP inválido.';
        if (!formData.rua) errors.rua = 'Rua é obrigatória.';
        if (!formData.numero) errors.numero = 'Número é obrigatório.';
        if (!formData.bairro) errors.bairro = 'Bairro é obrigatório.';
        if (!formData.cidade) errors.cidade = 'Cidade é obrigatória.';
        if (!formData.estado) errors.estado = 'Estado é obrigatório.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const validateStep2 = useCallback(() => {
        const errors: Record<string, string> = {};
        if (!formData.consumo || formData.consumo <= 0) errors.consumo = 'Consumo deve ser maior que zero.';
        if (!formData.valorConta || formData.valorConta <= 0) errors.valorConta = 'Valor da conta deve ser maior que zero.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);
    
    const validateStep3 = useCallback(() => {
        const errors: Record<string, string> = {};
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, []);

    const handleNextStep = useCallback(() => {
        let isValid = false;
        switch (currentStep) {
            case 1: isValid = validateStep1(); break;
            case 2: isValid = validateStep2(); break;
            case 3: isValid = validateStep3(); break;
            default: isValid = true;
        }

        if (isValid && currentStep < 4) {
            setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, validateStep1, validateStep2, validateStep3]);
    
    const handlePrevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleGoToStep = useCallback((step: number) => {
        if (step === 0) {
             setCurrentStep(0);
             return;
        }
        if (step < currentStep || completedSteps.includes(step - 1) || step === 1) {
            setCurrentStep(step);
        }
    }, [currentStep, completedSteps]);

    const handleResetForm = useCallback(() => {
        setCurrentStep(1);
        setCompletedSteps([]);
        setFormData(INITIAL_FORM_DATA);
        setValidationErrors({});
    }, []);

    const saveLeadToCloud = async (): Promise<boolean> => {
        try {
            if (window.data && window.data.set) {
                const finalResults = results || calculateResults(formData);
                const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const leadData = {
                    formData,
                    results: finalResults,
                    timestamp: new Date().toISOString(),
                };
                await window.data.set(leadId, leadData);
                console.log(`Lead ${leadId} saved successfully.`);
                return true;
            }
        } catch (error) {
            console.error("Failed to save lead data:", error);
        }
        return false;
    };


    const value = {
        currentStep,
        completedSteps,
        formData,
        results,
        validationErrors,
        visitorCount,
        setFormData,
        handleNextStep,
        handlePrevStep,
        handleGoToStep,
        handleResetForm,
        saveLeadToCloud,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

import React, { useState, useCallback } from 'react';
import type { FormData } from '../../types';
import { useAppContext } from '../../context/AppContext';

const InputField: React.FC<{ label: string, id: keyof FormData, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, placeholder: string, type?: string, required?: boolean, error?: string, children?: React.ReactNode, maxLength?: number }> = ({ label, id, value, onChange, placeholder, type = "text", required = true, error, children, maxLength }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                className={`w-full p-3 text-base border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            {children}
        </div>
        {error && <p id={`${id}-error`} className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

const Step1UserData: React.FC = () => {
    const { formData, setFormData, validationErrors: errors } = useAppContext();
    const [cepLoading, setCepLoading] = useState(false);
    const [cepMessage, setCepMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = e.target;
        value = value.replace(/\D/g, "").slice(0, 11);
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (value.length > 6) {
             value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d*)$/, '($1) $2');
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        setFormData(prev => ({ ...prev, telefone: value }));
    };

    const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { value } = e.target;
        value = value.replace(/\D/g, "").slice(0, 14);
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
        }
        setFormData(prev => ({ ...prev, documento: value }));
    };

    const buscarCEP = useCallback(async (cep: string) => {
        setCepLoading(true);
        setCepMessage('');
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) throw new Error('CEP não encontrado');
            setFormData(prev => ({ ...prev, rua: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }));
            setCepMessage('✅ Endereço encontrado!');
        } catch (error) {
            setCepMessage('❌ CEP não encontrado.');
        } finally {
            setCepLoading(false);
            setTimeout(() => setCepMessage(''), 3000);
        }
    }, [setFormData]);

    const handleCepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 5) value = value.replace(/(\d{5})(\d)/, '$1-$2');
        setFormData(prev => ({ ...prev, cep: value }));
        if (value.replace(/\D/g, '').length === 8) {
            buscarCEP(value.replace(/\D/g, ''));
        }
    }, [setFormData, buscarCEP]);

    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">👤 Dados Pessoais</h2>
                <p className="text-gray-600 text-base">Informe seus dados para personalizar a simulação</p>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Nome Completo" id="nome" value={formData.nome} onChange={handleChange} placeholder="Seu nome completo" error={errors.nome}/>
                    <InputField label="E-mail" id="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" type="email" required={!formData.telefone} error={errors.email || errors.contato} />
                    <InputField label="Telefone/WhatsApp" id="telefone" value={formData.telefone} onChange={handleTelefoneChange} placeholder="(00) 90000-0000" required={!formData.email} error={errors.telefone || errors.contato} maxLength={15}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="CEP" id="cep" value={formData.cep} onChange={handleCepChange} placeholder="00000-000" error={errors.cep}>
                        {cepLoading && <div className="absolute right-2 top-3 animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>}
                         <div className="absolute right-9 top-3.5" aria-live="polite">
                             {cepMessage && <p className={`text-xs font-bold ${cepMessage.includes('❌') ? 'text-red-500' : 'text-green-600'}`}>{cepMessage}</p>}
                         </div>
                    </InputField>
                     <InputField label="Rua" id="rua" value={formData.rua} onChange={handleChange} placeholder="Nome da rua" error={errors.rua}/>
                     <InputField label="Número" id="numero" value={formData.numero} onChange={handleChange} placeholder="123" error={errors.numero}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <InputField label="Bairro" id="bairro" value={formData.bairro} onChange={handleChange} placeholder="Nome do bairro" error={errors.bairro}/>
                     <InputField label="Cidade" id="cidade" value={formData.cidade} onChange={handleChange} placeholder="Sua cidade" error={errors.cidade}/>
                     <InputField label="Estado (UF)" id="estado" value={formData.estado} onChange={handleChange} placeholder="SP" maxLength={2} error={errors.estado}/>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <InputField label="CPF/CNPJ (Opcional)" id="documento" value={formData.documento} onChange={handleDocumentoChange} placeholder="000.000.000-00" required={false} maxLength={18}/>
                     <InputField label="Complemento (Opcional)" id="complemento" value={formData.complemento} onChange={handleChange} placeholder="Apto, Bloco, etc." required={false}/>
                     <InputField label="Ponto de Referência (Opcional)" id="pontoReferencia" value={formData.pontoReferencia} onChange={handleChange} placeholder="Próximo a..." required={false}/>
                 </div>
                 <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                    <h4 className="font-bold text-blue-900 mb-1 text-base">📞 Contato Flexível</h4>
                    <p>✅ Preencha E-mail OU Telefone (ou ambos). Recomendamos WhatsApp para uma resposta mais rápida.</p>
                 </div>
                 <div className="bg-green-50 rounded-lg p-4 text-sm text-green-800">
                     <h4 className="font-bold text-green-900 mb-1 text-base">🔒 Privacidade Garantida</h4>
                    <p>Seus dados são protegidos e usados exclusivamente para a simulação e envio do orçamento.</p>
                 </div>
            </div>
        </div>
    );
};

export default Step1UserData;
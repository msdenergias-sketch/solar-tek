
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Footer: React.FC = () => {
    const { visitorCount } = useAppContext();
    
    return (
        <>
            <section className="bg-gradient-to-r from-green-700 to-green-800 text-white py-6 md:py-8 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">🌟 SolarTek Pro - Energia Solar Profissional</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                            <div className="bg-green-600/50 backdrop-blur-sm rounded-lg p-3 md:p-4 hover:bg-green-600 transition-colors">
                                <div className="text-lg md:text-xl font-bold text-green-100">15+</div>
                                <div className="text-xs md:text-sm text-green-200">Anos de Mercado</div>
                            </div>
                            <div className="bg-green-600/50 backdrop-blur-sm rounded-lg p-3 md:p-4 hover:bg-green-600 transition-colors">
                                <div className="text-lg md:text-xl font-bold text-green-100">5.000+</div>
                                <div className="text-xs md:text-sm text-green-200">Projetos Entregues</div>
                            </div>
                            <div className="bg-green-600/50 backdrop-blur-sm rounded-lg p-3 md:p-4 hover:bg-green-600 transition-colors">
                                <div className="text-lg md:text-xl font-bold text-green-100">98%</div>
                                <div className="text-xs md:text-sm text-green-200">Clientes Satisfeitos</div>
                            </div>
                            <div className="bg-green-600/50 backdrop-blur-sm rounded-lg p-3 md:p-4 hover:bg-green-600 transition-colors">
                                <div className="text-lg md:text-xl font-bold text-green-100">24/7</div>
                                <div className="text-xs md:text-sm text-green-200">Suporte Técnico</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="bg-gray-900 text-white py-6">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <img 
                                src="https://drive.google.com/thumbnail?id=1hlyKB3L9oHLtRSrCV-JNdQXpZELdML-p&sz=w1000" 
                                alt="SolarTek Pro Logo" 
                                className="h-8 w-auto object-contain" 
                            />
                            <span className="text-lg font-bold tracking-wide">SolarTek Pro</span>
                        </div>
                        <div className="hidden md:block text-gray-600">|</div>
                        <div className="text-xs md:text-sm text-gray-400">
                            Todos os direitos reservados &copy; {new Date().getFullYear()}
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-8 text-sm text-gray-400">
                        <a href="https://wa.me/5551991663470" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-800">
                            <span>📞</span> (51) 99166-3470
                        </a>
                        <a href="mailto:solartekpro@gmail.com" className="hover:text-blue-400 transition-colors flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-800">
                            <span>📧</span> solartekpro@gmail.com
                        </a>
                    </div>

                    {visitorCount > 0 && (
                         <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 mt-6 border-t border-gray-800 pt-4 max-w-xs mx-auto">
                            <span>👁️</span>
                            <span>{visitorCount.toLocaleString('pt-BR')} Visualizações</span>
                        </div>
                    )}
                </div>
            </footer>
        </>
    );
};

export default Footer;

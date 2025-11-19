
import type { FormData, CalculationResults, BatteryConfig, OffGridConfig } from '../types';
import { BATTERY_DATABASE } from '../constants';

export const calculateBatteryConfig = (consumo: number, config: Omit<BatteryConfig, 'batteryData' | 'count' | 'cost' | 'capacity' | 'usableCapacity' | 'systemVoltage' | 'strings' | 'batteriesPerString'>): BatteryConfig => {
    const selectedBattery = BATTERY_DATABASE[config.type];
    const effectiveDod = Math.min(config.dod, selectedBattery.maxDod);
    const consumoDiario = consumo / 30;
    const consumoHorario = consumoDiario / 24;
    const consumoBackup = consumoHorario * config.autonomy * config.load;
    const consumoReal = consumoBackup / selectedBattery.efficiency;
    const capacidadeUtil = selectedBattery.capacity * effectiveDod;
    
    let systemVoltage = 12;
    let batteriesInSeries = 1;
    
    if (config.systemConfig === 'auto') {
        if (consumoReal > 10) systemVoltage = 48;
        else if (consumoReal > 5) systemVoltage = 24;
        else systemVoltage = 12;
    } else {
        systemVoltage = parseInt(config.systemConfig.replace('v', ''));
    }
    
    if (selectedBattery.voltage < systemVoltage) {
        batteriesInSeries = systemVoltage / selectedBattery.voltage;
    }

    const capacidadePorString = capacidadeUtil * batteriesInSeries;
    const stringsNecessarias = Math.ceil(consumoReal / capacidadePorString);
    const numeroBaterias = stringsNecessarias * batteriesInSeries;
    const custoTotal = numeroBaterias * selectedBattery.cost;

    return {
        ...config,
        count: numeroBaterias,
        cost: custoTotal,
        capacity: numeroBaterias * selectedBattery.capacity,
        usableCapacity: numeroBaterias * capacidadeUtil,
        batteryData: selectedBattery,
        systemVoltage,
        strings: stringsNecessarias,
        batteriesPerString: batteriesInSeries
    };
};

export const calculateOffGridConfig = (consumo: number, config: Omit<OffGridConfig, 'batteryCount' | 'extraPanels' | 'cost'>): OffGridConfig => {
    const consumoDiario = consumo / 30;
    const consumoTotal = consumoDiario * config.autonomyDays;
    const consumoComSeguranca = consumoTotal * 1.3; // 30% safety factor
    const capacidadeBateriaUtil = 5.12 * config.dod;
    const numeroBaterias = Math.ceil(consumoComSeguranca / capacidadeBateriaUtil);
    
    const potenciaBase = consumo * 1.2 / 150;
    const potenciaExtra = numeroBaterias * 0.5;
    const paineisExtras = Math.ceil(potenciaExtra / 0.665);

    const custoBaterias = numeroBaterias * 8500;
    const custoPaineis = paineisExtras * 800;
    const custoInversorControlador = 7000;
    const custoTotal = custoBaterias + custoPaineis + custoInversorControlador;
    
    return {
        ...config,
        batteryCount: numeroBaterias,
        extraPanels: paineisExtras,
        cost: custoTotal,
    };
};


export const calculateResults = (data: FormData): CalculationResults => {
    const { consumo, valorConta, tipoLigacao, veiculo, sistema, baterias, offgrid } = data;
    
    const consumoTotal = consumo + (veiculo.hasVehicle ? veiculo.monthlyConsumption : 0);
    const tarifaMedia = valorConta > 0 && consumo > 0 ? valorConta / consumo : 0.80;
    
    // Potência necessária com 20% de perdas/segurança e irradiação média de 5 kWh/m²/dia * 30 dias = 150
    const potenciaSistema = consumoTotal * 1.2 / 150;
    
    const potenciaPainel = 0.665; // 665W
    const numeroPaineis = Math.ceil(potenciaSistema / potenciaPainel);
    const potenciaReal = numeroPaineis * potenciaPainel;
    
    const custoDisponibilidadeKwh: Record<string, number> = {
        monofasico: 30,
        bifasico: 50,
        trifasico: 100
    };
    
    const kwhDisponibilidade = custoDisponibilidadeKwh[tipoLigacao] || 30;
    const valorDisponibilidade = kwhDisponibilidade * tarifaMedia;
    
    const custoPorKwp = 4200;
    const custoSistemaBase = potenciaReal * custoPorKwp;
    let custoAdicional = 0;
    let investimentoTotal = custoSistemaBase;

    if (sistema === 'hybrid') {
        custoAdicional = baterias.cost;
        investimentoTotal += custoAdicional;
    } else if (sistema === 'offgrid') {
        // Recalcula o custo base para offgrid + custo adicional de baterias/componentes
        const custoBaseOffgrid = potenciaReal * 5500;
        custoAdicional = offgrid.cost;
        investimentoTotal = custoBaseOffgrid + custoAdicional;
    }

    // Detalhamento de custos (estimativa)
    const custoPaineis = custoSistemaBase * 0.45;
    const custoInversor = custoSistemaBase * 0.15;
    const custoEstrutura = custoSistemaBase * 0.15;
    const custoMaoDeObra = custoSistemaBase * 0.25;
    
    let economiaContaAnual = 0;
    let novaContaMensal = 0;

    if (sistema === 'offgrid') {
        economiaContaAnual = valorConta * 12;
        novaContaMensal = 0;
    } else {
        economiaContaAnual = (valorConta - valorDisponibilidade) * 12;
        novaContaMensal = valorDisponibilidade;
    }
    
    const economiaVeiculoAnual = veiculo.hasVehicle ? veiculo.savings * 12 : 0;
    const economiaAnual = economiaContaAnual + economiaVeiculoAnual;
    
    const payback = economiaAnual > 0 ? investimentoTotal / economiaAnual : Infinity;
    const economia25Anos = (economiaAnual * 25) - investimentoTotal;

    return {
        investimentoTotal,
        potenciaSistema,
        potenciaReal,
        numeroPaineis,
        payback,
        economiaAnual,
        economia25Anos,
        areaNecessaria: numeroPaineis * 2.8,
        geracaoMensal: potenciaReal * 150,
        novaContaMensal,
        kwhDisponibilidade,
        custoSistemaBase,
        custoAdicional,
        economiaContaAnual,
        economiaVeiculoAnual,
        custoPaineis,
        custoInversor,
        custoEstrutura,
        custoMaoDeObra,
    };
};
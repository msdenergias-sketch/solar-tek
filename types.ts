
export type SystemType = 'ongrid' | 'hybrid' | 'offgrid';
export type LigacaoType = 'monofasico' | 'bifasico' | 'trifasico';
export type VehicleOption = 'nao' | 'tenho' | 'vou-comprar';

export interface Attachment {
    name: string;
    type: string;
    data: string; // base64 data URI
}

export interface BatteryData {
    capacity: number;
    voltage: number;
    cycles: number;
    efficiency: number;
    cost: number;
    name: string;
    maxDod: number;
    warranty: number;
}

export interface BatteryConfig {
    autonomy: number;
    load: number;
    type: string;
    dod: number;
    systemConfig: string;
    count: number;
    cost: number;
    capacity: number;
    usableCapacity: number;
    batteryData: BatteryData;
    systemVoltage: number;
    strings: number;
    batteriesPerString: number;
}

export interface OffGridConfig {
    autonomyDays: number;
    dod: number;
    batteryCount: number;
    extraPanels: number;
    cost: number;
}

export interface VehicleConfig {
    hasVehicle: boolean;
    type: string;
    kmPerMonth: number;
    consumption: number; // kWh/100km
    monthlyConsumption: number; // kWh
    savings: number; // R$
}

export interface FormData {
    // Step 1
    nome: string;
    email: string;
    telefone: string;
    documento: string;
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    pontoReferencia: string;
    
    // Step 2
    consumo: number;
    valorConta: number;
    tipoLigacao: LigacaoType;
    veiculo: VehicleConfig;
    faturas: Attachment[];
    
    // Step 3
    sistema: SystemType;
    baterias: BatteryConfig;
    offgrid: OffGridConfig;
}

export interface CalculationResults {
    investimentoTotal: number;
    potenciaSistema: number;
    potenciaReal: number;
    numeroPaineis: number;
    payback: number;
    economiaAnual: number;
    economia25Anos: number;
    areaNecessaria: number;
    geracaoMensal: number;
    novaContaMensal: number;
    kwhDisponibilidade: number;
    custoSistemaBase: number;
    custoAdicional: number;
    economiaContaAnual: number;
    economiaVeiculoAnual: number;
    custoPaineis: number;
    custoInversor: number;
    custoEstrutura: number;
    custoMaoDeObra: number;
}
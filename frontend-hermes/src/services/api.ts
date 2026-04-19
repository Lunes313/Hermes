const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hermes-two-eta.vercel.app/api/v1';

export interface PQRSDInput {
  texto: string;
}

export interface PQRSDOutput {
  nombre: string;
  dependencias: string[];
  tipo_pqrs: string;
  lugar: string;
  asunto?: string;
  hechos?: string;
  territorio?: string;
}

export interface PQRSD {
  id: number;
  asunto: string;
  canal: string;
  remitente: string;
  texto: string;
  radicado: string;
  estado: string;
  dependencia_asignada: string;
  tipo_pqrs: string;
  lugar: string;
  nombre_identificado: string;
  fecha_creacion: string;
  fecha_vencimiento: string;
}

export type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export const api = {
  async analyze(texto: string): Promise<PQRSDOutput> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });
    if (!response.ok) throw new Error('Failed to analyze');
    return response.json();
  },

  async create(data: {
    asunto: string;
    canal: string;
    remitente: string;
    texto: string;
    nombre?: string;
    email?: string;
    tipo?: string;
    territorio?: string;
  }): Promise<PQRSD> {
    const response = await fetch(`${API_BASE_URL}/pqrsd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create PQRSD');
    return response.json();
  },

  async list(): Promise<PQRSD[]> {
    const response = await fetch(`${API_BASE_URL}/pqrsd`);
    if (!response.ok) throw new Error('Failed to fetch PQRSDs');
    return response.json();
  },

  async get(id: number): Promise<PQRSD> {
    const response = await fetch(`${API_BASE_URL}/pqrsd/${id}`);
    if (!response.ok) throw new Error('Failed to fetch PQRSD');
    return response.json();
  },

  async chatInteract(history: ChatHistoryMessage[]): Promise<{ respuesta: string, analisis: PQRSDOutput, radicado?: string }> {
    const response = await fetch(`${API_BASE_URL}/chat/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });
    if (!response.ok) throw new Error('Failed to interact with chat');
    return response.json();
  }
};

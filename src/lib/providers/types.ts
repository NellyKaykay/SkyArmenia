// src/lib/providers/types.ts
/**
 * Contratos comunes para los conectores de aerolíneas (FlyOne, Blackstone).
 * 👉 Sin dependencias. Solo tipos/Interfaces.
 * 👉 Fechas:
 *    - SearchRequest.depart / return: 'YYYY-MM-DD'
 *    - Segment.departure / arrival: ISO 8601 completo (ej. '2025-09-10T12:30:00Z')
 */

export type ProviderId = 'flyone' | 'blackstone';
export type TripType = 'oneway' | 'round';
export type Cabin = 'economy' | 'premium_economy' | 'business';

// IATA: usamos string (3 letras) a nivel de tipo; validación real se hará en runtime.
export type IATACode = string;

/** Pasajeros por tipo. infants no ocupa asiento. */
export interface PassengerMix {
  adults: number;      // >= 1
  children?: number;   // 2–11
  infants?: number;    // <2
}

/** Petición de búsqueda normalizada para todos los proveedores. */
export interface SearchRequest {
  origin: IATACode;         // ej. 'BCN'
  destination: IATACode;    // ej. 'EVN'
  depart: string;           // 'YYYY-MM-DD'
  return?: string;          // 'YYYY-MM-DD' si trip === 'round'
  trip: TripType;           // 'oneway' | 'round'
  cabin?: Cabin;            // preferencia (si el proveedor soporta)
  passengers: PassengerMix;
  bags?: number;            // nº de maletas facturadas solicitadas
}

/** Dinero en una divisa. amounts en unidades (no céntimos). */
export interface Money {
  amount: number;
  currency: 'EUR' | 'USD' | 'AMD' | string;
}

/** Tramo de vuelo. */
export interface Segment {
  marketingCarrier: string;   // ej. 'FZ', 'W9'
  operatingCarrier?: string;  // si distinto
  flightNumber: string;       // ej. 'W95412'
  origin: IATACode;
  destination: IATACode;
  departure: string;          // ISO 8601 completo
  arrival: string;            // ISO 8601 completo
  durationMinutes: number;
  aircraft?: string;
}

/** Itinerario: 1+ segmentos (directo o con escalas). */
export interface Itinerary {
  segments: Segment[];
}

/** Información de equipaje incluida. */
export interface BaggageInfo {
  includedCheckedBags?: number;  // maletas facturadas incluidas
  includedCarryOn?: boolean;     // equipaje de mano incluido
  notes?: string;                // texto libre (p.ej. "10kg hand luggage")
}

/** Precio desglosado opcionalmente. */
export interface Price {
  total: Money;            // obligatorio
  base?: Money;
  taxes?: Money;
  perAdult?: Money;
  perChild?: Money;
  perInfant?: Money;
  fees?: Money;
}

/** Oferta devuelta por un proveedor (formato normalizado mínimo). */
export interface ProviderOffer {
  provider: ProviderId;
  providerCode?: string;      // código interno/tarifa del proveedor, si aplica
  deeplink?: string;          // URL de compra (si existe)
  itinerary: Itinerary;
  price: Price;
  cabin?: Cabin;
  fareClass?: string;         // ej. 'Y', 'M', 'J'...
  refundable?: boolean;
  baggage?: BaggageInfo;
  extras?: Record<string, unknown>; // campos específicos del proveedor
  raw?: unknown;              // respuesta cruda del proveedor para debug
}

/** Resultado "lote" por proveedor. */
export interface ProviderBatchResult {
  provider: ProviderId;
  durationMs: number;
  offers: ProviderOffer[];
  error?: string;             // si el conector falló, describir el error
}

/** Contrato que debe implementar cada conector. */
export interface Provider {
  id: ProviderId;

  /**
   * Ejecuta la búsqueda en el proveedor y devuelve ofertas normalizadas.
   * Debe:
   *  - mapear SearchRequest al formato del proveedor
   *  - hacer scraping o llamadas HTTP necesarias
   *  - normalizar al tipo ProviderOffer
   *  - NO lanzar error por "sin resultados" (devuelve [])
   *  - lanzar error solo por fallos técnicos (timeout, parse, etc.)
   */
  search(req: SearchRequest): Promise<ProviderOffer[]>;

  /** Comprobación de salud opcional para /api/db-check u otros diagnósticos. */
  health?(): Promise<{ ok: boolean; details?: Record<string, unknown> }>;
}

/** Respuesta final del endpoint /api/search (agregada de varios proveedores). */
export interface AggregatedSearchResponse {
  ok: boolean;
  query: SearchRequest;
  results: ProviderBatchResult[]; // uno por proveedor consultado
  totalOffers: number;
  tookMs: number;
}

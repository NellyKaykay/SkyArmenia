// tests/test-book.js
// Test simple para el endpoint POST /api/aerocrs/book
// Vuelo de TLV → LHR

const BASE_URL = 'http://localhost:5173';

async function testBooking() {
  try {
    const body = {
      offerId: 'aerocrs-API401-Y-Basic-2026-06-15-0', // reemplaza con un offerId válido para TLV→LHR
      origin: 'TLV',
      destination: 'LHR',
      passengers: [
        {
          type: 'ADT',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1985-05-15',
          email: 'john.doe@example.com'
        }
      ]
    };

    console.log('[Test] Enviando POST a /api/aerocrs/book con body:', body);

    const res = await fetch(`${BASE_URL}/api/aerocrs/book`, {
      method: 'POST',             // 🔑 POST obligatorio
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[Test] HTTP status:', res.status);

    const data = await res.json();
    console.log('[Test] Respuesta del endpoint:', data);
  } catch (err) {
    console.error('[Test] ERROR:', err);
  }
}

// Ejecuta la prueba
testBooking();

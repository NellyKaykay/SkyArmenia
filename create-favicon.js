// Script para crear un favicon moderno para SkyArmenia
const fs = require('fs');
const { createCanvas } = require('canvas');

function createFavicon() {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 32, 32);
    
    // Color azul de SkyArmenia
    ctx.fillStyle = '#38b6ff';
    
    // Dibujar tiles simplificados
    ctx.fillRect(4, 8, 6, 6);
    ctx.fillRect(12, 8, 6, 6);
    ctx.fillRect(20, 8, 6, 6);
    
    // Dibujar forma de avión simple
    ctx.beginPath();
    ctx.moveTo(8, 18);
    ctx.lineTo(16, 20);
    ctx.lineTo(24, 18);
    ctx.lineTo(20, 22);
    ctx.lineTo(12, 22);
    ctx.closePath();
    ctx.fill();
    
    // Guardar como PNG (luego convertir a ICO)
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('static/favicon-32.png', buffer);
    
    console.log('Favicon PNG generado: static/favicon-32.png');
    console.log('Usar una herramienta online para convertir a ICO');
}

// Solo ejecutar si node canvas está disponible
try {
    createFavicon();
} catch (error) {
    console.log('Canvas no disponible. Usar generador HTML manual.');
}
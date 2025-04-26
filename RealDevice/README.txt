Proyecto: EEG Viewer - Real Device (BrainBit)
⚡ Instrucciones rápidas para correr
1. Importante: El Web Bluetooth SOLO funciona en HTTPS o localhost
No puedes abrir el archivo index_real.html directamente con doble click (file://).

Debes levantar un servidor local o usar HTTPS.

2. Cómo levantar un servidor local fácil 🚀
Si tienes Node.js instalado:

bash
Copiar
Editar
npm install -g serve
Y luego en la carpeta de tu proyecto:

bash
Copiar
Editar
serve .
Te dará algo como:

arduino
Copiar
Editar
✔  Serving!
- Local:    http://localhost:3000
👉 Ahora abres en tu navegador http://localhost:3000/index_real.html

¡Y podrás conectar tu BrainBit! 🎯

3. Alternativa ultra rápida (sin instalar nada)
Con Python si lo tienes:

bash
Copiar
Editar
python -m http.server
Y accedes igual a http://localhost:8000/.

📁 Estructura de archivos
pgsql
Copiar
Editar
/EEG-Viewer/
│
├── index_real.html       (Para el BrainBit real)
├── style_real.css        (Estilos para el modo real)
├── script_real.js        (Código JavaScript conexión Brainbit)
├── index.html            (Para modo Simulación)
├── style.css             (Estilos modo Simulación)
├── script.js             (Código Simulación)
📋 Requisitos mínimos
Navegador compatible con Web Bluetooth API (Chrome recomendado)

Node.js instalado si quieres usar serve

Tu dispositivo BrainBit cargado y encendido 🔋

Permitir Bluetooth en el navegador


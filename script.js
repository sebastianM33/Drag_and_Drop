// --- JAVASCRIPT (Fase 2: Renderizado) ---

// 1. Configuración: Definimos las columnas fijas
// CORRECCIÓN: Nombres de clases actualizados para coincidir con tu CSS (.estado-en-progreso, .estado-completado)
const COLUMNAS_FIJAS = [
    { id: 'por-hacer', titulo: 'Por Hacer', claseColor: 'estado-por-hacer' },
    { id: 'en-proceso', titulo: 'En Progreso', claseColor: 'estado-en-progreso' },
    { id: 'terminado', titulo: 'Completado', claseColor: 'estado-completado' }
];

// 2. Datos de Prueba (Simulando una base de datos)
const proyectos = [
    { id: 'proy-1', nombre: 'Mi Primer Proyecto' }
];

const tareas = [
    { 
        id: 't1', 
        idProyecto: 'proy-1', 
        estado: 'por-hacer', 
        contenido: 'Diseñar la UI', 
        prioridad: 'alta', 
        responsable: 'Yo'
    },
    { 
        id: 't2', 
        idProyecto: 'proy-1', 
        estado: 'en-proceso', 
        contenido: 'Aprender JavaScript', 
        prioridad: 'media', 
        responsable: 'Seba'
    }
];

let idProyectoActual = 'proy-1'; // Proyecto seleccionado por defecto

// 3. Referencias al HTML
// CORRECCIÓN: Asegúrate de que tu contenedor principal en HTML tenga id="tablero"
const tablero = document.getElementById('tablero');

// 4. Función Principal: Renderizar (Pintar) el Tablero
function renderizarTablero() {
    console.log("Renderizando tablero..."); 

    // Verificamos que el tablero exista antes de intentar limpiarlo
    if (!tablero) {
        console.error("No se encontró el elemento con id='tablero' en el HTML");
        return;
    }

    tablero.innerHTML = ''; // Limpiamos el tablero antes de pintar

    // Recorremos las columnas configuradas
    COLUMNAS_FIJAS.forEach(columna => {
        // A. Creamos el contenedor de la columna
        const divColumna = document.createElement('div');
        // CORRECCIÓN: Cambiado de 'columna' a 'columna-tablero' para coincidir con tu CSS
        divColumna.className = 'columna-tablero'; 
        divColumna.id = columna.id;

        // B. Filtramos las tareas que van en ESTA columna y ESTE proyecto
        const tareasDeLaColumna = tareas.filter(t => 
            t.estado === columna.id && t.idProyecto === idProyectoActual
        );

        // C. Construimos el HTML interno de la columna
        divColumna.innerHTML = `
            <div class="cabecera-columna">
                <span class="titulo-columna">
                    <span class="punto-estado ${columna.claseColor}"></span>
                    ${columna.titulo}
                </span>
                <span class="contador-tareas">${tareasDeLaColumna.length}</span>
            </div>
            <div class="lista-tareas"></div>
        `;

        // D. Inyectamos las tarjetas dentro de la lista
        const contenedorLista = divColumna.querySelector('.lista-tareas');
        
        tareasDeLaColumna.forEach(tarea => {
            const htmlTarjeta = crearHTMLTarjeta(tarea);
            contenedorLista.appendChild(htmlTarjeta);
        });

        // E. Agregamos la columna terminada al tablero
        tablero.appendChild(divColumna);
    });
}

// 5. Función auxiliar para crear el diseño de la tarjeta
function crearHTMLTarjeta(tarea) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';
    tarjeta.id = tarea.id;

    // Colores de prioridad dinámicos
    let clasePrioridad = 'p-media';
    if (tarea.prioridad === 'alta') clasePrioridad = 'p-alta';
    if (tarea.prioridad === 'baja') clasePrioridad = 'p-baja';

    tarjeta.innerHTML = `
        <div class="cabecera-tarjeta">
            <span class="etiqueta-prioridad ${clasePrioridad}">${tarea.prioridad.toUpperCase()}</span>
        </div>
        <div class="contenido-tarjeta">${tarea.contenido}</div>
        <div class="meta-tarjeta">
            <span class="etiqueta-responsable">👤 ${tarea.responsable}</span>
        </div>
    `;

    return tarjeta;
}

// 6. ¡Arrancar motores! Ejecutamos la función al cargar
document.addEventListener('DOMContentLoaded', () => {
    renderizarTablero();
    
    // Lógica para el menú desplegable en móvil
    const menuToggle = document.getElementById('menuToggle');
    const controlesGlobales = document.getElementById('controlesGlobales');

    if (menuToggle && controlesGlobales) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            controlesGlobales.classList.toggle('active');
        });

        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!controlesGlobales.contains(e.target) && !menuToggle.contains(e.target)) {
                controlesGlobales.classList.remove('active');
            }
        });

        // Cerrar el menú al hacer clic en cualquier botón del desplegable (excepto el select)
        const botonesMenu = controlesGlobales.querySelectorAll('button');
        botonesMenu.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    controlesGlobales.classList.remove('active');
                }
            });
        });

        // Para el select, cerramos solo cuando se cambie la opción
        const selectProyecto = document.getElementById('selectProyecto');
        if (selectProyecto) {
            selectProyecto.addEventListener('change', () => {
                if (window.innerWidth <= 768) {
                    controlesGlobales.classList.remove('active');
                }
            });
        }
    }
});
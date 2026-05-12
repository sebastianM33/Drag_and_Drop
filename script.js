// --- JAVASCRIPT: LÓGICA COMPLETA DE OVERDRIVE ---

// 1. CONFIGURACIÓN
const COLUMNAS_FIJAS = [
    { id: 'por-hacer', titulo: 'Por Hacer', claseColor: 'estado-por-hacer' },
    { id: 'en-proceso', titulo: 'En Progreso', claseColor: 'estado-en-progreso' },
    { id: 'terminado', titulo: 'Completado', claseColor: 'estado-completado' }
];

// 2. DATOS INICIALES (SEMILLA)
const proyectosPorDefecto = [
    { id: 'proy-1', nombre: '🚀 Mi Primer Overdrive' }
];

const tareasPorDefecto = [
    { 
        id: 't1', 
        idProyecto: 'proy-1', 
        estado: 'por-hacer', 
        contenido: 'Estrenar el tablero', 
        prioridad: 'alta', 
        responsable: 'Yo',
        fechaVencimiento: '2025-12-31'
    }
];

// 3. GESTIÓN DE ESTADO (LOCALSTORAGE)
function cargarDatos(clave, valorPorDefecto) {
    try {
        const datos = JSON.parse(localStorage.getItem(clave));
        return Array.isArray(datos) ? datos : valorPorDefecto;
    } catch (e) { return valorPorDefecto; }
}

let proyectos = cargarDatos('overdrive-proyectos', proyectosPorDefecto);
let tareas = cargarDatos('overdrive-tareas', tareasPorDefecto);

let idProyectoActual = proyectos[0]?.id || ''; 
let itemArrastrado = null;

// 4. REFERENCIAS DOM
const tablero = document.getElementById('tablero');
const selectProyecto = document.getElementById('selectProyecto');

// 5. INICIALIZACIÓN
function iniciar() {
    renderizarSelectProyecto();
    if (!idProyectoActual && proyectos.length > 0) {
        idProyectoActual = proyectos[0].id;
    }
    renderizarTablero();
}

// 6. RENDERIZADO (VISTA)
function renderizarSelectProyecto() {
    if (!selectProyecto) return;
    selectProyecto.innerHTML = '';
    proyectos.forEach(proy => {
        const opcion = document.createElement('option');
        opcion.value = proy.id;
        opcion.textContent = proy.nombre;
        if (proy.id === idProyectoActual) opcion.selected = true;
        selectProyecto.appendChild(opcion);
    });
    if (proyectos.length === 0) selectProyecto.innerHTML = '<option>--- Sin Proyectos ---</option>';
}

function renderizarTablero() {
    if (!tablero) return;
    tablero.innerHTML = ''; // Limpiar

    if (!idProyectoActual) return;

    COLUMNAS_FIJAS.forEach(columna => {
        const divColumna = document.createElement('div');
        divColumna.className = 'columna-tablero';
        divColumna.id = columna.id;

        const tareasFiltradas = tareas.filter(t => 
            t.estado === columna.id && t.idProyecto === idProyectoActual
        );

        divColumna.innerHTML = `
            <div class="cabecera-columna">
                <span class="titulo-columna">
                    <span class="punto-estado ${columna.claseColor}"></span>
                    ${columna.titulo}
                </span>
                <span class="contador-tareas">${tareasFiltradas.length}</span>
            </div>
            <div class="lista-tareas"></div>
        `;

        const contenedorLista = divColumna.querySelector('.lista-tareas');
        configurarZonaSoltar(contenedorLista, columna.id);

        tareasFiltradas.forEach(tarea => {
            contenedorLista.appendChild(crearHTMLTarjeta(tarea));
        });

        tablero.appendChild(divColumna);
    });
}

function crearHTMLTarjeta(tarea) {
    const el = document.createElement('div');
    el.className = 'tarjeta';
    el.id = tarea.id;
    el.draggable = true;

    if (tarea.estado === 'terminado') el.classList.add('completada');

    let claseP = 'p-media';
    if (tarea.prioridad === 'alta') claseP = 'p-alta';
    if (tarea.prioridad === 'baja') claseP = 'p-baja';

    let htmlFecha = '';
    if (tarea.fechaVencimiento) {
        htmlFecha = `<span style="display:flex; align-items:center; gap:4px; font-size:0.75rem; color:var(--peligro)">
            📅 ${tarea.fechaVencimiento}
        </span>`;
    }

    el.innerHTML = `
        <div class="cabecera-tarjeta" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="etiqueta-prioridad ${claseP}">${tarea.prioridad.toUpperCase()}</span>
            <button class="btn-eliminar-tarea" onclick="eliminarTarea('${tarea.id}', event)">×</button>
        </div>
        <div class="contenido-tarjeta">${tarea.contenido}</div>
        <div class="meta-tarjeta">
            ${htmlFecha}
            <span class="etiqueta-responsable">👤 ${tarea.responsable || 'Sin asignar'}</span>
        </div>
    `;

    // Eventos Drag
    el.addEventListener('dragstart', (e) => {
        itemArrastrado = tarea;
        e.target.classList.add('arrastrando');
        e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', (e) => {
        e.target.classList.remove('arrastrando');
        itemArrastrado = null;
        document.querySelectorAll('.lista-tareas').forEach(l => l.classList.remove('drag-over'));
    });

    return el;
}

// 7. DRAG & DROP LOGIC
function configurarZonaSoltar(elemento, nuevoEstado) {
    elemento.addEventListener('dragover', (e) => {
        e.preventDefault();
        elemento.classList.add('drag-over');
    });
    elemento.addEventListener('dragleave', (e) => {
        elemento.classList.remove('drag-over');
    });
    elemento.addEventListener('drop', (e) => {
        e.preventDefault();
        elemento.classList.remove('drag-over');
        if (itemArrastrado) {
            const idx = tareas.findIndex(t => t.id === itemArrastrado.id);
            if (idx > -1) {
                tareas[idx].estado = nuevoEstado;
                guardarTareas();
                renderizarTablero();
            }
        }
    });
}

// 8. CONTROLADORES (ACCIONES)
function cambiarProyecto(id) {
    idProyectoActual = id;
    renderizarTablero();
}

function crearProyecto() {
    const nombre = document.getElementById('nombreNuevoProyecto').value.trim();
    if (nombre) {
        const nuevo = { id: 'proy-' + Date.now(), nombre: nombre };
        proyectos.push(nuevo);
        idProyectoActual = nuevo.id;
        guardarProyectos();
        renderizarSelectProyecto();
        renderizarTablero();
        cerrarModal('modalProyecto');
        document.getElementById('nombreNuevoProyecto').value = '';
    }
}

function guardarNuevaTarea() {
    if (!idProyectoActual) return alert("Crea un proyecto primero");
    
    const contenido = document.getElementById('contenidoNuevaTarea').value.trim();
    const resp = document.getElementById('responsableNuevaTarea').value.trim();
    const prio = document.getElementById('prioridadNuevaTarea').value;
    const fecha = document.getElementById('fechaNuevaTarea').value;
    const est = document.getElementById('estadoNuevaTarea').value;

    if (contenido) {
        const nueva = {
            id: 'tarea-' + Date.now(),
            idProyecto: idProyectoActual,
            estado: est,
            contenido: contenido,
            prioridad: prio,
            responsable: resp,
            fechaVencimiento: fecha
        };
        tareas.push(nueva);
        guardarTareas();
        renderizarTablero();
        cerrarModal('modalTarea');
        
        // Limpiar
        document.getElementById('contenidoNuevaTarea').value = '';
        document.getElementById('responsableNuevaTarea').value = '';
        document.getElementById('fechaNuevaTarea').value = '';
    }
}

function eliminarTarea(id, e) {
    e.stopPropagation();
    if(confirm("¿Borrar tarea?")) {
        tareas = tareas.filter(t => t.id !== id);
        guardarTareas();
        renderizarTablero();
    }
}

function resetearTodo() {
    if(confirm("⚠ ¡Se borrará TODO!")) {
        localStorage.removeItem('overdrive-proyectos');
        localStorage.removeItem('overdrive-tareas');
        location.reload();
    }
}

// 9. PERSISTENCIA
function guardarProyectos() { localStorage.setItem('overdrive-proyectos', JSON.stringify(proyectos)); }
function guardarTareas() { localStorage.setItem('overdrive-tareas', JSON.stringify(tareas)); }

// 10. MODALES
function abrirModalProyecto() { 
    document.getElementById('modalProyecto').classList.add('activo'); 
    document.getElementById('nombreNuevoProyecto').focus();
}
function abrirModalTarea() { 
    document.getElementById('modalTarea').classList.add('activo'); 
    document.getElementById('contenidoNuevaTarea').focus();
}
function cerrarModal(id) { document.getElementById(id).classList.remove('activo'); }

window.onclick = (e) => { if(e.target.classList.contains('capa-modal')) e.target.classList.remove('activo'); }

// INICIAR Y GESTIONAR EVENTOS DOM
document.addEventListener('DOMContentLoaded', () => {
    iniciar();
    
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
        if (selectProyecto) {
            selectProyecto.addEventListener('change', () => {
                if (window.innerWidth <= 768) {
                    controlesGlobales.classList.remove('active');
                }
            });
        }
    }
});
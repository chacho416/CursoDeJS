// ============================================
// LISTA DE TAREAS - CURSO DE JAVASCRIPT
// ============================================
// Este archivo contiene toda la lógica de nuestra
// aplicación de lista de tareas (To-Do App)
// ============================================

// ============================================
// PASO 1: Seleccionar elementos del DOM
// ============================================
// Primero necesitamos "agarrar" los elementos HTML
// con los que vamos a trabajar

const formulario = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputFecha = document.getElementById('input-fecha');
const inputCategoria = document.getElementById('input-categoria');
const listaTareas = document.getElementById('lista-tareas');
const contadorPendientes = document.getElementById('contador-pendientes');
const botonesFiltro = document.querySelectorAll('.filtro');
const btnModo = document.getElementById('btn-modo');

// ============================================
// PASO 2: Estado de la aplicación
// ============================================
// El "estado" son los datos que nuestra app necesita
// para funcionar correctamente

// Array que guarda todas las tareas
let tareas = [];

// El filtro actualmente seleccionado
let filtroActual = 'todas';

// ============================================
// PASO 3: Cargar tareas del localStorage
// ============================================
// Cuando abrimos la página, queremos recuperar
// las tareas que guardamos anteriormente

function cargarTareas() {
    // Intentamos obtener las tareas guardadas
    const tareasGuardadas = localStorage.getItem('tareas');

    // Si hay tareas guardadas, las convertimos de JSON a array
    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
        console.log('✅ Tareas cargadas:', tareas.length);
    } else {
        console.log('📝 No hay tareas guardadas, empezando desde cero');
    }

    // Mostramos las tareas en pantalla
    renderizarTareas();
}

// ============================================
// PASO 4: Guardar tareas en localStorage
// ============================================
// Cada vez que modificamos las tareas, las guardamos
// para que persistan al cerrar el navegador

function guardarTareas() {
    // Convertimos el array a texto JSON y lo guardamos
    localStorage.setItem('tareas', JSON.stringify(tareas));
    console.log('💾 Tareas guardadas');
}

// ============================================
// PASO 5: Agregar nueva tarea
// ============================================
// Función que se ejecuta cuando el usuario
// quiere agregar una nueva tarea

function agregarTarea(texto, fecha, categoria) {
    // Creamos un objeto con la información de la tarea
    const nuevaTarea = {
        id: Date.now(),        // ID único basado en la fecha/hora actual
        texto: texto,          // El texto que escribió el usuario
        completada: false,     // Inicialmente no está completada
        fecha: fecha || null,  // Fecha límite (ISO yyyy-mm-dd) o null
        categoria: categoria || 'General'
    };

    // Agregamos la tarea al inicio del array (para que aparezca arriba)
    tareas.unshift(nuevaTarea);

    // Guardamos en localStorage
    guardarTareas();

    // Actualizamos la pantalla
    renderizarTareas();

    console.log('➕ Nueva tarea agregada:', texto);
}

// ============================================
// PASO 6: Cambiar estado de tarea
// ============================================
// Cuando el usuario hace clic en el checkbox,
// cambiamos entre completada/pendiente

function toggleTarea(id) {
    // Usamos map para crear un nuevo array
    // modificando solo la tarea con el ID indicado
    tareas = tareas.map(tarea => {
        if (tarea.id === id) {
            // Invertimos el valor de completada (true -> false, false -> true)
            return { ...tarea, completada: !tarea.completada };
        }
        return tarea;
    });

    guardarTareas();
    renderizarTareas();

    console.log('🔄 Tarea actualizada:', id);
}

// ============================================
// PASO 7: Eliminar tarea
// ============================================
// Cuando el usuario hace clic en el botón de eliminar

function eliminarTarea(id) {
    // Usamos filter para crear un nuevo array
    // SIN la tarea que queremos eliminar
    tareas = tareas.filter(tarea => tarea.id !== id);

    guardarTareas();
    renderizarTareas();

    console.log('🗑️ Tarea eliminada:', id);
}

// ============================================
// PASO 7b: Editar tarea
// ============================================
// Actualiza el texto de una tarea existente

function editarTarea(id, nuevoTexto) {
    tareas = tareas.map(tarea => {
        if (tarea.id === id) {
            return { ...tarea, texto: nuevoTexto };
        }
        return tarea;
    });

    guardarTareas();
    renderizarTareas();

    console.log('✏️ Tarea editada:', id, nuevoTexto);
}

// ============================================
// PASO 8: Filtrar tareas
// ============================================
// Devuelve las tareas según el filtro seleccionado

function filtrarTareas() {
    switch (filtroActual) {
        case 'pendientes':
            // Solo las que NO están completadas
            return tareas.filter(tarea => !tarea.completada);
        case 'completadas':
            // Solo las que SÍ están completadas
            return tareas.filter(tarea => tarea.completada);
        default:
            // Todas las tareas
            return tareas;
    }
}

// ============================================
// PASO 9: Renderizar tareas
// ============================================
// "Renderizar" significa mostrar en pantalla
// Esta función actualiza la lista visual de tareas

function renderizarTareas() {
    // Obtenemos las tareas según el filtro activo
    const tareasFiltradas = filtrarTareas();

    // Limpiamos la lista actual
    listaTareas.innerHTML = '';

    // Si no hay tareas, mostramos un mensaje
    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = `
            <li class="sin-tareas">
                ${filtroActual === 'todas'
                    ? '¡No hay tareas! Agrega una nueva.'
                    : `No hay tareas ${filtroActual}.`}
            </li>
        `;
        actualizarContador();
        return;
    }

    // Creamos el HTML para cada tarea
    tareasFiltradas.forEach(tarea => {
        // Creamos el elemento li (list item)
        const li = document.createElement('li');

        // Agregamos las clases CSS
        li.className = `tarea ${tarea.completada ? 'completada' : ''}`;
            // Añadir atributo data-id para referencia
            li.setAttribute('data-id', tarea.id);

        // Preparar HTML de fecha, categoría y badge según vencimiento
        let fechaHTML = '';
        let badgeHTML = '';
        let categoriaHTML = `<span class="badge categoria">${escaparHTML(tarea.categoria || 'General')}</span>`;
        if (tarea.fecha) {
            const dias = calcularDiasRestantes(tarea.fecha);
            fechaHTML = `<span class="tarea-fecha">${escaparHTML(formatoFecha(tarea.fecha))}</span>`;
            if (dias < 0) {
                badgeHTML = `<span class="badge vencida">Vencida</span>`;
                li.classList.add('vencida');
            } else if (dias === 0) {
                badgeHTML = `<span class="badge hoy">Vence hoy</span>`;
                li.classList.add('vence-hoy');
            } else if (dias <= 3) {
                badgeHTML = `<span class="badge pronto">Por vencer (${dias}d)</span>`;
                li.classList.add('por-vencer');
            }
        }
        // Agregamos el contenido HTML usando template literals
        li.innerHTML = `
            <input
                type="checkbox"
                ${tarea.completada ? 'checked' : ''}
                aria-label="Marcar como ${tarea.completada ? 'pendiente' : 'completada'}"
            >
            <span class="tarea-texto">${escaparHTML(tarea.texto)}</span>
            <div class="tarea-meta">
                ${categoriaHTML}
                ${fechaHTML}
                ${badgeHTML}
            </div>
            <button class="btn-editar" aria-label="Editar tarea">✏️</button>
            <button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button>
        `;

        // Agregamos el evento al checkbox
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => toggleTarea(tarea.id));

        // Agregamos el evento al botón editar
        const btnEditar = li.querySelector('.btn-editar');
        btnEditar.addEventListener('click', () => {
            const spanTexto = li.querySelector('.tarea-texto');
            const inputEdicion = document.createElement('input');
            inputEdicion.type = 'text';
            inputEdicion.className = 'input-edicion';
            inputEdicion.value = tarea.texto;

            li.replaceChild(inputEdicion, spanTexto);
            inputEdicion.focus();
            inputEdicion.select();

            const guardar = () => {
                const nuevoTexto = inputEdicion.value.trim();
                if (nuevoTexto && nuevoTexto !== tarea.texto) {
                    editarTarea(tarea.id, nuevoTexto);
                } else {
                    renderizarTareas();
                }
            };

            const cancelar = () => renderizarTareas();

            inputEdicion.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') guardar();
                if (e.key === 'Escape') cancelar();
            });

            inputEdicion.addEventListener('blur', guardar);
        });

        // Agregamos el evento al botón eliminar con animación
        const btnEliminar = li.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => {
            // Añadir clase que dispara la animación CSS
            li.classList.add('remover');

            // Esperar la duración de la animación antes de eliminar de los datos
            // Duración sincronizada con CSS (0.35s)
            setTimeout(() => eliminarTarea(tarea.id), 350);
        });

        // Agregamos el li a la lista
        listaTareas.appendChild(li);
    });

    // Actualizamos el contador
    actualizarContador();
}

// ============================================
// PASO 10: Actualizar contador
// ============================================
// Muestra cuántas tareas pendientes hay

function actualizarContador() {
    // Contamos las tareas que NO están completadas
    const pendientes = tareas.filter(tarea => !tarea.completada).length;
    contadorPendientes.textContent = pendientes;
}

// Calcula cuántos días faltan desde hoy hasta la fecha (fecha ISO yyyy-mm-dd)
function calcularDiasRestantes(fechaIso) {
    const hoy = new Date();
    // Normalizar horas para comparar solo fechas
    const utcHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const f = new Date(fechaIso + 'T00:00:00');
    const utcFecha = Date.UTC(f.getFullYear(), f.getMonth(), f.getDate());
    const msPorDia = 24 * 60 * 60 * 1000;
    return Math.round((utcFecha - utcHoy) / msPorDia);
}

// Formatea fecha ISO a formato local dd/mm/yyyy
function formatoFecha(fechaIso) {
    const f = new Date(fechaIso + 'T00:00:00');
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = String(f.getMonth() + 1).padStart(2, '0');
    const anio = f.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

// ============================================
// PASO 11: Función auxiliar de seguridad
// ============================================
// Evita que alguien inyecte código HTML malicioso

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// PASO 12: Configurar eventos
// ============================================
// Conectamos las acciones del usuario con nuestras funciones

// Evento cuando se envía el formulario (agregar tarea)
formulario.addEventListener('submit', (e) => {
    // Prevenimos que la página se recargue
    e.preventDefault();

    // Obtenemos el texto y quitamos espacios extras
    const texto = inputTarea.value.trim();

    // Si hay texto, agregamos la tarea (incluyendo fecha si existe)
    if (texto) {
        const fecha = inputFecha && inputFecha.value ? inputFecha.value : null;
        const categoria = inputCategoria && inputCategoria.value ? inputCategoria.value : 'General';
        agregarTarea(texto, fecha, categoria);
        inputTarea.value = '';  // Limpiamos el input
        if (inputFecha) inputFecha.value = '';
        if (inputCategoria) inputCategoria.value = 'General';
        inputTarea.focus();     // Devolvemos el foco al input
    }
});

// Eventos para los botones de filtro
botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        // Quitamos la clase 'activo' de todos los botones
        botonesFiltro.forEach(b => b.classList.remove('activo'));

        // Agregamos 'activo' al botón que se clickeó
        boton.classList.add('activo');

        // Actualizamos el filtro actual con el valor del data-filtro
        filtroActual = boton.dataset.filtro;

        // Volvemos a renderizar para mostrar las tareas filtradas
        renderizarTareas();

        console.log('🔍 Filtro cambiado a:', filtroActual);
    });
});

// ============================================
// MODO OSCURO
// ============================================
function aplicarModo(modo) {
    if (modo === 'dark') {
        document.body.classList.add('dark');
        if (btnModo) btnModo.textContent = '☀️';
        localStorage.setItem('modo', 'dark');
    } else {
        document.body.classList.remove('dark');
        if (btnModo) btnModo.textContent = '🌙';
        localStorage.setItem('modo', 'light');
    }
}

if (btnModo) {
    btnModo.addEventListener('click', () => {
        const esDark = document.body.classList.contains('dark');
        aplicarModo(esDark ? 'light' : 'dark');
    });
}

// Inicializar modo según preferencia guardada
const modoGuardado = localStorage.getItem('modo') || 'light';
aplicarModo(modoGuardado);

// ============================================
// PASO 13: Iniciar la aplicación
// ============================================
// Cuando la página termina de cargar, iniciamos todo

cargarTareas();

console.log('🚀 ¡Aplicación de tareas lista!');
console.log('💡 Tip: Abre la consola del navegador (F12) para ver los logs');

// Algoritmo de Huffman
function codificarHuffman(texto) {
    if (!texto) return { codificado: "", codigos: {}, arbol: null };
    const frecuencias = {};
    for (const char of texto) {
        frecuencias[char] = (frecuencias[char] || 0) + 1;
    }
    let nodos = Object.entries(frecuencias).map(([char, freq]) => ({
        char,
        freq,
        left: null,
        right: null
    }));
    while (nodos.length > 1) {
        nodos.sort((a, b) => a.freq - b.freq);
        const left = nodos.shift();
        const right = nodos.shift();
        nodos.push({
            char: null,
            freq: left.freq + right.freq,
            left,
            right
        });
    }
    const arbol = nodos[0];
    const codigos = {};
    function recorrer(nodo, camino) {
        if (!nodo.left && !nodo.right) {
            codigos[nodo.char] = camino || "0";
            return;
        }
        if (nodo.left) recorrer(nodo.left, camino + "0");
        if (nodo.right) recorrer(nodo.right, camino + "1");
    }
    recorrer(arbol, "");
    let resultado = "";
    for (const char of texto) {
        resultado += codigos[char];
    }
    return { codificado: resultado, codigos, arbol };
}

function decodificarHuffman(binario, caracteres) {
    if (!binario || !caracteres) return "";
    const frecuencias = {};
    for (const char of caracteres) {
        frecuencias[char] = (frecuencias[char] || 0) + 1;
    }
    let nodos = Object.entries(frecuencias).map(([char, freq]) => ({
        char,
        freq,
        left: null,
        right: null
    }));
    while (nodos.length > 1) {
        nodos.sort((a, b) => a.freq - b.freq);
        const left = nodos.shift();
        const right = nodos.shift();
        nodos.push({
            char: null,
            freq: left.freq + right.freq,
            left,
            right
        });
    }
    const arbol = nodos[0];
    let resultado = "";
    let nodoActual = arbol;
    for (const bit of binario) {
        nodoActual = bit === "0" ? nodoActual.left : nodoActual.right;
        if (!nodoActual.left && !nodoActual.right) {
            resultado += nodoActual.char;
            nodoActual = arbol;
        }
    }
    return resultado;
}

function calcularMetricasHuffman(texto, codificado, codigos) {
    const total = texto.length;
    const frecuencias = {};
    for (const char of texto) {
        frecuencias[char] = (frecuencias[char] || 0) + 1;
    }
    let longitudPromedio = 0;
    for (const char in frecuencias) {
        const p = frecuencias[char] / total;
        longitudPromedio += p * codigos[char].length;
    }
    let entropia = 0;
    for (const char in frecuencias) {
        const p = frecuencias[char] / total;
        entropia -= p * Math.log2(p);
    }
    const eficiencia = longitudPromedio === 0 ? 0 : (entropia / longitudPromedio) * 100;
    const bitsOriginal = texto.length * 8;
    const bitsCodificado = codificado.length;
    const tasaCompresion = bitsCodificado / bitsOriginal;
    return {
        tasaCompresion: tasaCompresion.toFixed(3),
        eficiencia: eficiencia.toFixed(2) + "%",
        longitudPromedio: longitudPromedio.toFixed(3)
    };
}

// Manejo de selección de opción (collapse)
let opcionSeleccionada = "codificar";
document.querySelectorAll('.opcion-codificacion').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.opcion-codificacion').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('btn-opcion').innerHTML = this.textContent + ' <i class="bi bi-chevron-down"></i>';
        opcionSeleccionada = this.getAttribute('data-value');

        const inputTexto = document.getElementById('input-texto');
        const inputCodificado = document.getElementById('input-codificado');

        if (opcionSeleccionada === "decodificar") {
            inputTexto.classList.remove("d-none");
            inputCodificado.classList.remove("d-none");
            inputTexto.placeholder = "Ingresar caracteres originales";
            inputCodificado.placeholder = "Ingresar secuencia de 0 y 1";
        } else {
            inputTexto.classList.remove("d-none");
            inputCodificado.classList.add("d-none");
            inputTexto.placeholder = "Ingresar texto a codificar";
        }

        const collapse = bootstrap.Collapse.getOrCreateInstance(document.getElementById('collapseOpciones'));
        collapse.hide();
    });
});

function mostrarResultadosHuffman({entrada, salida, tasaCompresion, eficiencia, longitudPromedio}) {
    document.getElementById("resultado-huffman").classList.remove("d-none");
    document.getElementById("resultado-huffman").classList.add("d-block");
    document.getElementById("contenido-inicial").classList.remove("d-block");
    document.getElementById("contenido-inicial").classList.add("d-none");

    document.getElementById('textarea-entrada').value = entrada;
    document.getElementById('textarea-salida').value = salida;
    document.getElementById('tasa-compresion').value = tasaCompresion;
    document.getElementById('eficiencia').value = eficiencia;
    document.getElementById('longitud-promedio').value = longitudPromedio;

    document.getElementById("btn-volver").onclick = function() {
        document.getElementById("resultado-huffman").classList.remove("d-block");
        document.getElementById("resultado-huffman").classList.add("d-none");
        document.getElementById("contenido-inicial").classList.remove("d-none");
        document.getElementById("contenido-inicial").classList.add("d-block");
    };
}

// Confirmar: alterna display y muestra resultado o advertencia
document.getElementById("btn-confirmar").addEventListener("click", function() {
    if (opcionSeleccionada === "codificar") {
        const texto = document.getElementById("input-texto").value.trim();
        if (texto === "") {
            alert("Por favor, ingresa un texto para codificar.");
            return;
        }
        const resultado = codificarHuffman(texto);
        const metricas = calcularMetricasHuffman(texto, resultado.codificado, resultado.codigos);
        mostrarResultadosHuffman({
            entrada: texto,
            salida: resultado.codificado,
            tasaCompresion: metricas.tasaCompresion,
            eficiencia: metricas.eficiencia,
            longitudPromedio: metricas.longitudPromedio
        });
    } else {
        const binario = document.getElementById("input-codificado").value.trim();
        const caracteres = document.getElementById("input-texto").value.trim();

        // Restricción: no permitir caracteres repetidos
        const set = new Set(caracteres);
        if (set.size !== caracteres.length) {
            alert("No se permite ingresar caracteres repetidos en el campo de caracteres originales.");
            return;
        }

        if (binario === "" || caracteres === "") {
            alert("Por favor, ingresa tanto la secuencia de 0 y 1 como los caracteres originales.");
            return;
        }
        const decodificado = decodificarHuffman(binario, caracteres);
        const resultado = codificarHuffman(caracteres);
        const metricas = calcularMetricasHuffman(caracteres, binario, resultado.codigos);
        mostrarResultadosHuffman({
            entrada: binario,
            salida: decodificado,
            tasaCompresion: metricas.tasaCompresion,
            eficiencia: metricas.eficiencia,
            longitudPromedio: metricas.longitudPromedio
        });
    }
});

// Botón volver: alterna display de los bloques
function agregarEventoVolver() {
    const btnVolver = document.getElementById("btn-volver");
    const contenidoInicial = document.getElementById("contenido-inicial");
    const resultadoDiv = document.getElementById("resultado-huffman");
    if (btnVolver) {
        btnVolver.onclick = function() {
            resultadoDiv.classList.remove("d-block");
            resultadoDiv.classList.add("d-none");
            contenidoInicial.classList.remove("d-none");
            contenidoInicial.classList.add("d-block");
        };
    }
}

function actualizarChevronIcon() {
    const chevron = document.getElementById('chevron-icon').firstElementChild;
    if (window.innerWidth < 768) {
        chevron.className = 'bi bi-chevron-down';
    } else {
        chevron.className = 'bi bi-chevron-right';
    }
}

// Llama a la función al cargar y al redimensionar
window.addEventListener('DOMContentLoaded', actualizarChevronIcon);
window.addEventListener('resize', actualizarChevronIcon);
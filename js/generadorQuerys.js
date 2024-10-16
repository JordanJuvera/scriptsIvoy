function leerArchivo() {
    const input = document.getElementById('archivoInput');
    const file = input.files[0];

    if (file) {
        const lector = new FileReader();

        lector.onload = function (e) {
            const contenido = e.target.result;
            procesarCSV(contenido);
        };

        lector.readAsText(file);
    } else {
        alert('No se seleccionó ningún archivo.');
    }
}

function procesarCSV(csv) {

    const lineas = csv.split('\n');
    const datos = lineas.map(linea => linea.split(','));

    // Puedes hacer lo que quieras con los datos aquí
    const tabla = document.getElementById('tablaDatos');

    // Limpiar la tabla antes de agregar nuevos datos
    tabla.innerHTML = '';
    
   

    let arrayObjetos = ordenarNumeros(datos)

    


    // Agregar encabezados de columna basados en las claves del primer objeto
    //Quitar primer elemento del array para pintar headers
    headers = arrayObjetos.shift();
    //console.log(headers);
    const encabezadosRow = tabla.insertRow();
    for (const clave in headers) {
        const th = document.createElement('th');
        th.textContent = clave;
        encabezadosRow.appendChild(th);
    }

    // Agregar filas de datos
    arrayObjetos.forEach(objeto => {
        //console.log(objeto);
        const fila = tabla.insertRow();
        for (const clave in objeto) {
                
                const celda = fila.insertCell();
                celda.textContent = objeto[clave];
            
        }
    });
    
    const arrayQuerys = [];
    let zipCodes = '';

    for (var i = 0; i < arrayObjetos.length; i++) {
      zipCodes += `'${arrayObjetos[i].cp}',`;

      if (i === arrayObjetos.length - 1 || arrayObjetos[i].hub !== arrayObjetos[i + 1].hub) {
        // Construir la consulta de actualización
        let query = `UPDATE iv_zip_code
                     SET hub = '${arrayObjetos[i].hub}',
                         date_edit = NOW(),
                         user_edit = 'jordan.juvera@ivoy.mx'
                     WHERE zip_code IN (${zipCodes.slice(0, -1)});`; // Elimina la última coma

        // Agregar la consulta al array

        arrayQuerys.push(query.replace(/\t/g, ' ').replace(/\r/g, ''));

        // Reiniciar zipCodes para el próximo conjunto
        zipCodes = '';
      }
    }

    // Imprimir las consultas generadas
    generarArchivo(arrayQuerys);
    

}

function ordenarNumeros(dataArray){
        
    let arrayOrdenado = [];

    const myObjectArray = dataArray.map(function(elemento,index){

        const container = {};

        container.cp = elemento[0];
        container.hub = elemento[1]; 
        
        return container;
    })
    
    arrayOrdenado = myObjectArray.sort( (a,b) => a.hub > b.hub ? 1 : a.hub < b.hub ? -1 : 0 ).reverse() ;
    
    return  arrayOrdenado;
}

function generarArchivo(arrayDataQuerys){
    // Convertir el array a un formato de texto
    const contenidoTexto = arrayDataQuerys.join('\n');

    // Crear un Blob con el contenido de texto
    var blob = new Blob([contenidoTexto], { type: 'text/plain' });

    // Crear un objeto URL para el Blob
    var url = window.URL.createObjectURL(blob);

    // Crear un elemento de enlace para descargar el archivo
    var a = document.createElement('a');
    a.href = url;
    a.download = 'consultas.txt';

    // Agregar el enlace al cuerpo del documento
    document.body.appendChild(a);

    // Simular un clic en el enlace para iniciar la descarga
    a.click();

    // Eliminar el enlace del cuerpo del documento
    document.body.removeChild(a);

}       
const guiasCreadas = [];

function leerArchivoPackage() {
    const input = document.getElementById('packagesInfoApi');
    const file = input.files[0];

    if (file) {
        const lector = new FileReader();

        lector.onload = function (e) {
            const contenido = e.target.result;
            procesarCSVPackage(contenido);
        };

        lector.readAsText(file);
    } else {
        alert('No se seleccionó ningún archivo.');
    }
}

function procesarCSVPackage(csv){
    const rows = csv.split('\n').map(row => row.split(','));
    //console.log(rows);
        // Obtener las columnas que necesitamos
        const headers = rows[0]; // Encabezados
        const headersAceptados = ['guide','guide_ivoy','original_address','latitude','longitude','zip_code','id_business_type'];

        const guideIndex = headers.indexOf(headersAceptados[0]);
        const guideIvoyIndex = headers.indexOf(headersAceptados[1]);
        const originalAddressIndex = headers.indexOf(headersAceptados[2]);
        const latitudeIndex = headers.indexOf(headersAceptados[3]);
        const longitudeIndex = headers.indexOf(headersAceptados[4]);
        const zipCodeIndex = headers.indexOf(headersAceptados[5]);
        const idBussinessTypeIndex = headers.indexOf(headersAceptados[6]);
         
    const data = rows.slice(1).map(row => ({
            guide: row[guideIndex],
            guide_ivoy: row[guideIvoyIndex],
            original_address: row[originalAddressIndex],
            latitude: row[latitudeIndex],
            longitude: row[longitudeIndex],
            zip_code: row[zipCodeIndex],
            idBussinessTypeIndex: row[idBussinessTypeIndex]
    }));
    data.pop();
    // Llamar a la función para generar la tabla con los datos del CSV
    generarTabla(headersAceptados,data);
   
   
}

async function procesarAPIbyCreateDelivery(objetoInfo) {
  const { guide, guide_ivoy, latitude, longitude, original_address, zip_code, idBussinessTypeIndex} = objetoInfo;
  let bussinessType = idBussinessTypeIndex === 2 ?'SAME_DAY' : 'NEXT_DAY';
  const endpoint = "https://api.ivoy.mx/graphql";
  const payload = {
      "query": "mutation createDelivery($input: CreateDeliveryInput!){createDeliveryWithLabel(input: $input){id trackingNumber referenceId label(type: ZPL)}}",
      "variables": {
          "input": {
              "type": `${bussinessType}`,
              "referenceId": `TEST_CREAR_RUTA_${guide}`,
              "storeId": "storeZone8-Tlalne",
              "dropoff": {
                  "location": {
                      "address": original_address,
                      "zipCode": zip_code,
                      "instructions": "ESTO ES UNA PRUEBA",
                      "latitude": parseFloat(latitude),
                      "longitude": parseFloat(longitude)
                  },
                  "contact": {
                      "name": "Jordan Juvera",
                      "phone": "5532253056",
                      "email": "jordan.juvera@ivoy.mx"
                  }
              },
              "packages": [
                  {
                      "dimensions": {
                          "height": 1,
                          "width": 1,
                          "length": 1,
                          "weight": 1
                      },
                      "items": [
                          {
                              "quantity": 1,
                              "description": "Remera Nena"
                          },
                          {
                              "description": "QA Integration",
                              "quantity": 1
                          }
                      ]
                  }
              ]
          }
      }
  };
  try {
      const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'x-ivoy-user': '76d59825-4bbd-4904-a5b4-f8688a3dc3cd',
              'Authorization': 'Bearer is-x0wf9m642cp473z7siehy6qfhhh0ovbb9'
          },
          body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      // Verificar si el tracking number existe en la respuesta
      if (data.data.createDeliveryWithLabel.trackingNumber) {
          const guia = data.data.createDeliveryWithLabel.trackingNumber;
          return guia;
      } else {
          console.error('No se encontró el tracking number en la respuesta:', data);
          return null; // Retorna null si no se encuentra el tracking number
      }
  } catch (error) {
      console.error('Error al enviar los datos:', error);
      return null; // Retorna null si hay un error
  }
}


async function generarTabla(headersAceptados, data) {
  const tabla = document.getElementById('tablaDatosPackages');
  tabla.innerHTML = '';
  const encabezadosRow = tabla.insertRow();
  let guiasIvoy = '';

  headersAceptados.forEach(elem => {
      const th = document.createElement('th');
      th.textContent = elem;
      encabezadosRow.appendChild(th);
  });

  for (const item of data) {
      const row = document.createElement("tr");
      let guiaIvoy = await procesarAPIbyCreateDelivery(item);
      if (guiaIvoy) { // Aseguramos que guiaIvoy tenga valor antes de agregarlo
          guiasIvoy += `${guiaIvoy}, `; // Concatenamos las guías de entrega
      }

      for (let key in item) {
          const cell = document.createElement("td");
          cell.textContent = item[key];
          row.appendChild(cell);
      }

      tabla.appendChild(row);
  }
  alert(`Guias Generadas: ${guiasIvoy}`);
}

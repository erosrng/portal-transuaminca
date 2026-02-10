/*
 * PROTEO ERP
 * Desarrollador: © EROS RANGEL
 */

//**//
var table = null;
if (table !== null && $.fn.DataTable.isDataTable('#car-table')) {
        // Si la tabla ya está inicializada, destrúyela completamente
        table.destroy();
        $('#car-table').empty(); // Vaciar el contenido del contenedor de la tabla
    }

    // Inicializar DataTable
    table = $('#car-table').DataTable({
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        }
    });

    function regsession(){
        $.ajax({
            type: "POST",
            url: baseUrl + "portalprv/buscalog",
            success: function(response) {
                if(response=='nouser'){
                    Swal.fire({
                        title: 'No se puede conectar al servidor.',
                        text: 'Recargue la página para disfrutar de su sesión.',
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                    }).then((result) => {
                        if (result.isConfirmed || result.dismiss) {
                            location.reload();
                        }
                    });
                    return false;
                }else{
                    return true;
                }
            },
            error: function(error) {
                console.error('Error in AJAX request:', error);
            }
        });
    }

    // Función para abrir la ficha del producto
    function mostrarFichaProducto(codigo) {
        $.ajax({
            url: baseUrl + 'portalprv/traeficha/',
            type: 'POST',
            data: { codigo: codigo },
            dataType: 'json',
            success: function(producto) {
                // Construimos la ficha del producto con los datos recibidos
                let cardHtml = `
                    <div id="product-card-${producto.codigo}" class="product-card">
                        <div class="product-card-content">
                            <span class="close-card" onclick="$('#product-card-${producto.codigo}').remove()">&times;</span>
                            <div class="product-card-header">
                                <h2>${producto.descrip}</h2>
                                <img 
                                    src="${baseUrl}uploads/inventario/Image/${producto.codigo}_.png" 
                                    alt="Product Image" 
                                    class="card-image" 
                                    onerror="this.src='${baseUrl}assets/images/elemento-44.png';" />                            
                            </div>
                            <div class="product-card-body">
                                <p><strong>Precio:</strong> Bs. ${producto.precio1}</p>
                                <p><strong>Precio $:</strong> Bs. ${producto.preciod1}</p>
                                <p><strong>Código Interno:</strong> ${producto.codigop}</p>
                                <ul>
                                    <li><strong>Exist 1:</strong> ${producto.exis1}</li>
                                </ul>
                                <p><strong>Tipo:</strong> ${producto.tipo}</p>
                                <p><strong>Origen:</strong> ${producto.origen}</p>
                            </div>
                            <div class="product-card-footer">
                                <div class="product-options">
                                    <label>Cantidad:</label>
                                    <input type="number" id="cana2_${producto.codigo}" min="1" value="1" />
                                    <label>Descuento:</label>
                                    <input type="number" id="descu2_${producto.codigo}" min="0" max="100" value="0" />
                                    <button id="aggpedido2_${producto.codigo}" class="send__button" onclick="agg_pedido('${producto.codigo}', $('#cana2_${producto.codigo}').val(), $('#descu2_${producto.codigo}').val())">
                                        Agregar al carrito de compras
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>`;
    
                // Insertamos la ficha en el DOM
                $('body').append(cardHtml);

                const productCard = document.getElementById(`product-card-${producto.codigo}`);
                productCard.style.display = 'flex';
                opencar();
            },
            error: function(err) {
                console.error("Error al obtener el producto:", err);
            }
        });
    }
    
    function openProductCard(productId) {
        const productCard = document.getElementById(`product-card-${productId}`);
        if (productCard) {
            productCard.style.display = 'flex';
        }
    }

    // Función para cerrar la ficha del producto
    function closeProductCard(event) {
        const productCard = event.target.closest('.product-card');
        if (productCard) {
            productCard.style.display = 'none';
        }
    }

    // Añadir eventos de clic a todas las imágenes de producto
    document.querySelectorAll('.img__product').forEach(image => {
        image.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            openProductCard(productId);
        });
    });

    // Añadir eventos de clic a todos los botones de cerrar en las fichas
    document.querySelectorAll('.close-card').forEach(closeButton => {
        closeButton.addEventListener('click', closeProductCard);
    });

    //Login de acceso al portal
    // Función para abrir el overlay del perfil de usuario
    function openUserProfileOverlay() {
        document.getElementById('user-profile-overlay').style.display = 'flex';
    }

    // Función para cerrar el overlay del perfil de usuario
    function closeUserProfileOverlay() {
        document.getElementById('user-profile-overlay').style.display = 'none';
    }

    //GUARDA EN EL LOCALSTORAGE EL CLIENTE Y EL ALMACEN PARA APLICACIONES QUE NO SON DE CLIENTES
    function carshopcli() {
            const codCliInput = document.getElementById('idcli');
            if (codCliInput) {
                const clienteSeleccionado = document.getElementById('cliente_seleccionado');
                const carnomcli = document.getElementById('car_buscascli');
                const datalist = document.getElementById('buscascli').options;
            
                const codCli = codCliInput.value;
                let nombre = '';
    
                for (let i = 0; i < datalist.length; i++) {
                    if (datalist[i].value === codCli) {
                        nombre = datalist[i].getAttribute('data-nombre');
                        break;
                    }
                }
            
                clienteSeleccionado.textContent = nombre ? `${nombre}` : '';
                carnomcli.textContent = nombre ? 'Para: ' + `${nombre}` + '('+ codCli +')' : 'No hay cliente seleccionado';
            
                if (nombre !== '') {
                    // Guardar el valor de idcli en localStorage con el nombre del usuario
                    localStorage.setItem(`idcli_${usuario}`, codCli);
                    localStorage.setItem(`nomcli_${usuario}`, nombre);
                    buscaalmacen();
                } else {                
                    // Limpiar el valor de localStorage si no hay nombre
                    localStorage.removeItem(`idcli_${usuario}`);
                    localStorage.removeItem(`nomcli_${usuario}`);
                }
    
                    // Almacén
                    const almacenSelect = document.getElementById('idAlma');
                    const almaSeleccionado = almacenSelect.value; // Valor de "ubica" seleccionado
                    
                    const almacenseleccionado = almaSeleccionado.trim().replace(/-/g, '');
    
                    // Imprimir el valor limpio en la consola
                    console.log("El valor final de almacenseleccionado es: '" + almacenseleccionado + "'");
                    
                    if (almacenseleccionado !== '') {
                        // Guardar el valor de ubica y el nombre del almacén en localStorage
                        localStorage.setItem(`idAlma_${usuario}`, almacenseleccionado);
                    
                        // Mostrar el nombre del almacén seleccionado
                        document.getElementById('car_buscacaub').textContent = `Almacén seleccionado: ${almacenseleccionado}`;
                    } else {
                        // Limpiar el valor de localStorage si no hay almacén seleccionado
                        localStorage.removeItem(`idAlma_${usuario}`);
                        document.getElementById('car_buscacaub').textContent = 'No hay almacen seleccionado'; // Limpiar el texto visible
                    }
    
    
                    //Debe seleccionar almacen y cliente para procesar pedidos
                    if (nombre !== '' && almacenseleccionado !=='') {
                        $(".inventario__table-container").show();
                    } else {                
                        $(".inventario__table-container").hide();
                    }
    
                opencar();
            }
    }

    // Recuperar el valor de idcli desde localStorage al cargar la página
    window.onload = function() {
        const codCli = localStorage.getItem(`idcli_${usuario}`);
        if (codCli) {
            document.getElementById('idcli').value = codCli;
            carshopcli(); // Esto se encargará de mostrar el cliente y almacen seleccionado
        }
    
        const alMaRaw = localStorage.getItem(`idAlma_${usuario}`); // Obtener el valor de localStorage
        const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';

        if (alMa) {
            document.getElementById('idAlma').value = alMa;
            const almacenSelect = document.getElementById('idAlma');
            carshopcli();
        }
    };

    const codCli = localStorage.getItem(`idcli_${usuario}`);
    const alMaRaw = localStorage.getItem(`idAlma_${usuario}`);
    const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';

    const nomCli = localStorage.getItem(`nomcli_${usuario}`);

    $('#idcli').val(codCli);
    $('#idcli').text(codCli);
    $('#idAlma').val(alMa);

    if(nomCli!==null){
        $('#cliente_seleccionado').val(nomCli);
        $('#cliente_seleccionado').text(nomCli);
        $('#car_buscascli').text('Para: ' + nomCli + '('+ codCli +')');
        $('#car_buscacaub').text('Almacen: ' + alMa);
    }else{
        $('#car_buscascli').text('No hay cliente seleccionado');
        $('#car_buscacaub').text('No hay almacen seleccionado');
    }

//Agrega producto al carrito con tecla enter
   function eventcant(codigo,cana,descu){ if(event.keyCode=="13") { agg_pedido(codigo, cana, descu); } }

    olpws__button
    var olpws__button = document.getElementById('olpws__button');

    if (olpws__button) {
        document.getElementById("olpws__button").addEventListener("click", function(event) {
            event.preventDefault(); // Evita que el enlace se comporte como un enlace normal (no recargue la página)
            $.post(baseUrl + "portalprv/olpws", function(data){
                $("#login__container").html(data);
            });
        });
    }

    //Interaccion de las imagenes en el portal bienvenido
    document.addEventListener('DOMContentLoaded', function() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        let currentIndex = 0;

        //Interaccion del menu hamburguesa para dispositivos moviles
        const hamburger = document.getElementById('hamburger');
        const menu = document.getElementById('menu');
        const closeMenu = document.getElementById('closeMenu');

        hamburger.addEventListener('click', function() {
            menu.style.left = '0';
        });

        // Abre el menú cuando el cursor está sobre el icono de hamburger
        hamburger.addEventListener('click', function() {
            menu.style.left = '0';
        });

        closeMenu.addEventListener('click', function() {
            menu.style.left = '-100%';
        });

        window.addEventListener('click', function(event) {
            if (event.target !== menu && event.target !== hamburger && !menu.contains(event.target)) {
                menu.style.left = '-100%';
            }
        });
 
        // Obtener el contenedor de la barra de navegación
        const navbarLinks = document.querySelectorAll('.menu__content a');

        navbarLinks.forEach(function(link) {
            link.addEventListener('click', function(event) {
                const parentLi = this.parentElement;
                const id = parentLi.id;
                const isDropdownToggle = this.getAttribute('data-bs-toggle') === 'collapse';
    
                if (!isDropdownToggle){
                    event.preventDefault();
                }
    
                if (id === 'c1') {
                    window.location = baseUrl + 'portalprv';
                } else if (id == "b3" || id == "c3") {
                    $("#loader-wrapper").show();

                    $.post(baseUrl + "portalprv/usprv", function(data) {
                        setTimeout(function() {
                            $(".content__general").html(data);
                            $("#loader-wrapper").hide();
                        }, 800);
                    }); 
                } else if (id == "b4" || id == "c4") {
                    $("#loader-wrapper").show();

                    $.post(baseUrl + "portalprv/historialped", function(data) {
                        setTimeout(function() {
                            $(".content__general").html(data);
                            $("#loader-wrapper").hide();
                        }, 800);
                    }); 
                }else  if (id == "b5" || id == "c5") {
                    $("#loader").show();

                    $.post(baseUrl + "portalcli/cese", function(data){
                        location.reload(); 
                    });
                } else if (id === 'c6') {
                    $('#loader-wrapper').show();
    
                    $.post(baseUrl + 'portalprv/inventariop', { codCli: codCli }, function(data) {
                        setTimeout(function() {
                            $('.content__general').html(data);
                            $('#loader-wrapper').hide();
                        }, 800);
                    });
                } else if (id === 'c7') {
                    window.open(baseUrl + 'reportes/ver/VTPTPRV', '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
                } else if (id === 'c8') {
                    window.open(baseUrl + 'reportes/ver/SINVEXTPRV', '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
                } else if (id === 'c9') {
                    window.open(baseUrl + 'reportes/ver/VTPRVUS', '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
                } else if (id === 'c10') {
                    window.open(baseUrl + 'reportes/ver/VXCLITPRV', '_blank', 'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,screenx=((screen.availWidth/2)-400),screeny=((screen.availHeight/2)-300)');
                } else {
                    console.log('Enlace no reconocido');
                }
            });
        });

    });

    function agg_pedido(codigo,cana,descu){
        const codCli = localStorage.getItem(`idcli_${usuario}`);
        const alMaRaw = localStorage.getItem(`idAlma_${usuario}`); // Obtener el valor de localStorage
        const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';

        if(usuario!=''){
            if(tipous=='U' && (codCli==null || codCli=='')){
                Swal.fire('Debe seleccionar un cliente para procesar pedidos!', '', 'warning');
                return false;
            }else{
                if(cana>0){
                    if(descu>100){
                        Swal.fire('Descuento no puede ser mayor a 100!', '', 'warning');
                        return false;
                    }else if(descu<0){
                        Swal.fire('Descuento debe ser mayor a 0!', '', 'warning');
                        return false;
                    }else{
                        var postData = {
                            codigo: codigo,
                            cana: cana,
                            descu: descu,
                            codCli: codCli,
                            alMa: alMa
                        };
            
                        $.ajax({
                            url:   baseUrl + 'portalprv/agg_pedido/',
                            type: "POST",
                            data: postData,
                            success: function (data) {
                                if (data=='agregado') {
                                    Swal.fire('Pedido agregado exitosamente!','','success');
                                    opencar();
                                } else {
                                    Swal.fire(data,'','error');
                                } 
                            }
                        });
                    }

                }else{
                    Swal.fire('Cantidad debe ser mayor a 0!', '', 'warning');
                    return false;
                }
            }
        }else{
            Swal.fire('Debe ingresar al portal nuevamente','','warning');
            return false;
        }
    } 

    function showdetail(pedidoId) {
        $("#loader").show();
        var tablehist = $('#historial_pedido-table').DataTable();
        // Buscar la fila correspondiente al pedidoId
        var rowIndex = tablehist.rows().eq(0).filter(function(rowIdx) {
            return tablehist.cell(rowIdx, 0).data() === pedidoId ? true : false;
        });

        if (rowIndex.length > 0) {
            var row = tablehist.row(rowIndex[0]);

            // Si la fila está marcada como abierta, la cerramos
            if (row.child.isShown()) {
                row.child.hide();
                row.node().classList.remove('shown');
                $("#loader").hide();
            } else {
                // Si no, hacemos una solicitud AJAX para obtener los detalles del pedido
                $.ajax({
                    url: baseUrl + 'portalprv/detalle_pedido/' + pedidoId,
                    type: 'POST',
                    success: function(response) {
                        // Verificamos que la respuesta es un objeto y no una cadena
                        var detalle = JSON.parse(response);

                        // Creamos la tabla de detalles usando template literals
                        var detailTable = `
                        <div class="detalle__table-container">
                            <table class="detalle__table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Lote</th>
                                        <th>Vence</th>
                                        <th>Descuento</th>
                                        <th>Precio Unitario</th>
                                        <th>Importe</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;

                        // Agregamos los detalles del pedido a la tabla
                        detalle.forEach(function(detalleItem) {
                            detailTable += `
                                <tr>
                                    <td>${detalleItem.desca || 'N/A'}</td>
                                    <td>${parseInt(detalleItem.cana) || 0}</td>
                                    <td>${detalleItem.lote || 'N/A'}</td>
                                    <td>${detalleItem.vence || 'N/A'}</td>
                                    <td>${detalleItem.descprov || 0}</td>
                                    <td>${detalleItem.preca || 0}</td>
                                    <td>${detalleItem.tota || 0}</td>
                                </tr>
                            `;
                        });

                        // Cerramos la tabla de detalles
                        detailTable += `
                                </tbody>
                            </table>
                        </div>
                        `;

                        // Insertamos la tabla de detalles debajo de la fila
                        row.child(detailTable).show();
                        row.node().classList.add('shown');
                        $("#loader").hide();
                    },
                    error: function(message) {
                        console.log('Error: ' + message);
                    }
                });
            }
        } else {
            console.log('Fila no encontrada');
        }
    }

    //Cierra el contenedor del carshop
    function closecar(){
    $('.car__container').css('width', '0');
    $('.container__carshop').css('right', '100%'); 
    }

    //Baja el archivo de excel del proveedor 
    function bajaexcel() {
        $("#loader-wrapper").show();

        $.ajax({
            type: "POST",
            url: baseUrl + "ventas/generador/index/" + '21' + "/" + 'S',
            data: {},
            success: function(response) {
                const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                window.location.href = "/generador/listasprv/LISTADO DE PROVEEDOR_" + uspadre + "_" + formattedDate + ".xlsx";
                $("#loader-wrapper").hide();
            },
            error: function(error) {
                console.error('Error in AJAX request:', error);
            }
        });
    }

            function cargaexcel() {
                const codCli = localStorage.getItem(`idcli_${usuario}`);
                const alMaRaw = localStorage.getItem(`idAlma_${usuario}`);
                const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';
            
                if (codCli && alMa) {
                    const newWindow = window.open(
                        `${baseUrl}portalprv/cargaexcelcertra/index/${codCli}/${alMa}`,
                        '_blank',
                        'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,' +
                        `left=${screen.width / 2 - 400},top=${screen.height / 2 - 300}`
                    );
            
                    // Escuchar el mensaje de la ventana secundaria
                    window.addEventListener('message', function (event) {
                        const { status, messages } = event.data || {};
            
                        // Si hay un mensaje de estado
                        if (status) {
                            const icon = status === 'success' ? 'success' : 'error';
            
                            // Mostrar el mensaje con SweetAlert
                            Swal.fire({
                                title: status === 'success' ? 'Operación exitosa' : 'Error en la operación',
                                html: messages.join(''), // Mostrar los mensajes concatenados
                                icon: icon,
                                confirmButtonText: 'Aceptar'
                            });
            
                            // Si fue exitoso, ejecutar función adicional
                            if (status === 'success') {
                                opencar();
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Advertencia',
                        text: 'Seleccione un cliente',
                        icon: 'warning',
                        confirmButtonText: 'Aceptar'
                    });
                }
            }

            function abreperfil(){
                $("#loader-wrapper").show();

                $.post(baseUrl + "portalprv/profilesprv", function(data){
                    setTimeout(function() {
                        openUserProfileOverlay();
                        $("#user-profile-overlay").html(data);
                        $("#loader-wrapper").hide();
                    }, 100);
                });
            }

            function abrehistorial(){
                $("#loader-wrapper").show();

                $.post(baseUrl + "portalprv/historialped", function(data){
                    setTimeout(function() {
                        openUserProfileOverlay();
                        $("#user-profile-overlay").html(data);
                        $("#loader-wrapper").hide();
                    }, 100);
                });
            }
            
        

    $(document).ready(function() {
        $('#closeCar').click(function(event) {
            closecar();
        });

        // Evento de clic fuera del contenedor para cerrarlo
        $(document).mouseup(function(event) {
            var container = $(".container__carshop");
        });


        // Mostrar el contenedor del carrito
        function opencar(opencontainer='') {
            regsession();
            itscar();
            const codCli = localStorage.getItem(`idcli_${usuario}`);
            const alMaRaw = localStorage.getItem(`idAlma_${usuario}`); // Obtener el valor de localStorage
            const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';
    
            if(opencontainer=='yes'){
                $('.car__container').css('width', '100%'); // Cambiar el ancho del contenedor para que se muestre completamente
                $('.container__carshop').css('right', '0'); 
            }

            var ivabs=0;
            var ivaD=0;
            var subtotalbs=0;
            var totalBs=0;
            var subtotalD=0;
            var totalD=0;
            var totalItems = 0;
            var unidades = 0;
            totalConDescuento = 0;
            precioConDescuento = 0;
            var resumenHtml;
            var postData = {
                codCli: codCli,
                alMa: alMa
            };
                            var i=0;
            $.ajax({
                url: baseUrl + 'portalprv/opencardb/',
                type: 'post',
                data: postData,
                success: function(data) {
                        table.clear();
                        var pedidos = JSON.parse(data);

                        pedidos.forEach(function(pedido) {
                            totalConDescuento = pedido.totalbs - (pedido.totalbs * (parseFloat(pedido.descprov) / 100));
                            precioConDescuento = pedido.precio - (pedido.precio * (parseFloat(pedido.descprov) / 100));
            
                            totalConDescuentoDolar = pedido.totald - (pedido.totald * (parseFloat(pedido.descprov) / 100));
                            precioConDescuentoDolar = pedido.preciod - (pedido.preciod * (parseFloat(pedido.descprov) / 100));


                            totalBs += parseFloat(totalConDescuento); 
                            totalD += parseFloat(totalConDescuentoDolar); 
                            subtotalbs += parseFloat(pedido.bssiniva);
                            subtotalD += parseFloat(pedido.dsiniva);
                            
                            ivabs += parseFloat(pedido.tivabs); 
                            ivaD += parseFloat(pedido.tivad); 

                            unidades += parseInt(pedido.cant);
                            totalItems += 1;
                            
                            table.row.add([
                                '<img src="' + baseUrl + 'assets/images/elemento-44.png" alt=""> ' + pedido.descrip,
                                //totales,
                                //'<td class="hidden-mobile">' + totales + '</td>',
                                '<div class="quantity-container">' +
                                    '<input type="" min="1" max="10" id="descprov_' + pedido.id_pedido + '" value="' + pedido.descprov+ '" ' +
                                    'onchange="updatedes(\'' + pedido.id_pedido + '\', \'' + pedido.codigoa + '\',\'' + pedido.existen + '\', \'' + pedido.descprov + '\', \'' + pedido.cant + '\')" ' +
                                    'class="quantity-input">'+
                                '</div>',
                                parseFloat(pedido.precio).toFixed(2) + ' Bs ' +
                                '<span style="color: green;font-weight: bold;">' + parseFloat(pedido.preciod).toFixed(2) + ' USD</span>',
                                precioConDescuento.toFixed(2)+ ' Bs ' +
                                '<span style="color: green;font-weight: bold;">' + precioConDescuentoDolar.toFixed(2) + ' USD</span>',
                                parseFloat(pedido.tivabs).toFixed(2) + ' Bs ' +
                                '<span style="color: green;font-weight: bold;">' + parseFloat(pedido.tivad).toFixed(2) + ' USD</span>',
                                parseFloat(pedido.totalbs).toFixed(2) + ' Bs ' +
                                '<span style="color: green;font-weight: bold;">' + parseFloat(pedido.totald).toFixed(2) + ' USD</span>',
                                totalConDescuento.toFixed(2)+ ' Bs ' +
                                '<span style="color: green;">' + totalConDescuentoDolar.toFixed(2) + ' USD</span>',
                                '<div class="quantity-container">' +
                                    '<button class="quantity-btn" onclick="updatecant(\'' + pedido.id_pedido +'\', \'' + pedido.codigoa + '\',\'' + pedido.existen + '\',  \'-\', \'' + pedido.descprov + '\')"><i class="fa-solid fa-minus"></i></button>' +
                                    '<input type="" min="1" max="10" id="cantidad_'+pedido.codigoa+'" value="' + pedido.cant + '" onchange="validacant(this, \'' + pedido.id_pedido + '\', \'' + pedido.codigoa + '\',\'' + pedido.existen + '\', \'' + pedido.descprov + '\')" class="quantity-input">' +
                                    '<button class="quantity-btn" onclick="updatecant(\'' + pedido.id_pedido + '\', \'' + pedido.codigoa + '\',\'' + pedido.existen + '\',  \'+\', \'' + pedido.descprov + '\')"><i class="fa-solid fa-plus"></i></button>' +
                                '</div>',
                                '<img onclick="eliminareg(\''+pedido.id_pedido+'\',\''+pedido.codigoa+'\')" class="eliminareg__icon" src="' + baseUrl + 'assets/images/Portal proteo-18.png" title="Eliminar producto del carrito" alt="" data-id="'+ pedido.id_pedido +'">'
                            ]);
                            itscar(pedido.codigoa);
                        });
                        table.draw();
                        
            
                        // Actualizar el círculo de notificación con la cantidad de productos
                        document.getElementById('und__count').textContent = totalItems;
                        document.getElementById('tota__count').textContent = totalBs.toFixed(2);
                        document.getElementById('renglones__count').textContent = unidades;
            
                        // Crear el resumen del pedido
                        // Crear el resumen del pedido
                        var resumenHtml = `
                            <section class="carrito__totals">
                                <div class="carrito__totals-container">
                                    <div class="carrito__totals-item">
                                        <h3 class="carrito__totals-title">US$</h3>
                                        <p class="carrito__totals-info">Subtotal US$:&nbsp; <span> ${subtotalD.toFixed(2)}</span></p>
                                        <p class="carrito__totals-info">IVA US$:&nbsp; <span> ${ivaD.toFixed(2)}</span></p>
                                        <p class="carrito__totals-info">Total US$:&nbsp; <span> ${totalD.toFixed(2)}</span></p>
                                    </div>
                                    <div class="carrito__totals-item">
                                        <h3 class="carrito__totals-title">Bs.</h3>
                                        <p class="carrito__totals-info">Subtotal Bs:&nbsp; <span> ${subtotalbs.toFixed(2)}</span></p>
                                        <p class="carrito__totals-info">IVA Bs:&nbsp; <span> ${ivabs.toFixed(2)}</span></p>
                                        <p class="carrito__totals-info">Total Bs:&nbsp; <span> ${totalBs.toFixed(2)}</span></p>
                                    </div>
                                </div>    
                                
                                <footer class="carrito__footer">
                                <div class="carrito__totals-item">
                                    <p class="carrito__totals-info">Unidades: <span>${unidades}</span></p>
                                </div>
                                <button  onclick="enviaped()" class="quantity-btn">Finalizar compra</button>
                                </footer>
                            </section>
                        `;
            
                        // Eliminar el resumen del pedido existente antes de añadir uno nuevo
                        $('.carrito__totals').remove();
                        // Añadir el resumen del pedido al final del contenedor del carrito
                        $('.container__carshop').append(resumenHtml);

                },
                error: function(message) {
                    console.log('error:(((');
                }
            });
        }

        $('input[id^="dlineal"]').keyup(function() {
            dlcal();
        });

        function dlcal() {
            var descuentoLineal = Number($("#dlineal").val());
            if (isNaN(descuentoLineal)) {
                Swal.fire('Debe seleccionar un cliente','','warning');                        
                return;
            }

            if (descuentoLineal > 100) {
                Swal.fire('El descuento no puede ser mayor a 100', '', 'warning');
                return;
            }

            // Restablecer los campos de descuento de laboratorio a su estado inicial
            $("input[id^='descprov_']").each(function() {
                $(this).val("");
            });

            // Si el campo de descuento lineal está vacío, establecer todos los campos de descuento de laboratorio en blanco
            if ($("#dlineal").val() === "") {
                $("input[id^='descprov_']").val("");
            }

            // Recorre todos los campos de descuento de laboratorio
            $("input[id^='descprov_']").each(function() {
                var elementId = $(this).attr('id');
                var idWithoutPrefix = elementId.substring(9); // Eliminar "descprov_" del ID

                // Calcula el nuevo valor de descuento para el campo actual
                var descuentoActual = Number($(this).val());
                var nuevoDescuento = descuentoActual + descuentoLineal;


                // Actualiza el campo de descuento de laboratorio con el nuevo valor
                $(this).val(nuevoDescuento);


                //totaliza(idWithoutPrefix, pedidoId); // Vuelve a calcular los totales para el campo actual
                totalizacar(idWithoutPrefix, nuevoDescuento);

            });
        }

        //Actualiza cantidad en renglon
        function updatecant(idPedido, codigo,existen, change,descu) {
            var input = $('#cantidad_' + codigo);
            var cantidad = parseInt(input.val());
            var newValue=cantidad;
            if (change=='-') {
                newValue=cantidad-1;
            }else if(change=='+'){
                newValue=cantidad+1;
            }


            if(newValue>0){
                totaliza(codigo, idPedido, newValue,existen,descu);
            }
        }

        //Actualiza descuento del renglon
        function updatedes(idPedido, codigo,existen,descu,cana){
            var input = $('#descprov_' + idPedido);
            var descu = parseInt(input.val());
            var newValue=descu;

            totaliza(codigo, idPedido, cana,existen,newValue);
        }

        //Envia pedidos al servidor
        function enviaped(){
            const codCli = localStorage.getItem(`idcli_${usuario}`);
            const alMaRaw = localStorage.getItem(`idAlma_${usuario}`);
            const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';

                var postData = {
                    usuario: usuario,
                    codCli: codCli,
                    alMa: alMa
                };

                Swal.fire({
                title: '¿Desea enviar el pedido?',
                text: "Esta acción no se puede deshacer.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Enviar',
                cancelButtonText: 'Cancelar'
                }).then((result) => {
                if (result.isConfirmed) {
                    opencar();
                    $.ajax({
                        url: baseUrl + 'portalprv/enviaped/',
                        type: "POST",
                        data: postData,
                        success: function (data) {
                            opencar();
                            Swal.fire('Pedido enviado', '', 'success');
                        },
                        error: function(data) {
                            console.log(data);
                            Swal.fire('Pedido no enviado', '', 'error');
                        }
                    });
                    
                }
                });
        }

        //Actualiza cantidad en renglon
        function validacant(input, idPedido, codigo,existen,descu) {
            var value = input.value;

            if (isNaN(value) || value < 0) {
                input.value = 0;
            } else if (value > 100) {
                input.value = 100;
            }
            if (!/^\d+$/.test(value)) {// Valida que el valor sea un número del 0 al 9
                input.value = 0; // Resetea el valor si no es válido
                Swal.fire('Solo se permiten valores numéricos del 0 al 9', '', 'warning');
            } else {
                totaliza(codigo, idPedido, value,existen,descu);
            }
        }

            function buscaalmacen(){
                const codCli = localStorage.getItem(`idcli_${usuario}`);
                $.ajax({
                    type: "POST",
                    url: baseUrl + "portalprv/buscaalmacen",
                    data: { codCli: codCli },
                    success: function(response) {
                        var almacen = response.ubica;


                        if (almacen) {
                            $('#idAlma').val(almacen);
                        }
                    },
                    error: function(error) {
                        console.error('Error in AJAX request:', error);
                    }
                });
            }

        //Totaliza cada item del carrito 
        function totaliza(codigo, idPedido, value,existen,descu) {
            existen = parseInt(existen);
            if(value>existen){
                Swal.fire('Cantidad mayor a existencia', '', 'error');
            }else{
                $.ajax({
                    url: baseUrl + 'portalprv/totalizacampo', 
                    method: 'POST',
                    data: { idPedido: idPedido, cantidad: value, codigo: codigo,descuento: descu}, 
                    success: function(response) {
                        opencar();
                    },
                    error: function(xhr, status, error) {
                    console.log(error);
                    }
                });
            }

        } 

        //Totaliza carrito completo 
        function totalizacar(idPedido,descu) {
            const codCli = localStorage.getItem(`idcli_${usuario}`);

                $.ajax({
                    url: baseUrl + 'portalprv/totalcarshop', 
                    method: 'POST',
                    data: { idPedido: idPedido,descuento: descu, codCli: codCli,}, 
                    success: function(response) {
                        opencar();
                    },
                    error: function(xhr, status, error) {
                    console.log(error);
                    }
                });
        } 

        

            function itscar(codigo) {
                const codCli = localStorage.getItem(`idcli_${usuario}`);
                const alMaRaw = localStorage.getItem(`idAlma_${usuario}`);
                const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';
            
                if (codCli && alMa) {
                    $.ajax({
                        type: "POST",
                        url: baseUrl + "portalprv/itscar",
                        data: { codigo: codigo, codCli: codCli, alMa: alMa },
                        success: function(response) {
                            var cantidadEnCarrito = parseInt(response);
            
                            // 1. Desmarcar estrictamente todos los botones
                            $(".aggpedido").each(function() {
                                $(this).html('<i class="fa-solid fa-cart-plus"></i>');
                                $(this).removeClass("send__button-check").addClass("send__button");
                            });
                            $(".aggpedido2").each(function() {
                                $(this).html('Agregar al carrito');
                                $(this).removeClass("send__button-check2").addClass("send__button");
                            });
            
                            // 2. Actualizar estrictamente solo el botón del producto actual basado en la respuesta
                           var $boton = $("#aggpedido_" + codigo);
                            var $boton2 = $("#aggpedido2_" + codigo);
            
                            if (cantidadEnCarrito > 0) {
                                // Si el producto está en el carrito, lo marcamos
                                $boton.html('<i class="fa-solid fa-square-check"></i>');
                                $boton.removeClass("send__button").addClass("send__button-check");
                                $boton2.html('Producto en el carrito');
                                $boton2.removeClass("send__button").addClass("send__button-check2");
                            } else {
                                // Si el producto NO está en el carrito, lo dejamos desmarcado
                                $boton.html('<i class="fa-solid fa-cart-plus"></i>');
                                $boton.removeClass("send__button-check").addClass("send__button");
                                $boton2.html('Agregar al carrito');
                                $boton2.removeClass("send__button-check2").addClass("send__button");
                            }
                        },
                        error: function(error) {
                            console.error('Error en la solicitud AJAX:', error);
                        }
                    });
                } else {
                    console.error('Cliente o almacén no definidos');
                }
            }
            

        //Elimina renglon del carrito de compras
        function eliminareg(idPedido,codigo){
            var input = $('#cana_' + codigo);
            $.ajax({
                url: baseUrl + 'portalprv/eliminareg/',
                type: "POST",
                data: {id: idPedido, codigo: codigo},
                success: function (data) {
                    opencar(); 
                }
            });
            input.val(''); 
            itscar(codigo); 
        }

        //Vacia carrito
        function vaciacar(){
            const alMaRaw = localStorage.getItem(`idAlma_${usuario}`);
            const alMa = alMaRaw ? alMaRaw.trim().replace(/-/g, '') : '';

            Swal.fire({
                title: '¿Desea vaciar el carrito?',
                text: "Eliminar todos los productos en el mismo.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Vaciar',
                cancelButtonText: 'Cancelar'
                }).then((result) => {
                        if (result.isConfirmed) {
                            opencar();
                            $.ajax({
                                url: baseUrl + 'portalprv/vaciacar/',
                                type: "POST",
                                data: {alMa: alMa},
                                success: function (data) {
                                    opencar();
                                }
                            });
                            Swal.fire('Carro vacio', '', 'success');
                        }
                });
        }


    //Asegura que las funciones sea accesible desde cualquier parte del codigo 
    window.opencar = opencar;
    window.updatecant = updatecant;
    window.updatedes = updatedes;
    window.validacant = validacant;
    window.eliminareg = eliminareg;
    window.vaciacar = vaciacar;
    window.enviaped = enviaped;
    window.itscar = itscar;
    window.buscaalmacen = buscaalmacen;
    window.dlcal = dlcal;

    carshopcli();

    const codCli = localStorage.getItem(`idcli_${usuario}`);

        $('#table_inventario').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: baseUrl + "portalprv/getdatainv",
                type: 'POST',
                data: {codCli: codCli}
            },
            columns: [
                { 
                    data: null, 
                    title: 'Producto', 
                    render: function(data, type, row) {
                        return `<div class="image-product__container">
                                    <img class="img__product" 
                                        src="${baseUrl}uploads/inventario/Image/${row.codigo}_.png" 
                                        alt="Imagen del producto" 
                                        data-product-id="${row.codigo}" 
                                        onerror="this.src='${baseUrl}assets/images/elemento-44.png';"
                                        onclick="mostrarFichaProducto('${row.codigo}')" />
                                </div>`;
                    }                    
                },
                { data: 'codigo', title: 'Código', visible: false },
                { data: 'barras', title: 'Barras', visible: false },
                { data: 'pactivo', title: 'P.Activo', visible: false },
                { data: 'descrip', title: 'Descripción', className: 'wide-description' },
                { data: null, title: 'Precio Original', render: function(data, type, row) {
                    return `<b>Bs.</b> ${$.fn.dataTable.render.number(',', '.', 2, '').display(row.precio1)} 
                            <b class="show__camp">
                                Ref. ${$.fn.dataTable.render.number(',', '.', 2, '').display(row.preciod1)} 
                                Ext.Maturin ${$.fn.dataTable.render.number(',', '.', 0, '').display(row.existen)} 
                                Ext.Guarenas ${$.fn.dataTable.render.number(',', '.', 0, '').display(row.existengua)}
                            </b>`;
                }},
                { data: 'preciod1', title: 'Precio $', className: 'wide__camp', render: function(data, type, row) {
                    return `Ref. ${$.fn.dataTable.render.number(',', '.', 2, '').display(data)}`;
                }},
                { data: null, title: 'Disponibles', className: 'wide__camp', render: function(data, type, row) {
                    return `<div class="wide__column">
                            <b class="inventario__item">Maturín: ${$.fn.dataTable.render.number(',', '.', 0, '').display(row.existen)} </b> 
                            <b class="inventario__item">Guarenas: ${$.fn.dataTable.render.number(',', '.', 0, '').display(row.existengua)}</b> 
                            </div>
                            `;
                }},
                { data: 'encar', title: 'Cantidad', render: function(data, type, row) {
                    return `<input class="cana__input" type="text" placeholder="Cantidad" id="cana_${row.codigo}" 
                                onkeypress="eventcant('${row.codigo}', $('#cana_${row.codigo}').val(), $('#descu_${row.codigo}').val(), event)" 
                                value="${row.encar}">`;
                }},
                { data: 'descu', title: 'Descuento', render: function(data, type, row) {
                    return `<input class="cana__input" type="text" placeholder="Descuento" id="descu_${row.codigo}" 
                                onkeypress="eventcant('${row.codigo}', $('#cana_${row.codigo}').val(), $('#descu_${row.codigo}').val(), event)" 
                                value="${row.descu}">`;
                }},
                { data: null, title: 'Acción', render: function(data, type, row) {
                    return `<button class="send__button" id="aggpedido_${row.codigo}" 
                                onclick="agg_pedido('${row.codigo}', $('#cana_${row.codigo}').val(), $('#descu_${row.codigo}').val())">
                                <i class="fa-solid fa-cart-plus"></i>
                            </button>`;
                }}
            ],
            pageLength: 10, 
            language: {
                "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            },
            drawCallback: function(settings) {
                // Llama a la función que valida los productos en el carrito
                opencar();
            }
        });
    });

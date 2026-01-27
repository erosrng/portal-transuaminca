/*
 * PROTEO ERP
 * Desarrollador: © EROS RANGEL
 */
var timer;
let viewonline = 'portalcli';

/**
 * Inicio o reinicia el timer para ejecutar una funcion.
 * Si ya está corriendo el timer lo cancela y crea uno nuevo
 * Manda un mensaje de evento llamado timerEjecutado al finalizar
 * 
 * @returns {void} Esta funcion no regresa un valor
 */
function startTimer(callback=null, timeout=1000) {
    // Elimina el timer que existe
    if (timer) {
        clearTimeout(timer);
    }

    // Inicia el timer con la funcion especificada
    timer = setTimeout(() => {
        const event = new Event('timerEjecutado');
        document.dispatchEvent(event);
        if(callback != null) callback();
    }, timeout);
}
    /////////////////////////////////
    //Revisa si la sesion esta activa
    function regsession(){
        $.ajax({
            type: "POST",
            url: baseUrl + "portalcli/buscalog",
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
    function copiaa(){
        var cacltual= $("#idcli").val();
        console.log(cacltual);
        $.ajax({
            type: "POST",
            url: baseUrl + "portalcli/clientes/JS",
            dataType: "json",
            success: function(response) {
              var tabla =`<select class="selected__cliente" name="copiaacliente" id="copiaacliente"><option value="ALL">Todos</option>`;
              $.each(response, function(idx,val){
                if(val.cliente == cacltual) return true;
                tabla += `<option value="${val.cliente}">(${val.cliente}) ${val.nombre}</option>`;
              }); 
              tabla += `</select>`;
              var ahtml= ` <div class="form-control">
              <label class="form-label" for="copiaacliente">Cliente</label>
              ${tabla}
              </div>`;
                Swal.fire({
                    icon: 'question',
                    title: 'Copiar carrito a otro a cliente(s)',
                    html:ahtml,
                    showCancelButton: true,
                    confirmButtonText: 'Copiar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        var cdest = $("#copiaacliente").val();
                        $.ajax({
                            type: "POST",
                            url: baseUrl + "portalcli/copiaa/"+cacltual+"/"+cdest,
                            dataType: "json",
                            success: function(response) {
                                Swal.fire({
                                    icon: ((response.resultado)? 'success':'error'),
                                    title: response.message,
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                            },
                            error: function(error) {
                                console.error('Error in AJAX request:', error);
                            }
                        });
                    }
                });
            },
        });
    }
    function movera(){
        var cacltual= $("#idcli").val();
        console.log(cacltual);
        $.ajax({
            type: "POST",
            url: baseUrl + "portalcli/clientes/JS",
            dataType: "json",
            success: function(response) {
              var tabla =`<select class="selected__cliente" name="copiaacliente" id="copiaacliente">`;
              $.each(response, function(idx,val){
                if(val.cliente == cacltual) return true;
                tabla += `<option value="${val.cliente}">(${val.cliente}) ${val.nombre}</option>`;
              }); 
              tabla += `</select>`;
              var ahtml= ` <div class="form-control">
              <label class="form-label" for="copiaacliente">Cliente</label>
              ${tabla}
              </div>`;
                Swal.fire({
                    icon: 'question',
                    title: 'Copiar carrito a otro a cliente(s)',
                    html:ahtml,
                    showCancelButton: true,
                    confirmButtonText: 'Mover',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        var cdest = $("#copiaacliente").val();
                        $.ajax({
                            type: "POST",
                            url: baseUrl + "portalcli/movera/"+cacltual+"/"+cdest,
                            dataType: "json",
                            success: function(response) {
                                opencar();
                                Swal.fire({
                                    icon: ((response.resultado)? 'success':'error'),
                                    title: response.message,
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                            },
                            error: function(error) {
                                console.error('Error in AJAX request:', error);
                            }
                        });
                    }
                });
            },
        });
    }


    ////////////////////////////////////////////
    // Función para abrir la ficha del producto
    function mostrarFichaProducto(codigo) {
        $("#loader").show();
        regsession();
        $.ajax({
            url: baseUrl + 'portalcli/traeficha/',
            type: 'POST',
            data: { codigo: codigo },
            dataType: 'json',
            success: function(producto) {
                // Construimos la ficha del producto con los datos recibidos
                let cardHtml = `
                    <div id="product-card-${producto.codigo}" class="ficha-container">
                        <div class="product-card-content">
                            <span class="close-card" onclick="$('#product-card-${producto.codigo}').remove()">&times;</span>
                            <div class="product-card-header">
                                <h2>${producto.descrip || ''}</h2>
                                <strong class="tipo__text">${producto.nom_grup || ''}</strong>
                                <img 
                                    src="${baseUrl}uploads/inventario/Image/th_${producto.codigo}_.png" 
                                    alt="Product Image" 
                                    class="card-image" 
                                    onerror="this.src='${baseUrl}assets/images/elemento-44.png';" />                            
                            </div>
                            <div class="product-card-body">
                                <p><strong>Bs.</strong> ${producto.precio1 || '0'}</p>
                                <p><strong>Ref:</strong> ${producto.preciod1 || '0'}</p>
                                <p><strong>Código de barra:</strong> ${producto.barras || ''}</p>
                                <ul>
                                    <li><strong>Existencia:</strong> ${producto.exis1 || '0'}</li>
                                </ul>
                                <p><strong>Tipo:</strong> ${producto.tipo || ''}</p>
                                <p><strong>Origen:</strong> ${producto.origen || ''}</p>
                                <p><strong>Marca:</strong> ${producto.marca || ''}</p>
                                <p><strong>Principio activo:</strong> ${producto.pactivo || ''}</p>
                            </div>
                            <div class="product-card-footer">
                                <div class="product-options">
                                    <label>Cantidad:</label>
                                    <input type="number" id="cana2_${producto.codigo}" min="1" value="1" />
                                    <button id="aggpedido2_${producto.codigo}" class="send__button" onclick="agg_pedido('${producto.codigo}', $('#cana2_${producto.codigo}').val(), $('#descu2_${producto.codigo}').val())">
                                        <i class="fa-solid fa-cart-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;

                // Insertamos la ficha en el DOM
                $('body').append(cardHtml);

                const productCard = document.getElementById(`product-card-${producto.codigo}`);
                productCard.style.display = 'flex';
                $("#loader").hide();
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
/////////////////////////////////////////////
    //Fin de funciones para la ficha del producto 
    // Añadir eventos de clic a todos los botones de cerrar en las fichas
    document.querySelectorAll('.close-card').forEach(closeButton => {
        closeButton.addEventListener('click', closeProductCard);
    });

    function bajaexcel() {
        $("#loader").show();
        const codCli = localStorage.getItem(`idcli_${usuario}`);

        $.ajax({
            type: "POST",
            url: baseUrl + "portalcli/traesegme/",
            data: {codCli: codCli},
            success: function(lista) {
                /* $.ajax({
                    type: "POST",
                    url: baseUrl + "ventas/generador/index/" + lista + "/" + 'N',
                    data: {},
                    success: function(response) { */
                        const formattedDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                        window.location.href = "/generador/"+lista;
                        $("#loader").hide();
                   /*  },
                    error: function(error) {
                        console.error('Error in AJAX request:', error);
                    }
                }); */
                
            },
            error: function(error) {
                console.error('Error in AJAX request:', error);
            }
        });
    }

    function cargaexcel() {
        regsession();
        const codCli = localStorage.getItem(`idcli_${usuario}`);
        if (tipous === 'U' || cmatriz!="" && (!codCli || codCli === '')) {
            Swal.fire('Debe seleccionar un cliente para procesar pedidos!', '', 'warning');
            return;
        }

        if (tipous == 'U' || cmatriz!=""){
            const newWindow = window.open(
                `${baseUrl}portalcli/cargar/index/${codCli}`,
                '_blank',
                'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,' +
                `left=${screen.width / 2 - 400},top=${screen.height / 2 - 300}`
            );
        }else{
            const newWindow = window.open(
                `${baseUrl}portalcli/cargar/index/${usuario}`,
                '_blank',
                'width=800,height=600,scrollbars=yes,status=yes,resizable=yes,' +
                `left=${screen.width / 2 - 400},top=${screen.height / 2 - 300}`
            );
        }
    
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
    }

    function buscaalmacen(){
        const codCli = localStorage.getItem(`idcli_${usuario}`);
        $.ajax({
            type: "POST",
            url: baseUrl + "portalcli/buscaalmacen",
            data: { codCli: codCli },
            success: function(response) {
                var almacen = response.ubides;
                var ubica   = response.ubica;
                var descripseg = response.descrip;
                var descvol = response.descvol;
                if (almacen) {
                    $('#almacli').text(almacen);
                    $('#almacli').attr('data-almacen', ubica);
                    $('#condicli').text(descripseg);
                    $('#segmecli').text(descvol);
                }



            },
            error: function(error) {
                console.error('Error in AJAX request:', error);
            }
        });
    }

    //REGISTRO PARA CLIENTES SIN USUARIO AL PORTAL
   /*  function carshopcli(open) {
        if(open!='no'){
            if(tipous=='U' || cmatriz!=''){
                const codCliInput = document.getElementById('idcli');
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
                if (nombre !== '') {
                    $(".inventario__table-container").show();
                    $(".content").show();
                } else {                
                    $(".inventario__table-container").hide();
                    $(".content").hide();
                }
            }else{
                const codCli = usuario;

                if (usuario != '') {
                    buscaalmacen();    
                }
            }
            opencar();
        }

    } */
    

    function carshopcli(open) {
        if (open !== 'no') {
            if (tipous === 'U' || cmatriz !== '') {
                const codCliInput = document.getElementById('idcli');
                if (codCliInput) {
                    const clienteSeleccionado = document.getElementById('cliente_seleccionado');
                    const carnomcli = document.getElementById('car_buscascli');
                    const selectedOption = codCliInput.options[codCliInput.selectedIndex]; // Obtener la opción seleccionada
                    
    
                    const codCli = codCliInput.value;
                    const nombre = selectedOption?.getAttribute('data-nombre') || '';
        
                    clienteSeleccionado.textContent = nombre ? `${nombre}` : '';
                    carnomcli.textContent = nombre ? 'Para: ' + `${nombre}` + ' (' + codCli + ')' : 'No hay cliente seleccionado';
        
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
                    if (nombre !== '') {
                        $(".inventario__table-container").show();
                        $(".content").show();
                    } else {
                        $(".inventario__table-container").hide();
                        $(".content").hide();
                    }
                }

            } else {
                const codCli = usuario;
    
                if (usuario !== '') {
                    buscaalmacen();
                }
            }
            opencar();
        }
    }
        

    // Recuperar el valor de idcli desde localStorage al cargar la página
    /* window.onload = function() {
        if(usuario){
            const codCli = localStorage.getItem(`idcli_${usuario}`);
            if(tipous=='U'  || cmatriz!=''){
                if (codCli) {
                    document.getElementById('idcli').value = codCli;
                }
            }
            //carshopcli();
        }
    }  */

        /* const codCli = localStorage.getItem(`idcli_${usuario}`);
        const nomCli = localStorage.getItem(`nomcli_${usuario}`);
        $('#idcli').val(codCli);
        $('#idcli').text(codCli);


        if(nomCli!==null){
            $('#cliente_seleccionado').val(nomCli);
            $('#cliente_seleccionado').text(nomCli);
            $('#car_buscascli').text('Para: ' + nomCli + '('+ codCli +')');
        }else{
            $('#car_buscascli').text('No hay cliente seleccionado');
        } */

            const codCli = localStorage.getItem(`idcli_${usuario}`);
            const nomCli = localStorage.getItem(`nomcli_${usuario}`);

            // Seleccionar la opción correcta en el dropdown
            if (codCli !== null) {
                $('#idcli').val(codCli); // Establece el valor del dropdown
            }

            if (nomCli !== null) {
                // Actualizar la información del cliente seleccionado
                $('#cliente_seleccionado').text(nomCli);
                $('#car_buscascli').text('Para: ' + nomCli + ' (' + codCli + ')');
            } else {
                // Mensaje si no hay cliente seleccionado
                $('#car_buscascli').text('No hay cliente seleccionado');
            }

        //Agrega producto al carrito con tecla enter
       function eventcant(codigo,cana){ if(event.keyCode=="13") { agg_pedido(codigo, cana); } }

        //Agrega producto seleccionado al carrito
        var registrate__button = document.getElementById('registrate__button');

        if (registrate__button) {
            $("#loader").show();

            document.getElementById("registrate__button").addEventListener("click", function(event) {
                event.preventDefault(); // Evita que el enlace se comporte como un enlace normal (no recargue la página)
                $.post(baseUrl + "portalcli/registro", function(data){
                    $("#login__container").html(data);
                    $("#loader").hide();
                });
            });
        }

        olpws__button
        var olpws__button = document.getElementById('olpws__button');

        if (olpws__button) {
            document.getElementById("olpws__button").addEventListener("click", function(event) {
                event.preventDefault(); // Evita que el enlace se comporte como un enlace normal (no recargue la página)
                $.post(baseUrl + "portalcli/olpws", function(data){
                    $("#login__container").html(data);
                });
            });
        }

        //Interaccion de las imagenes en el portal bienvenido
        document.addEventListener('DOMContentLoaded', function() {
            //Dropdown del menu
                // Selecciona todos los menús desplegables
            const dropdowns = document.querySelectorAll('.dropdown');

            // Recorre cada menú desplegable
            dropdowns.forEach(dropdown => {
                const toggle = dropdown.querySelector('.dropdown__toggle');
                const content = dropdown.querySelector('.dropdown__content');

                // Muestra u oculta el menú al hacer clic en el toggle
                toggle.addEventListener('click', function (event) {
                    event.stopPropagation(); // Evita que el clic se propague

                    // Cierra todos los demás menús
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.querySelector('.dropdown__content').style.display = 'none';
                        }
                    });

                    // Abre o cierra el menú actual
                    content.style.display = content.style.display === 'block' ? 'none' : 'block';
                });
            });

            // Cierra todos los menús al hacer clic fuera de ellos
            document.addEventListener('click', function () {
                dropdowns.forEach(dropdown => {
                    dropdown.querySelector('.dropdown__content').style.display = 'none';
                });
            });
            const carousel = document.getElementById('carousel');
            const images = carousel.getElementsByTagName('img');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            
            let currentIndex = 0;

            function updateCarousel() {
                const offset = -currentIndex * 100;
                for (let i = 0; i < images.length; i++) {
                    images[i].style.transform = `translateX(${offset}%)`;
                }
            }

            function showNextImage() {
                currentIndex = (currentIndex + 1) % images.length;
                updateCarousel();
            }

            function showPrevImage() {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                updateCarousel();
            }

            nextBtn.addEventListener('click', showNextImage);
            prevBtn.addEventListener('click', showPrevImage);

            // Automatic sliding (optional)
            setInterval(showNextImage, 3000);

            const hamburger = document.getElementById('hamburger');
            const menu = document.getElementById('menu');
            const closeMenu = document.getElementById('closeMenu');
            //const overlay = document.getElementById('overlay');
            const pantallaPrincipal = document.querySelector('.principal__pantalla');
            const contInputSearch = document.querySelector('.cont-input-search');
            
            // Abrir el menú y ajustar el layout
            hamburger.addEventListener('click', function() {
                if (menu.classList.contains("openmenu") && pantallaPrincipal.classList.contains("menu-active")) {
                    closeHamburguer();
                } else {
                    openHamburguer(); // Si está cerrado, ábrelo
                }
            });
            
            // Cerrar el menú y restaurar el layout
            closeMenu.addEventListener('click', function() {
                closeHamburguer();
            });
            
            // Cerrar el menú al hacer clic fuera de él
            document.addEventListener('click', function(event) {
                if(viewonline!='portalcli'){
                    if (!menu.contains(event.target) && event.target !== hamburger) {
                        closeHamburguer();
                    }
                }

                if ($(window).width() <= 780) { // Ajusta el ancho según necesites
                    if (!menu.contains(event.target) && event.target !== hamburger) {
                        closeHamburguer();
                    }
                }

            });

            function openHamburguer(){
                console.log(viewonline)
                if(viewonline=='portalcli'){
                    menu.classList.add("openmenu");
                    pantallaPrincipal.classList.add("menu-active");
                    contInputSearch.classList.add("adjust"); 
                }else{
                    menu.classList.add("menu-menu__active");
                    menu.classList.remove("openmenu");

                }

            }
            
            function closeHamburguer() {
                if(viewonline!='portalcli'){
                    menu.classList.remove("menu-menu__active");
                    pantallaPrincipal.classList.remove("menu-active");
                }else{
                    menu.classList.remove("openmenu");
                    pantallaPrincipal.classList.remove("menu-active");
                    contInputSearch.classList.remove("adjust");
                }

            }

            function abreinventariop(){
                $.post(baseUrl + "portalcli/inventariop", function (data) {
                    setTimeout(function () {
                        $(".content__general").html(data);
                        viewonline = 'inventario';
                        carshopcli();
                        initSinvpcli();
                        closeHamburguer();
                        $("#loader").hide();
                    }, 200);
                });
            }
    
            // Obtener el contenedor de la barra de navegación
            var navbarLinks = document.querySelectorAll(".navbar__content a");

            // Iterar sobre cada enlace y agregar un event listener
            navbarLinks.forEach(function(link) {
                link.addEventListener("click", function(event) {
                    // Prevenir el comportamiento predeterminado de los enlaces
                    event.preventDefault();
            
                    // Obtener el ID del enlace clicado
                    var id = event.target.id;
            
                    // Realizar una acción basada en el ID del enlace
                    if (id == "b1" || id == "c1") {
                        window.location = baseUrl +'portalcli';
                    } else if (id == "b2" || id == "c2") {
                        $("#loader").show();
                        /* Swal.fire({
                            imageUrl: baseUrl + "assets/images/banner2.png",
                            imageAlt: "A tall image",
                            showConfirmButton: false, // Oculta el botón de confirmación
                            showCloseButton: false,   // Oculta el botón de cerrar
                            html: '',                 // Sin texto adicional
                            width: 'auto',            // Ancho automático basado en la imagen
                            background: 'none',       // Fondo transparente
                            backdrop: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semi-transparente
                            customClass: {
                                popup: 'custom-swal-popup', // Clase personalizada para el modal
                                image: 'custom-swal-image'  // Clase personalizada para la imagen
                            }
                        }); */

                        abreinventariop();                    
                    } else if (id == "b3" || id == "c3") {
                        $("#loader").show();
                        const codCli = localStorage.getItem(`idcli_${usuario}`);
                        regsession();

                        $.post(baseUrl + "portalcli/historialped", {codCli: codCli},function(data){
                            setTimeout(function() {
                                viewonline = 'historial';
                                $(".content__general").html(data);
                                //carshopcli();
                                $("#loader").hide();
                            }, 200);
                        });
                    } else if (id == "b4" || id == "c4") {
                        $("#loader").show();
                        regsession();

                        $.post(baseUrl + "portalcli/profilescli", function(data){
                            setTimeout(function() {
                                $(".content__general").html(data);
                                $("#loader").hide();
                            }, 200);                    });
                    } else if (id == "b5" || id == "c5") {
                        $("#loader").show();

                        $.post(baseUrl + "portalcli/cese", function(data){
                            location.reload(); 
                        });
                    } else if (id == "b6" || id == "c6") {
                        $("#loader").show();

                        $.post(baseUrl + "portalcli/facturaspago", function(data){
                            setTimeout(function() {
                                $(".content__general").html(data);
                                carshopcli();
                                $("#loader").hide();
                            }, 200);                    });
                    } else {
                        // Acción por defecto si no se reconoce el ID
                        console.log("Enlace no reconocido");
                    }
                });
            });

                // Agregar un marcador de posición para recordar la ubicación original
                if (!$('#welcome-placeholder').length) {
                    $('.welcome-container').before('<div id="welcome-placeholder"></div>');
                }

                function moveWelcomeContainer() {
                    if ($(window).width() <= 980) { // Ajusta el ancho según necesites
                        closeHamburguer(); 
                    }

                    if ($(window).width() <= 768) { // Ajusta el ancho según necesites
                        if (!$('.menu__general .welcome-container').length) {
                            $('.menu__general').prepend($('.welcome-container')); // Lo mueve al principio en pantallas pequeñas
                        }
                    } else {
                        if (!$('#welcome-placeholder').next('.welcome-container').length) {
                            $('#welcome-placeholder').after($('.welcome-container')); // Lo devuelve a su lugar original en pantallas grandes
                        }
                    }
                }

                moveWelcomeContainer(); // Ejecutar al cargar
                $(window).resize(moveWelcomeContainer);

                window.abreinventariop = abreinventariop;
        });


        function limpiafiltrolateral() {
            // Resetear los inputs ocultos
            document.getElementById("dproveed").value = "";
            document.getElementById("dmarca").value = "";
        
            // Desmarcar los filtros seleccionados
            document.querySelectorAll(".filter-item.selected").forEach(item => {
                item.classList.remove("selected");
            });
        
            // Deseleccionar los checkboxes
            document.querySelectorAll(".filter-checkbox").forEach(checkbox => {
                checkbox.checked = false;
            });
        
            // Recargar la tabla con los filtros vacíos
            $('#table_inventario').DataTable().ajax.reload();
        }

        let selectedFiltersprv = [];
        let orderBy;

        //Filtro lateral de proveedores en el inventario 
        function initSinvpcli() {
            const dropdownOrderBy = document.querySelector('.dropdown-order-by');
            const dropdownToggle = document.getElementById('dropdown-order-by-toggle');
            const dropdownContent = document.getElementById('dropdown-order-by-content');
            const dropdownIcon = dropdownToggle.querySelector('.dropdown-order-by__icon');
        
            // Texto inicial del botón
            const initialText = dropdownToggle.textContent.trim();
        
            // Abrir/cerrar el dropdown al hacer clic en el toggle
            dropdownToggle.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
        
                // Alternar la visibilidad del contenido del dropdown
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
                dropdownOrderBy.classList.toggle('active');
            });
        
            // Cerrar el dropdown al hacer clic fuera de él
            document.addEventListener('click', function (event) {
                if (!dropdownOrderBy.contains(event.target)) {
                    dropdownContent.style.display = 'none';
                    dropdownOrderBy.classList.remove('active');
                }
            });
        
            // Manejar la selección de una opción de ordenamiento
            dropdownContent.querySelectorAll('a').forEach(option => {
                option.addEventListener('click', function (event) {
                    event.preventDefault();
        
                    const optionText = this.textContent.trim();
                    orderBy = this.getAttribute('data-order-by');
                    // Actualizar el texto del botón con la opción seleccionada
                    dropdownToggle.innerHTML = `
                        <i class="fas fa-sort"></i>
                        Ordenar por: ${optionText} <span class="dropdown-order-by__icon">&#9660;</span>
                    `;
        
                    console.log(`Ordenar por: ${orderBy}`);
        
                    // Aquí puedes llamar a una función para aplicar el ordenamiento
                    aplicarOrdenamiento(orderBy);
        
                    // Cerrar el dropdown después de seleccionar una opción
                    dropdownContent.style.display = 'none';
                    dropdownOrderBy.classList.remove('active');
                });
            });
        
            // Función para aplicar el ordenamiento (debes implementarla según tu lógica)
            function aplicarOrdenamiento(orderBy) {
                console.log(`Aplicando ordenamiento por: ${orderBy}`);
            
                let columnIndex = {
                    nombre: 1,      // Índice de la columna "Descripción"
                    proveedor: 2,   // Índice de la columna "Proveedor"
                    precio: 5,      // Índice de la columna "Precio"
                    existencia: 6
                };
            
                let orderDirection = 'asc'; // Puedes modificarlo si quieres alternar asc/desc
                let dataTable = $('#table_inventario').DataTable();
            
                dataTable.order([columnIndex[orderBy], orderDirection]).draw(); // Aplica el ordenamiento
            }
            
            // Inicializar cada sidebar de filtros
            document.querySelectorAll(".sidebar-filters").forEach(sidebar => {
                const filterItems = sidebar.querySelectorAll(".filter-item");
                const searchInput = sidebar.querySelector(".buscador-filtro-input");
                const hiddenInput = sidebar.querySelector("input[type='hidden']");
                const topIndicator = sidebar.querySelector(".scroll-indicator.top");
                const bottomIndicator = sidebar.querySelector(".scroll-indicator.bottom");
                const selectedFiltersprvContainer = sidebar.querySelector("#selected-filters");
            
                if (!filterItems.length || !hiddenInput || !searchInput) return;
            
                // Array para almacenar los filtros seleccionados
                let selectedFiltersprv = [];
            
                // Función para desmarcar un filtro en la lista de filterItems
                function desmarcarFiltroEnLista(value) {
                    filterItems.forEach(item => {
                        if (item.getAttribute("data-value") === value) {
                            item.classList.remove("selected");
                        }
                    });
                }
            
                // Función para actualizar los filtros seleccionados en la interfaz
                function updateSelectedFiltersprv() {
                    selectedFiltersprvContainer.innerHTML = ""; // Limpiar el contenedor
            
                    selectedFiltersprv.forEach(filter => {
                        const filterElement = document.createElement("div");
                        filterElement.className = "selected-filter";
                        filterElement.innerHTML = `
                            ${filter.text}
                            <span class="remove-filter" data-value="${filter.value}">×</span>
                        `;
            
                        // Eliminar el filtro al hacer clic en el botón "×"
                        filterElement.querySelector(".remove-filter").addEventListener("click", function () {
                            selectedFiltersprv = selectedFiltersprv.filter(f => f.value !== filter.value);
                            desmarcarFiltroEnLista(filter.value); // Desmarcar el filtro en la lista
                            updateSelectedFiltersprv();
                            aplicarFiltro(selectedFiltersprv.map(f => f.value));
                        });
            
                        selectedFiltersprvContainer.appendChild(filterElement);
                    });
                }
            
                // Función para filtrar la lista de opciones
                function filtrarLista(terminoBusqueda) {
                    const searchText = terminoBusqueda.toLowerCase();
            
                    filterItems.forEach(item => {
                        const textoItem = item.textContent.toLowerCase();
                        item.classList.toggle("oculto", !textoItem.includes(searchText));
                    });
            
                    updateScrollIndicators();
                }
            
                // Evento de búsqueda en el input
                searchInput.addEventListener("input", function () {
                    filtrarLista(this.value.trim());
                });
            
                // Selección de filtros
                filterItems.forEach(item => {
                    item.addEventListener("click", function () {
                        const value = this.getAttribute("data-value");
                        const text = this.textContent.trim();
                        const isSelected = this.classList.contains("selected");
            
                        if (isSelected) {
                            // Deseleccionar el filtro
                            this.classList.remove("selected");
                            selectedFiltersprv = selectedFiltersprv.filter(f => f.value !== value);
                        } else {
                            // Seleccionar el filtro
                            this.classList.add("selected");
                            selectedFiltersprv.push({ value, text });
                        }
            
                        // Actualizar la interfaz y aplicar los filtros
                        updateSelectedFiltersprv();
                        aplicarFiltro(selectedFiltersprv.map(f => f.value));
                    });
                });
            
                // Función para actualizar los indicadores de scroll
                function updateScrollIndicators() {
                    if (topIndicator && bottomIndicator) {
                        topIndicator.classList.toggle("hidden", sidebar.scrollTop === 0);
                        bottomIndicator.classList.toggle("hidden", sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight);
                    }
                }
            
                // Evento de scroll
                if (topIndicator && bottomIndicator) {
                    sidebar.addEventListener("scroll", updateScrollIndicators);
                    updateScrollIndicators();
                }
            });
        }
        
        // Función de filtrado global (ajustar según sea necesario)
        function aplicarFiltro(valores) {
            console.log("Aplicando filtros con valores:", valores);
            $('#table_inventario').DataTable().ajax.reload();
        }
            
   
    //Agregar producto al carrito
    function agg_pedido(codigo, cana) {
        regsession();
        const codCli = localStorage.getItem(`idcli_${usuario}`);
        const button = document.getElementById(`aggpedido_${codigo}`);
        const originalContent = button.innerHTML;
    
        if (tipous === 'U' || (cmatriz !== "" && (!codCli || codCli === ''))) {
            Swal.fire({
                text: 'Debe seleccionar un cliente para procesar pedidos!',
                icon: 'warning',
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                position: 'bottom-end',
            });
            return;
        }
    
        if (cana > 0) {
            const postData = { codigo, cana, codCli, usuario };
    
            // Cambiar el botón a loader y deshabilitarlo
            button.innerHTML = `<span class="loader__button"></span>`;
            button.disabled = true;
    
            // Realizar la solicitud AJAX
            $.ajax({
                url: baseUrl + 'portalcli/agg_pedido2/',
                type: 'POST',
                data: postData,
                success: function (response) {
                    button.innerHTML = originalContent;
                    button.disabled = false;
    
                    Swal.fire({
                        text: response === 'Producto Agregado' ? 'Pedido agregado exitosamente!' : response,
                        icon: response === 'Producto Agregado' ? 'success' : 'error',
                        showConfirmButton: false,
                        timer: 3000,
                        toast: true,
                        position: 'bottom-end',
                    });
    
                    if (response === 'Producto Agregado') {
                        opencar(); // Refrescar el carrito si es necesario
                    }
                },
                error: function () {
                    button.innerHTML = originalContent;
                    button.disabled = false;
    
                    Swal.fire({
                        text: 'Error al procesar el pedido',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 3000,
                        toast: true,
                        position: 'bottom-end',
                    });
                },
            });
        } else {
            Swal.fire({
                text: 'Cantidad debe ser mayor a 0!',
                icon: 'warning',
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                position: 'bottom-end',
            });
        }
    } 

    function agg_all(codigo, cana) {
        regsession();
        const codCli = localStorage.getItem(`idcli_${usuario}`);
        const button = document.getElementById(`aggall_${codigo}`);
        const originalContent = button.innerHTML;
    
        if (cana > 0) {
            $.ajax({
                type: "POST",
                url: baseUrl + "portalcli/clientes/JS",
                dataType: "json",
                success: function (response) {
                    let tableHTML = generarTablaCheckbox(response);
    
                    Swal.fire({
                        title: 'Selecciona las sucursales',
                        html: tableHTML,
                        showCancelButton: true,
                        confirmButtonText: 'Enviar a los carritos',
                        cancelButtonText: 'Cancelar',
                        width: '800px',
                        heightAuto: false,
                        customClass: {
                            popup: 'swal2-custom-height'
                        },
                        didOpen: () => {
                            inicializardtcm();
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            let seleccionados = $('#clientesaenviar').DataTable().rows({ selected: true }).data().toArray();
                            if (seleccionados.length > 0) {
                                let clientesSeleccionados = seleccionados.map(cliente => cliente[1]);
                                console.log("Clientes seleccionados:", clientesSeleccionados);
                                envia_all(clientesSeleccionados, cana, codigo);
                            } else {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'No seleccionaste ningún cliente',
                                    timer: 1500,
                                    showConfirmButton: false
                                });
                            }
                        }
                    });
                },
                error: function (error) {
                    console.error('Error en la solicitud AJAX:', error);
                }
            });
        } else {
            Swal.fire({
                text: 'Cantidad debe ser mayor a 0!',
                icon: 'warning',
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                position: 'bottom-end',
            });
        }
    }
    
    function generarTablaCheckbox(clientes) {
        let html = `
            <p>El producto se enviara al carrito de cada sucursal seleccionada</p>
            <table id="clientesaenviar" class="display" style="width:100%">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll"/></th> <!-- Celda para el checkbox -->
                        <th>Clientes</th>
                        <th>Nombre</th>
                    </tr>
                </thead>
                <tbody>
        `;
    
        clientes.forEach(cliente => {
            html += `
                <tr>
                    <td></td> <!-- Celda vacía para el checkbox -->
                    <td>${cliente.cliente}</td>
                    <td>${cliente.nombre}</td>
                </tr>
            `;
        });
    
        html += `
                </tbody>
            </table>
        `;
    
        return html;
    }
    
    //Inicia la tabla de las casas matrices
    function inicializardtcm() {
        let table = $('#clientesaenviar').DataTable({
            paging: true,
            searching: true,
            ordering: true,
            lengthChange: false,
            pageLength: 12,
            language: {
                search: '',
                searchPlaceholder: 'Buscar farmacia...'
            },
            initComplete: function () {
                $('.dataTables_filter input').addClass('centered-search');
    
                // Agregar el checkbox "Seleccionar todos" en el encabezado
                //let headerCheckbox = $('<th><input type="checkbox" id="selectAll"></th>');
                //$('#clientesaenviar thead tr').prepend(headerCheckbox);
    
                // Manejar el evento del checkbox "Seleccionar todos"
                $('#selectAll').on('click', function () {
                    let isChecked = $(this).prop('checked');
                    table.rows({ page: 'all' }).nodes().to$().find('input[type="checkbox"]').prop('checked', isChecked);
                    if (isChecked) {
                        table.rows({ page: 'all' }).select();
                    } else {
                        table.rows({ page: 'all' }).deselect();
                    }
                });
    
                // Manejar el evento de los checkboxes individuales
                $('#clientesaenviar tbody').on('change', 'input[type="checkbox"]', function () {
                    let row = $(this).closest('tr');
                    let isChecked = $(this).prop('checked');
                    if (isChecked) {
                        table.row(row).select();
                    } else {
                        table.row(row).deselect();
                    }
                    updateSelectAllCheckbox(table);
                });
            },
            columnDefs: [{
                targets: 0, // La primera columna es para los checkboxes
                orderable: false,
                className: 'select-checkbox',
                checkboxes: { selectRow: true }
            }],
            select: {
                style: 'multi',
                selector: 'td:first-child'
            }
        });
    
        // Función para actualizar el estado del checkbox "Seleccionar todos"
        function updateSelectAllCheckbox(table) {
            let allSelected = table.rows({ selected: true }).count() === table.rows().count();
            $('#selectAll').prop('checked', allSelected);
        }
    }

    //Envia el producto a todos los carritos 
    function envia_all(clientesSeleccionados, cana, codigo) {
        let clientesStr = clientesSeleccionados.join(",");
        console.log("Clientes seleccionados:", clientesSeleccionados);
    
        const postData = { codigo, cana, clientesSeleccionados };
    
        $.ajax({
            url: baseUrl + 'portalcli/envia_all/',
            type: 'POST',
            data: postData,
            success: function (response) {
                try {
                    const data = JSON.parse(response); // Parsear la respuesta JSON
    
                    if (data.status === 'success') {
                        Swal.fire({
                            text: data.message,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 3000,
                            toast: true,
                            position: 'bottom-end',
                        });
                        opencar(); // Actualizar el carrito
                    } else {
                        Swal.fire({
                            text: data.message,
                            icon: 'error',
                            showConfirmButton: false,
                            timer: 3000,
                            toast: true,
                            position: 'bottom-end',
                        });
                    }
                } catch (e) {
                    console.error('Error al procesar la respuesta:', e);
                    Swal.fire({
                        text: 'Error inesperado al procesar la respuesta',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 3000,
                        toast: true,
                        position: 'bottom-end',
                    });
                }
            },
            error: function () {
                Swal.fire({
                    text: 'Error al procesar el pedido',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true,
                    position: 'bottom-end',
                });
            },
        });
    }

    //Cierra el contenedor del carshop
    function closecar(){
        //$('.car__container').css('display', 'none');
        $('.car__container').css('width', '0'); // Cambiar el ancho del contenedor para ocultarlo
        $('.container__carshop').css('right', '100%'); 
    }

$(document).ready(function() {
    $('#closeCar').click(function(event) {
        closecar();
    });

    // Evento de clic fuera del contenedor para cerrarlo
    $(document).mouseup(function(event) {
        var container = $(".container__carshop");

    });

    function calcutot() {
        var subtotalbs = 0,
            tivabs = 0,
            totalBs = 0,
            tasad = 0;
    
        $('#car-table input').each(function (idx, e) {
            var cana = parseFloat($(e).val()) || 0,
                precio = parseFloat($(e).data('precio')) || 0,
                iva = parseFloat($(e).data('iva')) || 0,
                descu = parseFloat($(e).data('descu')) || 0,
                tasad = parseFloat($(e).data('tasa')) || 1; // Asegurar que tasad no sea 0
    
            var precio = parseFloat((precio * ((100 - descu) / 100)) * cana),
                preciosiniva = (precio / cana) * ((100 - iva) / 100),
                niva = (precio / cana) * (iva / 100);
    
            subtotalbs += preciosiniva * cana;
            tivabs += niva * cana;
            totalBs = parseFloat(totalBs) + precio;
        });
    
        // Verificar si tasad es cero y asignar un valor predeterminado (por ejemplo, 1)
        if (tasad === 0) {
            tasad = 1; // Evitar división por cero
        }
    
        // Crear el resumen del pedido
        var resumenHtml = `
        <div class="summary__container">
            <table class="table__summary">
                <tr>
                    <td>Sub. Total Bs:</td>
                    <td>${Number(subtotalbs.toFixed(2)).toLocaleString('es')}</td>
                    <td>Sub. Total $:</td>
                    <td>${Number((subtotalbs / tasad).toFixed(2)).toLocaleString('es')}</td>
                </tr>
                <tr>
                    <td>Iva Bs:</td>
                    <td>${Number(tivabs.toFixed(2)).toLocaleString('es')}</td>
                    <td>Iva $:</td>
                    <td>${Number((tivabs / tasad).toFixed(2)).toLocaleString('es')}</td>
                </tr>
                <tr>
                    <td>Total Bs:</td>
                    <td>${Number(totalBs.toFixed(2)).toLocaleString('es')}</td>
                    <td>Total $:</td>
                    <td>${Number((totalBs / tasad).toFixed(2)).toLocaleString('es')}</td>
                </tr>
            </table>
            <button class="btn__checkout" onclick="enviaped()">Finalizar Compra</button>
        </div>`;
    
        // Eliminar el resumen del pedido existente antes de añadir uno nuevo
        $('.summary__container').remove();
        // Añadir el resumen del pedido al final del contenedor del carrito
        $('.carshop__content').append(resumenHtml);
    }

    // Mostrar el contenedor del carrito
    function opencar(opencontainer='') {
        const codCli = localStorage.getItem(`idcli_${usuario}`);

        if(opencontainer=='yes'){
            $('.car__container').css('width', '100%'); // Cambiar el ancho del contenedor para que se muestre completamente
            $('.container__carshop').css('right', '0'); 
        }

        var ivabs=0;
        var subtotalbs=0;
        var totalBs=0;
        var totalItems = 0;
        var postData = {
            codCli: codCli
        };
        $.ajax({
            url: baseUrl + 'portalcli/opencardb2/',
            type: 'post',
            data: postData,
            success: function(data) {
                //Swal.close();
                table.clear();
                var pedidos = JSON.parse(data);
                pedidos.forEach(function(pedido) {
                    itscar(pedido.codigoa,pedido.cant);
                    subtotalbs += parseFloat(pedido.bssiniva); 
                    totalBs += parseFloat(pedido.totalbs); 
                    ivabs += parseFloat(pedido.tivabs); 
                
                    totalItems += 1;
                
                    var totales = 
                        '<div class="hidden-mobile">' + 
                            '<strong>Precio Bs.:</strong> ' + subtotalbs + '<br>' +
                            '<strong>Iva Bs.:</strong> ' + ivabs + '<br>' +
                            '<strong>Total Bs.:</strong> ' + totalBs +
                        '</div>';
                    var itvas = parseFloat((pedido.oprecio*((100-pedido.descu)/100))*(pedido.iva/100));

                    pedido.preciosiniva = pedido.preciosiniva - itvas;
                    pedido.totald = pedido.totalbs/pedido.tasa;
                    pedido.opreciod = pedido.oprecio/pedido.tasa;
                    pedido.preciosinivad = pedido.preciosiniva/pedido.tasa;

                    Number(subtotalbs.toFixed(2)).toLocaleString('es');

                    table.row.add([
                        `<img src="${baseUrl}uploads/inventario/Image/th_${pedido.codigoa}_.png"/>${pedido.descrip} ${((pedido.descu > 0)? `<span style="color:green;">(${pedido.descu}%)</span>`:'')} ${((pedido.escala > 0)? `<span style="color:purple;">(${pedido.escala}%)</span>`:'')}`,
                        Number(parseFloat(pedido.preciosiniva).toFixed(2)).toLocaleString('es'),
                        `${parseFloat(pedido.iva).toFixed(2)} %`,

                        Number(parseFloat(pedido.preciosinivad).toFixed(2)).toLocaleString('es'),
                        `${parseFloat(pedido.iva).toFixed(2)} %`,
                        `<div id="totald_${pedido.codigoa}">${(pedido.descu>0)? `<s style="color:red;font-size:.8 rem;">${parseFloat(pedido.totalbs).toFixed(2)}</s> <p style="color:green;">${Number(parseFloat(pedido.totalbs*((100-pedido.descu)/100)).toFixed(2)).toLocaleString('es')}</p>`:Number(parseFloat(pedido.totalbs).toFixed(2)).toLocaleString('es')}</div>`,
                        `<div id="totalbs_${pedido.codigoa}">${(pedido.descu>0)? `<s style="color:red;font-size:.8 rem;">${parseFloat(pedido.totald).toFixed(2)}</s> <p style="color:green;">${Number(parseFloat(pedido.totald*((100-pedido.descu)/100)).toFixed(2)).toLocaleString('es')}</p>`:Number(parseFloat(pedido.totald).toFixed(2)).toLocaleString('es')}</div>`,
                        //totales,
                        //'<td class="hidden-mobile">' + totales + '</td>',
                        `<div class="quantity-container">
                            <button class="quantity-btn" onclick="updatecant('${pedido.id_pedido}','${pedido.codigoa}','${pedido.existen}','-')">-</button>
                            <input type="numeric" min="1" data-tasa="${pedido.tasa}" data-descu="${pedido.descu}" data-precio="${pedido.oprecio}" data-iva="${pedido.iva}" id="cantidad_${pedido.codigoa}" value="${pedido.cant}" onchange="validacant(this,'${pedido.id_pedido}', '${pedido.codigoa}','${pedido.existen}')" class="quantity-input">
                            <button class="quantity-btn" onclick="updatecant('${pedido.id_pedido}','${pedido.codigoa}','${pedido.existen}',  '+')">+</button>
                        </div>`,
                        `<img onclick="eliminareg(this,'${pedido.id_pedido}','${pedido.codigoa}')" class="eliminareg__icon" src="${baseUrl}assets/images/Portal proteo-18.png" title="Eliminar producto del carrito" alt="">`
                    ]);
                });

                table.draw();
                
                // Actualizar el círculo de notificación con la cantidad de productos
                document.getElementById('cart-count').textContent = totalItems;
                calcutot();
                
            },
            error: function(message) {
                console.log('error:(((');
            }
        });
    }

    //Actualiza cantidad en renglon
    function updatecant(idPedido, codigo,existen, change) {
        var input = $('#cantidad_' + codigo);
        var cantidad = parseInt(input.val());
        var newValue =cantidad+((change=='-')? -1:1);
        $('#cantidad_' + codigo).val(newValue);
        if(newValue>0){
            totaliza(codigo, idPedido, newValue,existen);
        }
    }

    //Envia pedidos al servidor
    function enviaped(){
        regsession();

        const codCli = localStorage.getItem(`idcli_${usuario}`);

            var postData = {
                codCli: codCli
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
                    url: baseUrl + 'portalcli/enviaped/',
                    type: "POST",
                    data: postData,
                    success: function (data) {
                        opencar();
                    }
                });
                Swal.fire('Pedido enviado', '', 'success');
            }
            });
    }

    //Actualiza cantidad en renglon
    function validacant(input, idPedido, codigo,existen) {
        var value = input.value;
        if (!/^\d+$/.test(value)) {// Valida que el valor sea un número del 0 al 9
            input.value = 0; // Resetea el valor si no es válido
            Swal.fire('Solo se permiten valores numéricos del 0 al 9', '', 'warning');
        } else {
            totaliza(codigo, idPedido, value,existen);
        }
    }

    function retotalbs(codigo){
        var input = $('#cantidad_' + codigo),
        precio = input.data('precio'),
        descu = input.data('descu'),
        cantidad = input.val(),
        totalbs = precio*cantidad,
        valor = `${(pedido.descu>0)? `<s style="color:red;font-size:1 rem;">${parseFloat(totalbs).toFixed(2)}</s> <p style="color:green;">${parseFloat(totalbs*((100-descu)/100)).toFixed(2)}</p>`:parseFloat(totalbs).toFixed(2)}</div>`;

        $(`#totalbs_${codigo}`).html(valor);
        calcutot();
    }

    //Totaliza carrito
    function totaliza(codigo, idPedido, value,existen) {
        existen = parseInt(existen);
        if(value>existen){
            Swal.fire('Cantidad mayor a existencia', '', 'error');
            return true;
        }
        
        $.ajax({
            url: baseUrl + 'portalcli/totalizacampo', // Ruta al archivo PHP que realizará el update
            method: 'POST', // Método de la solicitud   
            data: { idPedido: idPedido, cantidad: value, codigo: codigo}, // Datos que se enviarán al archivo PHP
            success: function(response) {
                //opencar();
            },
            error: function(xhr, status, error) {
                console.log(error);
            }
        });
        retotalbs(codigo);
    } 

    function itscar(codigo,cantidadEnCarrito=0) {
        const codCli = localStorage.getItem(`idcli_${usuario}`);

        // 1. Desmarcar estrictamente todos los botones
        $(".aggpedido").each(function() {
            $(this).html('<i class="fa-solid fa-cart-plus"></i>');
            $(this).removeClass("send__button-check").addClass("send__button");
        });
        $(".aggpedido2").each(function() {
            $(this).html('Agregar al carrito');
            $(this).removeClass("send__button-check").addClass("send__button");
        });

        // 2. Actualizar estrictamente solo el botón del producto actual basado en la respuesta
        var $boton = $("#aggpedido_" + codigo);
        var $boton2 = $("#aggpedido2_" + codigo);

        if (cantidadEnCarrito > 0) {
            // Si el producto está en el carrito, lo marcamos
            $boton.html('<i class="fa-solid fa-square-check"></i>');
            $boton.removeClass("send__button").addClass("send__button-check");
            $boton2.html('<i class="fa-solid fa-square-check"></i>');
            $boton2.removeClass("send__button").addClass("send__button-check");
        } else {
            // Si el producto NO está en el carrito, lo dejamos desmarcado
            $boton.html('<i class="fa-solid fa-cart-plus"></i>');
            $boton.removeClass("send__button-check").addClass("send__button");
            $boton2.html('<i class="fa-solid fa-cart-plus"></i>');
            $boton2.removeClass("send__button-check").addClass("send__button");
        }

        /*
        $.ajax({
            type: "POST",
            url: baseUrl + "portalcli/itscar",
            data: { codigo: codigo, codCli: codCli },
            success: function(response) {
                /* var cantidadEnCarrito = parseInt(response);
                var $boton = $("#aggpedido_" + codigo);
    
                if (cantidadEnCarrito > 0) {
                    $boton.html('<i class="fa-solid fa-square-check"></i>');
                    $boton.removeClass("send__button").addClass("send__button-check");
                } else {

                    // Si la cantidad es 0 o la respuesta es vacía, actualiza todos los botones con id prefijo aggpedido_
                    $('button[id^="aggpedido_"]').each(function() {
                        var $btn = $(this);
                        $btn.html('<i class="fa-solid fa-square-check"></i>');
                        $btn.removeClass("send__button-check").addClass("send__button");
                    });
                } *//*

                var cantidadEnCarrito = parseInt(response);
            },
            error: function(error) {
                console.error('Error in AJAX request:', error);
            }
        }); */
    }

    //Elimina renglon del carrito de compras
    function eliminareg(caller,idPedido,codigo){
        var input = $('#cana_' + codigo);
        $.ajax({
            url: baseUrl + 'portalcli/eliminareg/',
            type: "POST",
            data: {id: idPedido, codigo: codigo},
            success: function (data) {
                //opencar(); //Totaliza y ejecuta procesos
            }
        });
        input.val(''); //Pone input en carro vacio
        $(caller).parents('tr').remove();
        itscar(codigo);
        calcutot();
    }

    //Vacia carrito
    function vaciacar(){
        const codCli = localStorage.getItem(`idcli_${usuario}`);

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
                            url: baseUrl + 'portalcli/vaciacar/',
                            type: "POST",
                            data: {usuario: usuario, codCli: codCli},
                            success: function (data) {
                                opencar();
                            }
                        });
                        Swal.fire('Carro vacio', '', 'success');
                    }
            });
    }

    // Función que realiza la filtración de pedidos
    function filterped() {
        $("#loader").show();
        const fechaDesde = document.getElementById('fechaDesde').value;
        const fechaHasta = document.getElementById('fechaHasta').value;
        const codCli = localStorage.getItem(`idcli_${usuario}`);

        $.ajax({
            url: baseUrl + 'portalcli/traeped/',
            type: 'post',
            data: {
                fdesde: fechaDesde,
                fhasta: fechaHasta,
                codCli: codCli
            },
            success: function(response) {
                table.clear();
                var pedidos = JSON.parse(response);

                pedidos.forEach(function(pedido) {
                    table.row.add([
                        pedido.pedido,
                        pedido.factura,
                        parseInt(pedido.cantidad),
                        pedido.fecha,
                        '<i onclick="showdetail(\'' + pedido.pedido + '\', ' + table.rows().count() + ')" class="show__detail fa-solid fa-eye" title="Mostrar detalle"></i>',
                    ]);
                });
                table.draw();
                $("#loader").hide();
            },
            error: function(message) {
                console.log('Error: ' + message);
            }
        });
    }

    // Función para mostrar o cerrar los detalles del pedido
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
                    url: baseUrl + 'portalcli/detalle_pedido/' + pedidoId,
                    type: 'POST',
                    success: function(response) {
                        // Verificamos que la respuesta es un objeto y no una cadena
                        var detalle = JSON.parse(response);

                        // Creamos la tabla de detalles usando template literals
                        var detailTable = `
                            <table class="detalle__table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Lote</th>
                                        <th>Vence</th>
                                        <th>Seg</th>
                                        <th>Esc.Producto</th>
                                        <th>Esc.Proveedor</th>
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
                                    <td>${detalleItem.descu1 || 0}</td>
                                    <td>${detalleItem.descu2 || 0}</td>
                                    <td>${detalleItem.descu3 || 0}</td>
                                    <td>${detalleItem.preca || 0}</td>
                                    <td>${detalleItem.tota || 0}</td>
                                </tr>
                            `;
                        });

                        // Cerramos la tabla de detalles
                        detailTable += `
                                </tbody>
                            </table>
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
    window.showdetail = showdetail;
    window.filterped = filterped;

    //Asegura que la función sea accesible desde cualquier parte del codigo 

    window.opencar = opencar;
    window.updatecant = updatecant;
    window.validacant = validacant;
    window.eliminareg = eliminareg;
    window.vaciacar = vaciacar;
    window.enviaped = enviaped;
    window.itscar = itscar;

    //EJECUTA AL ABRIR EL MODULO PARA VERIFICAR EL CARRTIO
    carshopcli();

    let categoriaselected = '';
    // Inicializar DataTable para otra tabla, por ejemplo, table_inventario, si es necesario
    /* $('#table_inventario').DataTable({

        processing: true,
        serverSide: true,
        ajax: {
            url: baseUrl + "portalcli/get_data",
            type: 'POST',
            data: function (d) {
                regsession();
                const codCli = localStorage.getItem(`idcli_${usuario}`);
                d.p_activo = $('#filter-pactivo').val();
                d.categoria = $('#dcategoria').val();
                //d.categoria = categoriaselected; 
                d.proveed = $('#dproveed').val();
                d.marca = $('#dmarca').val();
                d.nuevos = $('#nuevos_productos').is(':checked') ? 1 : 0;
                d.codCli = codCli;
                d.search = $('#busca-articulo').val();
                //buscaalmacen();
            },
        },
        columns: [
            {
                data: 'html',
                orderable: false,
                searchable: false
            }
        ],
        paging: true,
        pageLength: 50,
        lengthMenu: [10, 25, 50],
        autoWidth: false,
        ordering: false,
        dom: '<"datatable-header">t<"datatable-footer"ip>', 
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
            search: "",
        },
        initComplete: function () {
            // Ocultar el loader al cargar inicialmente la tabla
            $("#loader").hide();
        },
        drawCallback: function () {
            // Desplazarse a la parte superior de la página al cambiar de página
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            $('.cuadricle__table').animate({ scrollTop: 0 }, 'fast');   
        }
    }); */
    
    /* $('#table_inventario').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        pageLength: 50,
        lengthMenu: [10, 25, 50, 100, 500],
        lengthChange: false, 
        ordering: false,
        searching: false, 
        info: false,
        autoWidth: false,
        ajax: {
            url: baseUrl + "portalcli/get_data",
            type: 'POST',
            data: function (d) {
                regsession();
                const codCli = localStorage.getItem(`idcli_${usuario}`);
                d.p_activo = $('#filter-pactivo').val();
                d.categoria = $('#dcategoria').val();
                d.orderby   = orderBy;
                //d.proveed = $('#dproveed').val();
                d.proveed = selectedFiltersprv;
                d.marca = $('#dmarca').val();
                d.nuevos = $('#nuevos_productos').is(':checked') ? 1 : 0;
                d.codCli = codCli;
                d.search = $('#busca-articulo').val();
                d.start = d.start || 0; 
                d.length = d.length || 50;
            },
            dataSrc: function (json) {
                return json.data.map(producto => construirHTMLProducto(producto));
            }
        },
        columns: [
            {
                data: "html",
                orderable: false,
                searchable: false
            }
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
        },
        initComplete: function () {
            $("#loader").hide();
        },
        drawCallback: function () {
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            $('.cuadricle__table').animate({ scrollTop: 0 }, 'fast');
        }
    });
    
    // Función para construir el HTML de cada producto en el frontend
    function construirHTMLProducto(producto) {
        let html = `
            <div class="product-card">
                <div class="image-product__container">
                    <img class="img__product" 
                        src="${baseUrl}uploads/inventario/Image/${producto.codigo}_.png" 
                        onerror="this.src='${baseUrl}assets/images/elemento-44.png'"
                        onclick="mostrarFichaProducto('${producto.codigo}')" 
                        alt="Imagen de producto" />
                </div>
                ${producto.oferta ? `
                    <div class="price__product">
                        <span class="existen__text">Disponibles: ${producto.oferta.lista}</span>
                        <span class="existen__text">Descuento: ${producto.oferta.descuento}</span>
                    </div>
                ` : ''}
                <div class="product-details">
                    <div class="title__product">${producto.descrip}</div>
                    <div class="price__product">
                        ${producto.dprice && producto.dprice > 0 ? `
                            <span class="discounted-price"><b>Bs.</b> ${producto.dprice}</span>
                            <span class="discounted-price">Ref. ${producto.dpriced}</span>
                        ` : ''}
                    
                        <span class="original-price"><b>Bs.</b> ${producto.oprecio}</span>
                        <span class="original-price">Ref. ${producto.opreciod}</span>
                    </div>
                    <div class="price__product">
                        <span class="existen__text">Disponibles: ${producto.existen}</span>
                    </div>
                    <div class="cana__container">
                        <input class="cana__input" type="text" id="cana_${producto.codigo}" 
                            onkeypress="eventcant('${producto.codigo}', $('#cana_${producto.codigo}').val(), event)" 
                            name="cana" value="${producto.encar ?? ''}">
                        <button class="send__button" id="aggpedido_${producto.codigo}" 
                            onclick="agg_pedido('${producto.codigo}', $('#cana_${producto.codigo}').val())">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>`;
    
        return { html };
    }  */
        function mostrarFichaProducto(codigo) {
            // Obtener los datos del producto desde la tabla
            const table = $('#table_inventario').DataTable();
            const row = table.row(`img[src*="${codigo}"]`).data();
        
            if (row) {
                // Construir el contenido de la ficha
                const contenido = `
                    <h2>${row.descrip}</h2>
                    <p><strong>Código:</strong> ${row.codigo}</p>
                    <p><strong>Proveedor:</strong> ${row.nomprv}</p>
                    <p><strong>Lote:</strong> ${row.lote}</p>
                    <p><strong>Vence:</strong> ${row.vence}</p>
                    <p><strong>Precio:</strong> ${row.oprecio}</p>
                    <p><strong>Disponibles:</strong> ${row.existen}</p>
                `;
        
                // Mostrar el contenedor y llenarlo con la información
                $('#fichaContenido').html(contenido);
                $('#fichaProducto').show();
            }
        }
        
        function cerrarFicha() {
            $('#fichaProducto').hide();
        }
        
        $('#table_inventario').DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            pageLength: 10, // Muestra 10 registros por defecto
            lengthMenu: [10, 25, 50, 100], // Opciones de paginación
            lengthChange: false, // No permite cambiar la cantidad de filas
            ordering: true,
            searching: false,
            info: false,
            autoWidth: false,
            order: [[1, 'asc']], 
            ajax: {
                url: apiUrl + "carrito/data",
                type: 'POST',
                beforeSend: function (request){
                    request.WidthCredentials = false;
                },
                data: function (d) {
                    regsession();
                    const codCli = localStorage.getItem(`idcli_${usuario}`);
                    d.p_activo = $('#filter-pactivo').val();
                    d.categoria = $('#dcategoria').val();
                    d.orderby   = orderBy;
                    d.proveed = selectedFiltersprv;
                    d.marca = $('#dmarca').val();
                    d.nuevos = $('#nuevos_productos').is(':checked') ? 1 : 0;
                    d.codCli = codCli;
                    d.usuario = usuario;
                    d.almacen = $('#almacli').attr('data-almacen');
                    d.cmatriz = cmatriz;
                    d.tipous = tipous;
                    d.api_key = api_key;
                    d.search = $('#busca-articulo').val().replace(/\s+/g, '%%');
                    d.start = d.start || 0;
                    d.length = d.length || 50;

                }
            },
            columns: [
                { 
                    data: "codigo",
                    title: "Ver",
                    orderable: true,
                    searchable: false,
                    render: function (data, type, row) {
                        return `<img src="${baseUrl}uploads/inventario/Image/th_${data}_.png" 
                                onerror="this.src='${baseUrl}assets/images/elemento-44.png'" 
                                class="img-fluid" style="max-width: 50px;" 
                                onclick="mostrarFichaProducto('${data}')">`;
                    }
                },
                //{ data: "codigo", title: "Código" },
                {
                    data: "descrip",
                    title: "Descripción",
                    className: "text-right",
                    render: function (data, type, row) {
                        return `
                            <div class="price-table">
                                ${row.descrip}
                                ${row.oferta && row.oferta[0] ? `
                                    <div class="price__product">
                                        <span class="">Oferta: ${row.oferta[0].lista}</span>
                                        <span class="">Descuento: ${row.oferta[0].descuento}</span>
                                    </div>
                                ` : ''}
                            </div>`;
                    }
                },
                { data: "nomprv", title: "Proveedor" },
                { data: "lote", title: "Lote", orderable: false, },
                { data: "vence", title: "Vence", orderable: false, },
                {
                    data: "oprecio",
                    title: "Precio",
                    className: "text-right",
                    render: function (data, type, row) {
                        return `
                            <div class="price-table">
                                ${row.dprice && row.dprice > 0 ? `
                                    <div class="discounted-price"><b>Bs.</b> ${row.dprice}</div>
                                    <div class="discounted-price">Ref. ${row.dpriced}</div>
                                ` : ''}
                    
                                <div class="original-price"><b>Bs.</b> ${row.oprecio}</div>
                                <div class="original-price">Ref. ${row.opreciod}</div>
                            </div>`;
                    }
                },
                { data: "existen", title: "Disponibles", className: "text-right" },
                { 
                    data: "codigo",
                    title: "Cantidad",
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return `
                        <input class="cana__input" type="text" id="cana_${row.codigo}" 
                        onkeypress="eventcant('${row.codigo}', $('#cana_${row.codigo}').val(), event)" 
                        name="cana" value="${row.encar ?? ''}" />`;
                    }
                },
                { 
                    data: "codigo",
                    title: "Acción",
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="cana__container">
                                <button class="send__button" id="aggpedido_${row.codigo}" 
                                    onclick="agg_pedido('${row.codigo}', $('#cana_${row.codigo}').val())"
                                    title="Carrito">
                                    <i class="fa-solid fa-cart-plus"></i>
                                </button>
                                ${cmatriz!='' ? `
                                    <button class="send__button" id="aggall_${row.codigo}" 
                                        onclick="agg_all('${row.codigo}', $('#cana_${row.codigo}').val())"
                                        title="Todos">
                                        <i class="fa-solid fa-truck"></i>
                                    </button>
                                ` : ''}
                    

                            </div>`;
                    }
                }
            ],
            columnDefs: [
                {
                    targets: 7, // Índice de la columna "Cantidad"
                    width: "100px", // Ancho de la columna
                }
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
            },
            initComplete: function () {
                $("#loader").hide();
            }
        });
        
    // Mostrar el loader antes de cargar los datos
    $('#table_inventario').on('preXhr.dt', function () {
        $("#loader").show();
    });
    
    // Ocultar el loader después de cargar los datos
    $('#table_inventario').on('xhr.dt', function () {
        $("#loader").hide();
    });
    
    
    // Recargar DataTable cuando se cambie un filtro
    let reloadTimer; 

    $('#busca-articulo').on('keydown', function (e) {

        if (e.key === 'Enter') {
            $("#loader").show();

            e.preventDefault(); // Evita que se repita el evento por defecto
    
            let input = $(this);
    
            // Si ya está procesando, no permitir otra ejecución
            if (input.prop('disabled')) return;
    
            // Deshabilita temporalmente la entrada para evitar múltiples disparos
            input.prop('disabled', true);
        
            if (viewonline === 'inventario') {
                $('#table_inventario').DataTable().ajax.reload(() => {
                    input.prop('disabled', false); // Reactiva el input después de recargar la tabla
                });
            } else {
                abreinventariop();
            }
        }
    });

    // Manejo de filtros con un retraso prudencial
        // Escuchar clic en el elemento #dcategoria para desplegar la lista
        /* $('#dcategoria').on('click', function (e) {
            e.stopPropagation(); // Evita que el evento se propague
            $('.cont-select-list').toggle(); // Muestra u oculta la lista
            $(this).attr('aria-expanded', function(i, attr) {
                return attr === 'true' ? 'false' : 'true';
            });
        }); */
            
        $(document).on('click', '.category-option', function (e) {
            // Verificar si el evento ya está en proceso
            if ($(this).hasClass('processing')) {
                return; // Salir si ya se está procesando
            }
        
            // Marcar el evento como en proceso
            $(this).addClass('processing');
                
            $("#loader").show();
            e.preventDefault();
            e.stopPropagation();
        
            let selectedText = $(this).text();
            let selectedValue = $(this).data('value');
        
            // Actualizar la interfaz
            $('#dcategoria').html(selectedText + ' <i class="fas fa-chevron-down icon-arrow"></i>');
            $('#dcategoria').val(selectedValue);
        
            // Ejecutar acciones dependiendo de viewonline
            if (viewonline === 'inventario') {
                $('#table_inventario').DataTable().ajax.reload(() => {
                    // Habilitar el evento nuevamente después de completar la recarga
                    $(this).removeClass('processing');
                    $("#loader").hide();
                });
            } else {
                abreinventariop();
            }
    
        });

    // Cargar la categoría seleccionada al iniciar la página
    /* if (selectedCategory) {
        const selectedOption = $(`.category-option[data-value="${selectedCategory}"]`);
        if (selectedOption.length) {
            updateCategory(selectedCategory, selectedOption.text());
        }
    } */


    // Opcional: Abrir/cerrar la lista desplegable al hacer clic en #dcategoria
    /* $('#dcategoria').on('click', function() {
        $('.cont-select-list').toggle();
    });

    // Opcional: Cerrar la lista desplegable al hacer clic fuera de ella
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.cont-select-deparment').length) {
            $('.cont-select-list').hide();
        }
    }); */

    $('.filters__container select, #nuevos_productos, #filter-pactivo').on('keyup change', function (e) {
        // Verificar si se presionó Enter
        if (e.type === 'keyup' && e.key === 'Enter') {
            $('#table_inventario').DataTable().ajax.reload();
        } else {
            // Establece un temporizador para recargar la tabla después de 500 ms
            reloadTimer = setTimeout(() => {
                $('#table_inventario').DataTable().ajax.reload();
            }, 900);
        }
    });

    $('#idcli').on('change', function (e) {
        // Verificar si se presionó Enter
        if(viewonline=='historial'){
            filterped();
        }
    });
});

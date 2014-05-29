/******************************************
*
* VARIABLES Y CONSTANTES
*
* *****************************************/
var SERVIDOR = 'http://www.rodorte.com/appasionate/';
var preGeolocated = false, preMarkers = false, preClases = false;

// ESTADOS Y NAVEGACION
var estado;
var myScrollMenu;
var cuerpo = $("#cuerpo");
var listObj;

// POSICIONES MAPA
var myPosition, myLng, myLat, myLatLng, map, myMarker;
var marcadores;

var owlMarker;
var owlCont = 0;


// OBJETO TU
var you = {
	path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
	fillColor: "yellow",
	fillOpacity: 0.8,
	scale: 1,
	strokeColor: "gold",
	strokeWeight: 14
};

var app = {
    // Constructor de la app
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	estado="cuerpo";
		myScrollMenu = new iScroll('wrapperMenu', { hideScrollbar: true });

    	new FastClick(document.body);
    	initEventsHandlers();

    	$("#owl-marker").owlCarousel();
    	owlMarker = $("#owl-marker").data('owlCarousel');


    	navigator.geolocation.getCurrentPosition(onSuccess, onError, {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true});
    	loadClases();
    },

};

/***********************************************************
*
* PRIMERA GEOLOCALIZACION // CARGA DE MAPA
*
* **********************************************************/
// Inicia el mapa con la localizacion del usuario.
function onSuccess(position) {
	myLat = position.coords.latitude;
	myLng = position.coords.longitude;

	myLatLng = new google.maps.LatLng(myLat, myLng);

	var mapOptions = {
		center: myLatLng,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

  	createMarkerMyPosition();

  	// Rellenar menu marcadores
    rellenarMenuMarcadores();

    // init LONG CLICK on MAP
	if (usuario.rol.toLowerCase() === "admin") {
		LongPress(map);
	}

    completarPreCarga("preGeolocated");
}


// Muestra error de geolocalizacion y muestra el mapa en un punto predeterminado
function onError(error) {
	navigator.notification.alert(
	    'Error en la geolocalización, asegurese de tener activado el GPS del dispositivo.',
	    null,
	    'Geolocalización',
	    'Aceptar'
	);

	myLat = 28.400;
	myLng = -16.500;

	myLatLng = new google.maps.LatLng(myLat, myLng);

	var mapOptions = {
		center: myLatLng,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	createMarkerMyPosition();

	// Rellenar menu marcadores
    rellenarMenuMarcadores();

    // init LONG CLICK on MAP
    if (usuario.rol.toLowerCase() === "admin") {
    	LongPress(map);
	}

    completarPreCarga("preGeolocated");
}


/*****************************************************
*
* MENU MARCADORES
*
* ****************************************************/
// Funcion encargada de los eventos para el MENU de marcadores
function menu(opcion){

	// Si pulsamos en el boton de "menu" entramos en el if
	if(opcion=="menu"){
		if(estado=="cuerpo"){
			cuerpo.removeClass('center').addClass('right');
			estado="menuprincipal";
			$('#menuIcon').attr("class", "glyphicon glyphicon-remove-circle");

		}else if(estado=="menuprincipal"){
			cuerpo.removeClass('right').addClass('center');
			estado="cuerpo";
			$('#menuIcon').attr("class", "glyphicon glyphicon-map-marker");
		}

	// Si pulsamos un boton del menu principal entramos en el else
	}else{
		// Establecer posicion en el mapa del marcador
		var arrayLatLng = opcion.split(", ");
		var positionOpcion = new google.maps.LatLng(arrayLatLng[0], arrayLatLng[1]);
		map.setCenter(positionOpcion);
		map.setZoom(18);

		// Añadimos las clases necesarias para que la capa cuerpo se mueva al centro de nuestra app y muestre el contenido
		cuerpo.removeClass('right').addClass('center');
		estado="cuerpo";

		$('#menuIcon').attr("class", "glyphicon glyphicon-map-marker");

	}

}

// rellena el menu con los marcadores del usuario
function rellenarMenuMarcadores() {

	var parametros = {"id" : usuario.id_usuario};

	$.ajax({
		url: SERVIDOR + 'obtenerMarcadores.php',
		type:'POST',
		data:parametros,
		dataType:'json',
		error:function(jqXHR,text_status,strError){
			completarPreCarga("preMarkers");

			navigator.notification.alert(
			    'No se pudo establecer conexión con el servidor.',
			    null,
			    'Conexión',
			    'Aceptar'
			);
		},
		timeout:60000,
		success:function(data){
			completarMenu(data);
		}
	});
}

// Rellena el menu con sus componentes
function completarMenu(data) {
	var menu = $('#ulMenu');
	myLatLngItem = myLat + ", " + myLng;

	// ENCABEZADO MENU
	var firstItem = "";
	firstItem += '<a style="text-decoration:none" href="javascript:menu(\'' + myLatLngItem + '\');">';
		firstItem += '<li>';
			firstItem += '<span class="glyphicon glyphicon-map-marker"></span>';
			firstItem += ' Marcadores: ' + usuario.nombre + ' ' + usuario.apellidos;
			firstItem += '<span class="num-marcadores pull-right">' + data.length + ' <i class="fa fa-flag"></i></span>'
		firstItem += '</li>';
	firstItem += '</a>';
	$('#firstList').html(firstItem);

	// ITEMS DEL MENU
	menu.html("");
	var color = 1;
	for (var i = 0; i < data.length; i++) {
	    var latLngItem = String(data[i].lat + ', ' + data[i].lng);
	    var item = "";

	    item += '<li id="' + "item" + i + '" class="color' + color + '">';
		    item += '<a href="javascript:menu(\'' + latLngItem + '\');">';
			    item += '<div class="titulo text-color-' + color + '">' + data[i].titulo + '</div>';
			    item += '<div class="class-marker">' + data[i].clase + '</div>';
			    item += '<div class="descripcion">' + latLngItem + '</div>';
		    item += '</a>';
	    item += '</li>';

	    menu.append(item);

	    // Contador color.
	    if (color == 6) {
	    	color = 1;
	    } else {
	    	color ++;
	    }

	    crearMarcador(data[i]);
	}


	var options = {
	  	valueNames: [ 'titulo', 'descripcion' ]
	};

	listObj = new List('contenidoMenu', options);

	listObj.on('searchComplete', function() {
		myScrollMenu.refresh();
	});

	myScrollMenu.refresh();

	completarPreCarga("preMarkers");
}

// Crea el marcador y su modal
function crearMarcador(dataMarker) {
	var positionMarker = new google.maps.LatLng(dataMarker.lat, dataMarker.lng);
	var marker = new google.maps.Marker({
	    position: positionMarker,
	    map: map,
	    title:dataMarker.titulo,
	    datos: dataMarker
	});

	google.maps.event.addListener(marker, 'click', function() {
		var datos = marker.datos;

		var cadBody  = '<p>' + datos.descripcion + '</p>';
		$('#marker-modal .modal-body .modal-body-contenido').html(cadBody);

		for (var i = 0; i <= owlCont; i++) {
		  	owlMarker.removeItem(0);
		}
		owlCont = 0;

		if (datos.imagenes.length > 0) {
			for (var i = 0; i < datos.imagenes.length; i++) {
				imgCad = '<img src="' + datos.imagenes[i].path_imagen + '"/>';

				owlMarker.addItem(imgCad);

				owlCont++;
			}

			setTimeout(
				function(){
					owlMarker.reinit({
					    slideSpeed : 300,
					    paginationSpeed : 400,
					    singleItem:true,
					    autoHeight : true
					});
				}, 200
			);
		} else {
			owlMarker.addItem('<h4 class="text-center"><i class="fa fa-image"></i> Sin imágenes</h4>');
			owlCont++;

			setTimeout(
				function(){
					owlMarker.reinit({
					    slideSpeed : 300,
					    paginationSpeed : 400,
					    singleItem:true,
					    autoHeight : true
					});
				}, 200
			);
		}

		$('#marker-modal .modal-title').html(datos.titulo);


	  	$('#marker-modal').modal('show');
	});
}

// Al pulsar el icono de apagado mostramos modal con opciones
function offIcon() {
	$('#offModal').modal('show');
}

// Salir de la APP
function onBackKeyDown(){
    navigator.app.exitApp();
}

// Borra la sesion y regresa a la pagina de logueo
function onClickCerrarSesion() {
	localStorage.removeItem("login");
	sessionStorage.removeItem("login");

	location.href='index.html';
}

// Al pulsar en el boton de configuracion
function onClickConfig() {
	navigator.notification.alert(
	    'Configuración para ' + usuario.rol + ': Aun no implementado.',
	    null,
	    'Configuración',
	    'Aceptar'
	);
}

/*****************************************************
*
* LOAD CLASES
*
* ****************************************************/
function loadClases() {
	if (usuario.rol.toLowerCase() === "admin") {

		var parametros = {"id" : usuario.id_usuario};

		$.ajax({
			url: SERVIDOR + 'obtenerClasesDelUsuaio.php',
			type:'POST',
			data:parametros,
			dataType:'json',
			error:function(jqXHR,text_status,strError){
				completarPreCarga("preClases");
			},
			timeout:60000,
			success:function(data){
				$('#new-marker-clase').html('');
				for (var i = 0; i < data.length; i++) {
					$('#new-marker-clase').append('<option value="' + data[i].id_clase + '">' + data[i].nombre + '</option>');
				}

				completarPreCarga('preClases');
			}
		});

	} else {
		completarPreCarga('preClases');
	}
}


/*********************************************************
*
* REELOCALIZAR
*
* *******************************************************/
// Al pulsar en el boton de geolocalizar
function onClickLocate() {
	$('#processing-modal .loading-modal-text').html("Localizando...");
	$('#processing-modal').modal('show');
	navigator.geolocation.getCurrentPosition(reelocalizar, reelocalizarError, {maximumAge: 3000, timeout: 10000, enableHighAccuracy: true});
}

// localiza el dispositivo y actualiza el mapa a esa posicion.
function reelocalizar(position) {
	myLat = position.coords.latitude;
	myLng = position.coords.longitude;

	//alert(myLat + ", " + myLng);

	myLatLng = new google.maps.LatLng(myLat, myLng);
	map.setCenter(myLatLng);
	map.setZoom(16);
	myMarker.setPosition(myLatLng);

	$('#processing-modal').modal('hide');
}

// Muestra error de geolocalizacion y vuelve a la ultima posicion guardada
function reelocalizarError(error) {
	navigator.notification.alert(
	    'Error en la geolocalización, asegurese de tener activado el GPS del dispositivo.',
	    null,
	    'Geolocalización',
	    'Aceptar'
	);

	map.setCenter(myLatLng);
	map.setZoom(16);
	myMarker.setPosition(myLatLng);

	$('#processing-modal').modal('hide');
}

// Crea el marcador de mi posicion
function createMarkerMyPosition() {
	myMarker = new google.maps.Marker({
      	position: myLatLng,
      	map: map,
      	title: 'My Position!',
      	icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png'
  	});

  	// TODO --- Corregir que se cree el marcador cuando no haya conexion.. etc.
}


function completarPreCarga(action) {
	if (action === "preGeolocated") { preGeolocated = true; }
	else if (action === "preMarkers") { preMarkers = true; }
	else if (action === "preClases") { preClases = true; }

	console.log("preGeolocated: " + preGeolocated);
	console.log("preMarkers: " + preMarkers);
	console.log("preClases: " + preClases);

	if (preGeolocated && preMarkers && preClases) {
		$('#processing-modal').modal('hide');
	}
}

/*======================================================
/** INIT EVENTS HANDLERS/
=======================================================*/
function initEventsHandlers() {
	$(document).on("backbutton", function() { $('#offModal').modal('show') });

	$('#clean-markers-searcher').on('click', limpiarInput);

	// MENU
	$('#btn-menu-principal').on('click', function() { menu('menu'); });

	// MODAL EXIT
	$('#btn-cerrar-sesion').on('click', onClickCerrarSesion);
	$('#btn-exit').on('click', onBackKeyDown);

	// OPTIONS
	$('#btn-relocate').on('click', onClickLocate);
	$('#btn-config').on('click', onClickConfig);
	$('#btn-option-salir').on('click', offIcon);

	// NEW MARKER
	$('#btn-guardar-nuevo-marcador').on('click', guardarNuevoMarcador);
	$('#upload-photos-modal').on('hide.bs.modal', function() {
		$('#processing-modal .loading-modal-text').html("Recargando marcadores...");
		$('#processing-modal').modal('show');
		rellenarMenuMarcadores();
	});

	// GET IMAGE
	$('#get-image-files').on('click', getImage);
	$('#get-image-camera').on('click', getImageCamera);

	// UPLOAD PHOTOS
	$('#btn-upload-fotos').on('click', uploadPhotos);

	$("#inputSearchMarkers").on("keyup", onMarkersSearcherKeyUp);
	$("#inputSearchMarkers").bind("mousedown",function(e){ e.stopPropagation(); });
}

function limpiarInput() {
	var target = $($(this).data().target);

	if (target.val() !== "") {
		target.val("");
		$(this).addClass('disabled');
		listObj.search();
		myScrollMenu.refresh();
	}
}

function onMarkersSearcherKeyUp() {
	if ($(this).val() !== "") {
		$($(this).data().cleaner).removeClass('disabled');
	} else {
		$($(this).data().cleaner).addClass('disabled');
	}
}

/*function LongPress(map) {
  	var me = this;
  	me.map_ = map;
  	me.timeoutId_ = null;

  	google.maps.event.addListener(map, 'mousedown', function(e) {
    	clearTimeout(this.timeoutId_);
    	this.timeoutId_ = setTimeout(function() {
	  		crearNuevoMarcador(e);
	  	}, 1000);
  	});

  	google.maps.event.addListener(map, 'mouseup', function(e) {
    	clearTimeout(this.timeoutId_);
	  	var map = this.map_;
	  	var event = e;

  	});

  	google.maps.event.addListener(map, 'drag', function(e) {
    	clearTimeout(this.timeoutId_);
  	});
};*/

function LongPress(map) {
  	var me = this;
  	me.map = map;
  	me.now = null;

  	google.maps.event.addListener(map, 'mousedown', function(e) {
    	this.now = new Date().getTime();
    	console.log("TIEMPO: " + this.now);
  	});

  	google.maps.event.addListener(map, 'mouseup', function(e) {
    	if (this.now !== null) {
    		var difTime = new Date().getTime() - this.now;

    		console.log("TIEMPO: " + this.now);
    		console.log("DIFERENCIA TIEMPO: " + this.now);

    		if (difTime > 1000) {
    			crearNuevoMarcador(e);
    		}
    	}

  	});

  	google.maps.event.addListener(map, 'drag', function(e) {
    	this.now  = null;
    	console.log("TIEMPO: " + this.now);
  	});
};



/* ==============================================
**
/*** CREAR MARCADORES
**
================================================= */
var latLngNewMarker;
var idNewMarker = null;
var fotosNuevoMarcador;
var arrayUris;
var contUploadFotos;
function crearNuevoMarcador(event) {
	fotosNuevoMarcador = new Array();
	arrayUris = new Array();
	latLngNewMarker = event.latLng;
	idNewMarker = null;
	contUploadFotos = 0;
/*
	var objFoto = {
    	"uri": 'http://rodorte.com/appasionate/images/1_28.416706%2C-16.550790.jpg',
    	"estado": true,
    	"name": '1.jpg'
    }
    fotosNuevoMarcador.push(objFoto);

    var objFoto = {
    	"uri": 'http://rodorte.com/appasionate/images/1_28.420025%2C-16.542990.jpg',
    	"estado": true,
    	"name": '2.jpg'
    }
    fotosNuevoMarcador.push(objFoto);

    contUploadFotos = 2;
*/

	$('#new-marker-errors').html('').hide();

	$('#new-marker-modal #new-marker-lat-lng').html(latLngNewMarker.k + ", " + latLngNewMarker.A);

	var img1  = '<img src="http://maps.googleapis.com/maps/api/staticmap?center='+latLngNewMarker.k+','+latLngNewMarker.A+'&zoom=14&size=600x200';
		img1 += '&markers=color:red%7Ccolor:red%7Clabel:M%7C'+latLngNewMarker.k+','+latLngNewMarker.A+'&sensor=false">';
	$('#images-new-marker-container').html(img1);

	$('#new-marker-titulo').val('');
	$('#new-marker-descripcion').val('');

	$('#new-marker-modal').modal('show');
}

function guardarNuevoMarcador() {
	// GET VALUES
	var parametros = {
		'titulo': $.trim($('#new-marker-titulo').val()),
		'descripcion': $.trim($('#new-marker-descripcion').val()),
		'lat': latLngNewMarker.k,
		'lng': latLngNewMarker.A,
		'creador': usuario.id_usuario,
		'clase': $('#new-marker-clase').val()
	}


	if (parametros.titulo === "" || parametros.descripcion === "" || parametros.clase === "") {
		var errorCad = '<i class="fa fa-exclamation-triangle" style ="font-size:18px;"></i> Complete todos los campos de formulario porfavor.';
		$('#new-marker-errors').html(errorCad).show();

	} else {
		$('#new-marker-errors').html('').hide();

		$.ajax({
			url: SERVIDOR + 'crearNuevoMarcador.php',
			type:'POST',
			data:parametros,
			dataType:'json',
			beforeSend: function () {
				$('#processing-modal .loading-modal-text').html("Creando marcador...");
		    	$('#processing-modal').modal('show');
		    },
			error:function(jqXHR,text_status,strError){
				//$('#processing-modal').modal('hide');
				navigator.notification.alert(
				    'No se pudo crear el marcador.',
				    null,
				    'Nuevo marcador',
				    'Aceptar'
				);
			},
			timeout:60000,
			success:function(data){
				console.log(data);
				if (data.res) {
					idNewMarker = data.id;
					preMarkers = false;
					$('#new-marker-modal').modal('hide');
					$('#processing-modal').modal('hide');

				} else {
					$('#processing-modal').modal('hide');
					navigator.notification.alert(
					    'No se pudo crear el marcador.',
					    null,
					    'Nuevo marcador',
					    'Aceptar'
					);
				}
			},
			complete: function() {
				$('#uploaded-photos').html("");
				$('#upload-photos-modal').modal('show');
			}
		});
	}
}


function getImage() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(
    	selectPhoto,
    	function(message) {
			navigator.notification.alert(
				'No se pudo seleccionar la imagen.',
				null,
				'Imagen',
				'Aceptar'
			);
		},
		{
			quality: 50,
			destinationType: navigator.camera.DestinationType.FILE_URI,
			sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
		}
    );
}

function getImageCamera() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(
    	selectPhoto,
    	function(message) {
			navigator.notification.alert(
				'No se pudo seleccionar la imagen.',
				null,
				'Imagen',
				'Aceptar'
			);
		},
		{
			quality: 50,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 600,
			targetWidth: 600,
			correctOrientation: true
		}
    );
}

function selectPhoto(imageURI) {
	if (arrayUris.indexOf(imageURI) > -1) {
		navigator.notification.alert(
			'Esa imágen ya se encuentra lista para subir.',
			null,
			'Subir imágenes',
			'Aceptar'
		);
	} else {
		var millsecs = new Date().getTime()
	    var nameFoto = millsecs + ".jpeg";

		var cadPhoto = "";
		cadPhoto += '<div id="'+millsecs+'" class="img-upload">';
	    cadPhoto +=   	'<img src="'+imageURI+'" alt="">';
	    cadPhoto +=   	'<div class="btns-upload-photo text-center btn-group">';
	    cadPhoto +=   		'<button data-named="' + millsecs + '" onclick="seleccionarFoto($(this))" class="btn btn-sm btn-success active"><i class="fa fa-check"></i></button>';
	    cadPhoto +=   		'<button data-named="' + millsecs + '" onclick="deseleccionarFoto($(this))" class="btn btn-sm btn-danger"><i class="fa fa-times"></i></button>';
	    cadPhoto +=   	'</div>';
	    cadPhoto += '</div>';

	    var objFoto = {
	    	"uri": imageURI,
	    	"estado": true,
	    	"name": nameFoto,
	    	"named": millsecs
	    }
	    fotosNuevoMarcador.push(objFoto);
	    arrayUris.push(imageURI);
	    contUploadFotos++;

		$('#uploaded-photos').append(cadPhoto);
	}

}

function seleccionarFoto(me) {
	if (!me.hasClass('active')) {
		me.siblings('.active').removeClass('active');
		me.addClass('active');
		me.parents('.img-upload').children('img').css('opacity', '1');
		var named = me.data().named;

		for (var i = 0; i < fotosNuevoMarcador.length; i++) {
			if (fotosNuevoMarcador[i].named === named) {
				fotosNuevoMarcador[i].estado = true;
				contUploadFotos++;
			}
		}
	}
}

function deseleccionarFoto(me) {
	if (!me.hasClass('active')) {
		me.siblings('.active').removeClass('active');
		me.addClass('active');
		me.parents('.img-upload').children('img').css('opacity', '0.4');
		var named = me.data().named;

		for (var i = 0; i < fotosNuevoMarcador.length; i++) {
			if (fotosNuevoMarcador[i].named === named) {
				fotosNuevoMarcador[i].estado = false;
				contUploadFotos--;
			}
		}
	}
}

function uploadPhotos() {
	var tempList = new Array();
	var tempFoto;

	for (var i = 0; i < fotosNuevoMarcador.length; i++) {
		if(fotosNuevoMarcador[i].estado) {
			tempList.push(fotosNuevoMarcador[i]);
		}
	}

	if (tempList.length > 0) {
	    var foto = tempList.pop();
	    uploadPhoto(foto);
	} else {
		navigator.notification.alert(
			'No hay imágenes listas para subir.',
			null,
			'Subir imágenes',
			'Aceptar'
		);
	}

	function uploadPhoto(foto) {
		tempFoto = foto;
		var options = new FileUploadOptions();
	    options.fileKey = "file";
	    options.fileName = foto.uri.substr(foto.uri.lastIndexOf('/') + 1);
	    options.mimeType = "image/jpeg";
	    options.chunkedMode = false;
        options.headers = {
         	Connection: "close"
        };

	    var params = {};
	    params.name = foto.name;
	    params.marker = idNewMarker;

	    options.params = params;

	    var ft = new FileTransfer();
	    ft.upload(foto.uri, SERVIDOR + 'uploadPhoto.php', winUpload, failUpload, options);
	}

	function winUpload(r) {
		var response = JSON.parse(r.response);

	    if (tempList.length == 0) {
	    	quitarFoto();

       		navigator.notification.alert(
				'Éxito subiendo las imágenes.',
				null,
				'Subir imágenes',
				'Aceptar'
			);

		} else {
			if (response === 1) {
				quitarFoto();

				var foto = tempList.pop();
	    		uploadPhoto(foto);
			} else {
				navigator.notification.alert(
					'Fallo al subir fotos. Alguna de las imágenes restantes no pudo subirse y se paro la cola.',
					null,
					'Subir imágenes',
					'Aceptar'
				);
			}

		}


		function quitarFoto() {
			var index = fotosNuevoMarcador.indexOf(tempFoto);
			if (index > -1) {
				fotosNuevoMarcador.splice(index, 1);
			}

			$('#'+tempFoto.named).remove();
		}
	}

	function failUpload(error) {
		navigator.notification.alert(
			'Fallo al subir fotos. Alguna de las imágenes restantes no pudo subirse y se paro la cola.',
			null,
			'Subir imágenes',
			'Aceptar'
		);
	    console.log("failImg An error has occurred: Code = " + error.code);
		console.log("upload error source " + error.source);
		console.log("upload error target " + error.target);
	}
}


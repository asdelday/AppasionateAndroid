var SERVIDOR = 'http://www.rodorte.com/appasionate/';

///////////////////////
// Dispositivo listo //
///////////////////////
var app = {
    // Constructor de la app
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
    	//borrarLoginStoraged();
		new FastClick(document.body);

		$('#loginContainer').show();
		$('#registroContainer').hide();

		// ICHECK
		$('input').iCheck({
	    	checkboxClass: 'icheckbox_flat-red',
	    	radioClass: 'iradio_flat-red'
	 	});


		initEventsHandlers();
    },

};


///////////////////
// Redireccionar //
///////////////////
function redireccionarAplicacion() {
	location.href='map.html';
}


////////////////////////////////
// Click en el boton de LOGIN //
////////////////////////////////
function onClickLogin() {
	$('#loginErrors').html('');
	var isError = false;

	var email = $('#inputEmail').val();
	var pass = $('#inputPassword').val();

	if (email == '') {
		printError('Campo de email vacio.', $('#loginErrors'));
		isError = true;
	} else if (!isEmail(email)) {
		printError('Email no válido.', $('#loginErrors'));
		isError = true;
	}

	if (pass == '') {
		printError('Campo de contraseña vacio.', $('#loginErrors'));
		isError = true;
	}

	if (!isError) {
		conectar(email, pass);
	}
}


//////////////
// CONECTAR //
//////////////
function conectar(email, pass) {
	var parametros = {"email" : email, "pass" : pass};

	$.ajax({
		url: SERVIDOR + 'login.php',
		type:'POST',
		data:parametros,
		dataType:'json',
		beforeSend: function () {
			$('#processing-modal .loading-modal-text').html("Conectando...");
            $('#processing-modal').modal('show');
        },
		error:function(jqXHR,text_status,strError){
			$('#processing-modal').modal('hide');
			navigator.notification.alert(
			    'No se pudo establecer conexión con el servidor.',
			    null,
			    'Conexión',
			    'Aceptar'
			);
		},
		timeout:60000,
		success:function(data){
			$('#processing-modal').modal('hide');
			$("#loginErrors").html("");

			if (data.length > 0) {
				borrarLoginStoraged();

				// Si esta activado el recuerdame...
				if ($('#recordar').parent().hasClass('checked')) {
					localStorage.login = JSON.stringify(data[0]);
				} else {
					sessionStorage.login = JSON.stringify(data[0]);
				}

				redireccionarAplicacion();

			} else {
				printError('No existe ningún usuario con los datos proporcionados.', $('#loginErrors'));
			}
		}
	});

}


///////////////////////////////////
// Click en el boton de REGISTRO //
///////////////////////////////////
function onClickIrRegistro() {
	$('#loginContainer').fadeOut('400', function() {
		$("#loginErrors").html("");
		$('#registroContainer').fadeIn('400');
	});

}

function onClickVolverLogin() {
	$('#registroContainer').fadeOut('400', function() {
		$("#loginErrors").html("");
		$('#loginContainer').fadeIn('400');
	});
}

///////////////////
// VALIDAR EMAIL //
///////////////////
function isEmail(email) {
  	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  	return regex.test(email);
}


//////////////////////
// IMPRIMIR ERRORES //
//////////////////////
function printError(cad, elem) {
	var cadena = '<div style="margin: 5px 4% 5px 4%;background: #333;color: #FFF;" class="alert alert-danger alert-dismissable">';
  		cadena += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
  		cadena += '<strong><i class="fa fa-exclamation-triangle" style ="font-size:18px;"></i> Error!</strong> ' + cad;
	cadena += '</div>';

	elem.append(cadena);
}


///////////////////////////////
// LIMPIAR VARIABLES LOCALES //
///////////////////////////////
function borrarLoginStoraged() {
    localStorage.removeItem("login");
	sessionStorage.removeItem("login");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// 	REGISTRO
//////////////////////////////////////////////////////////////////////////
function onClickRegistrarse() {
	$('#loginErrors').html("");
	// Recoger datos.
	var email = $('#inputEmailReg').val();
	var pass = $('#inputPasswordReg').val();
	var passRep = $('#inputRepetirPasswordReg').val();
	var nombre = $('#inputNombreReg').val();
	var apellidos = $('#inputApellidosReg').val();
	var cod = $('#inputCodReg').val();

	//////////////////
	// VALIDACIONES //
	//////////////////
	var isNotEmpty = true;
	var isOk = true;

	// Comprobar campos vacios
	if (!isNotCampoVacioFromRegistro(email, pass, passRep, nombre, apellidos, cod)) {
		printError('Debe rellenar todos los campos para registrarse.', $('#loginErrors'));
		isOk = false;
		isNotEmpty = false;
	}

	// Comprobar email
	if (!isEmail(email) && isNotEmpty) {
		printError('Email no válido.', $('#loginErrors'));
		isOk = false;
	}

	// Comprobar si existe algun usuario con ese email
	if (isNotEmpty) {
		$.ajax({
			url: SERVIDOR + 'testEmail.php',
			type:'POST',
			data:{"email" : email},
			dataType:'json',
			beforeSend: function () {
				$('#processing-modal .loading-modal-text').html("Registrandose...");
		    	$('#processing-modal').modal('show');
		    },
			error:function(jqXHR,text_status,strError){
				printError('Error al comprobar email en la base de datos.', $('#loginErrors'));
				isOk = false;
			},
			timeout:60000,
			success:function(data){
				if (data) {
					printError('El Email proporcionado ya se encuentra en uso.', $('#loginErrors'));
					isOk = false;
				}
			},
			complete: function() {

				// Comprobar contraseñas
				if (pass.length < 6) {
					isOk = false;
					printError('La contraseña proporcionada es demasiado corta (mínimo 6 carácteres).', $('#loginErrors'));
				}
				else if (pass != passRep) {
					isOk = false;
					printError('Las contraseñas proporcionadas no coinciden.', $('#loginErrors'));
				}

				// Comprobar si existe el cod
				$.ajax({
					url: SERVIDOR + 'testCod.php',
					type:'POST',
					data:{"cod" : cod},
					dataType:'json',
					error:function(jqXHR,text_status,strError){
						printError('Error al comprobar código de la clase en la base de datos.', $('#loginErrors'));
						isOk = false;
					},
					timeout:60000,
					success:function(data){
						if (!data) {
							printError('El Código de clase proporcionado no exite, porfavor pregunte a su profesor el código.', $('#loginErrors'));
							isOk = false;
						}
					},
					complete: function() {

						// Comprobar contraseñas
						if (isOk) {
							registrarUsuario(email, pass, passRep, nombre, apellidos, cod);
						}
						else {
							$('#processing-modal').modal('hide');
						}
					}
				});
			}
		});
	}
}

function registrarUsuario(email, pass, passRep, nombre, apellidos, cod) {
	var parametros = {"email" : email, "pass" : pass, "passRep" : passRep, "nombre" : nombre, "apellidos" : apellidos, "cod" : cod};

	$.ajax({
		url: SERVIDOR + 'registrarUsuario.php',
		type:'POST',
		data:parametros,
		dataType:'json',
		error:function(jqXHR,text_status,strError){
			$('#processing-modal').modal('hide');
			navigator.notification.alert(
			    'No se pudo realizar el registro.',
			    null,
			    'Registro',
			    'Aceptar'
			);
		},
		timeout:60000,
		success:function(data){
			$('#processing-modal').modal('hide');

			if (data) {
				printError('El registro se ha completado correctamente.', $('#loginErrors'));
			} else {
				navigator.notification.alert(
				    'Error en el registro.',
				    null,
				    'Registro',
				    'Aceptar'
				);
			}
		}
	});
}

function isNotCampoVacioFromRegistro(email, pass, passRep, nombre, apellidos, cod) {
	var centinela = true;

	if (email == "") {
		centinela = false;
	} else if (pass == "") {
		centinela = false;
	} else if (passRep == "") {
		centinela = false;
	} else if (nombre == "") {
		centinela = false;
	} else if (apellidos == "") {
		centinela = false;
	} else if (cod == "") {
		centinela = false;
	}

	return centinela;
}

function initEventsHandlers() {
	$(document).on("backbutton", onBackKeyDown);

	// REG
	$('#submitRegistro').on('click', onClickRegistrarse);
	$('#volverLogin').on('click', onClickVolverLogin);

	// LOG
	$('#submitLogin').on('click', onClickLogin);
	$('#registerLogin').on('click', onClickIrRegistro);
}

/////////////////////
// Salir de la APP //
/////////////////////
function onBackKeyDown(){
    navigator.app.exitApp();
}
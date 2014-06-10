function Perfil() {
	self.email = null;
	self.nombre = null;
	self.apellidos = null;
	self.pass1 = null;
	self.pass2 = null;

	self.emailAux = null;
	self.nombreAux = null;
	self.apellidosAux = null;
	self.pass1Aux = null;
	self.pass2Aux = null;

	self.inputEmail = $('#inputEmail');
	self.inputNombre = $('#inputNombre');
	self.inputApellidos = $('#inputApellidos');
	self.inputPassword1 = $('#inputPassword1');
	self.inputPassword2 = $('#inputPassword2');

	self.submit = $('#perfil-submit');
	self.reset = $('#perfil-reset');
	self.form = $('#perfil-form');

	self._init_ = function() {
		self.selectPerfil();

		self.form.on('submit', function(e) {
			e.preventDefault();
			self.submit.focus();
			submitForm();
		});

		self.submit.on('submit', function(e) {
			e.preventDefault();
		});

		self.reset.on('click', function(e) {
			e.preventDefault();
			resetForm();
		});

		$('#perfil-form input').on('click', function() {
			$(this).val("");
		});

		self.inputEmail.on('blur', function() {
			var value = $(this).val();

			if ($.trim(value) !== "") {
				self.emailAux = value;
			} else {
				$(this).val(self.emailAux);
			}
		});

		self.inputNombre.on('blur', function() {
			var value = $(this).val();

			if ($.trim(value) !== "") {
				self.nombreAux = value;
			} else {
				$(this).val(self.nombreAux);
			}
		});

		self.inputApellidos.on('blur', function() {
			var value = $(this).val();

			if ($.trim(value) !== "") {
				self.apellidosAux = value;
			} else {
				$(this).val(self.apellidosAux);
			}
		});

		self.inputPassword1.on('blur', function() {
			var value = $(this).val();

			if ($.trim(value) !== "") {
				self.pass1Aux = value;
			} else {
				$(this).val(self.pass1Aux);
			}
		});

		self.inputPassword2.on('blur', function() {
			var value = $(this).val();

			if ($.trim(value) !== "") {
				self.pass2Aux = value;
			}
		});
	}


	self.selectPerfil = function() {
		$('#processing-modal').modal('show');
		$('#perfil-table-error').hide();
		$('#perfil-form .perfil-error, #perfil-form .perfil-warning, #perfil-form .perfil-success').hide();

		$.ajax({
	        data: {"usuario": usuario.id_usuario, "action": "select"},
	        url: self.SERVIDOR + "backendPerfil.php",
	        dataType: 'json',
	        type:'POST',
	        async: 'true',
	        success:function(data) {

	        	if (data.state) {
	        		self.email = data.email;
					self.nombre = data.nombre;
					self.apellidos = data.apellidos;
					self.pass1 = "appasionate";
					self.pass2 = "";

					self.emailAux = self.email;
					self.nombreAux = self.nombre;
					self.apellidosAux = self.apellidos;
					self.pass1Aux = self.pass1;
					self.pass2Aux = self.pass2;

					self.inputEmail.val(self.email);
					self.inputNombre.val(self.nombre);
					self.inputApellidos.val(self.apellidos);
					self.inputPassword1.val(self.pass1);
					self.inputPassword2.val(self.pass2);
	        	} else {
	        		console.log(data);
	        		$('#perfil-table-error').show();
	        	}

	            $('#processing-modal').modal('hide');

	        },
	        error:function(error) {
	            console.error(error);
	            $('#perfil-table-error').show();

	            $('#processing-modal').modal('hide');
	        }
	    });
	}

	resetForm = function() {
		$('#perfil-table-error').hide();

		self.emailAux = self.email;
		self.nombreAux = self.nombre;
		self.apellidosAux = self.apellidos;
		self.pass1Aux = self.pass1;
		self.pass2Aux = self.pass2;

		self.inputEmail.val(self.email);
		self.inputNombre.val(self.nombre);
		self.inputApellidos.val(self.apellidos);
		self.inputPassword1.val(self.pass1);
		self.inputPassword2.val(self.pass2);
	}

	submitForm = function() {
		console.log("a");
		var parametros = {usuario: usuario.id_usuario, action: 'update'};
		var cadError = "";
		var cambios = false;
		var isOk = true;
		$('#perfil-form .perfil-error, #perfil-form .perfil-warning, #perfil-form .perfil-success').hide();

		self.emailAux = self.inputEmail.val();
		self.nombreAux = self.inputNombre.val();
		self.apellidosAux = self.inputApellidos.val();
		self.pass1Aux = self.inputPassword1.val();
		self.pass2Aux = self.inputPassword2.val();

		if (self.emailAux !== self.email) {
			cambios = true;
			if (isEmail(self.emailAux)) {
				parametros.email = self.emailAux;
			} else {
				isOk = false;
				cadError += '<p><i class="fa fa-exclamation-triangle"></i> Email no válido.</p>';
			}
		}

		if (self.nombreAux !== self.nombre) {
			cambios = true;
			parametros.nombre = self.nombreAux;
		}

		if (self.apellidosAux !== self.apellidos) {
			cambios = true;
			parametros.apellidos = self.apellidosAux;
		}

		if (self.pass1Aux !== self.pass1) {
			cambios = true;
			if (self.pass1Aux === self.pass2Aux) {
				if (self.pass1Aux.length < 6) {
					isOk = false;
					cadError += '<p><i class="fa fa-exclamation-triangle"></i> La tiene que tener mas de 5 dígitos.</p>';
				} else {
					parametros.pass1 = self.pass1Aux;
					parametros.pass2 = self.pass2Aux;
				}
			} else {
				isOk = false;
				cadError += '<p><i class="fa fa-exclamation-triangle"></i> Las contraseñas no coinciden.</p>';
			}
		}


		if (cambios) {

			if (isOk) {
				updatePerfil(parametros);

			} else {
				$('#perfil-form .perfil-error').html(cadError).show();
				$('html, body').animate({
			        scrollTop: 0
			    },500);
			}

		} else {
			$('#perfil-form .perfil-warning').show();
			$('html, body').animate({
		        scrollTop: 0
		    },500);
		}

	}

	updatePerfil = function(parametros) {
		$('#processing-modal').modal('show');
		$.ajax({
	        data: parametros,
	        url: self.SERVIDOR + "backendPerfil.php",
	        dataType: 'json',
	        type:'POST',
	        async: 'true',
	        success:function(data) {

	        	if (data.state) {
	        		$('#perfil-form .perfil-success').show();

	        		self.email = self.emailAux;
					self.nombre = self.nombreAux;
					self.apellidos = self.apellidosAux;
					self.pass1 = "appasionate";
					self.pass2 = "";

					self.inputEmail.val(self.email);
					self.inputNombre.val(self.nombre);
					self.inputApellidos.val(self.apellidos);
					self.inputPassword1.val(self.pass1);
					self.inputPassword2.val(self.pass2);
	        	} else {
	        		$('#perfil-form .perfil-error').html('<p><i class="fa fa-exclamation-triangle"></i> Error al actualizar perfil.</p>').show();

	        	}

	            $('#processing-modal').modal('hide');

	            $('html, body').animate({
				    scrollTop: 0
				},500);

	        },
	        error:function(error) {
	            console.error(error);
	            $('#perfil-form .perfil-error').html('<p><i class="fa fa-exclamation-triangle"></i> Error al actualizar perfil.</p>').show();
				$('html, body').animate({
			        scrollTop: 0
			    },500);

	            $('#processing-modal').modal('hide');
	        }
	    });
	}

	self._init_();
}

function isEmail(email) {
  	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  	return regex.test(email);
}
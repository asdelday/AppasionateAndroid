var markerActual;

var fotosNuevoMarcador;
var arrayUris;
var contUploadFotos;

var owlMarker;
var owlCont = 0;


function FootableMarcadores() {
	var self = this;


	self.SERVIDOR = 'http://www.rodorte.com/appasionate/';

	self.marcadoresId_marcador;
	self.marcadoresLat;
	self.marcadoresLng;
	self.marcadoresTitulo;
	self.marcadoresDescripcion;
	self.marcadoresClase;
	self.marcadoresLocalizacion;

	// TABLE
	self.idTable = '#marcadores-table';
	self.myfootable = null;
	self.maxResults = 5;
	self.numPaginas = 0;
	self.totalRegistros = 0;
	self.pagina = 1;

	// FILTROS
	self.filtros = {
	    titulo: null,
	    clase: null
	}
	self.idFiltros = '#marcadores-filtros';
	self.filtrosTitulo = $(self.idFiltros + '-titulo');
	self.clearButton = $(self.idFiltros + '-clear');
	self.filtrosClase = $(self.idFiltros + '-clase');

	// PAGS
	self.idPagination = '#marcadores-pagination';
	self.firstPag = $('#marcadores-pagination .first-pag');
	self.nextPag = $('#marcadores-pagination .next-pag');
	self.prevPag = $('#marcadores-pagination .prev-pag');
	self.lastPag = $('#marcadores-pagination .last-pag');
	self.pos1Pag = $('#marcadores-pagination .pos1-pag');
	self.pos2Pag = $('#marcadores-pagination .pos2-pag');
	self.pos3Pag = $('#marcadores-pagination .pos3-pag');
	self.pos4Pag = $('#marcadores-pagination .pos4-pag');
	self.pos5Pag = $('#marcadores-pagination .pos5-pag');

	// ORDER
	self.orderBy = "marcadores.titulo";
	self.orderDir = "ASC";
	self.orderSql = self.orderBy + " " + self.orderDir;


	// Only call it after instance object
	self._init_ = function() {
		self.getMarcadores();
		$(self.idTable + ' .sort').on('click', self.ordenarTabla);
    	self.initPaginarEvents();
    	self.initFiltrarEvents();

    	$("#owl-marker").owlCarousel();
    	owlMarker = $("#owl-marker").data('owlCarousel');

    	self.initMarkerModalEvents();
	}

	self._destroy_ = function() {
		$(self.idTable + ' tbody').html("");
		self.initFootable();
	}

	self.getMarcadores = function(notModal) {

	    self.pagina = 1;

	    if (notModal) {
			self.getMarcadoresFromDb(notModal);
		} else {
			self.getMarcadoresFromDb();
		}

	}

	self.getMarcadoresFromDb = function(notModal) {
		$(self.idTable + '-error').hide();
		if (!notModal) {
			$('#processing-modal').modal('show');
		}

	    var parametros = self.getParametrosForAjax();

	    $.ajax({
	        data: parametros,
	        url: self.SERVIDOR + "getMarcadores.php",
	        dataType: 'json',
	        type:'POST',
	        async: 'true',
	        success:function(data) {

	            self.totalRegistros = (data.length > 0) ? data[0].totalRegistros : 0;
	            self.numPaginas = Math.ceil(self.totalRegistros / self.maxResults);

	            var table = "";
	            var row;
	            var tableRow;
	            for (var i = 0; i < data.length; i++) {
	                row = data[i];

	                self.marcadoresId_marcador = (row['id_marcador'] == null)?" ":row['id_marcador'];
					self.marcadoresLat = (row['lat'] == null)?" ":row['lat'];
					self.marcadoresLng = (row['lng'] == null)?" ":row['lng'];
					self.marcadoresTitulo = (row['titulo'] == null)?" ":row['titulo'];
					self.marcadoresDescripcion = (row['descripcion'] == null)?" ":row['descripcion'];
					self.marcadoresClase = (row['clase'] == null)?" ":row['clase'];
					self.marcadoresLocalizacion = (row['localizacion'] == null)?" ":row['localizacion'];

					var imgMap  = '<img style="width: 100%; border: solid 4px #FFF; outline: solid 1px;" src="http://maps.googleapis.com/maps/api/staticmap?center='+self.marcadoresLocalizacion+'&zoom=17&size=600x150';
					imgMap += '&markers=color:red%7Ccolor:red%7Clabel:M%7C'+self.marcadoresLocalizacion+'&sensor=false">';

	                tableRow = '<tr>';
	                tableRow +=     '<td>' + self.marcadoresTitulo + '</td>';
	                tableRow +=     '<td>' + self.marcadoresClase + '</td>';
	                tableRow +=     '<td>' + self.marcadoresDescripcion + '</td>';
	                tableRow +=     '<td>' + self.marcadoresLocalizacion + '</td>';
	                tableRow +=     '<td>' + imgMap + '</td>';


	                tableRow += 	'<td style="text-align:right;">';
	                tableRow +=			'<button onclick="getMarkerModal($(this).data().id);" ';
	                tableRow +=             'data-id="' + self.marcadoresId_marcador + '" ';
	                tableRow +=             'style="margin:2px; width:44px;" class="btn-ficha btn-success btn"><i class="fa fa-map-marker"></i>';
	                tableRow +=     	'</button>';

	                tableRow +=			'<button onclick="goQuizAdmin($(this).data().id);" ';
	                tableRow +=             'data-id="' + self.marcadoresId_marcador + '" ';
	                tableRow +=             'style="margin:2px;" class="btn-ficha btn-primary btn"><i class="fa fa-graduation-cap"></i>';
	                tableRow +=     	'</button>';
	                tableRow +=		'</td>';

	                tableRow += '</tr>';

	                table += tableRow;

	            }

	            $(self.idTable + ' tbody').html(table);
	            self.initFootable();

	            $('#processing-modal').modal('hide');

	        },
	        error:function(error) {
	            console.error(error);
	            $(self.idTable + '-error').show();

	            $('#processing-modal').modal('hide');
	        }
	    });
	}

	self.initFootable = function() {
	    if (self.myfootable == null) {
	        $(self.idTable).footable();
	        self.myfootable = $(self.idTable).data('footable');

	    } else {
	        self.myfootable.redraw();
	    }

	    self.hacerPaginacionTabla();
	}


	self.getParametrosForAjax = function() {
	    var parametros = {};

	    if (self.filtros.titulo != null) {
	        parametros.titulo = self.filtros.titulo;
	    }
	    if (self.filtros.clase != null) {
	        parametros.clase = self.filtros.clase;
	    }

	    parametros.usuario = usuario.id_usuario;
	    parametros.order = self.orderSql;
	    parametros.pagina = self.pagina;
	    parametros.maxResults = self.maxResults;

	    return parametros;
	}

	/* ORDER TABLE
	================================================================================*/
	self.ordenarTabla = function() {
	    var me = $(this);

	    // Recoger estado
	    var ordered;
	    if (me.hasClass('asc') || me.hasClass('desc')) {ordered=1}
	    else {ordered=0}

	    // Si estado es igual a sort (aun no ordenado por ese parametro)
	    if (ordered == 0) {
	        $('.sort').removeClass('asc').removeClass('desc');
	        me.addClass('asc');
	        self.orderDir = 'ASC';

	    // Si ya estaba ordenado...
	    } else {

	        if (me.hasClass('asc')) {
	            me.removeClass('asc');
	            me.addClass('desc');
	            self.orderDir = 'DESC';
	        } else {
	            me.removeClass('desc');
	            me.addClass('asc');
	            self.orderDir = 'ASC';
	        }

	    }

	    self.orderBy = me.data().orderby;
	    self.orderSql = self.orderBy + " " + self.orderDir;

	    self.getMarcadores();
	}


	self.hacerPaginacionTabla = function() {
	    $(self.idPagination + ' li a.active').removeClass('active');
	    $(self.idPagination + ' li a.pag-arrows.disabled').removeClass('disabled');

	    if (self.numPaginas < 5) {
	        switch (self.numPaginas) {
	            case 0:
	                self.pos1Pag.html(1).addClass('active').show();
	                self.pos2Pag.html(2).hide();
	                self.pos3Pag.html(3).hide();
	                self.pos4Pag.html(4).hide();
	                self.pos5Pag.html(5).hide();

	                $(self.idPagination + ' li a.pag-arrows').addClass('disabled');
	                break;

	            case 1:
	                self.pos1Pag.html(1).addClass('active').show();
	                self.pos2Pag.html(2).hide();
	                self.pos3Pag.html(3).hide();
	                self.pos4Pag.html(4).hide();
	                self.pos5Pag.html(5).hide();

	                $(self.idPagination + ' li a.pag-arrows').addClass('disabled');
	                break;

	            case 2:
	                if (self.pagina == 1) {
	                    self.pos1Pag.html(1).addClass('active').show();
	                    self.pos2Pag.html(2).show();
	                    $(self.idPagination + ' li a.pag-arrows.left').addClass('disabled');
	                } else {
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).addClass('active').show();
	                    $(self.idPagination + ' li a.pag-arrows.right').addClass('disabled');
	                }
	                self.pos3Pag.html(3).hide();
	                self.pos4Pag.html(4).hide();
	                self.pos5Pag.html(5).hide();
	                break;

	            case 3:
	                if (self.pagina == 1) {
	                    self.pos1Pag.html(1).addClass('active').show();
	                    self.pos2Pag.html(2).show();
	                    self.pos3Pag.html(3).show();
	                    $(self.idPagination + ' li a.pag-arrows.left').addClass('disabled');
	                } else if (self.pagina == 2) {
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).addClass('active').show();
	                    self.pos3Pag.html(3).show();
	                } else {
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).show();
	                    self.pos3Pag.html(3).addClass('active').show();
	                    $(self.idPagination + ' li a.pag-arrows.right').addClass('disabled');
	                }
	                self.pos4Pag.html(4).hide();
	                self.pos5Pag.html(5).hide();
	                break;

	            case 4:
	                if (self.pagina == 1) {
	                    self.pos1Pag.html(1).addClass('active').show();
	                    self.pos2Pag.html(2).show();
	                    self.pos3Pag.html(3).show();
	                    self.pos4Pag.html(4).show();
	                    $(self.idPagination + ' li a.pag-arrows.left').addClass('disabled');
	                } else if (self.pagina == 2) {
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).addClass('active').show();
	                    self.pos3Pag.html(3).show();
	                    self.pos4Pag.html(4).show();
	                } else if (self.pagina == 3) {
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).show();
	                    self.pos3Pag.html(3).addClass('active').show();
	                    self.pos4Pag.html(4).show();
	                } else {
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).show();
	                    self.pos3Pag.html(3).show();
	                    self.pos4Pag.html(4).addClass('active').show();
	                    $(self.idPagination + ' li a.pag-arrows.right').addClass('disabled');
	                }
	                self.pos5Pag.html(5).hide();
	                break;
	        }
	    } else {
	        //  PAGINACION NORMAL
	        if (self.pagina > 2 && self.pagina < (self.numPaginas-1)) {
	            self.pos1Pag.html(self.pagina-2).show();
	            self.pos2Pag.html(self.pagina-1).show();
	            self.pos3Pag.html(self.pagina).addClass('active').show();
	            self.pos4Pag.html(self.pagina+1).show();
	            self.pos5Pag.html(self.pagina+2).show();

	        //  PAGINACION EXTREMOS (1, 2, ultima, penultima)
	        } else {
	            switch (self.pagina) {
	                case 1:
	                    self.pos1Pag.html(1).addClass('active').show();
	                    self.pos2Pag.html(2).show();
	                    self.pos3Pag.html(3).show();
	                    self.pos4Pag.html(4).hide();
	                    self.pos5Pag.html(5).hide();
	                    $(self.idPagination + ' li a.pag-arrows.left').addClass('disabled');
	                    break;

	                case 2:
	                    self.pos1Pag.html(1).show();
	                    self.pos2Pag.html(2).addClass('active').show();
	                    self.pos3Pag.html(3).show();
	                    self.pos4Pag.html(4).show();
	                    self.pos5Pag.html(5).hide();
	                    break;

	                case (self.numPaginas - 1):
	                    self.pos1Pag.html(self.numPaginas-4).hide();
	                    self.pos2Pag.html(self.numPaginas-3).show();
	                    self.pos3Pag.html(self.numPaginas-2).show();
	                    self.pos4Pag.html(self.numPaginas-1).addClass('active').show();
	                    self.pos5Pag.html(self.numPaginas).show();
	                    break;

	                case self.numPaginas:
	                    self.pos1Pag.html(self.numPaginas-4).hide();
	                    self.pos2Pag.html(self.numPaginas-3).hide();
	                    self.pos3Pag.html(self.numPaginas-2).show();
	                    self.pos4Pag.html(self.numPaginas-1).show();
	                    self.pos5Pag.html(self.numPaginas).addClass('active').show();
	                    $(self.idPagination + ' li a.pag-arrows.right').addClass('disabled');
	                    break;
	            }
	        }
	    }

	}

	self.initPaginarEvents = function() {
	    // FIRST PAG
	    self.firstPag.on('click', function() {
	        if (!$(this).hasClass('disabled')) {
	            self.pagina = 1;
	            self.getMarcadoresFromDb();
	        }
	    });
	    // NEXT PAG
	    self.nextPag.on('click', function() {
	        if (self.pagina < self.numPaginas && !$(this).hasClass('disabled')) {
	            self.pagina ++;
	            self.getMarcadoresFromDb();
	        }
	    });
	    // PREV PAG
	    self.prevPag.on('click', function() {
	        if (self.pagina > 1 && !$(this).hasClass('disabled')) {
	            self.pagina --;
	            self.getMarcadoresFromDb();
	        }
	    });
	    // LAST PAG
	    self.lastPag.on('click', function() {
	        if (!$(this).hasClass('disabled')) {
	            self.pagina = Math.ceil(self.totalRegistros / self.maxResults);
	            self.getMarcadoresFromDb();
	        }
	    });

	    // NUM PAGS
	    $(self.idPagination + ' .num-pag').on('click', function() {
	        if (!$(this).hasClass('active')) {
	            self.pagina = +($(this).html());
	            self.getMarcadoresFromDb();
	        }
	    });
	}

	self.initFiltrarEvents = function() {
		function checkIcon() {
			if (self.filtrosTitulo.val() === "" && self.filtrosClase.val() === "") {
				self.clearButton.children('i').removeClass('fa-times').addClass('fa-search');
			} else {
				self.clearButton.children('i').removeClass('fa-search').addClass('fa-times');
			}
		}

		self.filtrosClase.on('change', function() {
			var value = $(this).val();

			if (value !== "") {
				self.filtros.clase = value;
			} else {
				self.filtros.clase = null;
			}

			self.getMarcadores();
			checkIcon();

		});

		self.filtrosTitulo.on('keyup', function() {
			self.filtros.titulo = $(this).val();
			self.getMarcadores(true);
			checkIcon();
		});

		self.clearButton.on('click', function() {
			if ($(this).children('i').hasClass('fa-times')) {
				$(this).children('i').removeClass('fa-times').addClass('fa-search');

				$(self.idFiltros + ' .filtros-fields-container input:text').val("");
				$(self.idFiltros + ' .filtros-fields-container select').val("");

				self.filtros = {
				    titulo: null,
				    clase: null
				}

				self.getMarcadores();
			}
		});
	}

	self.initMarkerModalEvents = function() {
		// GET IMAGE
		$('#get-image-files').on('click', getImage);
		$('#get-image-camera').on('click', getImageCamera);

		// UPLOAD PHOTOS
		$('#btn-upload-fotos').on('click', uploadPhotos);

		// CUESTIONARIO
		$('#btn-cuestionario').on('click', function() {
			sessionStorage.idMarker = markerActual;

			if (usuario.rol.toLowerCase() !== "admin") {
	        	location.href = 'quiz.html';
		    } else {
		    	location.href = 'quizAdmin.html';
		    }
		});

		// DELETE MARKER
		if (usuario.rol.toLowerCase() === "admin") {
	       	$('#btn-del-marker').show().on('click', deleteMarker);
		} else {
		    $('#btn-del-marker').hide();
		}

		// ADD IMAGES
		if (usuario.rol.toLowerCase() === "admin") {
			$('#btn-add-images').show().on('click', function() { $('#marker-modal').modal('hide'); });
		} else {
			$('#btn-add-images').hide();
		}

		// EDIT MARKER
		if (usuario.rol.toLowerCase() === "admin") {
			$('#btn-edit-marker').show().on('click', cargarEditMarcador);
			$('#btn-guardar-edit-marcador').on('click', guardarBtnEditMarcador);
		} else {
			$('#btn-edit-marker').hide();
		}


		$('#marker-modal').on('show.bs.modal', function (e) {
		  $('#btn-edit-marker, #btn-add-images, #btn-del-marker, #btn-cuestionario, #btn-delete-img').prop('disabled', true);
		});
		$('#marker-modal').on('shown.bs.modal', function (e) {
		  	setTimeout(function() {
		  		$('#btn-edit-marker, #btn-add-images, #btn-del-marker, #btn-cuestionario, #btn-delete-img').prop('disabled', false);
		  	}, 200);
		});
	}

	goQuizAdmin = function(idMarker) {
		sessionStorage.idMarker = idMarker;
        location.href = 'quizAdmin.html';
	}

	getMarkerModal = function(idMarker) {
		markerActual = idMarker;

		$.ajax({
			url: SERVIDOR + 'obtenerMarcador.php',
			type:'POST',
			data:{"usuario": usuario.id_usuario, "marker": markerActual},
			dataType:'json',
			error:function(jqXHR,text_status,strError){
				alert("No se pudo establecer conexion con el servidor.");
			},
			timeout:60000,
			success:function(data){
				if (data.res) {
					showMarker(data);
				} else {
					alert("Error al obtener marcador.");
				}
			}
		});

	}

	self._init_();
}

function showMarker(datos) {
	fotosNuevoMarcador = new Array();
	arrayUris = new Array();
	contUploadFotos = 0;
	$('#btn-edit-marker, #btn-add-images, #btn-del-marker, #btn-cuestionario, #btn-delete-img').prop('disabled', true);

	var cadBody  = '<p>' + datos.descripcion + '</p>';
	$('#marker-modal .modal-body .modal-body-contenido').html(cadBody);

	for (var i = 0; i <= owlCont; i++) {
	  	owlMarker.removeItem(0);
	}
	owlCont = 0;

	if (datos.imagenes.length > 0) {
		for (var i = 0; i < datos.imagenes.length; i++) {
			imgCad = '<img data-id="' + datos.imagenes[i].id_imagen + '" src="' + datos.imagenes[i].path_imagen + '"/>';

			owlMarker.addItem(imgCad);

			owlCont++;
		}

		if (usuario.rol.toLowerCase() === "admin") {
			$('#btn-delete-img').off('click');
		    $('#btn-delete-img').show().on('click', deleteMarkerImg);
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
		$('#btn-delete-img').hide();

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
}


/* DELETE
==============================================*/
function deleteMarkerImg() {
	var current = owlMarker.currentItem + 1;
    var src = $('#owl-marker .owl-wrapper .owl-item:nth-child(' + current + ') img').attr('src');
    var idImg = $('#owl-marker .owl-wrapper .owl-item:nth-child(' + current + ') img').data().id;

    $.ajax({
		url: SERVIDOR + 'delImgMarker.php',
		type:'POST',
		data:{"usuario": usuario.id_usuario, "imagen": idImg},
		dataType:'json',
		error:function(jqXHR,text_status,strError){
			alert("No se pudo establecer conexion con el servidor.");
		},
		timeout:60000,
		success:function(data){
			if (data) {
				owlMarker.removeItem(current - 1);

			    if ($('#owl-marker .owl-wrapper .owl-item').length === 0) {
			        $('#btn-delete-img').hide();
			    }


			} else {
				alert("Error al tratar de eliminar foto.");
			}
		}
	});

}

function deleteMarker(){
	var res = confirm("Va a eliminar este marcador, ¿Está seguro?");

    if (res == true) {
        $.ajax({
			url: SERVIDOR + 'deleteMarker.php',
			type:'POST',
			data:{"usuario": usuario.id_usuario, "marker": markerActual},
			dataType:'json',
			error:function(jqXHR,text_status,strError){
				alert("No se pudo establecer conexion con el servidor.");

			},
			timeout:60000,
			success:function(data){
				if (data) {
					$('#marker-modal').modal('hide');
					footables.marcadores.getMarcadoresFromDb();

				} else {
					alert("Error al tratar de eliminar marcador.");
				}
			}
		});
    }

}


/* =============================================
**
*	EDITAR MARCADOR
*
* ==============================================*/
function cargarEditMarcador() {
	$.ajax({
		url: SERVIDOR + 'getMarkerFromId.php',
		type:'POST',
		data:{"usuario": usuario.id_usuario, "marker": markerActual},
		dataType:'json',
		beforeSend: function () {
			$('#processing-modal .loading-modal-text').html("Cargando marcador...");
		    $('#processing-modal').modal('show');
		},
		error:function(jqXHR,text_status,strError){
			$('#processing-modal').modal('hide');
			alert("No se pudo establecer conexion con el servidor.");
		},
		timeout:60000,
		success:function(data){
			$('#processing-modal').modal('hide');
			console.log(data);
			if (data.res) {
				$('#edit-marker-errors').html('').hide();
				$('#marker-modal').modal('hide');

				$('#edit-marker-modal #edit-marker-lat-lng').html(data.lat + ", " + data.lng);

				var img1  = '<img src="http://maps.googleapis.com/maps/api/staticmap?center='+data.lat+','+data.lng+'&zoom=14&size=600x200';
					img1 += '&markers=color:red%7Ccolor:red%7Clabel:M%7C'+data.lat+','+data.lng+'&sensor=false">';
				$('#images-edit-marker-container').html(img1);

				$('#edit-marker-titulo').val(data.titulo);
				$('#edit-marker-descripcion').val(data.descripcion);
				$('#edit-marker-clase').val(data.clase);

				$('#edit-marker-modal').modal('show');

			} else if (data.length === 0) {
				alert("Usted no puede editar este marcador.");

			} else {
				alert("Error al tratar de editar marcador.");
			}
		}
	});

}

function guardarBtnEditMarcador() {
	var parametros = {
		'titulo': $.trim($('#edit-marker-titulo').val()),
		'descripcion': $.trim($('#edit-marker-descripcion').val()),
		"usuario": usuario.id_usuario,
		"marker": markerActual,
		'clase': $('#edit-marker-clase').val()
	}

	if (parametros.titulo === "" || parametros.descripcion === "" || parametros.clase === "") {
		var errorCad = '<i class="fa fa-exclamation-triangle" style ="font-size:18px;"></i> Complete todos los campos del formulario porfavor.';
		$('#edit-marker-errors').html(errorCad).show();

	} else {
		$('#edit-marker-errors').html('').hide();

		$.ajax({
			url: SERVIDOR + 'editarMarcador.php',
			type:'POST',
			data:parametros,
			dataType:'json',
			beforeSend: function () {
				$('#processing-modal .loading-modal-text').html("Editando marcador...");
		    	$('#processing-modal').modal('show');
		    },
			error:function(jqXHR,text_status,strError){
				$('#processing-modal').modal('hide');
				alert('No se pudo crear el marcador.');
			},
			timeout:60000,
			success:function(data){
				console.log(data);
				if (data.res) {
					$('#edit-marker-modal').modal('hide');
					footables.marcadores.getMarcadoresFromDb(true);


				} else {
					$('#processing-modal').modal('hide');
					alert('No se pudo editar el marcador.');
				}
			}
		});
	}
}


/** IMAGES
==========================================*/
function getImage() {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(
    	selectPhoto,
    	function(message) {
			alert('No se pudo seleccionar la imagen.');
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
			alert('No se pudo seleccionar la imagen.');
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
		alert('Esa imágen ya se encuentra lista para subir.');
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
		alert('No hay imágenes listas para subir.');
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
	    params.marker = markerActual;

	    options.params = params;

	    var ft = new FileTransfer();
	    ft.upload(foto.uri, SERVIDOR + 'uploadPhoto.php', winUpload, failUpload, options);
	}

	function winUpload(r) {
		var response = JSON.parse(r.response);

	    if (tempList.length == 0) {
	    	quitarFoto();

       		alert('Éxito subiendo las imágenes.');

		} else {
			if (response === 1) {
				quitarFoto();

				var foto = tempList.pop();
	    		uploadPhoto(foto);
			} else {
				alert('Fallo al subir fotos. Alguna de las imágenes restantes no pudo subirse y se paro la cola.');
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
		alert('Fallo al subir fotos. Alguna de las imágenes restantes no pudo subirse y se paro la cola.');
	    console.log("failImg An error has occurred: Code = " + error.code);
		console.log("upload error source " + error.source);
		console.log("upload error target " + error.target);
	}
}
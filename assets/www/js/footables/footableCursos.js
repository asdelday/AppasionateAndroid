function FootableCursos() {
	var self = this;

	self.profesor = true;
	if (usuario.rol.toLowerCase() !== "admin") {
		self.profesor = false;
	}

	self.SERVIDOR = 'http://www.rodorte.com/appasionate/';

	self.cursoId;
	self.cursoNombre;
	self.cursoProfesor;
	self.cursoAlumnos;
	self.cursoCodigo;

	// TABLE
	self.idTable = '#cursos-table';
	self.myfootable = null;
	self.maxResults = 5;
	self.numPaginas = 0;
	self.totalRegistros = 0;
	self.pagina = 1;

	// FILTROS
	self.filtros = {
	    nombre: null
	}
	self.idFiltros = '#cursos-filtros';
	self.filtrosNombre = $(self.idFiltros + '-nombre');
	self.clearButton = $(self.idFiltros + '-clear');
	self.cursoSeleccionado = null;

	// PAGS
	self.idPagination = '#cursos-pagination';
	self.firstPag = $('#cursos-pagination .first-pag');
	self.nextPag = $('#cursos-pagination .next-pag');
	self.prevPag = $('#cursos-pagination .prev-pag');
	self.lastPag = $('#cursos-pagination .last-pag');
	self.pos1Pag = $('#cursos-pagination .pos1-pag');
	self.pos2Pag = $('#cursos-pagination .pos2-pag');
	self.pos3Pag = $('#cursos-pagination .pos3-pag');
	self.pos4Pag = $('#cursos-pagination .pos4-pag');
	self.pos5Pag = $('#cursos-pagination .pos5-pag');

	// ORDER
	self.orderBy = "clases.nombre";
	self.orderDir = "ASC";
	self.orderSql = self.orderBy + " " + self.orderDir;

	//BTNS
	self.addBtn = $('#add-curso');
	self.addFormId = '#add-curso-form';
	self.editFormId = '#edit-curso-form';
	self.delBtnOk = $('#del-curso-btn');

	// Only call it after instance object
	self._init_ = function() {
		self.getCursos();
		$(self.idTable + ' .sort').on('click', self.ordenarTabla);
    	self.initPaginarEvents();
    	self.initFiltrarEvents();

    	if (self.profesor) {
    		self.addBtn.on('click', profesorAddCurso);
    		$(self.addFormId).on('submit', function(e) {
    			e.preventDefault();
    			profesorAddCursoSubmit();
    		});
    		$(self.editFormId).on('submit', function(e) {
    			e.preventDefault();
    			profesorEditCursoSubmit();
    		});
    		self.delBtnOk.on('click', profesorDelCurso);
    	} else {
    		self.addBtn.on('click', alumnoAddCurso);
    		$(self.addFormId).on('submit', function(e) {
    			e.preventDefault();
    			alumnoAddCursoSubmit();
    		});
    		self.delBtnOk.on('click', alumnoDelCurso);
    	}
	}

	self._destroy_ = function() {
		$(self.idTable + ' tbody').html("");
		self.initFootable();
	}

	self.getCursos = function(notModal) {

	    self.pagina = 1;

	    if (notModal) {
			self.getCursosFromDb(notModal);
		} else {
			self.getCursosFromDb();
		}

	}

	self.getCursosFromDb = function(notModal) {
		$(self.idTable + '-error').hide();
		if (!notModal) {
			$('#processing-modal').modal('show');
		}

	    var parametros = self.getParametrosForAjax();
	    var url = self.SERVIDOR + "getCursos.php";
	    if (!self.profesor) {
	    	url = self.SERVIDOR + "getCursosAlumno.php";
	    }

	    $.ajax({
	        data: parametros,
	        url: url,
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

	                self.cursoId = (row['id_clase'] == null)?" ":row['id_clase'];
	                self.cursoNombre = (row['nombre'] == null)?" ":row['nombre'];
	                self.cursoProfesor = (row['profesor'] == null)?" ":row['profesor'];
	                self.cursoAlumnos = (row['alumnos'] == null)?0:row['alumnos'];
	                self.cursoCodigo = (row['cod'] == null)?" ":row['cod'];


	                tableRow = '<tr>';
	                tableRow +=     '<td>' + self.cursoNombre + '</td>';
	                tableRow +=     '<td>' + self.cursoProfesor + '</td>';
	                tableRow +=     '<td>' + self.cursoAlumnos + '</td>';
	                tableRow +=     '<td>' + self.cursoCodigo + '</td>';

	                // PROFESOR
	                if (self.profesor) {
	                    tableRow +=     '<td style="text-align:right;">';

	                    tableRow +=			'<button onclick="profesorEditCurso($(this).data());" ';
	                    tableRow +=             'data-id="' + self.cursoId + '" data-cod="' + self.cursoCodigo + '" ';
	                    tableRow +=             'data-nombre="' + self.cursoNombre + '" style="margin:2.5px;" ';
	                    tableRow +=             'class="btn-ficha btn-warning btn"><i class="fa fa-pencil"></i>';
	                    tableRow +=     	'</button>';

	                    tableRow +=			'<button onclick="profesorExitCurso($(this).data().id);" ';
	                    tableRow +=             'data-id="' + self.cursoId + '" style="margin:2.5px;" ';
	                    tableRow +=             'class="btn-ficha btn-danger btn"><i class="fa fa-trash-o"></i>';
	                    tableRow +=     	'</button>';

	                    tableRow +=		'</td>';

	                // ALUMNO
	                } else {
	                    tableRow +=     '<td style="text-align:right;">';
	                    tableRow +=			'<button onclick="alumnoExitCurso($(this).data().id);" ';
	                    tableRow +=             'data-id="' + self.cursoId + '" ';
	                    tableRow +=             'class="btn-ficha btn-danger btn"><i class="fa fa-trash-o"></i>';
	                    tableRow +=     	'</button>';
	                    tableRow +=		'</td>';
	                }

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

	    if (self.filtros.nombre != null) {
	        parametros.nombre = self.filtros.nombre;
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

	    self.getCursos();
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
	            self.getCursosFromDb();
	        }
	    });
	    // NEXT PAG
	    self.nextPag.on('click', function() {
	        if (self.pagina < self.numPaginas && !$(this).hasClass('disabled')) {
	            self.pagina ++;
	            self.getCursosFromDb();
	        }
	    });
	    // PREV PAG
	    self.prevPag.on('click', function() {
	        if (self.pagina > 1 && !$(this).hasClass('disabled')) {
	            self.pagina --;
	            self.getCursosFromDb();
	        }
	    });
	    // LAST PAG
	    self.lastPag.on('click', function() {
	        if (!$(this).hasClass('disabled')) {
	            self.pagina = Math.ceil(self.totalRegistros / self.maxResults);
	            self.getCursosFromDb();
	        }
	    });

	    // NUM PAGS
	    $(self.idPagination + ' .num-pag').on('click', function() {
	        if (!$(this).hasClass('active')) {
	            self.pagina = +($(this).html());
	            self.getCursosFromDb();
	        }
	    });
	}

	self.initFiltrarEvents = function() {
		$(self.idFiltros + ' .filtros-fields-container input:text').on('keyup', function() {
			if ($(this).val() !== "") {
				self.clearButton.children('i').removeClass('fa-search').addClass('fa-times');

			} else if (self.clearButton.children('i').hasClass('fa-times')) {
				self.clearButton.children('i').removeClass('fa-times').addClass('fa-search');
			}
		});

		self.filtrosNombre.on('keyup', function() {
			self.filtros.nombre = $(this).val();
			self.getCursos(true);
		});

		self.clearButton.on('click', function() {
			if ($(this).children('i').hasClass('fa-times')) {
				$(this).children('i').removeClass('fa-times').addClass('fa-search');

				$(self.idFiltros + ' .filtros-fields-container input:text').val("");

				self.filtros = {
				    nombre: null
				}

				self.getCursos();
			}
		});
	}

	alumnoExitCurso = function(idCurso){
		self.cursoSeleccionado = idCurso;
		$('#deleteCursoModal .error-delete-curso').hide();
		$('#deleteCursoModal').modal('show');
	}

	profesorExitCurso = function(idCurso){
		self.cursoSeleccionado = idCurso;
		$('#deleteCursoModal .error-delete-curso').hide();
		$('#deleteCursoModal').modal('show');
	}

	profesorEditCurso = function(data) {
		self.cursoSeleccionado = data.id;
		$(self.editFormId + " input.curso-nombre").val(data.nombre);
		$(self.editFormId + " input.curso-cod").val(data.cod);
		$('#editCursoModal .message-error').html("").hide();
		$('#editCursoModal').modal('show');
	}

	profesorAddCurso = function() {
		$(self.addFormId + " input").val("");
		$(self.addFormId + " .message-error").html("").hide();
		$('#addCursoModal').modal('show');
	}

	alumnoAddCurso = function() {
		$(self.addFormId + " input").val("");
		$(self.addFormId + " .message-error").html("").hide();
		$('#addCursoModal').modal('show');
	}

	alumnoAddCursoSubmit = function() {
		var value = $.trim($(self.addFormId + " input").val());

		if (value !== "") {
			$('#processing-modal').modal('show');

			$.ajax({
		        data: {"cod": value, "usuario": usuario.id_usuario},
		        url: self.SERVIDOR + "alumnoAddCurso.php",
		        dataType: 'json',
		        type:'POST',
		        async: 'true',
		        success:function(data) {

		        	if (data.res == "insertado") {
		        		$('#addCursoModal').modal('hide');
		        		self.getCursos();
		        	} else {
		        		$(self.addFormId + " .message-error").html("Error: "+data.res+".").show();
		        	}

		            $('#processing-modal').modal('hide');

		        },
		        error:function(error) {
		            console.error(error);
		            $(self.addFormId + " .message-error").val("Error.").show();
		        }
		    });
		} else {
			$(self.addFormId + " .message-error").html("Inserte el código.").show();
		}
	}

	profesorAddCursoSubmit = function() {
		var nombre = $.trim($(self.addFormId + " input.curso-nombre").val());
		var cod = $.trim($(self.addFormId + " input.curso-cod").val());

		if (nombre !== "" && cod !== "") {
			$('#processing-modal').modal('show');

			$.ajax({
		        data: {"nombre": nombre, "cod": cod, "usuario": usuario.id_usuario},
		        url: self.SERVIDOR + "profesorAddCurso.php",
		        dataType: 'json',
		        type:'POST',
		        async: 'true',
		        success:function(data) {

		        	if (data.res == "insertado") {
		        		$('#addCursoModal').modal('hide');
		        		self.getCursos();
		        	} else {
		        		$(self.addFormId + " .message-error").html("Error: "+data.res+".").show();
		        	}

		            $('#processing-modal').modal('hide');

		        },
		        error:function(error) {
		            console.error(error);
		            $(self.addFormId + " .message-error").val("Error.").show();
		        }
		    });
		} else {
			$(self.addFormId + " .message-error").html("Rellene los campos.").show();
		}
	}

	profesorEditCursoSubmit = function() {
		var nombre = $.trim($(self.editFormId + " input.curso-nombre").val());
		var cod = $.trim($(self.editFormId + " input.curso-cod").val());

		if (nombre !== "" && cod !== "") {
			$('#processing-modal').modal('show');

			$.ajax({
		        data: {"nombre": nombre, "cod": cod, "clase": self.cursoSeleccionado, "usuario": usuario.id_usuario},
		        url: self.SERVIDOR + "profesorEditCurso.php",
		        dataType: 'json',
		        type:'POST',
		        async: 'true',
		        success:function(data) {

		        	if (data.res == "actualizado") {
		        		$('#editCursoModal').modal('hide');
		        		self.getCursos();
		        	} else {
		        		$(self.editFormId + " .message-error").html("Error: "+data.res+".").show();
		        	}

		            $('#processing-modal').modal('hide');

		        },
		        error:function(error) {
		            console.error(error);
		            $(self.editFormId + " .message-error").val("Error.").show();
		        }
		    });

		} else {
			$(self.editFormId + " .message-error").html("Rellene los campos.").show();
		}
	}

	alumnoDelCurso = function() {
		if (self.cursoSeleccionado !== null) {
			$('#processing-modal').modal('show');

			$.ajax({
		        data: {"clase": self.cursoSeleccionado, "usuario": usuario.id_usuario},
		        url: self.SERVIDOR + "alumnoDeleteCurso.php",
		        dataType: 'json',
		        type:'POST',
		        async: 'true',
		        success:function(data) {

		        	if (data) {
		        		$('#deleteCursoModal').modal('hide');
		        		self.getCursos();
		        	} else {
		        		$('#deleteCursoModal .error-delete-curso').show();
		        	}

		            $('#processing-modal').modal('hide');

		        },
		        error:function(error) {
		            console.error(error);
		            $('#deleteCursoModal .error-delete-curso').show();
		        }
		    });
		} else {
			$('#deleteCursoModal .error-delete-curso').show();
		}
	}


	profesorDelCurso = function() {
		if (self.cursoSeleccionado !== null) {

			$('#processing-modal').modal('show');

			$.ajax({
		        data: {"clase": self.cursoSeleccionado},
		        url: self.SERVIDOR + "profesorDeleteCurso.php",
		        dataType: 'json',
		        type:'POST',
		        async: 'true',
		        success:function(data) {

		        	if (data) {
		        		$('#deleteCursoModal').modal('hide');
		        		self.getCursos();
		        	} else {
		        		$('#deleteCursoModal .error-delete-curso').show();
		        	}

		            $('#processing-modal').modal('hide');

		        },
		        error:function(error) {
		            console.error(error);
		            $('#deleteCursoModal .error-delete-curso').show();
		        }
		    });
		} else {
			$('#deleteCursoModal .error-delete-curso').show();
		}
	}



	self._init_();
}



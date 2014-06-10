function FootableAlumnos() {
	var self = this;

	self.SERVIDOR = 'http://www.rodorte.com/appasionate/';

	self.alumnosId;
	self.alumnosAlumno;
	self.alumnosEmail;
	self.alumnosCursos;

	// TABLE
	self.idTable = '#alumnos-table';
	self.myfootable = null;
	self.maxResults = 5;
	self.numPaginas = 0;
	self.totalRegistros = 0;
	self.pagina = 1;

	// FILTROS
	self.filtros = {
	    nomApe: null,
	    clase: null
	}
	self.idFiltros = '#alumnos-filtros';
	self.filtrosNomApe = $(self.idFiltros + '-nomApe');
	self.clearButton = $(self.idFiltros + '-clear');
	self.filtrosClase = $(self.idFiltros + '-clase');

	// PAGS
	self.idPagination = '#alumnos-pagination';
	self.firstPag = $('#alumnos-pagination .first-pag');
	self.nextPag = $('#alumnos-pagination .next-pag');
	self.prevPag = $('#alumnos-pagination .prev-pag');
	self.lastPag = $('#alumnos-pagination .last-pag');
	self.pos1Pag = $('#alumnos-pagination .pos1-pag');
	self.pos2Pag = $('#alumnos-pagination .pos2-pag');
	self.pos3Pag = $('#alumnos-pagination .pos3-pag');
	self.pos4Pag = $('#alumnos-pagination .pos4-pag');
	self.pos5Pag = $('#alumnos-pagination .pos5-pag');

	// ORDER
	self.orderBy = "usuarios.nombre";
	self.orderDir = "ASC";
	self.orderSql = self.orderBy + " " + self.orderDir;


	// Only call it after instance object
	self._init_ = function() {
		self.getAlumnos();
		$(self.idTable + ' .sort').on('click', self.ordenarTabla);
    	self.initPaginarEvents();
    	self.initFiltrarEvents();
	}

	self._destroy_ = function() {
		$(self.idTable + ' tbody').html("");
		self.initFootable();
	}

	self.getAlumnos = function(notModal) {

	    self.pagina = 1;

	    if (notModal) {
			self.getAlumnosFromDb(notModal);
		} else {
			self.getAlumnosFromDb();
		}

	}

	self.getAlumnosFromDb = function(notModal) {
		$(self.idTable + '-error').hide();
		if (!notModal) {
			$('#processing-modal').modal('show');
		}

	    var parametros = self.getParametrosForAjax();

	    $.ajax({
	        data: parametros,
	        url: self.SERVIDOR + "getAlumnos.php",
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

	                self.alumnosId = (row['id_usuario'] == null)?" ":row['id_usuario'];
	                self.alumnosAlumno = (row['alumno'] == null)?" ":row['alumno'];
	                self.alumnosEmail = (row['email'] == null)?" ":row['email'];
	                self.alumnosCursos = (row['cursos'] == null)?" ":row['cursos'];

	                tableRow = '<tr>';
	                tableRow +=     '<td>' + self.alumnosAlumno + '</td>';
	                tableRow +=     '<td>' + self.alumnosEmail + '</td>';
	                tableRow +=     '<td>' + self.alumnosCursos + '</td>';

	                tableRow +=     '<td style="text-align:right;">';
	                tableRow +=			'<button onclick="quitarAlumno($(this).data().id);" ';
	                tableRow +=             'data-id="' + self.alumnosId + '" ';
	                tableRow +=             'class="btn-ficha btn-danger btn"><i class="fa fa-times"></i>';
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

	    if (self.filtros.nomApe != null) {
	        parametros.nomApe = self.filtros.nomApe;
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

	    self.getAlumnos();
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
	            self.getAlumnosFromDb();
	        }
	    });
	    // NEXT PAG
	    self.nextPag.on('click', function() {
	        if (self.pagina < self.numPaginas && !$(this).hasClass('disabled')) {
	            self.pagina ++;
	            self.getAlumnosFromDb();
	        }
	    });
	    // PREV PAG
	    self.prevPag.on('click', function() {
	        if (self.pagina > 1 && !$(this).hasClass('disabled')) {
	            self.pagina --;
	            self.getAlumnosFromDb();
	        }
	    });
	    // LAST PAG
	    self.lastPag.on('click', function() {
	        if (!$(this).hasClass('disabled')) {
	            self.pagina = Math.ceil(self.totalRegistros / self.maxResults);
	            self.getAlumnosFromDb();
	        }
	    });

	    // NUM PAGS
	    $(self.idPagination + ' .num-pag').on('click', function() {
	        if (!$(this).hasClass('active')) {
	            self.pagina = +($(this).html());
	            self.getAlumnosFromDb();
	        }
	    });
	}

	self.initFiltrarEvents = function() {
		function checkIcon() {
			if (self.filtrosNomApe.val() === "" && self.filtrosClase.val() === "") {
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

			self.getAlumnos();
			checkIcon();

		});

		self.filtrosNomApe.on('keyup', function() {
			self.filtros.nomApe = $(this).val();
			self.getAlumnos(true);
			checkIcon();
		});

		self.clearButton.on('click', function() {
			if ($(this).children('i').hasClass('fa-times')) {
				$(this).children('i').removeClass('fa-times').addClass('fa-search');

				$(self.idFiltros + ' .filtros-fields-container input:text').val("");
				$(self.idFiltros + ' .filtros-fields-container select').val("");

				self.filtros = {
				    nomApe: null,
				    clase: null
				}

				self.getAlumnos();
			}
		});
	}

	quitarAlumno = function(idAlumno) {
		$.ajax({
			url: SERVIDOR + 'delAlumnoClasFromProfesor.php',
			type:'POST',
			data:{"profesor": usuario.id_usuario, "alumno": idAlumno},
			dataType:'json',
			error:function(jqXHR,text_status,strError){
				alert("No se pudo establecer conexion con el servidor.");
			},
			timeout:60000,
			success:function(data){
				if (data) {
					self.getAlumnos();
				} else {
					alert("Error al tratar de quitar alumno.");
				}
			}
		});
	}

	self._init_();
}



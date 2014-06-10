function FootableNotas() {
	var self = this;

	self.SERVIDOR = 'http://www.rodorte.com/appasionate/';

	self.notasId;
	self.notasFecha;
	self.notasExamen;
	self.notasMarcador;
	self.notasClase;
	self.notasAlumno;
	self.notasPuntuacion;
	self.notasNota;

	// TABLE
	self.idTable = '#notas-table';
	self.myfootable = null;
	self.maxResults = 5;
	self.numPaginas = 0;
	self.totalRegistros = 0;
	self.pagina = 1;

	// FILTROS
	self.filtros = {
	    examen: null,
	    alumno: null
	}
	self.idFiltros = '#notas-filtros';
	self.filtrosExamen = $(self.idFiltros + '-examen');
	self.clearButton = $(self.idFiltros + '-clear');
	self.filtrosAlumno = $(self.idFiltros + '-alumno');

	// PAGS
	self.idPagination = '#notas-pagination';
	self.firstPag = $('#notas-pagination .first-pag');
	self.nextPag = $('#notas-pagination .next-pag');
	self.prevPag = $('#notas-pagination .prev-pag');
	self.lastPag = $('#notas-pagination .last-pag');
	self.pos1Pag = $('#notas-pagination .pos1-pag');
	self.pos2Pag = $('#notas-pagination .pos2-pag');
	self.pos3Pag = $('#notas-pagination .pos3-pag');
	self.pos4Pag = $('#notas-pagination .pos4-pag');
	self.pos5Pag = $('#notas-pagination .pos5-pag');

	// ORDER
	self.orderBy = "examenes.nombre";
	self.orderDir = "ASC";
	self.orderSql = self.orderBy + " " + self.orderDir;


	// Only call it after instance object
	self._init_ = function() {
		self.getNotas();
		$(self.idTable + ' .sort').on('click', self.ordenarTabla);
    	self.initPaginarEvents();
    	self.initFiltrarEvents();
	}

	self._destroy_ = function() {
		$(self.idTable + ' tbody').html("");
		self.initFootable();
	}

	self.getNotas = function(notModal) {

	    self.pagina = 1;

	    if (notModal) {
			self.getNotasFromDb(notModal);
		} else {
			self.getNotasFromDb();
		}

	}

	self.getNotasFromDb = function(notModal) {
		$(self.idTable + '-error').hide();
		if (!notModal) {
			$('#processing-modal').modal('show');
		}

	    var parametros = self.getParametrosForAjax();

	    $.ajax({
	        data: parametros,
	        url: self.SERVIDOR + "getNotas.php",
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

	                self.notasId = (row['id_nota'] == null)?" ":row['id_nota'];
	                self.notasFecha = (row['fecha'] == null)?" ":row['fecha'];
	                self.notasExamen = (row['examen'] == null)?" ":row['examen'];
	                self.notasMarcador = (row['marcador'] == null)?" ":row['marcador'];
	                self.notasClase = (row['clase'] == null)?" ":row['clase'];
	                self.notasAlumno = (row['alumno'] == null)?" ":row['alumno'];
	                self.notasPuntuacion = (row['puntuacion'] == null)?" ":row['puntuacion'];
	                self.notasNota = (row['nota'] == null)?" ":row['nota'];


	                tableRow = '<tr>';
	                tableRow +=     '<td>' + self.notasExamen + '</td>';
	                tableRow +=     '<td>' + self.notasAlumno + '</td>';
	                tableRow +=     '<td>' + (Math.round(self.notasNota * 100) / 100) + '</td>';
	                tableRow +=     '<td>' + self.notasPuntuacion + '</td>';
	                tableRow +=     '<td>' + self.notasFecha.yyyymmddTOddmmyyyy() + '</td>';
	                tableRow +=     '<td>' + self.notasMarcador + '</td>';
	                tableRow +=     '<td>' + self.notasClase + '</td>';

	                tableRow += 	'<td></td>';
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

	    if (self.filtros.examen != null) {
	        parametros.examen = self.filtros.examen;
	    }
	    if (self.filtros.alumno != null) {
	        parametros.alumno = self.filtros.alumno;
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

	    self.getNotas();
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
	            self.getNotasFromDb();
	        }
	    });
	    // NEXT PAG
	    self.nextPag.on('click', function() {
	        if (self.pagina < self.numPaginas && !$(this).hasClass('disabled')) {
	            self.pagina ++;
	            self.getNotasFromDb();
	        }
	    });
	    // PREV PAG
	    self.prevPag.on('click', function() {
	        if (self.pagina > 1 && !$(this).hasClass('disabled')) {
	            self.pagina --;
	            self.getNotasFromDb();
	        }
	    });
	    // LAST PAG
	    self.lastPag.on('click', function() {
	        if (!$(this).hasClass('disabled')) {
	            self.pagina = Math.ceil(self.totalRegistros / self.maxResults);
	            self.getNotasFromDb();
	        }
	    });

	    // NUM PAGS
	    $(self.idPagination + ' .num-pag').on('click', function() {
	        if (!$(this).hasClass('active')) {
	            self.pagina = +($(this).html());
	            self.getNotasFromDb();
	        }
	    });
	}

	self.initFiltrarEvents = function() {
		function checkIcon() {
			if (self.filtrosExamen.val() === "" && self.filtrosAlumno.val() === "") {
				self.clearButton.children('i').removeClass('fa-times').addClass('fa-search');
			} else {
				self.clearButton.children('i').removeClass('fa-search').addClass('fa-times');
			}
		}

		self.filtrosAlumno.on('change', function() {
			var value = $(this).val();

			if (value !== "") {
				self.filtros.alumno = value;
			} else {
				self.filtros.alumno = null;
			}

			self.getNotas();
			checkIcon();

		});

		self.filtrosExamen.on('keyup', function() {
			self.filtros.examen = $(this).val();
			self.getNotas(true);
			checkIcon();
		});

		self.clearButton.on('click', function() {
			if ($(this).children('i').hasClass('fa-times')) {
				$(this).children('i').removeClass('fa-times').addClass('fa-search');

				$(self.idFiltros + ' .filtros-fields-container input:text').val("");
				$(self.idFiltros + ' .filtros-fields-container select').val("");

				self.filtros = {
				    examen: null,
				    alumno: null
				}

				self.getNotas();
			}
		});
	}

	self._init_();
}

String.prototype.yyyymmddTOddmmyyyy = function () {
    var cad = this.split("-");
    var year = cad[0];
    var month = cad[1];
    var day = cad[2];
    return (day + "/" + month + "/" + year);
}


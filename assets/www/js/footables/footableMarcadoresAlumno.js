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
	self.marcadoresProfesor
	self.marcadoresNota;

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
	        url: self.SERVIDOR + "getMarcadoresAlumno.php",
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
					self.marcadoresProfesor = (row['profesor'] == null)?" ":row['profesor'];
					self.marcadoresNota = (row['nota'] == null)?" ":row['nota'];
					self.marcadoresLocalizacion = (row['localizacion'] == null)?" ":row['localizacion'];

					var imgMap  = '<img style="width: 100%; border: solid 4px #FFF; outline: solid 1px;" src="http://maps.googleapis.com/maps/api/staticmap?center='+self.marcadoresLocalizacion+'&zoom=17&size=600x150';
					imgMap += '&markers=color:red%7Ccolor:red%7Clabel:M%7C'+self.marcadoresLocalizacion+'&sensor=false">';

	                tableRow = '<tr>';
	                tableRow +=     '<td>' + self.marcadoresTitulo + '</td>';
	                tableRow +=     '<td>' + self.marcadoresClase + '</td>';
	                tableRow +=     '<td>' + self.marcadoresDescripcion + '</td>';
	                tableRow +=     '<td><span style="color:#3398DC;border: solid 1px;padding: 2px;">' + self.marcadoresNota + '</span></td>';
	                tableRow +=     '<td>' + self.marcadoresProfesor + '</td>';
	                tableRow +=     '<td>' + self.marcadoresLocalizacion + '</td>';
	                tableRow +=     '<td>' + imgMap + '</td>';

	                tableRow += 	'<td>';
	                tableRow +=			'<button onclick="goQuiz($(this).data().id);" ';
	                tableRow +=             'data-id="' + self.marcadoresId_marcador + '" ';
	                tableRow +=             'class="btn-ficha btn-primary btn"><i class="fa fa-graduation-cap"></i>';
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

	goQuiz = function(idMarker) {
		sessionStorage.idMarker = idMarker;
        location.href = 'quiz.html';
	}

	self._init_();
}



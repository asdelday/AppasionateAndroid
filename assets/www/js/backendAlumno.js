var SERVIDOR = 'http://www.rodorte.com/appasionate/';

// ESTADOS Y NAVEGACION
var estado;
var actual = "principal";
var myScrollMenu;
var cuerpo = $("#cuerpo");

var clasesLoaded = false;
var perfil = null;
var footables = {marcadores: null, notas: null, cursos: null};

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

        $('#menu-usuario-first-list').html(usuario.nombre + " " + usuario.apellidos);
    	initEventsHandlers();

    },

};


// Funcion encargada de los eventos para el MENU de marcadores
function menu(opcion){

    // Si pulsamos en el boton de "menu" entramos en el if
    if(opcion=="menu"){
        if(estado=="cuerpo"){
            cuerpo.removeClass('center').addClass('right');
            estado="menuprincipal";
            $('#menuIcon').attr("class", "fa fa-times");

        }else if(estado=="menuprincipal"){
            cuerpo.removeClass('right').addClass('center');
            estado="cuerpo";
            $('#menuIcon').attr("class", "fa fa-bars");
        }

    // Si pulsamos un boton del menu principal entramos en el else
    }else{

        switch (opcion) {
            case "principal":
                if (actual !== opcion) {
                    $('#main-' + actual).slideUp('400', function() {
                        $('#main-' + opcion).slideDown('400');
                        actual = opcion;
                    });
                }
                break;

            case "perfil":
                if (actual !== opcion) {
                    $('#main-' + actual).slideUp('400', function() {
                        $('#main-' + opcion).slideDown('400');
                        actual = opcion;
                    });

                    if (perfil == null) {
                        perfil = new Perfil();
                    } else {
                        perfil.selectPerfil();
                    }
                }
                break;

            case "marcadores":
                if (actual !== opcion) {
                    $('#main-' + actual).slideUp('400', function() {
                        $('#main-' + opcion).slideDown('400');
                        actual = opcion;

                        if (!clasesLoaded) {
                            loadClases();
                        }

                        if (footables.marcadores == null) {
                            footables.marcadores = new FootableMarcadores();
                        } else {
                            footables.marcadores.getNotas();
                        }

                    });
                }
                break;

            case "notas":
                if (actual !== opcion) {
                    $('#main-' + actual).slideUp('400', function() {
                        $('#main-' + opcion).slideDown('400');
                        actual = opcion;

                        if (!clasesLoaded) {
                            loadClases();
                        }

                        if (footables.notas == null) {
                            footables.notas = new FootableNotas();
                        } else {
                            footables.notas.getNotas();
                        }

                    });
                }

                break;

            case "cursos":
                if (actual !== opcion) {
                    $('#main-' + actual).slideUp('400', function() {
                        $('#main-' + opcion).slideDown('400');
                        actual = opcion;

                        if (footables.cursos == null) {
                            footables.cursos = new FootableCursos();
                        } else {
                            footables.cursos.getCursos();
                        }

                    });
                }

                break;
        }


        cuerpo.removeClass('right').addClass('center');
        estado="cuerpo";

        $('#menuIcon').attr("class", "fa fa-bars");

    }

}


function loadClases() {

    $('#marcadores-filtros-clase, #notas-filtros-clase').html('<option value="">Todos los cursos</option>');
    $.ajax({
        data: {usuario: usuario.id_usuario},
        url: self.SERVIDOR + "loadCursosAlumno.php",
        dataType: 'json',
        type:'POST',
        async: 'true',
        success:function(data) {
            for (var i = 0; i < data.cursos.length; i++) {
                var curso = data.cursos[i];
                $('#marcadores-filtros-clase, #notas-filtros-clase').append('<option value="'+curso.id_clase+'">'+curso.nombre+'</option>');
            }

            clasesLoaded = true;

        },
        error:function(error) {
            console.error(error);
        }
    });
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

function initEventsHandlers() {
    $(document).on("backbutton", function() { $('#offModal').modal('show'); });
    $('#btn-option-salir').on('click', function() { $('#offModal').modal('show'); });

    // MENU
    $('#btn-menu-principal').on('click', function() { menu('menu'); });
    $('.menu-principal').on('click', function() { menu('principal'); });
    $('.menu-perfil').on('click', function() { menu('perfil'); });
    $('.menu-marcadores').on('click', function() { menu('marcadores'); });
    $('.menu-notas').on('click', function() { menu('notas'); });
    $('.menu-cursos').on('click', function() { menu('cursos'); });
    // MODAL EXIT
    $('#btn-cerrar-sesion').on('click', onClickCerrarSesion);
    $('#btn-exit').on('click', onBackKeyDown);
    $('#btn-volver-mapa').on('click', function() {location.href='map.html';});
}
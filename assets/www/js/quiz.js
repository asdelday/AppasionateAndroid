var SERVIDOR = 'http://www.rodorte.com/appasionate/';
var quizJSON;
var canExit = true;
var examen = null;
var idMarker = null;

///////////////////////
// Dispositivo listo //
///////////////////////
var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
		new FastClick(document.body);

		checkQuiz();

		initEventsHandlers();
    },

};

function checkQuiz() {
    if (sessionStorage.idMarker == null) {
        $('.quizName').html('No se pudo cargar el examen del marcador.');
    } else {
        idMarker = sessionStorage.idMarker;
        var parametros = {"marker": idMarker, "usuario": usuario.id_usuario};

        $.ajax({
            url: SERVIDOR + 'checkQuiz.php',
            type:'POST',
            data:parametros,
            dataType:'json',
            error:function(jqXHR,text_status,strError){
                $('.quizName').html('No se pudo cargar el examen del marcador.');
            },
            timeout:60000,
            success:function(data){

                if (data.existe) {
                    $('#no-quiz').show();

                    $('.quizName').html(data.nombre);

                    $('#no-quiz .puntuacion span').html(data.nota + "/" + data.num_preguntas);

                    var nota = (data.nota * 10) / data.num_preguntas;
                    var notaRound = Math.round((nota * 100) / 100);
                    $('#no-quiz .nota span').html(notaRound);

                    $('#fecha span').html(data.fecha.yyyymmddTOddmmyyyy());
                } else {
                    initQuiz();
                }

            }
        });
    }
}


function initQuiz() {
    var parametros = {"marker": idMarker};

    $.ajax({
        url: SERVIDOR + 'obtenerQuiz.php',
        type:'POST',
        data:parametros,
        dataType:'json',
        error:function(jqXHR,text_status,strError){
            $('.quizName').html("Marcador sin examen.");
        },
        timeout:60000,
        success:function(data){
            quizJSON = data;
            examen = data.id;

            if (data.info.name == null) {
                $('.quizName').html("Marcador sin examen.");
            } else {
                if (data.questions.length > 0) {
                    if (data.abierto) {
                        $('#slickQuiz').slickQuiz();

                        $('input').iCheck({
                            checkboxClass: 'icheckbox_flat-red',
                            radioClass: 'iradio_flat-red'
                        });

                    } else {
                        $('.quizName').html(data.info.name + ": <small><i class='fa fa-lock'></i> Cuestionario Cerrado.</small>");
                    }

                } else {
                    $('.quizName').html(data.info.name + ": <small>Cuestionario sin preguntas.</small>");
                }
            }

        }
    });
}

function goBack() {
    if (canExit) {
        window.history.back();
    } else {
        alert("Termina el cuestionario, porfavor, sino perdera su nota");
    }
}

function initEventsHandlers() {
    $(document).on("backbutton", goBack);
    $('.exitQuiz').on('click', goBack);
}

String.prototype.yyyymmddTOddmmyyyy = function () {
    var cad = this.split("-");
    var year = cad[0];
    var month = cad[1];
    var day = cad[2];
    return (day + "/" + month + "/" + year);
}
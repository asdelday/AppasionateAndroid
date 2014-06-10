var SERVIDOR = 'http://www.rodorte.com/appasionate/';
var idMarker = null;
var quizAdmin = null;
var questionCont = 1, optionCont = 1;

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

		initQuizAdmin();

		initEventsHandlers();
    },

};



function initQuizAdmin() {
    if (sessionStorage.idMarker == null) {
        $('#quizAdmin').html("<h1 style='margin:10px 0px;'><strong>No se pudo cargar cuestionario para el marcador.</strong>");
    } else {
        idMarker = sessionStorage.idMarker;
        var parametros = {"marker": idMarker, "usuario": usuario.id_usuario};

        $('#processing-modal').modal('show');
        $.ajax({
            url: SERVIDOR + 'obtenerQuizAdmin.php',
            type:'POST',
            data:parametros,
            dataType:'json',
            error:function(jqXHR,text_status,strError){
                $('#processing-modal').modal('hide');
                $('#quizAdmin').html("<h1 style='margin:10px 0px;'><strong>No se pudo establecer conexión con el servidor.</strong>");
            },
            timeout:60000,
            success:function(data){
                console.log(data);

                if (data.marcador == null) {
                   $('#quizAdmin').html("<h1 style='margin:10px 0px;'><strong>Marcador - Profesor, incorrecto.</strong>");
                } else {
                    quizAdmin = new QuizAdmin(data);
                }
                $('#processing-modal').modal('hide');

            }
        });
    }
}


/*================================================================================
/* QUIZ ADMIN
==================================================================================*/

function QuizAdmin(jsonQuiz) {
    // VARIABLES
    // ===============================================
    var self = this;

    self.quiz = jsonQuiz;

    // WRAPPERS
    self._quizExamen = '#quizExamen';
    self._quizActions = '#quizActions';
    self._quizQuestions = '#quizQuestions';

    // ELEMENTS
    // quizExamen
    self.markerName = $('#marker-name');
    self.inputQuizName = $('#input-quiz-name');
    self.inputQuizDescription = $('#input-quiz-description');

    // QUIZ
    self.idQuiz = self.quiz.id;
    self.marker = self.quiz.marcador;

    self.name = null;
    self.description = null;
    self.opened = null;

    // QUESTIONS
    self.quizQuestions = new Array();

    // OPTIONS
    self.btnAddQuestion = $('#btn-add-question');
    self.btnSaveQuiz = $('#btn-save-quiz');
    self.btnDelQuiz = $('#btn-del-quiz');
    self.btnOpenQuiz = $('#btn-open-quiz');


    // INIT METHODS
    // ================================================
    self._init_ = function() {
        if (self.idQuiz == 0) {
            self.btnDelQuiz.prop('disabled', true);
        }

        // CHARGE QuizExamen
        function chargeQuizExamen() {
            // MARKER
            self.markerName.html(self.marker);

            // NAME
            if (self.quiz.info.name != null) {
                self.name = self.quiz.info.name;
            } else {
                self.name = "";
            }
            self.inputQuizName.val(self.name);
            self.inputQuizName.on('blur', function() {
                self.name = $(this).val();
            });

            // DESCRIPTION
            if (self.quiz.info.main != null) {
                self.description = self.quiz.info.main;
            } else {
                self.description = "";
            }
            self.inputQuizDescription.val(self.description);
            self.inputQuizDescription.on('blur', function() {
                self.description = $(this).val();
            });

            // ABIERTO
            if (self.quiz.abierto != null) {
                self.opened = (self.quiz.abierto == 1)?true:false;
                if (self.opened) {
                    self.btnOpenQuiz.removeClass('closed').addClass('btn-success').addClass('opened').removeClass('btn-main');
                } else {
                    self.btnOpenQuiz.removeClass('opened').addClass('btn-main').addClass('closed').removeClass('btn-success');
                }
            } else {
                self.opened = false;
                self.btnOpenQuiz.removeClass('opened').addClass('btn-main').addClass('closed').removeClass('btn-success');
            }

        }; chargeQuizExamen();

        // CHARGE QuestionsExamen
        function chargeQuestionsExamen() {

            for (var i = 0; i < self.quiz.questions.length; i++) {
                var q = self.quiz.questions[i];
                self.quizQuestions.push(new QuizQuestion(q));
            }

        }; chargeQuestionsExamen();

        function initOptionsEventHandlers() {
            // ADD QUESTION
            self.btnAddQuestion.on('click', function() {
                self.quizQuestions.push(new QuizQuestion(null));
                $('html, body').animate({
                    scrollTop: $(document).height()
                },500);
            });

            // SAVE QUIZ
            self.btnSaveQuiz.on('click', function() {
                var parametros = self.getJson();

                $('#processing-modal').modal('show');
                $.ajax({
                    url: SERVIDOR + 'saveQuizAdmin.php',
                    type:'POST',
                    data:parametros,
                    dataType:'text',
                    error:function(jqXHR,text_status,strError){
                        $('#processing-modal').modal('hide');
                        $('#error-modal p.contenido').html("No se pudo establecer conexión con el servidor.");
                        $('#error-modal').modal('show');
                    },
                    timeout:60000,
                    success:function(data){
                        $('#processing-modal').modal('hide');
                        if (data) {
                            self.btnDelQuiz.prop('disabled', false);
                            $('#success-modal p.contenido').html('Examen guardado con éxito.');
                            $('#success-modal').modal('show');
                        } else {
                            $('#error-modal p.contenido').html('Ocurrió un error al intentar guardar el examen.');
                            $('#error-modal').modal('show');
                        }

                    }
                });

            });

            // DELETE QUIZ
            self.btnDelQuiz.on('click', function() {
                var parametros = {"marker": idMarker};

                $('#processing-modal').modal('show');
                $.ajax({
                    url: SERVIDOR + 'deleteQuizAdmin.php',
                    type:'POST',
                    data:parametros,
                    dataType:'text',
                    error:function(jqXHR,text_status,strError){
                        $('#processing-modal').modal('hide');
                        $('#error-modal p.contenido').html("No se pudo establecer conexión con el servidor.");
                        $('#error-modal').modal('show');
                    },
                    timeout:60000,
                    success:function(data){
                        $('#processing-modal').modal('hide');
                        if (data) {
                            self.btnDelQuiz.prop('disabled', false);
                            $('#success-modal p.contenido').html('Examen eliminado con éxito.');

                            $('#success-modal').on('hidden.bs.modal', function() {
                                location.reload();
                            });

                            $('#success-modal').modal('show');


                        } else {
                            $('#error-modal p.contenido').html('Ocurrió un error al intentar eliminar el examen.');
                            $('#error-modal').modal('show');
                        }

                    }
                });
            });

            self.btnOpenQuiz.on('click', function() {
                me = $(this);
                if (me.hasClass('opened')) {
                    self.opened = false;
                    me.removeClass('opened').addClass('btn-main').addClass('closed').removeClass('btn-success');
                } else if (me.hasClass('closed')) {
                    self.opened = true;
                    me.removeClass('closed').addClass('btn-success').addClass('opened').removeClass('btn-main');
                }
                console.log(quizAdmin);
            });


        } initOptionsEventHandlers();

        $(self._quizExamen + " input[type='text'], " + self._quizExamen + " textarea, " + self._quizQuestions + "  input[type='text']").on('click', function() { $(this).select(); });

    }

    self.getJson = function() {
        var json = {"marcador": idMarker, "nombre": "", "descripcion": "", "abierto": false, "preguntas": new Array()};

        // QUIZ DATA
        json.nombre = self.name;
        json.descripcion = self.description;
        json.abierto = self.opened;

        //QUIZ QUESTIONS
        for (var i = 0; i < self.quizQuestions.length; i++) {
            var q = self.quizQuestions[i];
            qJson = {"pregunta": "", "mensaje_correcto": "", "mensaje_error": "", "opciones": new Array()};

            qJson.pregunta = q.question;
            qJson.mensaje_correcto = q.correctMsg;
            qJson.mensaje_error = q.incorrectMsg;

            for (var j = 0; j < q.questionOptions.length; j++) {
                var opt = q.questionOptions[j];
                oJson = {"opcion": "", "correcta": opt.correct};

                oJson.opcion = opt.option;

                qJson.opciones.push(oJson);
            }

            json.preguntas.push(qJson);
        }

        return json;
    }

    self._init_();
}


/*================================================================================
/* QUIZ QUESTION
==================================================================================*/

function QuizQuestion(jsonQuestion) {
    // VARIABLES
    // ===============================================
    var self = this;

    self.selfId = questionCont++;

    self.jsonQuestion = jsonQuestion;

    // WRAPPER
    self._container = '#quizQuestions';
    self.container = $(self._container);

    // MAIN VARIABLES
    self.question = null;
    self.correctMsg = null;
    self.incorrectMsg = null;
    self.questionOptions = new Array();

    self.element = null;
    self.subElement = null;
    self.inputQuestion = null;
    self.inputCorrect = null;
    self.inputIncorrect = null;
    self._optionsContainer = null;
    self.btnAddOption = null;


    // INIT METHODS
    // ================================================
    self._init_ = function() {
        // CHARGE Question
        function chargeQuestion() {

            if (self.jsonQuestion != null && self.jsonQuestion != undefined) {

                if (self.jsonQuestion.q !== null) {
                    self.question = self.jsonQuestion.q;
                } else {
                    self.question = "";
                }

                if (self.jsonQuestion.correct !== null) {
                    self.correctMsg = self.jsonQuestion.correct;
                } else {
                    self.correctMsg = "";
                }

                if (self.jsonQuestion.incorrect !== null) {
                    self.incorrectMsg = self.jsonQuestion.incorrect;
                } else {
                    self.incorrectMsg = "";
                }


            } else {
                self.question = "Nueva pregunta";
                self.correctMsg = "";
                self.incorrectMsg = "";
            }

        }; chargeQuestion();


        // CREATE ELEMENT QUESTION
        function createQuestionElement() {

            var questionWrapper  = '';
                questionWrapper += '<div id="' + self.selfId + '-question" class="quiz-question" data-toggle="collapse" data-target="#' + self.selfId + '-options">';
                questionWrapper +=      '<div class="question-main-content pull-left">';
                questionWrapper +=          '<i class="fa icon-question"></i> ';
                questionWrapper +=          '<span class="name-question">' + self.question + '</span>';
                questionWrapper +=      '</div>';
                questionWrapper +=      '<i onclick="onDelQuestion($(this).data().question);" data-question="' + self.selfId + '" class="fa fa-trash-o del-question"></i>';
                questionWrapper += '</div>';

            var optionsWrapper  = '';
                optionsWrapper += '<div id="' + self.selfId + '-options" class="quiz-options collapse">';
                optionsWrapper +=       '<div class="cabecera-question-container">';
                optionsWrapper +=           '<label for="input-question-' + self.selfId + '"><h4 class="text-main"><strong>Nombre:</strong></h4></label>';
                optionsWrapper +=           '<input data-id="' + self.selfId + '" type="text" class="my-input2 form-control" id="input-question-' + self.selfId + '" placeholder="Pregunta...">';

                optionsWrapper +=           '<label for="input-correct-' + self.selfId + '"><h4 style="color:#5CB85C;"><strong><i class="fa fa-check"></i> Mensaje correcto:</strong></h4></label>';
                optionsWrapper +=           '<input type="text" class="my-input2 form-control" id="input-correct-' + self.selfId + '" placeholder="Mensaje correcto..." style="color:#5CB85C;">';

                optionsWrapper +=           '<label for="input-incorrec-' + self.selfId + '"><h4 style="color:#D9534F;"><strong><i class="fa fa-times"></i> Mensaje error:</strong></h4></label>';
                optionsWrapper +=           '<input type="text" class="my-input2 form-control" id="input-incorrec-' + self.selfId + '" placeholder="Mensaje error..." style="color:#D9534F;">';
                optionsWrapper +=       '</div>';

                optionsWrapper +=       '<ul id="options-container-' + self.selfId + '" class="quiz-options-wrapper">';
                optionsWrapper +=       '</ul>';

                optionsWrapper +=       '<button id="' + self.selfId + '-btn-add-option" style="margin: 10px 0px 10px 20px;" class="btn btn-primary"><i class="fa fa-plus"></i> Opción</button>';

                optionsWrapper += '</div>';

            self.container.append(questionWrapper).append(optionsWrapper);


            self.element = $('#' + self.selfId + '-question');
            self.element.on('click', onCollapseQuestion);

            self.subElement = $('#' + self.selfId + '-options');

            // input question
            self.inputQuestion = $('#input-question-' + self.selfId);
            if (self.jsonQuestion == null || self.jsonQuestion == undefined) {
                self.inputQuestion.val("");
            } else {
                self.inputQuestion.val(self.question);
            }
            self.inputQuestion.on('keyup', onQuestionInputKeyup);
            self.inputQuestion.on('blur', function() {
                self.question = $(this).val();
            });

            // input correct
            self.inputCorrect = $('#input-correct-' + self.selfId);
            self.inputCorrect.val(self.correctMsg);
            self.inputCorrect.on('blur', function() {
                self.correctMsg = $(this).val();
            });

            // input incorrect
            self.inputIncorrect = $('#input-incorrec-' + self.selfId);
            self.inputIncorrect.val(self.incorrectMsg);
            self.inputIncorrect.on('blur', function() {
                self.incorrectMsg = $(this).val();
            });

            // options container selector
            self._optionsContainer = '#options-container-' + self.selfId;

            // add btn
            self.btnAddOption = $('#' + self.selfId + '-btn-add-option');
            self.btnAddOption.on('click', function() { self.addOptionToQuestion(); });


        }; createQuestionElement();

        // CHARGE OptionsQuestion
        function chargeOptionsQuestion() {
            if (self.jsonQuestion !== null) {
                for (var i = 0; i < self.jsonQuestion.a.length; i++) {
                    var opt = self.jsonQuestion.a[i];
                    self.questionOptions.push(new QuizOption(self, opt));
                }
            }

        }; chargeOptionsQuestion();

    }


    onCollapseQuestion = function() {
        me = $(this);
        target = $(me.data().target);
        if (target.hasClass('in')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
    }

    onQuestionInputKeyup = function() {
        me = $(this);
        $('#' + self.selfId + '-question span.name-question').html(me.val());
    }

    onDelQuestion = function(question) {
        event.stopPropagation()

        var auxQuestions = quizAdmin.quizQuestions;
        var auxQ = null, pos = null;
        for (var i = 0; i < auxQuestions.length; i++) {
            if (auxQuestions[i].selfId === question) {
                auxQ = auxQuestions[i];
                pos = i;
            }
        }

        if (auxQ !== null && pos !== null) {
            quizAdmin.quizQuestions.splice(pos, 1);
            auxQ.element.remove();
            auxQ.subElement.remove();
        }
    }

    self.addOptionToQuestion = function() {
        var uniqueOption = false;
        if (self.questionOptions.length === 0) {
            uniqueOption = true;
        }

        var newOption = new QuizOption(self, null);
        self.questionOptions.push(newOption);

        if (uniqueOption) {
            $(newOption._container + ' input[name="options-' + newOption._container + '"]').first().iCheck('check');
            newOption.updateCorrectOption();
        }
    }

    self._init_();

}


/*================================================================================
/* QUIZ OPTION
==================================================================================*/

function QuizOption(question, jsonOption) {
    // VARIABLES
    // ===============================================
    var self = this;

    self.selfId = optionCont++;

    self.jsonOption = jsonOption;

    self.question = question;

    // WRAPPER
    self._container = question._optionsContainer;
    self.container = $(self._container);

    // MAIN VARIABLES
    self.optionLi = null;
    self.option = null;
    self.correct = false;
    self.element = null;
    self.inputOption = null;
    self.inputRadio = null;


    // INIT METHODS
    // ================================================
    self._init_ = function() {
        // CHARGE Question
        function chargeQuestion() {

            if (self.jsonOption != null && self.jsonOption != undefined) {

                if (self.jsonOption.option !== null) {
                    self.option = self.jsonOption.option;
                } else {
                    self.option = "";
                }

                if (self.jsonOption.correct !== null) {
                    self.correct = self.jsonOption.correct;
                } else {
                    self.correct = false;
                }


            } else {
                self.option = "";
                self.correctMsg = "";
                self.incorrectMsg = "";
            }

        }; chargeQuestion();


        // CREATE ELEMENT QUESTION
        function createOptionElement() {

            var optionRadio  = '<li id="option-li-' + self.selfId + '" style="list-style-type: none; margin:3px;">';
                optionRadio +=      '<input value="' + self.selfId + '" name="options-' + self._container + '" id="option-' + self.selfId + '" type="radio"/>';
                optionRadio +=      '<label style="margin-left: 5px;" for="my-option-' + self.selfId + '"> ';
                optionRadio +=          '<input type="text" class="my-input2 form-control" id="input-option-' + self.selfId + '" placeholder="Opción...">';
                optionRadio +=      '</label>';
                optionRadio +=      '<i id="del-option-' + self.selfId + '" data-option="' + self.selfId + '" class="text-main fa fa-trash-o del-option"></i>';
                optionRadio += '</li>';

            self.container.append(optionRadio);
            self.element = $('#option-' + self.selfId);

            self.inputOption = $('#input-option-' + self.selfId);
            self.inputOption.val(self.option);
            self.inputOption.on('blur', function() {
                self.option = $(this).val();
            });

            self.optionLi = $('#option-li-' + self.selfId);

            if (self.correct) {
                self.element.prop('checked', true);
            }

            self.element.iCheck({
                checkboxClass: 'icheckbox_flat-red',
                radioClass: 'iradio_flat-red'
            });

            self.element.on('ifChecked', function(event){ self.updateCorrectOption(); });

            $('#del-option-' + self.selfId).on('click', function() {
                self.onDelOption($(this).data().option);
            });


        }; createOptionElement();
    }

    self.onDelOption = function(idOption) {
        var auxOptions = self.question.questionOptions;

        var auxO = null, pos = null;
        for (var i = 0; i < auxOptions.length; i++) {
            if (auxOptions[i].selfId === idOption) {
                auxO = auxOptions[i];
                pos = i;
            }
        }

        if (auxO !== null && pos !== null) {
            optionChecked = $(auxO._container + ' input[name="options-' + auxO._container + '"]:checked').val();

            self.question.questionOptions.splice(pos, 1);
            auxO.optionLi.remove();

            if (optionChecked == idOption) {
                $(auxO._container + ' input[name="options-' + auxO._container + '"]').first().iCheck('check');
            }
        }
    }

    self.updateCorrectOption = function() {
        var idChecked = parseInt($(self._container + ' input[name="options-' + self._container + '"]:checked').val());

        for (var i = 0; i < self.question.questionOptions.length; i++) {
            if (self.question.questionOptions[i].selfId === idChecked) {
                self.question.questionOptions[i].correct = true;
            } else {
                self.question.questionOptions[i].correct = false;
            }
        }

    }


    self._init_();

}







/*=================================================================================*/

function goBack() {
    var r = confirm("Perderá los cambios que no haya guardado, ¿Está seguro?");

    if (r == true) {
        window.history.back()
    }

}

function scrollQuizActions() {
    quizActions = $('#quizActions');
    quizActionsNormalTop = $('#quizActionsOffset').offset().top + 20;

    if ($(this).scrollTop() > quizActionsNormalTop) {
        quizActions.css('top', ($(this).scrollTop() - quizActionsNormalTop));
        quizActions.addClass('scrolling');
    } else {
        quizActions.css('top', '0px');
        quizActions.removeClass('scrolling');
    }
}

function initEventsHandlers() {
    $(document).on("backbutton", goBack);
    $('#btn-option-salir').on('click', goBack);

    $(window).scroll(scrollQuizActions);
    $(window).resize(scrollQuizActions);
}

String.prototype.yyyymmddTOddmmyyyy = function () {
    var cad = this.split("-");
    var year = cad[0];
    var month = cad[1];
    var day = cad[2];
    return (day + "/" + month + "/" + year);
}
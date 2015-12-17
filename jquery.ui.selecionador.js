(function ($) {
    $.widget("ui.selecionador", {
        options: {
            formats: [], // [{label: "Campos", min: 1, max: -1, tipos: ['literal', 'data', 'numero']}, ...]
            cols: [], // [{id: "campo", label: "Campo", type: "date"}, ...]
            values: [] // [{posicao: 0, campo: "localEntrega"}, ...]
        },

        _init: function(){
            var self = this;
            this.element.html('');

            // Create
            this.element
                .append('<div class="ui-selecionador-unselect"></div>')
                .append('<div class="ui-selecionador-select"></div>')
                .find('.ui-selecionador-unselect')
                .append('<span>Disponíveis</span>')
                .append('<ul class="ui-selecionador-list"></ul>');

            // Colunas dos desselecionados
            $.each(this.options.cols, function(i, obj){
                switch (obj.type) {
                    case 'date': var tipo = 'data'; break;
                    case 'number': var tipo = 'numero'; break;
                    default: var tipo = 'literal'
                }
                self.element
                    .find('.ui-selecionador-unselect>.ui-selecionador-list')
                    .append('<li class="ui-selecionador-field '+tipo+'" data-nome="'+obj.id+'">'+obj.label+'</li>');
            });

            // Colunas dos selecionados
            var $selecionados = this.element.find('.ui-selecionador-select');
            $.each(this.options.formats, function(i, obj){
                $selecionados.append('<span>'+obj.label+' <span class="ui-selecionador-type">('+obj.tipos.join(', ')+')</span> <span class="ui-selecionador-limit"></span></span>');
                $('<ul></ul>')
                    .addClass('ui-selecionador-list')
                    .addClass(obj.tipos.join(' '))
                    .toggleClass('obrigatorio', obj.min > 0)
                    .appendTo($selecionados)
                    .data({min: obj.min, max: obj.max});
            });

            //Sortable
            this.element
                .find('.ui-selecionador-unselect, .ui-selecionador-select')
                .find('.ui-selecionador-list')
                .sortable({
                    connectWith: 'ul',
                    revert: 100
                });

            $listSelect = $(".ui-selecionador-select>.ui-selecionador-list");
            $listSelect.on( "sortreceive", function(ev, ui){
                var that = this;
                var validos = $.grep(["numero", "literal", "data"], function(item){
                    return $(that).hasClass(item) && ui.item.hasClass(item);
                });
                if(validos.length == 0 || !self._validaLimites($(this)))
                    ui.sender.sortable("cancel");
                self._updateValues();
            });

            $listSelect.on('sortupdate', function(ev, ui){
                self._updateValues();
            });

            this.values(this.options.values);
            this._updateValues();

            this.element.find('.ui-selecionador-list').addClass('list-group');
            this.element.find('.ui-selecionador-field').addClass('list-group-item');
        },

        _validaLimites: function($el){
            var limites = $el.data();
            var numeroItens = $el.find('li').length;
            
            var $labelLimite = $el.prev().find('.ui-selecionador-limit');

            if (numeroItens < limites.min && numeroItens > 0){
                $labelLimite.text("falta "+(limites.min - numeroItens)+" item(ns)");
            }else if (limites.max != -1 && numeroItens > limites.max){
                $labelLimite.text("limite atingido");
                return false;
            }else{
                $labelLimite.text("");
            }
            return true;
        },

        _updateValues: function(){
            var posicao = 0;
            var self = this;
            self.options.values = [];
            this.element
                .find('.ui-selecionador-select>.ui-selecionador-list')
                .each(function(){
                    jQuery(this).find('.ui-selecionador-field')
                        .each(function(){
                            self.options.values.push({
                                lista: posicao,
                                campo: jQuery(this).data('nome')
                            });
                        });
                    posicao++;
                });
        },

        values: function(values){
            if (values == undefined)
                return this.options.values;

            if(Array.isArray(values)){
                this.options.values = values;
                $listUnselect = this.element.find('.ui-selecionador-unselect>.ui-selecionador-list');
                $listSelect = this.element.find('.ui-selecionador-select>.ui-selecionador-list');

                //Reseta campos
                $listSelect.find('.ui-selecionador-field').each(function(i, item){
                    $listUnselect.append(item);
                });

                //Define campos
                $.each(this.options.values, function(i, dado){
                    $listSelect.eq(dado.lista).append($listUnselect.find('[data-nome='+dado.campo+']'));
                });
            }else{
                throw "Invalid values";
            }
        },

        getElement: function(selector){
            return this.element.find(selector);
        },

        destroy: function(){
            $.Widget.prototype.destroy.call(this, arguments);
            this.element
                .find('.ui-selecionador-unselect, .ui-selecionador-select')
                .remove();
        },

        disable: function(){
            $.Widget.prototype.disable.call(this, arguments);
            $(".ui-selecionador-select, .ui-selecionador-unselect")
                .find('.ui-selecionador-list').sortable( "disable" );
        },

        enable: function(){
            $.Widget.prototype.enable.call(this, arguments);
            $(".ui-selecionador-select, .ui-selecionador-unselect")
                .find('.ui-selecionador-list').sortable("enable");
        }
    });
})(jQ);
/*
 * The MIT License
 *
 * Copyright 2015 Eduardo Weiland.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

require(['knockout', 'jquery', 'grammar', 'file-saver-js', 'ko-tagsinput'], function(ko, $, Grammar, saveAs) {
    'use strict';

    function App() {
        this.grammar = new Grammar();
    }

    App.prototype = {
        save: function() {
            var json = ko.toJSON(this, null, 2);
            saveAs(new Blob([json], {type: 'application/json'}), 'Gramática.json');
        },

        open: function(model, event) {
            var files = event.target.files;
            if (!files) {
                alert('Navegador não suporta HTML 5');
                return;
            }

            var reader = new FileReader();
            reader.onload = function() {
                try {
                    var json = JSON.parse(reader.result);

                    // Gramática
                    model.grammar.nonTerminalSymbols(json.grammar.nonTerminalSymbols);
                    model.grammar.terminalSymbols(json.grammar.terminalSymbols);
                    model.grammar.productionSetSymbol(json.grammar.productionSetSymbol);
                    model.grammar.productionStartSymbol(json.grammar.productionStartSymbol);

                    model.grammar.productionRules([]);
                    for (var i = 0, l = json.grammar.productionRules.length; i < l; ++i) {
                        model.grammar.addProductionRule(json.grammar.productionRules[i]);
                    }
                }
                catch (e) {
                    alert('Arquivo inválido');
                    return;
                }
            };

            reader.readAsText(files[0]);
        }
    };

    $(function() {
        ko.applyBindings(new App());

        $('.overlay').removeClass('in');
        setTimeout(function() {
            $('.container').addClass('in');
            $('.overlay').remove();
        }, 150);
    });
});

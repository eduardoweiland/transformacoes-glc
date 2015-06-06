/*
 * The MIT License
 *
 * Copyright 2015 eduardo.
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

define(['knockout', 'transitiontable'], function(ko, TransitionTable) {
    'use strict';

    function FiniteAutomaton() {
        this.init.apply(this, arguments);
    }

    FiniteAutomaton.prototype = {

        /**
         * @constructs
         */
        init: function() {
            this.rules    = new TransitionTable();
            this.sentence = ko.observable('');

            this.currentState = '';
            this.recognized   = ko.observable(false);
            this.recognition  = ko.pureComputed(this.recognize, this);
        },

        /**
         * Tenta ler um símbolo da sentença, verificando se é possível ler esse símbolo no estado atual do autômato
         * e, caso seja possível ler o símbolo, definindo qual será o próximo estado do autômato.
         *
         * @param {string} symbol Símbolo que deve ser lido.
         * @param {object[]} steps Etapas executadas durante a execução. Um novo item será adicionado nesse array.
         *
         * @return {boolean} Retorna um indicador se foi possível ou não ler o símbolo a partir do estado atual.
         */
        readSymbol: function(symbol, steps) {
            var possibilities = this.rules.productions[this.currentState];

            if (possibilities && possibilities[symbol]) {
                var next = possibilities[symbol]();

                if (next) {
                    steps.push({
                        currentState: this.currentState,
                        readSymbol: symbol,
                        nextState: next
                    });

                    this.currentState = next;
                    return true;
                }
            }

            return false;
        },

        /**
         * Tenta reconhecer a sentença definida utilizando a tabela de transição montada.
         *
         * @return {object[]} Etapas que foram executadas, mesmo que a sentença não tenha sido reconhecida.
         */
        recognize: function() {
            var s = this.sentence();
            var steps = [];

            this.recognized(true);
            this.currentState = this.rules.startState();

            for (var i = 0, l = s.length; i < l; ++i) {
                if (!this.readSymbol(s[i], steps)) {
                    this.recognized(false);
                    break;
                }
            }

            // Terminou em um estado não-terminal, não valida o reconhecimento
            if (this.rules.endStates.indexOf(this.currentState) === -1) {
                this.recognized(false);
            }

            return steps;
        },

        toJSON: function() {
            return this.rules;
        }

    };

    return FiniteAutomaton;
});

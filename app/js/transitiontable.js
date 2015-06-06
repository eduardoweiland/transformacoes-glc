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

define(['knockout'], function(ko) {
    'use strict';

    /**
     * Cria um objeto que é utilizado como valor para as produções de um determinado estado.
     *
     * O objeto é formado utilizando todos os símbolos como chave e o valor é um observable do Knockout, inicialmente
     * com valor vazio. O observable é utilizado em cada célula da tabela de transição de estados.
     *
     * @param {string[]} symbols Símbolos que serão utilizados como chaves do objeto criado.
     */
    function createProductionObject(symbols) {
        var obj = {}, i, l;
        for (i = 0, l = symbols.length; i < l; ++i) {
            obj[symbols[i]] = ko.observable('');
        }
        return obj;
    }

    function TransitionTable() {
        this.init.apply(this, arguments);
    }

    TransitionTable.prototype = {

        /**
         * @constructs
         */
        init: function() {
            this.symbols = ko.observableArray([]);
            this.states  = ko.observableArray([]);

            this.startState = ko.observable();
            this.endStates  = ko.observableArray([]);

            // Objeto onde cada chave é o nome de um estado e o valor de cada chave é um
            // outro objeto onde a chave é o símbolos que pode ser lido e o valor é o próximo
            // estado do autômato.
            this.productions = {};
        },

        /**
         * Adiciona uma nova linha na tabela para representar um novo estado.
         */
        addState: function() {
            var state = 'Q' + this.states().length;

            if (!this.productions[state]) {
                this.productions[state] = createProductionObject(this.symbols());
            }

            this.states.push(state);

            if (!this.startState()) {
                this.setStartState(state);
            }

            if (this.endStates().length === 0) {
                this.toggleEndState(state);
            }
        },

        /**
         * Adiciona uma nova coluna na tabela para representar um símbolo que pode ser reconhecido.
         */
        addSymbol: function() {
            var len = this.symbols().length;
            var symbol = String.fromCharCode((len % 26) + 97);

            for (var i in this.productions) {
                this.productions[i][symbol] = ko.observable('');
            }

            this.symbols.push(symbol + String(Math.floor(len / 26) || ''));
        },

        /**
         * Remove uma linha (estado) da tabela de transição.
         *
         * @param {string} state Nome do estado que deve ser removido da tabela.
         */
        removeState: function(state) {
            this.states.splice(this.states.indexOf(state), 1);
            delete this.productions[state];

            if (this.startState() === state) {
                this.startState(this.states()[0] || false);
            }

            if (this.endStates.indexOf(state) !== -1) {
                this.toggleEndState(state);
            }
        },

        /**
         * Remove uma coluna (símbolo) da tabela de transição.
         *
         * @param {string} symbol Símbolo para ser removido.
         */
        removeSymbol: function(symbol) {
            this.symbols.splice(this.symbols.indexOf(symbol), 1);

            for (var i in this.productions) {
                delete this.productions[i][symbol];
            }
        },

        /**
         * Define um estado como sendo o início da produção.
         *
         * Pode existir apenas um estado inicial na tabela de transição, então este método sobrescreve o valor
         * anterior e mantém apenas o estado informado como sendo o inicial.
         *
         * @param {string} state Nome do estado inicial.
         */
        setStartState: function(state) {
            this.startState(state);
        },

        /**
         * Troca a indicação de um estado se ele é ou não um estado final da tabela.
         *
         * Podem existir vários estados finais na tabela, então esse método controla apenas o estado informado,
         * definindo como final se ainda não for e definindo como não final se já foi definido assim.
         */
        toggleEndState: function(state) {
            var pos = this.endStates.indexOf(state);
            if (pos !== -1) {
                this.endStates.splice(pos, 1);
            }
            else {
                this.endStates.push(state);
            }
        }

    };

    return TransitionTable;
});

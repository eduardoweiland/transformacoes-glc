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

define(['knockout'], function(ko) {
    'use strict';

    /**
     * Representação de uma única regra de produção dentro de uma gramática.
     *
     * @class
     */
    function ProductionRule() {
        this.init.apply(this, arguments);
    }

    /**
     * Símbolo utilizado para representar a sentença vazia.
     * @const
     * @static
     */
    ProductionRule.EPSILON = String.fromCharCode(0x3B5);

    /**
     * Símbolo para separar o lado esquerdo do lado direito no formalismo.
     * @const
     * @static
     */
    ProductionRule.ARROW = String.fromCharCode(0x279C);

    ProductionRule.prototype = {

        /**
         * @constructs
         *
         * @param {Grammar} grammar Gramática à qual a regra de produção pertence.
         */
        init: function(grammar, data) {
            data = data || {};
            this.grammar = grammar;

            this.leftSide  = ko.observable(data.leftSide || '');
            this.rightSide = ko.observableArray(data.rightSide || []);
        },

        /**
         * Adiciona a sentenca vazia na lista de possíveis produções da regra.
         */
        addEmptySentence: function() {
            this.rightSide.push(ProductionRule.EPSILON);
        },

        /**
         * Gera a representação do formalismo desta regra.
         */
        toFormalismString: function() {
            var l = this.leftSide(),
                r = this.rightSide().join(' | ');

            if (l && r) {
                return l + ' ' + ProductionRule.ARROW + ' ' + r;
            }

            return '';
        },

        /**
         * Verifica se a definição da regra de produção está completa (todas as informações inseridas).
         *
         * @return boolean Se a regra de produção está completamente definida.
         */
        isCompleted: function() {
            return ((this.leftSide().length > 0) && (this.rightSide().length > 0));
        },

        /**
         * Verifica se a regra de produção obedece todas as restrições necessárias para pertencer a uma gramática do
         * tipo sensível ao contexto. Para isso, a regra deve obedecer a duas restrições:
         *
         *     * O lado esquerdo deve conter pelo menos um símbolo não terminal.
         *     * O lado direito não aceita a sentença vazia e seu comprimento deve ser maior ou igual ao lado esquerdo.
         *
         * @returns {Boolean} Se a regra obedece a todas as restrições do tipo sensível ao contexto.
         */
        isContextSensitive: function() {
            var left  = this.leftSide();
            var right = this.rightSide();
            var nt    = this.grammar.nonTerminalSymbols();

            // Lado esquerdo deve conter pelo menos um não terminal
            var found = false;
            for (var i = 0, l = nt.length; i < l; ++i) {
                if (left.indexOf(nt[i]) !== -1) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                return false;
            }

            // Lado direito não pode conter a sentença vazia e o comprimento deve ser maior ou igual ao lado esquerdo
            for (var i = 0, l = right.length; i < l; ++i) {
                if (right[i] === ProductionRule.EPSILON || right[i].length < left.length) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifica se a regra de produção obedece todas as restrições necessárias para pertencer a uma gramática do
         * tipo livre de contexto. Para isso, a regra deve obedecer a duas restrições:
         *
         *     * O lado esquerdo deve ser um e apenas um símbolo não terminal.
         *     * O lado direito não aceita a sentença vazia, mas aceita qualquer outro símbolo.
         *
         * @returns {Boolean} Se a regra obedece a todas as restrições do tipo livre de contexto.
         */
        isContextFree: function() {
            // Lado esquerdo deve ser um e apenas um não terminal
            if (this.grammar.nonTerminalSymbols().indexOf(this.leftSide()) === -1) {
                return false;
            }

            // Lado direito não pode conter a sentença vazia
            var right = this.rightSide();
            for (var i = 0, l = right.length; i < l; ++i) {
                if (right[i] === ProductionRule.EPSILON) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifica se a regra de produção obedece todas as restrições necessárias para pertencer a uma gramática do
         * tipo regular. Para isso, a regra deve obedecer a duas restrições:
         *
         *     * O lado esquerdo deve ser um e apenas um símbolo não terminal.
         *     * O lado direito pode ser apenas:
         *         * Um símbolo terminal
         *         * Um símbolo terminal seguido de um símbolo não terminal
         *         * Sentença vazia
         *
         * @returns {Boolean} Se a regra obedece a todas as restrições do tipo regular.
         */
        isRegular: function() {
            var right = this.rightSide();
            var nt    = this.grammar.nonTerminalSymbols();
            var t     = this.grammar.terminalSymbols();

            // Conjunto de todas as combinações de terminal + não terminal
            var tnt = [];
            for (var i = 0, lt = t.length; i < lt; ++i) {
                for (var j = 0, lnt = nt.length; j < lnt; ++j) {
                    tnt.push(t[i] + nt[j]);
                }
            }

            // Lado esquerdo deve ser um e apenas um não terminal
            if (nt.indexOf(this.leftSide()) === -1) {
                return false;
            }

            // Lado direito pode ser um terminal ou um terminal seguido de um não terminal
            for (var i = 0, l = right.length; i < l; ++i) {
                if (t.indexOf(right[i]) === -1 && tnt.indexOf(right[i]) === -1 && right[i] !== ProductionRule.EPSILON) {
                    return false;
                }
            }

            return true;
        },

        toJSON: function() {
            return {
                leftSide : this.leftSide,
                rightSide: this.rightSide
            };
        }

    };

    return ProductionRule;
});

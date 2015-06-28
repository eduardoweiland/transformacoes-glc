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

define(['grammar', 'utils'], function(Grammar, utils) {
    'use strict';

    /**
     * Encontra todos os símbolos não-terminais inalcançáveis dentro de uma gramática.
     *
     * @param {Grammar} grammar Gramática para ser verificada.
     * @return {string[]} Lista de símbolos inalcançáveis.
     */
    function findUnreachableSymbols(grammar) {
        var unreachable = [],
            nt = grammar.nonTerminalSymbols(),
            s  = grammar.productionStartSymbol();

        for (var i = 0, l = nt.length; i < l; ++i) {
            // Ignora símbolo de início de produção
            if (nt[i] === s) {
                continue;
            }

            var found = false;

            for (var j = 0, k = nt.length; j < k && !found; ++j) {
                if (i === j) {
                    // Ignora produções do próprio símbolo
                    continue;
                }

                var prods = grammar.getProductions(nt[j]);
                for (var x = 0, y = prods.length; x < y; ++x) {
                    if (prods[x].indexOf(nt[i]) !== -1) {
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                unreachable.push(nt[i]);
            }
        }

        return unreachable;
    }

    return {

        /**
         * Remove símbolos inúteis de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem os simbolos inúteis.
         */
        removeUselessSymbols: function(grammar) {
            var newGrammar = new Grammar();

            var sterile = [],
                unreachable = findUnreachableSymbols(grammar),
                nt = grammar.nonTerminalSymbols();

            // Remove os símbolos inalcançáveis e suas produções
            newGrammar.nonTerminalSymbols(utils.arrayRemove(nt, utils.arrayUnion(sterile, unreachable)));
            newGrammar.terminalSymbols(grammar.terminalSymbols());
            newGrammar.productionSetSymbol(grammar.productionSetSymbol());
            newGrammar.productionStartSymbol(grammar.productionStartSymbol());
            newGrammar.productionRules(grammar.productionRules());

            return newGrammar;
        },

        /**
         * Remove produções vazias de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem as produções vazias.
         */
        removeEmptyProductions: function(grammar) {
        },

        /**
         * Fatora uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática fatorada.
         */
        factor: function(grammar) {
        },

        /**
         * Remove produções vazias de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem as produções vazias.
         */
        removeLeftRecursion: function(grammar) {
        }

    };

});

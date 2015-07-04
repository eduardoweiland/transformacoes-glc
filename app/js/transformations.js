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

define(['knockout', 'grammar', 'productionrule', 'utils'], function(ko, Grammar, ProductionRule, utils) {
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

    function findSterileSymbols(grammar) {
        var steriles = [],
            rules = grammar.productionRules();

        for (var i = 0, l = rules.length; i < l; ++i) {
            var found = false,
                left  = rules[i].leftSide(),
                right = rules[i].rightSide();

            for (var j = 0, k = right.length; j < k && !found; ++j) {
                if (right[j].indexOf(left) === -1) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                steriles.push(left);
            }
        }

        return steriles;
    }

    function replaceStartingSymbols(grammar) {
        var rules = grammar.productionRules();
        var nt = grammar.nonTerminalSymbols();

        for (var i = 0, l = rules.length; i < l; ++i) {
            var prods = rules[i].rightSide();
            // Não usa cache do length porque o array é modificado internamente
            for (var j = 0; j < prods.length; ++j) {
                if (nt.indexOf(prods[j][0]) === -1) {
                    // Produção não começa com símbolo não-terminal, ignora
                    continue;
                }

                var otherProds = grammar.getProductions(prods[j][0]);
                var rest = prods[j].substr(1);

                for (var k = 0, m = otherProds.length; k < m; ++k) {
                    otherProds[k] = otherProds[k] + rest;
                }

                // Remove a produção que começa com não-terminal e adiciona as novas produções no lugar
                prods.splice.apply(prods, [j--, 1].concat(otherProds));
            }
        }

        return rules;
    }

    return {

        /**
         * Remove símbolos inúteis de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem os simbolos inúteis.
         */
        removeUselessSymbols: function(grammar) {
            var newGrammar = new Grammar(ko.toJS(grammar));

            var sterile = findSterileSymbols(newGrammar),
                unreachable = findUnreachableSymbols(newGrammar),
                nt = newGrammar.nonTerminalSymbols();

            // Remove os símbolos inalcançáveis e suas produções
            newGrammar.nonTerminalSymbols(utils.arrayRemove(nt, utils.arrayUnion(sterile, unreachable)));
            newGrammar.removeSymbolRules(utils.arrayUnion(sterile, unreachable));

            return newGrammar;
        },

        /**
         * Remove produções vazias de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem as produções vazias.
         */
        removeEmptyProductions: function(grammar) {
            var newGrammar = new Grammar(ko.toJS(grammar));

            var rules = newGrammar.productionRules();
            for (var i = 0, l = rules.length; i < l; ++i) {
                var left  = rules[i].leftSide();
                var right = rules[i].rightSide();

                var emptyIndex = right.indexOf(ProductionRule.EPSILON);
                if (emptyIndex === -1) {
                    // Essa regra não possui produção vazia, ignora e testa a próxima
                    continue;
                }

                // Encontra todas as outras regras que produzem esse símbolo e adiciona uma nova
                // produção sem esse símbolo
                for (var j = 0; j < l; ++j) {
                    var rightOther = rules[j].rightSide();
                    for (var k = 0, m = rightOther.length; k < m; ++k) {
                        if (rightOther[k].indexOf(left) !== -1) {
                            rightOther.push(rightOther[k].replace(new RegExp(left, 'g'), ''));
                        }
                    }
                    rules[j].rightSide(rightOther);
                }

                right.splice(emptyIndex, 1);
                rules[i].rightSide(right);
            }

            newGrammar.productionRules(rules);

            return newGrammar;
        },

        /**
         * Fatora uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática fatorada.
         */
        factor: function(grammar) {
            var newGrammar = new Grammar(ko.toJS(grammar));
            var rules = replaceStartingSymbols(newGrammar);

            newGrammar.productionRules(rules);
            return newGrammar;
        },

        /**
         * Remove recursão à esquerda de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem recursão à esquerda.
         */
        removeLeftRecursion: function(grammar) {
        }

    };

});

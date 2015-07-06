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

    /**
     * Substitui símbolos não terminais no começo de todas as produções pelas suas produções.
     *
     * @param {Grammar} grammar Gramática para ser modificada.
     * @return {ProductionRule[]} Regras de produção modificadas.
     */
    function replaceStartingSymbols(grammar) {
        var rules = grammar.productionRules();
        var nt = grammar.nonTerminalSymbols();
        var s = grammar.productionStartSymbol();

        for (var i = 0, l = rules.length; i < l; ++i) {
            var left = rules[i].leftSide();
            if (left === s) {
                // Ignora produção inicial
                continue;
            }

            var prods = rules[i].rightSide();
            // Não usa cache do length porque o array é modificado internamente
            for (var j = 0; j < prods.length; ++j) {
                if ( (prods[j][0] === left) || (nt.indexOf(prods[j][0]) === -1) ) {
                    // Produção começa com o próprio símbolo não-terminal (recursivo) ou
                    // não começa com nenhum símbolo não-terminal, ignora as substituições
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
                useless = utils.arrayUnion(sterile, unreachable),
                nt = newGrammar.nonTerminalSymbols();

            // Remove os símbolos inalcançáveis...
            newGrammar.nonTerminalSymbols(utils.arrayRemove(nt, utils.arrayUnion(sterile, unreachable)));
            newGrammar.removeSymbolRules(useless);

            // .. e as produções em que eles aparecem
            var rules = newGrammar.productionRules();
            for (var i = 0, l = rules.length; i < l; ++i) {
                var right = rules[i].rightSide();
                for (var j = 0, m = useless.length; j < m; ++j) {
                    for (var k = 0; k < right.length; ++k) {
                        if (right[k].indexOf(useless[j]) !== -1) {
                            right.splice(k--, 1);
                        }
                    }
                }
                rules[i].rightSide(utils.arrayUnique(right));
            }
            newGrammar.productionRules(rules);

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
            var newStart;

            var rules = newGrammar.productionRules();
            for (var i = 0, l = rules.length; i < l; ++i) {
                var left  = rules[i].leftSide();
                var right = rules[i].rightSide();

                var emptyIndex = right.indexOf(ProductionRule.EPSILON);
                if (emptyIndex === -1) {
                    // Essa regra não possui produção vazia, ignora e testa a próxima
                    continue;
                }

                if (left === newGrammar.productionStartSymbol()) {
                    // Início de produção pode gerar sentença vazia, então trata o caso especial
                    newStart = new ProductionRule(newGrammar, {
                        leftSide: left + "'",
                        rightSide: [left, ProductionRule.EPSILON]
                    });
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
                    rules[j].rightSide(utils.arrayUnique(rightOther));
                }

                right.splice(emptyIndex, 1);
                rules[i].rightSide(utils.arrayUnique(right));
            }

            if (newStart) {
                rules.unshift(newStart);
                newGrammar.productionStartSymbol(newStart.leftSide());
                newGrammar.nonTerminalSymbols([newStart.leftSide()].concat(newGrammar.nonTerminalSymbols()));
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
            var newRules = [];

            for (var i = 0; i < rules.length; ++i) {
                var left  = rules[i].leftSide();
                var right = rules[i].rightSide();
                var newRight = [];
                var firstSymbolGrouped = {};

                // Percorre todos as produções verificando quais precisam ser fatoradas
                for (var j = 0, l = right.length; j < l; ++j) {
                    if (right[j].length === 1) {
                        // Produções com apenas um símbolo são deixadas como estão
                        newRight.push(right[j]);
                    }
                    else {
                        // Agrupa todas as produções que começam com o mesmo símbolo terminal
                        var firstSymbol = right[j][0];
                        if (!firstSymbolGrouped[firstSymbol]) {
                            firstSymbolGrouped[firstSymbol] = [];
                        }

                        firstSymbolGrouped[firstSymbol].push(right[j].substr(1));
                    }
                }

                // Adiciona a produção na mesma ordem que estava antes, antes das novas produções serem adicionadas
                newRules.push(rules[i]);

                for (var j in firstSymbolGrouped) {
                    if (firstSymbolGrouped[j].length > 1) {
                        // Mais de uma produção começando com o mesmo símbolo terminal
                        var newSymbol = newGrammar.createNonTerminalSymbol(left);
                        newRight.push(j + newSymbol);
                        newRules.push(new ProductionRule(newGrammar, {
                            leftSide: newSymbol,
                            rightSide: firstSymbolGrouped[j]
                        }));
                    }
                    else {
                        // Senão, é apenas uma produção (índice 0), mantém ela no mesmo lugar
                        newRight.push(j + firstSymbolGrouped[j][0]);
                    }
                }

                // Atualiza as produções para o símbolo existente
                rules[i].rightSide(utils.arrayUnique(newRight));
            }

            newGrammar.productionRules(newRules);
            return newGrammar;
        },

        /**
         * Remove recursão à esquerda de uma gramática.
         *
         * @param {Grammar} grammar Gramática de entrada.
         * @return {Grammar} Uma nova gramática sem recursão à esquerda.
         */
        removeLeftRecursion: function(grammar) {
            var newGrammar = new Grammar(ko.toJS(grammar));
            var rules = newGrammar.productionRules();
            var newRules = [];

            for (var i = 0, l = rules.length; i < l; ++i) {
                var left = rules[i].leftSide();
                var prods = rules[i].rightSide();
                var recursives = [];

                // Adiciona a produção na mesma ordem que estava antes, antes das nova produção ser adicionada
                newRules.push(rules[i]);

                // Não usa cache do length porque o array é modificado internamente
                for (var j = 0; j < prods.length; ++j) {
                    if (prods[j][0] === left && prods[j].length > 1) {
                        // Encontrou produção recursiva, cria uma nova regra
                        var newSymbol = newGrammar.createNonTerminalSymbol(left);
                        recursives.push(newSymbol);
                        newRules.push(new ProductionRule(newGrammar, {
                            leftSide: newSymbol,
                            rightSide: [prods[j].substr(1) + newSymbol, ProductionRule.EPSILON]
                        }));

                        // Remove essa produção
                        prods.splice(j--, 1);
                    }
                }

                var newProds = [];
                if (recursives.length === 0) {
                    newProds = prods.slice();
                }
                else {
                    for (var j = 0; j < prods.length; ++j) {
                        for (var k = 0; k < recursives.length; ++k) {
                            newProds.push(prods[j] + recursives[k]);
                        }
                    }
                }

                rules[i].rightSide(newProds);
            }

            newGrammar.productionRules(newRules);
            return newGrammar;
        }

    };

});

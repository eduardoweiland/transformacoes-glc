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

define(['knockout', 'productionrule', 'utils'], function(ko, ProductionRule, utils) {
    'use strict';

    /**
     * Símbolo utilizado para representar a gramática no formalismo.
     *
     * @const
     */
    var GRAMMAR_SYMBOL = 'G';

    /**
     * Indentação utilizada para as regras de produção dentro do conjunto, na
     * representação do formalismo da gramática.
     *
     * @const
     */
    var INDENT = '    ';

    /**
     * Classes de gramáticas existentes e seus respectivos tipos na hierarquia
     * de Chomsky.
     *
     * @readonly
     * @enum {number}
     */
    var CLASSES = {
        UNRESTRICTED:      0,
        CONTEXT_SENSITIVE: 1,
        CONTEXT_FREE:      2,
        REGULAR:           3
    };

    /**
     * Classes de gramáticas existentes e seus respectivos tipos na hierarquia
     * de Chomsky.
     *
     * @readonly
     * @enum {number}
     */
    var CLASS_NAMES = [
        'Irrestrita',
        'Sensível ao Contexto',
        'Livre de Contexto',
        'Regular'
    ];

    /**
     * Representação de uma gramática regular ou livre de contexto.
     *
     * @class
     */
    function Grammar() {
        this.init.apply(this, arguments);
    }

    Grammar.prototype = {

        /**
         * @constructs
         */
        init: function() {
            this.nonTerminalSymbols    = ko.observableArray([]);
            this.terminalSymbols       = ko.observableArray([]);
            this.productionSetSymbol   = ko.observable('');
            this.productionStartSymbol = ko.observable('');
            this.productionRules       = ko.observableArray([new ProductionRule(this)]);

            this.completed        = ko.pureComputed(this.isCompleted,       this);
            this.validationErrors = ko.pureComputed(this.validate,          this);
            this.formalism        = ko.pureComputed(this.toFormalismString, this);
            this.classification   = ko.pureComputed(this.getGrammarClass,   this);

            this.generatedSentences = ko.pureComputed(function() {
                var a = this.generateSentence(), b, maxIter = 5;

                // Ainda não é possível gerar sentenças (gramática incompleta)
                if (!a) {
                    return[];
                }

                // Loop para gerar uma sentença diferente para b
                do {
                    b = this.generateSentence();
                } while (b === a && --maxIter);

                return [a, b];
            }, this);
        },

        /**
         * Verifica se a gramática é válida.
         *
         * @return {boolean} Se a gramática é válida ou não.
         */
        validate: function() {
            var err = [],
                nt  = this.nonTerminalSymbols(),
                t   = this.terminalSymbols(),
                p   = this.productionSetSymbol(),
                s   = this.productionStartSymbol(),
                r   = this.productionRules();

            // 1. Símbolos terminais e não terminais precisam ser diferentes
            var intersect = utils.arrayIntersection(nt, t);
            if (intersect.length > 0) {
                err.push('Existem símbolos não terminais repetidos entre os '
                        + 'símbolos terminais (' + intersect.join(', ') + ').');
            }

            // 2.1. Símbolo de início de produção deve ser não terminal
            if (s && nt.indexOf(s) === -1) {
                err.push('O símbolo de início de produção não está '
                        + 'entre os símbolos não terminais.');
            }

            // 2.2. Símbolo de início de produção NÃO deve ser terminal
            if (s && t.indexOf(s) > -1) {
                err.push('O símbolo de início de produção não pode '
                        + 'estar entre os símbolos terminais.');
            }

            // Validações das regras de produção
            var generators = [],
                duplicated = [];

            for (var i = 0, l = r.length; i < l; ++i) {
                var left = r[i].leftSide();
                if (left) {
                    if (generators.indexOf(left) !== -1 && duplicated.indexOf(left) === -1) {
                        duplicated.push(left);
                    }
                    else {
                        generators.push(left);
                    }
                }
            }

            // 3. Deve haver uma produção para o símbolo de início de produção
            if (s && generators.indexOf(s) === -1) {
                err.push('Não existe nenhuma produção para o símbolo de início de produção.');
            }

            // 4. Não deve existir mais de uma produção para o mesmo símbolo
            if (duplicated.length > 0) {
                err.push('Existem produções duplicadas (' + duplicated.join(', ') + ').');
            }

            // Retorna a lista de erros de validação.
            return err;
        },

        /**
         * Monta a string que representa o formalismo da gramática, incluindo
         * o conjunto de regras de produção.
         *
         * @return {string} A representação formal da gramática.
         */
        toFormalismString: function() {
            var nt = this.nonTerminalSymbols().join(', '),
                t  = this.terminalSymbols()   .join(', '),
                p  = this.productionSetSymbol(),
                s  = this.productionStartSymbol(),
                pr = [];

            var rules = this.productionRules(), f;
            for (var i = 0, l = rules.length; i < l; ++i) {
                f = rules[i].toFormalismString();
                if (f) {
                    pr.push(INDENT + f);
                }
            }

            if (nt && t && p && s && pr.length) {
                return GRAMMAR_SYMBOL + ' = ({' + nt + '}, {' + t + '}, ' + p + ', ' + s + ')\n'
                        + p + ' = {\n' + pr.join(',\n') + '\n}';
            }

            return '';
        },

        /**
         * Verifica a qual classe a gramática que foi definida pertence através da análise do formato das regras de
         * produção criadas.
         *
         * @return {string} O nome da classe à qual a gramática pertence.
         */
        getGrammarClass: function() {
            var clazz = CLASSES.REGULAR,
                rules = this.productionRules();

            for (var i = 0, l = rules.length; i < l; ++i) {
                if (!rules[i].isRegular()) {
                    --clazz;
                    break;
                }
            }

            // Se falhou na verificação de gramática regular, verifica se é livre de contexto
            if (clazz === CLASSES.CONTEXT_FREE) {
                for (var i = 0, l = rules.length; i < l; ++i) {
                    if (!rules[i].isContextFree()) {
                        --clazz;
                        break;
                    }
                }
            }

            // Se falhou na verificação de gramática livre de contexto, verifica se é sensível ao contexto
            if (clazz === CLASSES.CONTEXT_SENSITIVE) {
                for (var i = 0, l = rules.length; i < l; ++i) {
                    if (!rules[i].isContextSensitive()) {
                        --clazz;
                        break;
                    }
                }
            }

            return CLASS_NAMES[clazz];
        },

        /**
         * Adiciona uma nova regra de produção à gramática.
         */
        addProductionRule: function(data) {
            this.productionRules.push(new ProductionRule(this, data));
        },

        /**
         * Remove uma regra anteriormente adicionada à gramática.
         *
         * @param {ProductionRule} rule Regra de produção para ser removida.
         */
        removeRule: function(rule) {
            var rules = this.productionRules();
            for (var i = 0, l = rules.length; i < l; ++i) {
                if (rule === rules[i]) {
                    this.productionRules.splice(i, 1);
                    break;
                }
            }
        },

        /**
         * Verifica se a definição da gramática está completa (todas as informações inseridas).
         *
         * @return {boolean} Se a gramática está completamente definida.
         */
        isCompleted: function() {
            var completed = true,
                rules = this.productionRules();

            completed &= this.nonTerminalSymbols()   .length > 0;
            completed &= this.terminalSymbols()      .length > 0;
            completed &= this.productionSetSymbol()  .length > 0;
            completed &= this.productionStartSymbol().length > 0;
            completed &= this.productionRules()      .length > 0;

            for (var i = 0, l = rules.length; i < l; ++i) {
                completed &= rules[i].isCompleted();
            }

            return completed;
        },

        /**
         * Gera uma sentença a partir da gramática definida, seguindo as regras de produção de forma aleatória.
         *
         * @returns {string} A sentença gerada.
         */
        generateSentence: function() {
            if (!this.isCompleted()) {
                return;
            }

            var sentence = this.productionStartSymbol(),
                nt       = this.nonTerminalSymbols(),
                index    = utils.indexOfAny(sentence, nt),
                maxIter  = 100,
                replace;

            while (index[0] !== -1 && maxIter--) {
                replace  = utils.randomItem(this.getProductions(index[1]));
                sentence = sentence.replace(index[1], replace);
                index    = utils.indexOfAny(sentence, nt);
            }

            // Remove símbolo vazio de sentença vazia da sentença final
            sentence = sentence.replace(new RegExp(ProductionRule.EPSILON, 'g'), '');

            return sentence;
        },

        /**
         * Procura as possíveis produções para um determinado símbolo.
         *
         * @param {string} symbol Símbolo para o qual buscar as produções.
         * @returns {string[]} Conjunto das produções desse símbolo, ou null se o símbolo não possui produções.
         */
        getProductions: function(symbol) {
            var rules = this.productionRules();
            for (var i = 0, l = rules.length; i < l; ++i) {
                if (rules[i].leftSide() === symbol) {
                    return rules[i].rightSide();
                }
            }
            return [];
        },

        toJSON: function() {
            return {
                nonTerminalSymbols   : this.nonTerminalSymbols,
                terminalSymbols      : this.terminalSymbols,
                productionSetSymbol  : this.productionSetSymbol,
                productionStartSymbol: this.productionStartSymbol,
                productionRules      : this.productionRules
            };
        }

    };

    return Grammar;
});

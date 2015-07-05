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

define(function() {
    'use strict';

    var utils = {

        /**
         * Retorna a intersecção entre os arrays `a` e `b`.
         *
         * @param {array} a
         * @param {array} b
         * @returns {array} Um novo array.
         */
        arrayIntersection: function(a, b) {
            return a.filter(function(i) {
                return b.indexOf(i) > -1;
            });
        },

        /**
         * Retorna a união dos arrays `a` e `b` sem valores repetidos.
         *
         * @param {array} a
         * @param {array} b
         * @returns {array} Um novo array.
         */
        arrayUnion: function(a, b) {
            return utils.arrayUnique(a.concat(b));
        },

        /**
         * Remove valores do array `b` que estão presentes em `a`.
         *
         * @param {array} a
         * @param {array} b
         * @returns {array} Um novo array.
         */
        arrayRemove: function(a, b) {
            return a.filter(function(i) {
                return b.indexOf(i) === -1;
            });
        },

        /**
         * Cria um novo array com os valores passados, removendo as repetições.
         *
         * @param {array} array
         * @returns {array} Um novo array
         */
        arrayUnique: function(array) {
            return array.filter(function(value, index, self) {
                return self.indexOf(value) === index;
            });
        },

        /**
         * Retorna um valor aleatório de um array.
         *
         * @param {mixed[]} array Qualquer array.
         * @returns {mixed} Um dos valores do array.
         */
        randomItem: function(array) {
            return array[Math.floor(Math.random() * array.length)];
        },

        /**
         * Procura se `string` contém algum dos valores em `array` e retorna o índice do primeiro encontrado.
         *
         * @param {string} string String na qual procurar.
         * @param {string[]} array Valores que devem ser procurados.
         * @returns {[number, string]} Retorna um array onde o primeiro valor é o índice de um dos valores procurados e
         * o segundo é o valor que foi encontrado nesse índice. Se nada for encontrado, retorna um array com -1 e null.
         */
        indexOfAny: function(string, array) {
            for (var i = 0, l = array.length; i < l; ++i) {
                if (string.indexOf(array[i]) !== -1) {
                    return [string.indexOf(array[i]), array[i]];
                }
            }

            return [-1, null];
        }

    };

    return utils;

});

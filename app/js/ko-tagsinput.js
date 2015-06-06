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

define(['knockout', 'jquery', 'bootstrap-tagsinput'], function(ko, $) {
    'use strict';

    ko.bindingHandlers.tagsinput = {
        init: function(element) {
            $(element).tagsinput({
                confirmKeys: [13, 32, 44, 124]
            });
            $(element).next('.bootstrap-tagsinput').find('input')
                .focus(function() {
                    $(this).parent().addClass('focus');
                })
                .blur(function() {
                    $(this).parent().removeClass('focus');
                });
        },
        update: function(element, valueAccessor, allBindings) {
            var $el = $(element);
            if ($el.is('select')) {
                var opts = ko.unwrap(allBindings.get('selectedOptions'));
                $el.tagsinput('removeAll');

                for (var i = 0, l = opts.length; i < l; ++i) {
                    $el.tagsinput('add', opts[i]);
                }
            }
        }
    };
});

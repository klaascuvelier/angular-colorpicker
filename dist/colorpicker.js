(function (window, angular) {
    'use strict';

    angular.module('colorpicker', []);

})(window, angular);(function (window, angular) {
    'use strict';

    angular.module('colorpicker').directive('colorpicker', [
        '$timeout',
        function ($timeout) {

            /**
             * Convert HSLA value To HEX
             * @param {number} hue
             * @param {number} saturation
             * @param {number} lightness
             * @param {number} alpha
             * @returns {object}
             */
            function hslaToRgba(hue, saturation, lightness, alpha)
            {
                var R, G, B, X, C;

                hue *= 360;
                hue = (hue % 360) / 60;

                C = lightness * saturation;
                X = C * (1 - Math.abs(hue % 2 - 1));
                R = G = B = lightness - C;

                hue = ~~hue;
                R += [C, X, 0, 0, X, C][hue];
                G += [X, C, C, X, 0, 0][hue];
                B += [0, 0, X, C, C, X][hue];

                return {
                    r: Math.round(R * 255),
                    g: Math.round(G * 255),
                    b: Math.round(B * 255),
                    a: alpha
                };
            }

            /**
             * Convert HSLA value To HEX
             * @param {number} hue
             * @param {number} saturation
             * @param {number} lightness
             * @param {number} alpha
             * @returns {string}
             */
            function hslaToHex(hue, saturation, lightness, alpha)
            {
                var rgb = hslaToRgba(hue, saturation, lightness, alpha);
                return ((1 << 24) | (parseInt(rgb.r, 10) << 16) | (parseInt(rgb.g, 10) << 8) | parseInt(rgb.b, 10)).toString(16).substr(1);
            }

            /**
             * Convert HEX value to RGBA value
             * @param {string} value
             * @returns {object}
             */
            function hexToRgba(value)
            {
                var matches = value.match(/^([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])$/i);

                return {
                    r: parseInt(matches[1], 16),
                    g: parseInt(matches[2], 16),
                    b: parseInt(matches[3], 16),
                    a: 1
                };
            }

            /**
             * Convert RGBA to HSLA
             * @param red
             * @param green
             * @param blue
             * @returns {object}
             */
            function rgbaToHsla(red, green, blue, alpha){

                red /= 255;
                green /= 255;
                blue /= 255;

                var max = Math.max(red, green, blue),
                    min = Math.min(red, green, blue),
                    lightness = (max + min) / 2,
                    hue, saturation, d;

                if (max == min) {
                    hue = saturation = 0; // achromatic
                } else {
                    d = max - min;
                    saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);

                    switch (max) {
                        case red:
                            hue = (green - blue) / d + (green < blue ? 6 : 0);
                            break;

                        case green:
                            hue = (blue - red) / d + 2;
                            break;

                        case blue:
                            hue = (red - green) / d + 4;
                            break;
                    }
                    hue /= 6;
                }

                return {
                    h: hue,
                    s: saturation,
                    l: lightness,
                    a: alpha
                };
            }


            return {
                restrict: 'EA',
                require: ['^ngModel'],
                template: '<div class="colorpicker">' +
                        '<div class="colorpicker-saturation" ng-style="saturationStyle">' +
                            '<div class="colorpicker-saturation indicator" ng-style="saturationIndicatorStyle"></div>' +
                        '</div>' +
                        '<div class="colorpicker-hue">' +
                            '<div class="colorpicker-hue indicator" ng-style="hueIndicatorStyle"></div>' +
                        '</div>' +
                    '</div>' ,
                link: function ($scope, iElement, iAttrs, controllers) {

                    var offsetTop           = iElement[0].offsetTop,
                        offsetLeft          = iElement[0].offsetLeft,
                        $saturation         = angular.element(iElement[0].querySelectorAll('.colorpicker-saturation')),
                        saturationWidth     = $saturation[0].clientWidth,
                        saturationHeight    = $saturation[0].clientHeight,
                        $hue                = angular.element(iElement[0].querySelectorAll('.colorpicker-hue')),
                        hueHeight           = $hue[0].clientHeight,
                        saturationMouseDown = false,
                        hueMouseDown        = false,
                        modelController     = controllers[0],
                        initial             = true,
                        rgba                = {},
                        hueTimeout, saturationTimeout, modelTimeout;


                    $scope.saturationIndicatorStyle = {};
                    $scope.satuarationStyle = {};
                    $scope.hueIndicatorStyle = {};

                    $scope.value = {};


                    $scope.setHue =  function(h) {
                        this.value.h = h;
                    };

                    $scope.setSaturation = function(s) {
                        this.value.s = s;
                    };

                    $scope.setLightness = function(b) {
                        this.value.b = 1 - b;
                    };

                    $scope.setAlpha = function(a) {
                        this.value.a = parseInt((1 - a) * 100, 10) / 100;
                    };


                    // Move hue indicator on click
                    $hue.bind('click mousemove', function (event) {
                        if (event.type === 'click' || hueMouseDown) {
                            $timeout.cancel(hueTimeout);
                            hueTimeout = $timeout((function (event) {
                                return function () {
                                    $scope.setHue(1 - ((event.y - offsetTop) / hueHeight));
                                    $scope.updateView();
                                };
                            })(event), 10);
                        }
                    });

                    // Enable mousemove for indicator
                    $hue.bind('mouseup mousedown', function (event) {
                        hueMouseDown = event.type === 'mousedown';
                    });

                    // Move saturation indicator top position after click
                    $saturation.bind('click mousemove', function (event) {
                        if (event.type === 'click' || saturationMouseDown) {
                            $timeout.cancel(saturationTimeout);
                            saturationTimeout = $timeout((function (event) {
                                return function () {
                                    $scope.setSaturation((event.x - offsetLeft) / saturationWidth);
                                    $scope.setLightness(((event.y - offsetTop) / saturationHeight));
                                    $scope.updateView();
                                };
                            })(event), 10);
                        }
                    });

                    // Enable mousemove for indicator
                    $saturation.bind('mouseup mousedown', function (event) {
                        saturationMouseDown = event.type === 'mousedown';
                    });


                    $scope.parseModel = function (value) {

                        // Don't do anything if the value is invalid
                        if (!(/^([a-f0-9]{6})$/i.test(value))) {
                            return;
                        }

                        rgba = hexToRgba(value);
                        $scope.value = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a);


                        $scope.updateView(false);




                        return;
/*
k
                        // Strip # at start
                        if (value.substr(0, 1) === '#') {
                            value = value.substr(1);
                        }

                        // If hex value matches 3 char value -> wait 500ms and then update to 6 char
                        if (/^([a-f0-9]{3})$/i.test(value)) {
                            value = value.split('');

                            modelTimeout = $timeout(function () {
                                modelController.$setViewValue(parts[0] + parts[0] + parts[1] + parts[1] + parts[2] + parts[2]);
                            }, 500);

                            return;
                        }
                        */
                    };

                    $scope.updateView = function (updateViewValue)
                    {
                        $scope.hueIndicatorStyle = { top: (1 - $scope.value.h) * hueHeight + 1 + 'px' };
                        $scope.saturationIndicatorStyle = {
                            top: (1 - $scope.value.l) * saturationHeight - 3 + 'px',
                            left: ( $scope.value.s) * saturationWidth - 3 + 'px'
                        };

                        $scope.saturationStyle = {
                            'background-color': hslaToHex($scope.value.h, 1, 1, 1)
                        };

/*
                        if (updateViewValue !== false) {
                            modelController.$setViewValue(hslaToHex($scope.value.h, $scope.value.s, $scope.value.b, $scope.value.a));
                        }*/
                    };


                    $scope.$watch(iAttrs.ngModel, function (value) {

                        $timeout.cancel(modelTimeout);

                        if (!initial) {
                            modelTimeout = $timeout(function () {
                                $scope.parseModel(value);
                            }, 250);
                        } else {
                            $scope.parseModel(value);
                            initial = false;
                        }

                    });


                }
            };
        }
    ]);

})(window, angular);
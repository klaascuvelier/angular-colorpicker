(function (window, angular) {
    'use strict';

    angular.module('colorpicker').directive('colorpicker', [
        '$timeout',
        function ($timeout) {

            function toRGBA(h, s, b, a)
            {
                var R, G, B, X, C;

                h *= 360;
                h = (h % 360) / 60;

                C = b * s;
                X = C * (1 - Math.abs(h % 2 - 1));
                R = G = B = b - C;

                h = ~~h;
                R += [C, X, 0, 0, X, C][h];
                G += [X, C, C, X, 0, 0][h];
                B += [0, 0, X, C, C, X][h];

                return {
                    r: Math.round(R*255),
                    g: Math.round(G*255),
                    b: Math.round(B*255),
                    a: a
                };
            }

            function toHex(h, s, b, a)
            {
                var rgb = toRGBA(h, s, b, a);
                return '#'+((1 << 24) | (parseInt(rgb.r, 10) << 16) | (parseInt(rgb.g, 10) << 8) | parseInt(rgb.b, 10)).toString(16).substr(1);
            }

            function toHSL(h, s, b, a)
            {
                var H = h,
                    L = (2 - s) * b,
                    S = s * b;

                if (L > 0 && L <= 1) {
                    S /= L;
                } else {
                    S /= 2 - L;
                }

                L /= 2;

                if (S > 1) {
                    S = 1;
                }

                return {
                    h: H,
                    s: S,
                    l: L,
                    a: a
                };
            }

            function HueToRGB (p, q, h) {
                if (h < 0)
                    h += 1;
                else if (h > 1)
                    h -= 1;

                if ((h * 6) < 1)
                    return p + (q - p) * h * 6;
                else if ((h * 2) < 1)
                    return q;
                else if ((h * 3) < 2)
                    return p + (q - p) * ((2 / 3) - h) * 6;
                else
                    return p;
            }


            return {
                restrict: 'EA',
                require: ['?ngModel'],
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
                        hueTimeout, saturationTimeout;

                    $scope.$watch(iAttrs.ngModel, function (value) {
                        console.log(value);
                    });


                    $scope.saturationIndicatorStyle = {};
                    $scope.satuarationStyle = {};
                    $scope.hueIndicatorStyle = {};

                    $scope.value = {
                        h: 1,
                        s: 1,
                        b: 1,
                        a: 1
                    };

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
                                };
                            })(event), 10);
                        }
                    });

                    // Enable mousemove for indicator
                    $saturation.bind('mouseup mousedown', function (event) {
                        saturationMouseDown = event.type === 'mousedown';
                    });

                    $scope.$watch('value', function (value) {

                        $scope.hueIndicatorStyle = { top: (1 - value.h) * 100 + '%' };
                        $scope.saturationIndicatorStyle = {
                            top: (1 - value.b) * 100 + '%',
                            left: ( value.s) * 100 + '%'
                        };

                        $scope.saturationStyle = {
                            'background-color': toHex(value.h, 1, 1, 1)
                        };

                        modelController.$setViewValue(toHex(value.h, value.s, value.b, value.a).substr(1));
                    }, true);

                    $scope.$on('$destroy', function () {
                        $saturation.unbind('click mousedown mouseup mousemove');
                        $hue.unbind('click mousedown mouseup mousemove');
                    }) ;
                }
            };
        }
    ]);

})(window, angular);
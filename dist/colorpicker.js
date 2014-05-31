(function (window, angular) {
    'use strict';

    angular.module('colorpicker', []);

})(window, angular);(function (window, angular) {
    'use strict';

    angular.module('colorpicker').directive('colorpicker', [
        '$timeout',
        function ($timeout) {

            return {
                restrict: 'EA',
                template: '<div class="colorpicker">' +
                        '<div class="colorpicker-saturation">' +
                            '<div class="colorpicker-saturation indicator" ng-style="saturationIndicatorStyle"></div>' +
                        '</div>' +
                        '<div class="colorpicker-hue">' +
                            '<div class="colorpicker-hue indicator" ng-style="hueIndicatorStyle"></div>' +
                        '</div>' +
                    '</div>' ,
                link: function ($scope, iElement) {

                    var offsetTop           = iElement[0].offsetTop,
                        offsetLeft          = iElement[0].offsetLeft,
                        $saturation         = angular.element(iElement[0].querySelectorAll('.colorpicker-saturation')),
                        $hue                = angular.element(iElement[0].querySelectorAll('.colorpicker-hue')),
                        saturationMouseDown = false,
                        hueMouseDown        = false;

                    $scope.saturationIndicatorStyle = { left: 0, top: 0 };
                    $scope.hueIndicatorStyle = { top: '50%' };

                    $scope.value = {
                        h: 1,
                        s: 1,
                        b: 1,
                        a: 1
                    };

                    $scope.setHue =  function(h) {
                        this.value.h = 1 - h;
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
                    $hue.bind('click', function () {
                        $scope.$apply(function () {
                            $scope.hueIndicatorStyle = {
                                top: (event.y - offsetTop) + 'px'
                            };
                        });
                    });

                    // Enable mousemove for indicator
                    $hue.bind('mouseup mousedown', function (event) {
                        hueMouseDown = event.type === 'mousedown';
                    });

                    // Move indicator if mouse is down
                    $hue.bind('mousemove', function (event) {
                        if (hueMouseDown) {
                            $scope.$apply(function () {
                                $scope.hueIndicatorStyle = {
                                    top: (event.y - offsetTop) + 'px'
                                };
                            });
                        }
                    });

                    // Move saturation indicator top position after click
                    $saturation.bind('click', function (event) {
                        $scope.$apply(function () {
                            $scope.saturationIndicatorStyle = {
                                left: (event.x - offsetLeft) + 'px',
                                top: (event.y - offsetTop) + 'px'
                            };
                        });
                    });

                    // Enable mousemove for indicator
                    $saturation.bind('mouseup mousedown', function (event) {
                        saturationMouseDown = event.type === 'mousedown';
                    });

                    // Move indicator if mouse is down
                    $saturation.bind('mousemove', function (event) {
                        if (saturationMouseDown) {
                            $scope.$apply(function () {

                                $scope.saturationIndicatorStyle = {
                                    left: (event.x - offsetLeft) + 'px',
                                    top: (event.y - offsetTop) + 'px'
                                };
                            });
                        }
                    });

                    $scope.$on('$destroy', function () {
                        $saturation.unbind('click mousedown mouseup mousemove');
                        $hue.unbind('click mousedown mouseup mousemove');
                    }) ;
                }
            };
        }
    ]);

})(window, angular);
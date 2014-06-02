
angular.module('Example', ['colorpicker']);

angular.module('Example').controller('MainController', [
    '$scope',
    function ($scope) {
        $scope.color = '6A6A6A';
    }
]);
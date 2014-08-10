angular.module('tantra', []).controller('UVController', ['$scope', function($scope) {
    $scope.uvs = __UVS__;
    $scope.current_uv = __UVS__[21];
    $scope.choices = [
    [__UVS__[10], __UVS__[20]],
[__UVS__[5], __UVS__[100], __UVS__[30]],
[__UVS__[12], __UVS__[23]],
[__UVS__[2]], ]
    //$scope.choices = []
    $scope.categories = __CATEGORIES__
    this.set_uv = function(uv) {
        $scope.current_uv = uv;
    }
this.remove_choice = function(i, j) {
    $scope.choices[i].splice(j, 1)
    this.clean_choices();
}

this.add_choice = function(uv, i) {
    $scope.choices[i].push(uv)
}

this.add_line_and_choice = function(uv) {
    $scope.choices.push([uv]);
}

this.clean_choices = function() {
    for (var i = $scope.choices.length - 1; i >= 0; i--) {
        if ($scope.choices[i].length === 0) {
            $scope.choices.splice(i, 1);
        }
    }
}
}]).filter('times_to_table', ['$sce', function($sce) {
    return function(schedule) {
        all = schedule_to_table(schedule);
        return $sce.trustAsHtml(all);
    };
}]).filter('choices_to_timetable',['$sce', function($sce) {
    return function(choices) {
        //remove duplicates
        var uvs = [];
        choices.forEach(function(line){
            line.forEach(function(uv){
                if(uvs.indexOf(uv) === -1){
                    uvs.push(uv);
                }
            });
        })

        //addup schedules
        var schedules = [];
        uvs.forEach(function(uv){
            schedules = schedules.concat(uv.schedule);
        });

        //sort days
        schedules = schedules.sort(function(x,y){
            DAYS = ['lundi','mardi','mercredi','jeudi','vendredi','samedi']
            return DAYS.indexOf(x.day) - DAYS.indexOf(y.day)
        }) 

        all = schedule_to_table(schedules);
        return $sce.trustAsHtml(all);
    }
}]);

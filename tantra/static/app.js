angular.module('tantra', []).controller('UVController', ['$scope', function($scope) {
    $scope.uvs = __UVS__;
    $scope.current_uv = __UVS__[21];
    $scope.choices = [
    [__UVS__[10], __UVS__[20]],
[__UVS__[5], __UVS__[100], __UVS__[30]],
[__UVS__[12], __UVS__[23]],
[__UVS__[2]], ]
    $scope.choices = []
    $scope.categories = __CATEGORIES__
    this.set_uv = function(uv) {
        $scope.current_uv = uv;
    }
this.remove_choice = function(i, j) {
    $scope.choices[i].splice(j, 1)
    this.clean_choices();
}
this.update_choice = function(i, j, uv) {
    $scope.choices[i][j] = uv; 
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
}]).filter('add_spans', function() {
    return function(times) {
        times.forEach(function(time){
            var start = time.h_start*60+time.m_start;
            var end = time.h_end*60+time.m_end;
            time.spans = [
                Math.floor((start-8*60)/15),
                Math.floor((end-start)/15),
                Math.floor((20*60-end)/15),
                ]
        });
        return times;
    };
}).filter('merge_times',['$sce', function($sce) {
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
        var times = [];
        uvs.forEach(function(uv){
            uv.times.forEach(function(time){
                time.uv = uv.name;
            })
            times = times.concat(uv.times);
            
        });

        times = times.sort(function(x,y){
            return x.day_index - y.day_index;
        });

        return times;

    }
}]);

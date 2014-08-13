angular.module('tantra', []).controller('UVController', ['$scope', function($scope) {
    $scope.uvs = __UVS__;
    $scope.current_uv = __UVS__[21];
    $scope.choices = []
    $scope.show_full_calendar = false;
    $scope.categories = __CATEGORIES__
    this.set_uv = function(uv) {
        $scope.current_uv = uv;
    }
this.remove_choice = function(i, j) {
    $scope.choices[i].splice(j, 1)
    this.clean_choices();
    this.update_choices_compatibility()
}
this.update_choice = function(i, j, uv) {
    $scope.choices[i][j] = uv; 
    this.update_choices_compatibility()
}

this.add_choice = function(uv, i) {
    $scope.choices[i].push(uv)
    this.update_choices_compatibility()
}

this.add_line_and_choice = function(uv) {
    $scope.choices.push([uv]);
    this.update_choices_compatibility()
}

this.clean_choices = function() {
    for (var i = $scope.choices.length - 1; i >= 0; i--) {
        if ($scope.choices[i].length === 0) {
            $scope.choices.splice(i, 1);
        }
    }
}

this.update_choices_compatibility = function(){
    var result = agenda.bootstrap_combination_detection(merge_choices($scope.choices))
    if(result){
        $scope.choices_compatibles = true;
    }else{
        $scope.choices_compatibles = false;
    }
    $scope.uvs.forEach(function(uv){
       var result = agenda.bootstrap_combination_detection(
           merge_choices($scope.choices.concat([[uv]]))
           ) 
       uv.__compatible_with_choices = !(result === false);
    });
}

this.update_choices_compatibility();
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
        return merge_choices(choices);
    }
}]);

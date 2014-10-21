var app = angular.module('bus', []);

app.controller('MyCtrl', function($scope){
    $scope.stops = DATA.stops;
    $scope.current = {}

    $scope.compute = function(){
        var lines = [];
        DATA.lines.forEach(function(line){
            var stops = line.directions[0][0].split(',');
            if(stops.indexOf($scope.current.stop) != -1){
                lines.push(line);
            }
        })
        $scope.current.lines = lines;
        $scope.set_line(lines.length > 0 ? lines[0] : null);
    }

    $scope.set_line = function(line){
        $scope.current.line = line;
        var directions = []
        line.directions.forEach(function(direction){
            var stop_index = direction[0].split(',')
                    .indexOf($scope.current.stop);
            var times = [];
            direction.slice(1).forEach(function(timeline){ 
                times.push(timeline.split(',')[stop_index])
            })
            directions.push({
                name: direction[0].split(',').slice(-1)[0],   
                times:times
            })
        })
        $scope.current.directions = directions
    }
});

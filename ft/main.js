Papa.parse("data.csv", {
    download: true,
    header: true,
    dynamic_typing: true,
    complete: function(results) {
        var tabs = {
            'teble':{
                type:'table',
            },
            'chert':{
                type:'chart',
                x:{
                    col:'timestamp',
                },
                y:{
                    col:'price_usd',
                }
            }
        }
        React.render( <App data={results.data} tabs={tabs}/>, document.getElementById('content'))
    }
});
React.render(<strong>Loading..</strong>, document.getElementById('content'))

Pie = React.createClass({
  render: function() {
    var data = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      series: [
        [1, 2, 4, 8, 6, -2, -1, -4, -6, -2]
      ]
    };

    var options = {
      high: 10,
      low: -10,
      axisX: {
        labelInterpolationFnc: function(value, index) {
          return index % 2 === 0 ? value : null;
        }
      }
    };

    var type = 'Bar'

    return (
      <div>
        <ChartistGraph data={data} options={options} type={type} />
      </div>
    )
  }
})


var App = React.createClass({
    getInitialState:function(){
        return {
            'current_tab':'teble',
        }
    },

    changeTab: function(tab){
        this.setState({
            'current_tab':tab,
        })
    },

    render:function(){
        var curr_tab = this.props.tabs[this.state.current_tab]
        var tabs = []
        for(key in this.props.tabs){
            var className = this.state.current_tab == key ? "button-primary" : "";
            tabs.push((<span><button
                className={className}
                onClick={this.changeTab.bind(null, key)}>
                    {key}</button>&nbsp;</span>))
        }
        var content = "no tab man";
        if(curr_tab.type == 'table'){
            content = (<Griddle
                showFilter={true} 
                showSettings={true}
                results={this.props.data}
                resultsPerPage={10} />)
        }else{
            content = <Pie />;
        }
        return (<div><br/>{tabs}
                <h4>{this.state.current_tab}</h4>
                {content}
            </div>);
    }
})
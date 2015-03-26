Papa.parse("data.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
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

Chart = React.createClass({
    componentDidMount: function(){
        var data = this.props.data.map(function(x){
            return [
                x[this.props.params.x.col],
                x[this.props.params.y.col],
            ];
        }.bind(this))
        graph = new Dygraph(this.getDOMNode(), data, {
            showRoller: true,
            rollPeriod: 100,
            ylabel: 'Price (USD)',
            labels:['timestamp', 'price']
        });
    },

    render: function(){
        return <div></div>;
    },
})

ChartBuilder = React.createClass({
    render: function(){
        return (<div>
            <pre>{JSON.stringify(this.props.params)}</pre>
            <Chart data={this.props.data} params={this.props.params}/>
            </div>);
    }
})

var App = React.createClass({
    getInitialState:function(){
        return {
            'current_tab':'chert',
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
            tabs.push((<span key={key}><button
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
            content = <ChartBuilder data={this.props.data} params={curr_tab} />;
        }
        return (<div><br/>{tabs}<hr/>
                {content}
            </div>);
    }
})
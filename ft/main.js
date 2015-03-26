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
                },
                scatter: true,
            },
            'a nother chert':{
                type:'chart',
                x:{
                    col:'timestamp',
                },
                y:{
                    col:'product_rating',
                }
            }
        }
        React.render( <App data={results.data} tabs={tabs}/>, document.getElementById('content'))
    }
});
React.render(<strong>Loading..</strong>, document.getElementById('content'))

Chart = React.createClass({
    componentDidMount: function(){
        this.updateGraph();
    },
    componentDidUpdate: function(){
        this.updateGraph();
    },
    updateGraph: function(){
        var data = this.props.data.map(function(x){
            return [
                x[this.props.params.x.col],
                x[this.props.params.y.col],
            ];
        }.bind(this))
        var options = {
            showRoller: true,
            rollPeriod: 100,
            labels:[this.props.params.x.col, this.props.params.y.col]
        }
        if(this.props.params.scatter){
            options.strokeWidth = 0.0;
            options.drawPoints = true;
        }
        graph = new Dygraph(this.getDOMNode(), data, options);
    },

    render: function(){
        return <div></div>
    },
})

ChartBuilder = React.createClass({
    getInitialState: function(){
        return {
            params:this.props.params,
        }
    },

    changeAxisColumn: function(axis, col){
        var params = this.state.params;
        params[axis].col = col;
        this.setState(params);
    },

    toogleScatter: function(){
        var params = this.state.params;
        params.scatter = this.refs.scatter.getDOMNode().checked;
        this.setState(params);
    },

    render: function(){
        var options = []
        for(key in this.props.data[0]){
            options.push({value:key, label:key})
        }

        return (<div>
            <pre>{JSON.stringify(this.state.params)}</pre>
            <div className="row">
            <div className="three columns">
                <SimpleSelect
                    label={"X axis"}
                    value={this.state.params.x.col}
                    options={options}
                    onChange={this.changeAxisColumn.bind(null, 'x')} />
                <SimpleSelect
                    label={"Y axis"}
                    value={this.state.params.y.col}
                    options={options}
                    onChange={this.changeAxisColumn.bind(null, 'y')} />
                <label>
                    <input type="checkbox" ref="scatter"
                        checked={this.state.params.scatter}
                        onChange={this.toogleScatter}/>
                    <span className="label-body">Scatter plot</span>
                </label>
            </div>
            <div className="nine columns">
                <Chart data={this.props.data} params={this.state.params}/>
            </div>
        </div></div>);
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

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
        var debug = <pre>{JSON.stringify(this.state.params)}</pre>;

        return (<div>
            <div className="row">
            <div className="three columns">
                <ColumnSelect
                    label={"X axis"}
                    value={this.state.params.x.col}
                    data={this.props.data}
                    onChange={this.changeAxisColumn.bind(null, 'x')} />
                <ColumnSelect
                    label={"Y axis"}
                    value={this.state.params.y.col}
                    data={this.props.data}
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

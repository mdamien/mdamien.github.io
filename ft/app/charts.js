Chart = React.createClass({
    componentDidMount: function(){
        this.updateGraph();
    },
    componentDidUpdate: function(){
        this.updateGraph();
    },
    updateGraph: function(){
        var params = this.props.params;
        var data = this.props.data.map(function(x){
            return [
                x[params.x.col],
                x[params.y.col],
            ];
        }.bind(this))
        var options = {
            showRoller: true,
            rollPeriod: 1,
            labels:[params.x.col, params.y.col]
        }
        if(params.scatter){
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

        var chart = <div className="center">please select an X and an Y axis</div>;
        if(this.state.params.x.col && this.state.params.y.col){
            chart = <Chart data={this.props.data} params={this.state.params}/>;
        }

        return (<div>
            <div className="row">
            <div className="col-sm-2">
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
            <div className="col-sm-10">
                {chart}
            </div>
        </div></div>);
    }
})

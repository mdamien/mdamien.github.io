var Filter = React.createClass({
    getInitialState: function(){
        return {
            params:this.props.params,
        }
    },

    handleInputChange: function(){
        var params = this.props.params;
        params.value = this.refs.input.getDOMNode().value;
        this.props.onFilterChange(params)
    },

    handleColumnChange: function(col){
        var params = this.props.params;
        params.column = col;
        this.props.onFilterChange(params)
    },

    render: function(){
        return (<div className="three columns">
            <input type="text"
                ref="input"
                value={this.props.params.value}
                onChange={this.handleInputChange} />
            <ColumnSelect
                label={"Column"}
                value={this.props.params.column}
                data={this.props.data}
                onChange={this.handleColumnChange} />
            </div>);
    },
})

var Filters = React.createClass({
    getInitialState: function(){
        return {
            filters: this.props.filters ? this.props.filters : [],
        }
    },

    renderChildren: function (data) {
        return React.Children.map(this.props.children, function (child) {
            return React.addons.cloneWithProps(child, {
                data: data,
            })
        }.bind(this))
    },

    applyFilter: function(filter, line){
        if(filter.column){
            var arr = _.values(line);
            for (var i = 0; i < arr.length; i++) {
                if ((arr[i] || "").toString().toLowerCase().indexOf(filter.value.toLowerCase()) >= 0) {
                    return true;
                }
            }
        }else{
            return (line[filter.column] || "").toString().toLowerCase().indexOf(filter.value.toLowerCase()) >= 0
        }
        return false;
    },

    addFilter: function(){
        var filters = this.state.filters
        filters.push({'value':''})
        this.setState({filters:filters})
        return false;
    },

    handleFilterChange: function(i, params){
        var filters = this.state.filters;
        filters[i] = params;
        this.setState({filters:filters})
    },

    render: function(){
        var filters = []
        var filtered_data = this.props.data;
        if(this.state.filters){
            filters = this.state.filters.map(function(x, i){
                return (<Filter key={i} data={this.props.data} 
                    onFilterChange={this.handleFilterChange.bind(null, i)} params={x} />);
            }.bind(this))
            filtered_data = this.props.data.filter(function(line, i){
                for(var j=0;j < this.state.filters.length;j++){
                    if(!this.applyFilter(this.state.filters[j], line)){
                        return false;
                    }
                }
                return true;
            }.bind(this))
        }
        console.log(filtered_data)
        return (<div>
            <div className="row">
                {filters}
            </div>
            <pre>{JSON.stringify(this.state.filters)}</pre>
            <a href='' onClick={this.addFilter}>add filter</a>
            {this.renderChildren(filtered_data)}
        </div>);
    }
})

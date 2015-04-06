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

    remove: function(){
        this.props.onRemove()
    },

    render: function(){
        return (<div>
            { this.state.params.column } <a href="#" onClick={this.remove}>x</a>
            <input type="text"
                ref="input"
                value={this.props.params.value}
                onChange={this.handleInputChange} /></div>)
    },
})

var Filters = React.createClass({
    getInitialState: function(){
        var filters = this.props.filters ? this.props.filters : [];
        return {
            filters: filters,
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
        if(filter.column == undefined || !filter.column){
            var arr = _.values(line);
            for (var i = 0; i < arr.length; i++) {
                if ((arr[i] || "").toString().toLowerCase().indexOf(filter.value.toLowerCase()) >= 0) {
                    return true;
                }
            }
        }else{
            if(filter.type != undefined){
                if(filter.type == "formula"){
                    var x = line[filter.column];
                    var ret = true;
                    try{
                        var ret =  eval(filter.value);
                    }catch(e){}
                    return ret;
                }
            }
            return (line[filter.column] || "").toString().toLowerCase().indexOf(filter.value.toLowerCase()) >= 0
        }
        return false;
    },

    addFilter: function(column){
        var filters = this.state.filters
        var type = "contains";
        var value = "";
        var coltype = typeof this.props.data[1000 % this.props.data.length][column];
        if(coltype == "number"){
            type = "formula";
        }
        filters.push({value:value, column:column, type:type})
        this.setState({filters:filters})
        return false;
    },

    removeFilter: function(i){
        var filters = this.state.filters;
        var new_filters = [];
        for (var j = 0; j < filters.length; j++) {
            if(j != i){
                new_filters.push(filters[i]);
            }
        };
        this.setState({filters:new_filters})
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
                    onFilterChange={this.handleFilterChange.bind(null, i)}
                    onRemove={this.removeFilter.bind(null, i)}
                    params={x} />);
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
        var add_filters = []
        for(key in this.props.data[0]){
            add_filters.push((<li><a href='#' key={key}
                    onClick={this.addFilter.bind(null, key)} >{key}</a></li>));
        }
        var debug = <pre>{JSON.stringify(this.state.filters)}</pre>;
        return (<div className="row">
            <div className="col-sm-2">
                <div className="btn-group">
                    <button type="button" className="btn btn-default dropdown-toggle"
                        data-toggle="dropdown" aria-expanded="false">
                    Add filter <span className="caret"></span>
                </button>
                    <ul className="dropdown-menu" role="menu">
                        {add_filters}
                    </ul>
                </div>
                {filters}
            </div>
            <div className="col-sm-10">
                {this.renderChildren(filtered_data)}
            </div>
        </div>);
    }
})

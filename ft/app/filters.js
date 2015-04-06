var FILTERS_TYPE = {
    CONTAINS: "contains",
    FORMULA: "formula",
}

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
        if(filter.column == undefined || !filter.column){
            var arr = _.values(line);
            for (var i = 0; i < arr.length; i++) {
                if ((arr[i] || "").toString().toLowerCase().indexOf(filter.value.toLowerCase()) >= 0) {
                    return true;
                }
            }
        }else{
            if(filter.type != undefined){
                if(filter.type == FILTERS_TYPE.FORMULA){
                    var x = line[filter.column];
                    var ret =  eval(filter.value);
                    //console.log(x, ret, filter.value);
                    return ret;
                }
            }
            return (line[filter.column] || "").toString().toLowerCase().indexOf(filter.value.toLowerCase()) >= 0
        }
        return false;
    },

    addFilter: function(column){
        var filters = this.state.filters
        filters.push({value:'', column:column})
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
            var style={
                margin:"5px",
                display:"inline-block",
            }
            add_filters.push(<a style={style} href='' key={key} onClick={this.addFilter.bind(null, key)} >{key}</a>);
        }
        var debug = <pre>{JSON.stringify(this.state.filters)}</pre>;
        return (<div className="row">
            <div className="col-sm-2">
                Add filter: {add_filters}
                {filters}
            </div>
            <div className="col-sm-10">
                {this.renderChildren(filtered_data)}
            </div>
        </div>);
    }
})

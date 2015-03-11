DATA = []
for(var i=0;i < 100;i++){
	DATA.push({
        id:i,
		name:Math.random().toString(36).substring(7),
		color:['red','blue','green','yellow','orange','violet'][Math.floor(Math.random()*5)],
		price:Math.floor(Math.random()*100)
    })
}


Row = React.createClass({
	render: function(){
		var tds = _.values(this.props.data).map(function(key,i){
			return (<td
                onClick={this.handleClick.bind(null,key)}
                key={i}>
                {key}</td>)
		}.bind(this))
		return (<tr>{tds}
                </tr>)
	},
    handleClick: function(col){
        console.log('click',col);
        this.props.onClick(col);
    }
})

TableHead = React.createClass({
	render: function(){
		var ths = _.keys(this.props.data).map(function(value,i){
            var sort = ""
            if(this.props.sort.column == i){
                sort = this.props.sort.order == 1 ? '/\\' : '\\/'
            }
			return (<th key={i}>
                    <a onClick={this.props.onClick.bind(null, i)} >
                        {value}
                        {sort}
                    </a>
                </th>)
		}.bind(this))
		return (<thead><tr>{ths}</tr></thead>)
	}
})

Table = React.createClass({
    getInitialState: function(){
        return {
            sortBy: {
                column: 0,
                order: 1,
            },
        }
    },
    handleHeaderClick: function(col){
        sort = this.state.sortBy;
        if(sort.column == col){
            sort.order = -sort.order;
        }else{
            sort.column = col
            sort.order = 1;
        }
        this.setState({sortBy: sort});
        this.props.onHeaderClick(col);
    },
	render: function(){
        var sorted_data = _.sortBy(this.props.data, function(x){
            return this.state.sortBy.order*_.values(x)[this.state.sortBy.column]
        }.bind(this))

		var head = <TableHead
            data={sorted_data[0]}
            sort={this.state.sortBy}
            onClick={this.handleHeaderClick}/>

		var trs = sorted_data.map(function(row, i){
			return (<Row
                key={i}
                data={row}
                onClick={
                    this.handleClick.bind(null, i)
                }/>)
		}.bind(this))
		var body = <tbody>{trs}</tbody>
		return (<table className="table table-condensed table-hover table-striped">
                {head}{body}</table>)
	},
    handleClick: function(row, col){
        this.props.onClick(row, col);
    }
})

var Filter = React.createClass({
    handleChange: function() {
        var props = {value: this.refs.input.getDOMNode().value, column:this.props.column}
        this.props.onChange(props);
    },
    render: function(){
        return (<div>
            <input value={this.props.value} ref="input" onChange={this.handleChange} />
            <p>The col <strong>{this.props.column}</strong> should contain <strong>{this.props.value}</strong></p>
        </div>)

    }
})

var FilterableTable = React.createClass({
    getInitialState: function() {
        return {
            filters:[
                {
                    column: 'color',
                    value:"green",
                },
                {
                    column: 'name',
                    value:"t",
                },
            ],
        };
    },
    handleFilterChange: function(i, props){
        var filters = this.state.filters;
        filters[i] = props
        this.setState({filters:filters})
    },
    handleHeaderClick: function(col){
        var filters = this.state.filters;
        filters.push({
            column: _.keys(this.props.data[0])[col],
            value:""
        })
        this.setState({filters:filters})
    },
    render: function() {
        var filtered_data = _.filter(this.props.data, function(row){
            var ok = true;
            this.state.filters.forEach(function(f){
                if(row[f.column].indexOf(f.value) === -1){
                    ok = false;
                }
            })
            return ok;
        }.bind(this))
        var filters = this.state.filters.map(function(props,i){
            return <Filter key={i} onChange={this.handleFilterChange.bind(null,i)}  {...props} />
        }.bind(this))
        return (
            <div>
                {filters}
                <Table
                    data={filtered_data}
                    onHeaderClick={this.handleHeaderClick}
                    onClick={this.props.onClick} />
            </div>
        );
    }
});

var IndexPage = React.createClass({
    getInitialState: function(){
        return {
            selected: {

            }
        }
    },
    select: function(internship){
        this.setState({selected:internship})
    },
    render: function(){
        return (
            <div>
              <div className="col-md-9" id="index-page">
                <FilterableTable data={this.props.data} onClick={this.handleClick} />
              </div>
              <div className="col-md-3 hidden-sm" id="panel-container">
                <div className="panel panel-success affix-top" data-spy="affix" data-offset-top="80" id="internship-info">
                  <div className="panel-heading">
                    <h3 className="panel-title">{_.keys(this.state.selected)}</h3>
                  </div>
                  <div className="panel-body">
                    {this.state.selected}
                  </div>
              </div>
            </div>
        </div>
            );
    },
    handleClick: function(row, col){
        this.setState({selected:this.props.data[row]})
    }
})

React.render((<IndexPage data={DATA} />),
    document.getElementById('index-page'));

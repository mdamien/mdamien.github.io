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
			return <td key={i}>{key}</td>
		})
		return (<tr onClick={INDEX.select.bind(this,this.props.data)}>{tds}</tr>)
	}
})

TableHead = React.createClass({
	render: function(){
        var _this = this;
		var ths = _.keys(this.props.data).map(function(value,i){
            var sort = ""
            if(_this.props.sort.column == i){
                sort = _this.props.sort.order == 1 ? '/\\' : '\\/'
            }
			return (<th key={i}>
                    <a onClick={_this.props.handleClick.bind(_this, i)}>
                        {value}
                        {sort}
                    </a>
                </th>)
		})
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
    sortByCol: function(col){
        sort = this.state.sortBy
        if(sort.column == col){
            sort.order = -sort.order;
        }else{
            sort.column = col
            sort.order = 1;
        }
        this.setState({sortBy: sort})
    },
	render: function(){
		_this = this;
        var sorted_data = _.sortBy(this.props.data,
                x => this.state.sortBy.order*_.values(x)[this.state.sortBy.column])
		var head = <TableHead
            data={sorted_data[0]}
            sort={this.state.sortBy}
            handleClick={this.sortByCol}/>
		var trs = sorted_data.map(function(row, i){
			if(_.values(row).join('').indexOf(_this.props.filterText) !== -1){
				return <Row key={i} data={row} />
			}
		})
		var body = <tbody>{trs}</tbody>
		return (<table className="table table-condensed table-hover table-striped">
					<caption>{this.state.sortBy}</caption>{head}{body}</table>)
	}
})

var SearchBar = React.createClass({
    handleChange: function() {
        this.props.onUserInput(
            this.refs.filterTextInput.getDOMNode().value
        );
    },
    render: function() {
        return (
            <form>
                <input
                    type="text"
                    placeholder="Search..."
                    value={this.props.filterText}
                    ref="filterTextInput"
                    onChange={this.handleChange}
                />
            </form>
        );
    }
});


var FilterableTable = React.createClass({
    getInitialState: function() {
        return {
            filterText: ''
        };
    },
    
    handleUserInput: function(filterText) {
        this.setState({
            filterText: filterText
        });
    },
    
    render: function() {
        return (
            <div>
                <SearchBar
                    filterText={this.state.filterText}
                    onUserInput={this.handleUserInput}
                />
                <Table
                    data={this.props.data}
                    filterText={this.state.filterText}
                />
            </div>
        );
    }
});

var IndexPage = React.createClass({
    getInitialState: function(){
        INDEX = this;
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
                <FilterableTable data={DATA} />
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
    }
})

React.render((<IndexPage />),
    document.getElementById('index-page'));

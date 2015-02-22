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
        var sorted_data = _.sortBy(this.props.data, function(x){
            return this.state.sortBy.order*_.values(x)[this.state.sortBy.column]
        }.bind(this))

		var head = <TableHead
            data={sorted_data[0]}
            sort={this.state.sortBy}
            onClick={this.sortByCol}/>

		var trs = sorted_data.map(function(row, i){
			if(_.values(row).join('').indexOf(this.props.filterText) !== -1){
				return (<Row
                    key={i}
                    data={row}
                    onClick={
                        this.handleClick.bind(null, i)
                        /*function(col){
                            this.handleClick.bind(null, col, i)
                        }.bind(this)*/
                    }/>)
			}
		}.bind(this))
		var body = <tbody>{trs}</tbody>
		return (<table className="table table-condensed table-hover table-striped">
                {head}{body}</table>)
	},
    handleClick: function(row, col){
        this.props.onClick(row, col);
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
                    onClick={this.props.onClick}
                />
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

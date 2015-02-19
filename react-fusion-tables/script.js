data = [['id','name','color','price'],]
for(var i=0;i < 100;i++){
	data.push([i,
		Math.random().toString(36).substring(7),
		['red','blue','green','yellow','orange','violet'][Math.floor(Math.random()*5)],
		Math.floor(Math.random()*100)])
}


Row = React.createClass({
	render: function(){
		var tds = this.props.data.map(function(value,i){
			return <td key={i}>{value}</td>
		})
		return <tr>{tds}</tr>
	}
})

TableHead = React.createClass({
	render: function(){
		var ths = this.props.data.map(function(value,i){
			return <th key={i}>{value}</th>
		})
		return <thead><tr>{ths}</tr></thead>
	}	
})

Table = React.createClass({
	render: function(){
		_this = this;
		var head = <TableHead data={this.props.data[0]} />
		var trs = this.props.data.map(function(row,i){
			if(row.join('').indexOf(_this.props.filterText) !== -1){
				return <Row key={i} data={row} />
			}
		})
		var body = <tbody>{trs}</tbody>
		return (<table className="table table-condensed table-hover table-striped">
					{head}{body}</table>)
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

React.render((<FilterableTable data={data} />),
    document.getElementById('table'));

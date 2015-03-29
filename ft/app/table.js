var Table = React.createClass({
    render: function(){
        return (<Griddle
                showFilter={true} 
                showSettings={true}
                results={this.props.data}
                resultsPerPage={10} />)
    }
})
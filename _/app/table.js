var Table = React.createClass({
    render: function(){
        return (<Griddle
                showSettings={true}
                results={this.props.data}
                resultsPerPage={10} />)
    }
})
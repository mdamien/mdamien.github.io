SimpleSelect = React.createClass({
    getInitialState: function(){
        return {
            value:this.props.value,
        }
    },

    handleChange: function(){
        var value = this.refs.select.getDOMNode().value;
        this.setState({value:value});
        this.props.onChange(value);
    },
    
    render: function(){
        var options = this.props.options.map(function(option){
            return (<option key={option.value}
                value={option.value}
                >{option.label}</option>)
        }.bind(this))
        return (<div>
            <label>{this.props.label}</label>
            <select ref="select"
                value={this.state.value}
                onChange={this.handleChange} >
                {options}
            </select>
            </div>);
    },
})

ColumnSelect = React.createClass({
    render: function(){
        var options = []
        for(key in this.props.data[0]){
            options.push({value:key, label:key})
        }
        return <SimpleSelect options={options} {...this.props} />
    }
})
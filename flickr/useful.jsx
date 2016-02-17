var format_date = date => {
  return moment(date).calendar();
};

/* small utility for a basic input */
var Input = React.createClass({
  handleChanged(evt) {
    var value = this.refs.input.value;
    this.props.onChange(value);
  },
  render() {
    return <input type="text" value={this.props.value} ref="input"
        onChange={this.handleChanged}/>
  }
});

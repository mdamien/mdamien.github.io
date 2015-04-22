var Header = React.createClass({
    render: function(){
        var choices = this.props.choices.map(function(x,i){
            var className = this.props.current == x ? 'active' : '';
            return (<li key={i}
                className={className}
                onClick={this.props.onPageChange.bind(null,x)}><a href="#">{x}</a></li>)
        }.bind(this))
        return <nav className="navbar navbar-default">
          <div className="container-fluid">
              <ul className="nav navbar-nav">
                {choices}
              </ul>
          </div>
        </nav>
    }
})

var SearchPage = React.createClass({
    getInitialState: function(){
        return {
            beganTyping:false,
            text:'',
        }
    },
    handleSearchChange: function(){
        this.setState({
            beganTyping:true,
            text:this.refs.searchinput.getDOMNode().value,
        })
    },
    render: function(){
        var page = "";
        var input = (<input type="text" ref="searchinput"
            value={this.state.text} onChange={this.handleSearchChange}/>)
        if(this.state.beganTyping){
            var results = ['dqsd','sdqsdq','sqdqsd','qsd','a','aygqdsb','qcxwn,c x,','klcvnlodsop'];
            results = results.filter(x => x.indexOf(this.state.text) != -1)
            results = results.map((x,i) => {
                return <li key={i}><strong>{x}</strong><em>Loqs sqd aze dqs qs</em></li>
            })
            page = (<div>
                {input}
                <ul>
                    {results}
                </ul>
            </div>);
        }else{
            var style = {
                textAlign:'center',
            }
            page = (<div className="form-group" style={style}>
                    <h1>_.search</h1>
                {input}
            </div>);
        }
        return (<div>
                     {page}
                </div>)
    }
})

var App = React.createClass({
    getInitialState: function(){
        return {
            page:'search',
        }
    },
    handlePageChange: function(page){
        this.setState({page:page})
    },
    render: function(){
        var header_links = ['search','images','events','videos',
            'maps','news','docs','table'];
        var header = <Header choices={header_links}
            current={this.state.page} onPageChange={this.handlePageChange}/>;

        var page = "";
        if(this.state.page == 'search'){
            page = <SearchPage />
        }
        return (<div>
                <div className="row">
                    {header}
                </div>
                <div className="row">
                    {page}
                </div>
            </div>);
    },
})
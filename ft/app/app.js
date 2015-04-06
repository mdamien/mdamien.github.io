var App = React.createClass({
    getInitialState:function(){
        return {
            'current_tab':1,
            'tabs':this.props.tabs, 
        }
    },

    changeTab: function(tab){
        this.setState({
            'current_tab':tab,
        })
    },
    addNewTab: function(tab){
        var tabs = this.state.tabs;
        tabs.push(tab);
        this.setState({'tabs':tabs})
    },

    render:function(){
        var curr_tab = this.state.tabs[this.state.current_tab]
        var tabs = this.state.tabs.map(function(tab, i){
            var className = this.state.current_tab == i ? "active" : "";
            return (<li key={i} className={className}><a
                href="#"
                onClick={this.changeTab.bind(null, i)}>
                    {tab.name}</a></li>)
        }.bind(this))
        tabs.push((<li><a onClick={this.addNewTab.bind(null, {'type':'table', 'name':'lol'})}
            href='#'>Add tab</a></li>
        ))


        var content = "";
        if(curr_tab.type == 'table'){
            content = (<Table params={curr_tab} />)
        }else{
            content = <ChartBuilder params={curr_tab} />;
        }
        return (<div><br/>
                <ul className="nav nav-tabs">{tabs}</ul>
                <br/>
            <Filters key={this.state.current_tab} data={this.props.data} filters={curr_tab.filters}>
                {content}
            </Filters>
            </div>);
    }
})

Papa.parse("data.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
        var tabs = [
            {
                name:'teble',
                type:'table',
            },{
                name:'chert',
                type:'chart',
                x:{
                    col:'timestamp',
                },
                y:{
                    col:'price_usd',
                },
                scatter: true,
                filters:[
                    {
                        column:'drug_name',
                        value:"mdma",
                    },
                ],
            },{
                name:'a nother chert',
                type:'chart',
                x:{
                    col:'timestamp',
                },
                y:{
                    col:'product_rating',
                },
            }
        ]
        React.render( <App data={results.data} tabs={tabs}/>, document.getElementById('content'))
    }
});

React.render(<strong>Loading..</strong>, document.getElementById('content'))

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
            var className = this.state.current_tab == i ? "button-primary" : "";
            return (<span key={i}><button
                className={className}
                onClick={this.changeTab.bind(null, i)}>
                    {tab.name}</button>&nbsp;</span>)
        }.bind(this))
        var content = "no tab man";
        if(curr_tab.type == 'table'){
            content = (<Table params={curr_tab} />)
        }else{
            content = <ChartBuilder params={curr_tab} />;
        }
        return (<div><br/>{tabs}
            <button onClick={this.addNewTab.bind(null, {'type':'table', 'name':'lol'})}>Add tab</button>
            <Filters key={this.state.current_tab} data={this.props.data} filters={curr_tab.filters}>
                {content}
            </Filters>
            </div>);
    }
})

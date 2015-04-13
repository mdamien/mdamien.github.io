var Tabs = React.createClass({
    getInitialState:function(){
        return {
            'current_tab':this.props.current_tab ? this.props.current_tab : -1,
            'tabs':this.props.tabs ? this.props.tabs : [], 
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
        this.setState({'tabs':tabs,'current_tab':tabs.length-1})
    },

    render:function(){
        var tabs = [], curr_tab = false;
        if(this.state.current_tab != -1){
            curr_tab = this.state.tabs[this.state.current_tab]
            tabs = this.state.tabs.map(function(tab, i){
                var className = this.state.current_tab == i ? "active" : "";
                return (<li key={i} className={className}><a
                    href="#"
                    onClick={this.changeTab.bind(null, i)}>
                        {tab.name}</a></li>)
            }.bind(this))
        }

        var tabs_choices_infos = [
            {type:'table', name:'table'},
            {type:'chart', name:'chart',x:{},y:{},scatter:true},
        ];

        var tabs_choices = tabs_choices_infos.map(function(x,i){
            return (<li key={i}><a onClick={this.addNewTab.bind(null, x)}
                href='#'>{x.type}</a></li>);
        }.bind(this))

        tabs.push((<div key="-1" className="btn-group">
                    <button type="button" className="btn btn-default dropdown-toggle"
                        data-toggle="dropdown" aria-expanded="false">
                    Add tab <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu" role="menu">
                        {tabs_choices}
                    </ul>
                  </div>
        ))

        var content = <div>no tab selected</div>;
        var filters = [];
        if (curr_tab){
            if(curr_tab.type == 'table'){
                content = (<Table params={curr_tab} />)
            }else{
                content = <ChartBuilder params={curr_tab} />;
            }
            filters = curr_tab.filters;
        }
        return (<div><br/>
                <ul className="nav nav-tabs">{tabs}</ul>
                <br/>
            <Filters key={this.state.current_tab} data={this.props.data} filters={filters}>
                {content}
            </Filters>
            </div>);
    }
})


var App = React.createClass({
    getInitialState: function(){
        return {
            loading: false,
            data_url: this.props.data_url,
            data: [],
        }
    },
    componentDidMount: function(){
        this.load();
    },
    start_load: function(){
        this.setState({
            data_url:this.refs.data_url.getDOMNode().value,
            data:[],
        },this.load);
    },
    load: function(){
        this.setState({loading:true})
        Papa.parse(this.state.data_url, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                this.setState({
                    loading:false,
                    data:results.data,
                })
            }.bind(this)
        });
    },
    render: function(){
        var message = "";
        var content = "";
        if(this.state.loading){
            message = <strong>loading .csv</strong>;
        }
        else if(this.state.data.length > 0){
            content = (<Tabs data={this.state.data} />);
            message = (<span>Imported <strong>{this.state.data_url}</strong
                > with <strong>{this.state.data.length}</strong> lines
                </span>);
        }
        return (<div>
            <input ref="data_url" defaultValue={this.state.data_url}/>
                <button onClick={this.start_load}>load</button>  {message}
            {content}
        </div>);
    },
})

var TABS = [
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
                type:"contains",
            },
            {
                column:'price_usd',
                value:"x < 1000",
                type:"formula",
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
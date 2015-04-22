var Tabs = React.createClass({
    getInitialState:function(){
        var current_tab = this.props.current_tab ? this.props.current_tab : -1
        if(current_tab == -1 && this.props.tabs){
            current_tab = 0
        }
        
        return {
            'current_tab':current_tab,
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
    removeTab: function(tab){
        var tabs = this.state.tabs;
        tabs.splice(tab,1)
        this.setState({'tabs':tabs,'current_tab':-1})
    },
    render:function(){
        var tabs = [], curr_tab = false;
        if(this.state.current_tab != -1){
            curr_tab = this.state.tabs[this.state.current_tab]
        }
        var tabs = this.state.tabs.map(function(tab, i){
            var className = curr_tab && this.state.current_tab == i ? "active" : "";
            return (<li key={i} className={className}><a
                href="#"
                onClick={this.changeTab.bind(null, i)}>
                    {tab.name}
                    &nbsp;<button onClick={this.removeTab.bind(null, i)}>x</button>
                </a>
                </li>)
        }.bind(this))

        var tabs_choices_infos = [
            {type:'table', name:'table'},
            {type:'chart', name:'chart',x:{},y:{},scatter:true},
            {type:'map', name:'map'},
        ];

        var tabs_choices = tabs_choices_infos.map(function(x,i){
            return (<li key={i}>
                    <a
                        onClick={this.addNewTab.bind(null, x)}
                        href='#'>{x.type}</a>
                    </li>);
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

        var content = <div>no tab selected {curr_tab}</div>;
        var filters = [];
        if (curr_tab){
            if(curr_tab.type == 'table'){
                content = (<Table params={curr_tab} />)
            }else if(curr_tab.type == 'chart'){
                content = <ChartBuilder params={curr_tab} />;
            }else if(curr_tab.type == 'map'){
                content = <MapBuilder params={curr_tab} />;
            }else{
                content = "unknow tab type"
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
            var tabs = [
                {name:'table',type:'table'},
                {name:'map',type:'map'},
                ]
            content = (<Tabs data={this.state.data}
                    tabs={tabs} current_tab={0}/>);
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

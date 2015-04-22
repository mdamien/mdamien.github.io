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
    load: function(){
        this.setState({loading:true})
        $.get(this.state.data_url, function(results) {
            this.setState({
                loading:false,
                data:results.split("\n"),
            })
        }.bind(this));
    },
    render: function(){
        var content = "";
        if(this.state.data.length > 0){
            imgs = this.state.data.map(function(src,i){
                return <img key={i} src={src} />
            })
            content = ( <ComponentGallery
                            margin={0}
                            widthHeightRatio={3/4}
                            targetWidth={200}>
                              {imgs}
                          </ComponentGallery>);
        }
        return (<div>
            {content}
        </div>);
    },
})
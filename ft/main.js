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
                        type:FILTERS_TYPE.CONTAINS,
                    },
                    {
                        column:'price_usd',
                        value:"x < 1000",
                        type:FILTERS_TYPE.FORMULA,
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
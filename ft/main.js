Papa.parse("data.csv", {
    download: true,
    header: true,
    complete: function(results) {
        data = results.data
        React.render(<Griddle showFilter={true} 
                    showSettings={true} results={data} resultsPerPage={10} />,
                    document.getElementById('content'))
    }
});

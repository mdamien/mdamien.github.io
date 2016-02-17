/* find description, author url and author name */
var more_item_infos = data => {
  var html = $('<div/>').html(data.description);
  return {
    description: html.find('p').last().text(),
    author: data.author.split('(')[1].replace(')',''),
    author_link: html.find('a').first().attr('href'),
  }
};

/* display a detail page of a flickr post */
var FullPagePost = React.createClass({
  render() {
    var data = this.props.data;
    var more = more_item_infos(data);
    var tags = data.tags.split(' ');
    return <div className='full-post'>
      <div className='row'>
        <button
          className="btn btn-default pull-right"
          onClick={this.props.onBackClick}>
          Back
        </button>
        <h4>{data.title}</h4>
        <a href={more.author_link}>{more.author}</a>
        {' | '}
        Published: {format_date(data.published)}
        <hr/>
      </div>
      <div className='row'>
        <div className="img-container col-xs-3">
          <img src={data.media.m}/>
        </div>
        <div className="col-xs-8 description">
          {more.description}
          <p className="tags">Tags:&nbsp;
            <span>{tags.map(tag => {
              return <span key={tag}><a
                href={"https://www.flickr.com/photos/tags/" + tag + "/"}
                >{tag}</a> </span>;
            })}</span>
          </p>
        </div>
      </div>
    </div>;
  }
});

/* display a post as a list row */
var PostRow = React.createClass({
  render() {
    var data = this.props.data;
    var more = more_item_infos(data);
    return <li className='post row'>
      <div className="img-container col-xs-3">
        <img
          className={'internal-link'}
          onClick={this.props.onClick}
          src={data.media.m}/>
      </div>
      <div className="col-xs-8 description">
        <h4
          className={'internal-link'}
          onClick={this.props.onClick}>{data.title}</h4>
        <span className="published-block">
          Published: {format_date(data.published)}&nbsp;
        </span>
        <a href={more.author_link}>{more.author}</a>&nbsp;
        <span className="published-inline">
          Published: {format_date(data.published)}&nbsp;
        </span>
        <a href={data.link}>View on flickr</a>&nbsp;
      </div>
    </li>;
  }
});

/* display the feed or the post details and load the data */
var App = React.createClass({
  getInitialState() {
    return {
      filter: '',
      data: [],
    };
  },
  componentDidMount() {
    var location = "https://api.flickr.com/services/feeds/photos_public.gne?tags="
      + this.props.tag
      + "&tagmode=all&format=json&amp&jsoncallback=?";
    $.ajax({
        url: location,
        jsonp: "callback",
        dataType: "jsonp",
        success: response => {
            this.setState({ data: response});
        }
    });
  },
  handlePostClick(post_idx) {
    document.location.hash = '#'+post_idx;
  },
  handleGoBackToList() {
    document.location.hash = '';
  },
  render() {
    var data = this.state.data;
    if (data.length == 0){
      return <strong>Loading...</strong>;
    }
    if (this.props.post_idx !== undefined) {
      return <FullPagePost
        onBackClick={e => {this.handleGoBackToList()}}
        data={data.items[this.props.post_idx]} />
    }
    var posts = data.items.map((item, i) => {
      if (this.state.filter && item.tags.indexOf(this.state.filter) === -1) {
        return null;
      }
      return <PostRow data={item}
        onClick={e => {this.handlePostClick(i)}}
        key={i} />;
    });
    return <div>
        Filter by tag: <Input
          onChange={value => {this.setState({filter: value})}}
          value={this.state.filter}
          />
        <hr/>
        <ul className="feed">
          {posts}
        </ul>
      </div>;
  },
});

var render = () => {
  var post_idx = document.location.hash.split("#").slice(1);
  post_idx = parseInt(post_idx);
  if (isNaN(post_idx)) post_idx = undefined;
  ReactDOM.render(
    <App tag='potato' post_idx={post_idx} />,
    document.getElementById('content')
  );
}

window.onhashchange = render;
render();

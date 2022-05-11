function userJSON(user, token) {
  return {
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    token: token,
  };
}

// to format user profile
function userProfile(user, id = null) {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: id ? user.followingList.includes(id) : false,
  };
}
// to  format single article data
function articleformat(article, id = null) {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    taglist: article.taglist,
    createAt: article.createAt,
    updatedAt: article.updatedAt,
    favorited: id ? article.favouriteList.includes(id) : false,
    favouritedCount: article.favouritedCount,
    author: userProfile(article.author, id),
  };
}

// to format  single comment data
function commentformat(comment, id = null) {
  return {
    id: comment._id,
    createdAt: comment.createAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author: userProfile(comment.author, id),
  };
}

// to format multiple articles data
function formatArticles(articles, id = null) {
  return articles.map((eacharticle) => articleformat(eacharticle, id));
}

//to format multiple comments data
function formatcomments(comments, id = null) {
  return comments.map((comment) => commentformat(comment, id));
}
//generate  a  random numbers
function randomNumber(num = 123223) {
  return Math.floor(Math.random() * num);
}

module.exports = {
  userJSON,
  userProfile,
  articleformat,
  commentformat,
  formatArticles,
  formatcomments,
  randomNumber,
};

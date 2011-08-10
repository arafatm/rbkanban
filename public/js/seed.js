//$.getJSON('data.json', function(data) {
$.getJSON("/features", function(data) {
  $.each(data, function(fk, fv) {
    var f = new Feature(fv.id, fv.title, fv.status, fv.state);
    $.each(fv.comments, function(ck, cv) {
      console.log(cv);
      f.comments.unshift(new Comment(cv.comment, cv.user, cv.created_at));
    });
    viewModel.features.push(f);
  });
  //f = viewModel.features()[0];
  //f.addComment("Comment " + new Date());
});

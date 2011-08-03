//$.getJSON('data.json', function(data) {
$.getJSON("http://localhost:9393/features", function(data) {
  $.each(data, function(fk, fv) {
    var f = new Feature(fv.id, fv.title, fv.status, fv.state);
    $.each(fv.comments, function(ck, cv) {
      f.addComment(cv.comment, cv.createdon);
    });
    viewModel.features.push(f);
  });
});

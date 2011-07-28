//$.getJSON('data.json', function(data) {
$.getJSON("http://localhost:9393", function(data) {
  console.log(data);
  console.log(ko.toJSON(data));
  $.each(data, function(fk, fv) {
    var f = new Feature(fv.id, fv.title, fv.status, fv.state);
    console.log(ko.toJSON(f));
    $.each(fv.comments, function(ck, cv) {
      f.addComment(cv.comment, cv.createdon);
    });
    viewModel.features.push(f);
  });
});

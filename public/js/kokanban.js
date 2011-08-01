var statuses = [ "Backlog", "Analysis", "Dev", "Verify", "Release" ];
var states = [ "Ready", "Progress", "Impeded" ];

var Comment = function(comment, createdon) {
  this.comment = comment;
  if (typeof createdon == "undefined") {
    this.createdon = new Date();
  }
  else {
    this.createdon = new Date(createdon);
  }
}

var Feature = function(id, title, status, state) {
  this.id = id;
  this.title = ko.observable(title);
  this.status = ko.observable(status);
  this.state = ko.observable(state);
  this.comments = ko.observableArray([]);

  this.addComment = function(comment, createdon) {
    this.comments.unshift(new Comment(comment, createdon));
  }

  this.state.subscribe(function(newvalue) {
    this.addComment('Changing state from ' + state + ' to ' + newvalue);
  }, this);

  // Comments
  this.updateFeature = function(form) {
    if (form['newComment'].value.length > 0){
      this.addComment(form['newComment'].value);
      form['newComment'].value = '';
    }
  }


  // Swimming
  this.canSwimForward = ko.dependentObservable(function() {
    if (this.status() != statuses[statuses.length - 1]) {
      return true;
    }
    return false;
  }, this);
  this.canSwimBackward = ko.dependentObservable(function() {
    if (this.status() != statuses[0]) {
      return true;
    }
    return false;
  }, this);
  this.swimBackward = function(e) {
    var elem = $(e.target);
    for(var i = 1; i < statuses.length; i++) {
      if (this.status() == statuses[i]) {
        this.addComment('Swimming back from '+this.status()+' to '+(statuses[i-1]));
        this.status(statuses[i-1]);
        break;
      }
    }
  }
  this.swimForward = function() {
    for(var i = 0; i < (statuses.length-1); i++) {
      if (this.status() == statuses[i]) {
        this.addComment('Swimming forward from '+this.status()+' to '+(statuses[i+1]));
        this.status(statuses[i+1]);
        break;
      }
    }
  },
  this.showDetails = function(e) 
  {
    var elem = $(e.target); 
    var show = !elem.next().is(":visible")
      $(".details").hide();
    if(show) 
      elem.next().toggle();
  }
};

var viewModel = {
  statuses: ko.observableArray(statuses),
  states: ko.observableArray(states),
  features: ko.observableArray([])
}

viewModel.filterByStatus= ko.dependentObservable(function() {
  console.log('Filtering' + new Date());
  var result = [];
  ko.utils.arrayForEach(statuses, function(status) {
    result[status] = result[status] || []; 
  });
  ko.utils.arrayForEach(this.features(), function(feature) {
    var status = feature.status() || 0; 
    result[status].push(feature);
  });
  return result;
}, viewModel);

ko.applyBindings(viewModel);

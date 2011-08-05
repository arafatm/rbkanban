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
    var f = this;

    $.ajax({
      type: "PUT",
      url: '/feature/'+this.id+'/comment',
      data: { "comment": comment },
      dataType: 'json',
      success: function(data) {
        $.each(data, function(fk, fv) {
          f.comments.unshift(new Comment(fv.comment, fv.created_at));
        });
      },
      error: function(msg) {
               console.log( msg.responseText );
             }
    });
    //this.comments.unshift(new Comment(comment, createdon));
  }

  this.state.subscribe(function(newstate) {
    //this.addComment('Changing state from ' + state + ' to ' + newvalue);
    var f = this;
    $.ajax({
      type: "POST",
      url: '/feature/'+this.id+'/state',
      data: { "state": newstate },
      dataType: 'json',
      success: function(data) {
        $.each(data, function(fk, fv) {
          f.comments.unshift(new Comment(fv.comment, fv.created_at));
        });
      },
      error: function(msg) {
               console.log(msg.responseText);
             }
    });
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
        this.swim(statuses[i-1]);
        break;
      }
    }
  }
  this.swimForward = function() {
    for(var i = 0; i < (statuses.length-1); i++) {
      if (this.status() == statuses[i]) {
        this.swim(statuses[i+1]);
        break;
      }
    }
  },
    this.swim = function(newstatus) {
      var f = this;
      $.ajax({
        type: "POST",
      url: '/feature/'+this.id+'/status',
      data: { "status": newstatus },
      dataType: 'json',
      success: function(data) {
        $.each(data, function(fk, fv) {
          f.comments.unshift(new Comment(fv.comment, fv.created_at));
        });
        f.status(newstatus);
      },
      error: function(msg) {
               console.log(msg.responseText);
             }
      });
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
  features: ko.observableArray([]),
  addFeature: function(form) {
    if (form['newFeature'].value.length > 0){
      var newFeature = form['newFeature'].value;
      $.ajax({
        type: "PUT",
        url: '/feature',
        data: { "feature": newFeature },
        dataType: 'json',
        success: function(feature) {
          var f = new Feature(feature.id, feature.title, 
            feature.status, feature.state);
          var cm = feature.comments[0];
          f.comments.push(new Comment(cm.comment, cm.created_at));
          viewModel.features.push(f);
          form['newFeature'].value = '';
        },
        error: function(msg) {
                 console.log( msg.responseText );
               }
      });
    }
  }

}

viewModel.filterByStatus= ko.dependentObservable(function() {
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

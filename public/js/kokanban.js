var statuses = [ "Backlog", "Analysis", "Dev", "Verify", "Release" ];
var states = [ "Ready", "Progress", "Impeded" ];

var Comment = function(comment, user, created_at) {
  this.comment = comment;
  this.user = user; 
  this.created_at = new Date(created_at);
  this.datestamp = jQuery.timeago(this.created_at);
}

var Feature = function(id, title, status, state, complete) {
  var self = this;
  self.id = id;
  self.title = ko.observable(title);
  self.status = ko.observable(status);
  self.state = ko.observable(state);
  self.state.edit = ko.dependentObservable({
    read: self.state,
    write: function(newstate) {
      $.ajax({
        type: "POST",
        url: '/feature/'+self.id+'/state',
        data: { "state": newstate },
        dataType: 'json',
        success: function(data) {
          $.each(data, function(fk, fv) {
            self.comments.unshift(new Comment(fv.comment, fv.user, fv.created_at));
          });
          self.state(newstate);
        },
        error: function(msg) {
                 console.log(msg.responseText);
               }
      });
    }
  });
  self.complete = ko.observable(complete);
  self.completion = function() {
    $.ajax({
      type: "POST",
      url: '/feature/'+self.id+'/complete',
      dataType: 'json',
      success: function(data) {
        viewModel.features.remove(self);
      },
      error: function(msg) {
               console.log(msg.responseText);
             }
    });
  };
  self.comments = ko.observableArray([]);

  self.addComment = function(form) {
    var newComment;
    if (form['newComment'].value.length > 0){
      newComment = form['newComment'].value;
      var f = self;

      $.ajax({
        type: "PUT",
        url: '/feature/'+self.id+'/comment',
        data: { "comment": newComment },
        dataType: 'json',
        success: function(data) {
          $.each(data, function(fk, fv) {
            f.comments.unshift(new Comment(fv.comment, fv.user, fv.created_at));
          });
          form['newComment'].value = '';
        },
        error: function(msg) {
                 console.log( msg.responseText );
               }
      });
    }
  };

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
  };
  this.swimForward = function() {
    for(var i = 0; i < (statuses.length-1); i++) {
      if (this.status() == statuses[i]) {
        this.swim(statuses[i+1]);
        break;
      }
    }
  };
  this.swim = function(newstatus) {
    var f = this;
    $.ajax({
      type: "POST",
      url: '/feature/'+this.id+'/status',
      data: { "status": newstatus },
      dataType: 'json',
      success: function(data) {
        $.each(data, function(fk, fv) {
          f.comments.unshift(new Comment(fv.comment, fv.user, fv.created_at));
        });
        f.status(newstatus);
      },
      error: function(msg) {
               console.log(msg.responseText);
             }
    });
  };
  this.showDetails = function(e) {
    var elem = $(e.target); 
    var show = !elem.next().is(":visible")
      $(".details").hide();
    if(show) 
      elem.next().toggle();
  };
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
          console.log(ko.toJS(feature));
          var f = new Feature(feature.id, feature.title, 
            feature.status, feature.state, feature.complete);
          var cm = feature.comments[0];
          f.comments.push(new Comment(cm.comment, cm.user, cm.created_at));
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

viewModel.findFeatureByTitle = function(searchtitle) {
  return ko.utils.arrayFirst(this.features(), function(feature) {
    return ko.utils.stringStartsWith(feature.title(), searchtitle);
  });
};
viewModel.findFeatureByID = function(searchid) {
  return ko.utils.arrayFirst(this.features(), function(feature) {
    return ko.utils.stringStartsWith(feature.id, searchid);
  });
};
ko.applyBindings(viewModel);

// Ajax activity indicator bound to ajax start/stop document events
$(document).ajaxStart(function(){ 
  $('#dialog-progress').show(); 
}).ajaxStop(function(){ 
  $('#dialog-progress').hide();
});
/*
// Setup the ajax indicator
$('body').append('<div id="ajaxBusy"><p><img src="/img/loading.gif"></p></div>');

$('#ajaxBusy').css({
  display:"none",
  margin:"5em",
  paddingLeft:"0px",
  paddingRight:"0px",
  paddingTop:"0px",
  paddingBottom:"0px",
  position:"absolute",
  left:"5em",
  top:"5em",
  width:"auto"
});


*/

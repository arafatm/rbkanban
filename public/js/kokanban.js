var statuses = [ "Backlog", "Analysis", "Dev", "Verify", "Release" ];
var states = [ "Ready", "Progress", "Impeded" ];
var pointss = ["0", "1", "2", "3", "5", "8", "13"]

var Comment = function(comment, user, created_at) {
  this.comment = comment;
  this.user = user; 
  this.created_at = new Date(created_at);
  this.datestamp = jQuery.timeago(this.created_at);
}

var Feature = function(id, title, status, state, complete, points) {
  var self = this;
  self.id = id;
  self.title = ko.observable(title);
  self.status = ko.observable(status);
  self.points = ko.observable(points);
  self.state = ko.observable(state);
  self.complete = ko.observable(complete);
  self.points.edit = ko.dependentObservable({
    read: function() { return String(self.points()); },
    write: function(newpoints) {
      if (newpoints != self.points()) {
        //debug(typeof self.points());
        //debug(typeof newpoints);
        self.updateFeature({url: '/feature/'+self.id+'/points',
          data: { "points": newpoints }});
      }
    }
  });
  self.state.edit = ko.dependentObservable({
    read: self.state,
    write: function(newstate) {
        //debug("updating state");
        self.updateFeature({url: '/feature/'+self.id+'/state',
          data: { "state": newstate }});
    }
  });
  self.completion = function() {
    self.updateFeature({url: '/feature/'+self.id+'/complete', 
      callback: function() {
          if (self.complete() == true) {
            viewModel.features.remove(self);
          }
        }});
  };
  self.comments = ko.observableArray([]);
  self.lastcomment = ko.dependentObservable({
    read: function() {
            if (self.comments().length > 0) {
              debug(typeof self.comments()[0]);
              return self.comments()[0];
            }
            else {
              // data-bind really doesn't like nothing returned
              return {user: '', datestamp: '', comment: ''}; 
            }
          }
  });

  /* TODO:
   * Refactor to not care data is coming from a form
   * self.comment.new = ko.observable();
   */
  self.addComment = function(form) {
    var newComment;
    if (form['newComment'].value.length > 0){
      newComment = form['newComment'].value;
      var f = self;

      self.updateFeature({
        type: "PUT",
        url: '/feature/'+self.id+'/comment',
        data: { "comment": newComment },
        callback: function() {
          form['newComment'].value = '';
        }
      });
    }
  };

  self.updateFeature = function(args) {
    //debug(args);
    debug(args['url']+": "+ko.toJSON(args['data']));
    $.ajax({
      type: args['type'] || "POST",
      url: args['url'],
      data: args['data'],
      dataType: 'json',
      success: function(f) {
        self.title(f.title);
        self.status(f.status);
        self.state(f.state);
        self.complete(f.complete);
        self.points(f.points);
        //debug(self.id+": points: "+typeof self.points()+" new: "+typeof f.points);
        self.comments([]);
        $.each(f.comments, function(ck, cv) {
          self.comments.unshift(
            new Comment(cv.comment, cv.user, cv.created_at));
        });
        typeof args['callback'] === 'function' && args['callback']();
      },
      error: function(msg) {
               console.log(msg.responseText);
             }
    });
  }

  // Swimming
  self.canSwimForward = ko.dependentObservable(function() {
    if (self.status() != statuses[statuses.length - 1]) {
      return true;
    }
    return false;
  });
  self.canSwimBackward = ko.dependentObservable(function() {
    if (self.status() != statuses[0]) {
      return true;
    }
    return false;
  });
  self.swimBackward = function(e) {
    var elem = $(e.target);
    for(var i = 1; i < statuses.length; i++) {
      if (self.status() == statuses[i]) {
        self.swim(statuses[i-1]);
        break;
      }
    }
  };
  self.swimForward = function() {
    for(var i = 0; i < (statuses.length-1); i++) {
      if (self.status() == statuses[i]) {
        self.swim(statuses[i+1]);
        break;
      }
    }
  };
  self.swim = function(newstatus) {
    self.updateFeature({url: '/feature/'+self.id+'/status', 
      data: { "status": newstatus }});
  };
  self.showDetails = function(e) {
    var elem = $(e.target); 
    var show = !elem.siblings('.details').is(":visible")
    $(".details").hide();
    elem.siblings('.lastcomment').toggle();
    if(show)  {
      elem.siblings('.details').toggle();
    }
  };
};

var viewModel = {
  statuses: ko.observableArray(statuses),
  states: ko.observableArray(states),
  pointss: ko.observableArray(pointss),
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
          //debug(url);
          var f = new Feature(feature.id, feature.title, feature.status,
            feature.state, feature.complete, feature.points);
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
  //$(".details").hide();
  //$(".lastcomment").show();
});

var debug = function(arg) {
  console.log(arg);
}

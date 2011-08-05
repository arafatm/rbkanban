require 'rubygems'     
require 'sinatra'         
require 'json'         

load './model.rb'

class Feature 
  include MongoMapper::Document
  key :title, String
end

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/features' do        
  Feature.all.to_json
end

post '/feature/:id/state' do
  f = Feature.find(params['id'])
  if f
    c = "Changing state from " + f.state + " to " + params['state']
    f.state = params['state']
    c = f.comments << Comment.new(:comment => c)
    if f.save
      return c.to_json
    end
  end
  error 410, "yer moms mom" 
end

post '/feature/:id/status' do
  f = Feature.find(params['id'])
  if f
    c = "Changing status from " + f.status + " to " + params['status']
    f.status = params['status']
    c = f.comments << Comment.new(:comment => c)
    if f.save
      return c.to_json
    end
  end
  error 410, "yer moms mom" 
end

put '/feature/:id/comment' do
  f = Feature.find(params['id'])

  if f 
    c = f.comments << Comment.new(:comment => params["comment"])
    if f.save
      return c.to_json
    end
  end
  error 410, "yer mom"

end

require 'rubygems'     
require 'sinatra'         
require 'json'         

load './model.rb'

class Feature 
  include MongoMapper::Document
  key :title, String
end

enable :sessions

before do
  if session['user'] == nil and request.path != '/login'
    redirect '/login'
  end
end

get '/' do
  erb :index
end

get '/login' do
  erb :login
end

post '/login' do
  if params['user'].length > 3
    session['user'] = params['user']
    redirect '/'
  else
    redirect '/login'
  end
end

get '/logout' do
  session['user'] = nil
  redirect '/user'
end

get '/features' do        
  Feature.all.to_json
end

get '/features/working' do
  Feature.find_all_by_complete(false).to_json
end

put '/feature' do
  f = Feature.create(session['user'], params["feature"])
  if f.class == Feature
    return f.to_json
  else
    error 410, f
  end
end


post '/feature/:id/state' do
  f = Feature.find(params['id'])
  if f
    c = "Changing state from " + f.state + " to " + params['state']
    f.state = params['state']
    c = f.comments << Comment.new(:user => session['user'],
                                  :comment => c)
    if f.save
      return f.to_json
    end
  end
  error 410, "yer moms mom" 
end

post '/feature/:id/status' do
  f = Feature.find(params['id'])
  if f
    c = "Changing status from " + f.status + " to " + params['status']
    f.status = params['status']
    c = f.comments << Comment.new(:user => session['user'],
                                  :comment => c)
    if f.save
      return f.to_json
    end
  end
  error 410, "yer moms mom" 
end

put '/feature/:id/comment' do
  f = Feature.find(params['id'])
  c = f.comments << Comment.new(:user => session['user'], 
                                :comment => params['comment'])
  if f.save 
      return f.to_json
  else
    error 410, "yer mom"
  end
end

post '/feature/:id/complete' do
  f = Feature.complete(session['user'], params['id'])
  puts f.to_json
  if f.class == Feature
    return f.to_json
  else
    error 410, f
  end
end

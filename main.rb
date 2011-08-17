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
  respond Feature.create(session['user'], params["feature"])
end


post '/feature/:id/state' do
  respond Feature.changestate(session['user'],params['id'],params['state'])
end

post '/feature/:id/status' do
  respond Feature.swim(session['user'], params['id'], params['status'])
end

put '/feature/:id/comment' do
  respond Feature.comment(session['user'], params['id'], params['comment'])
end

post '/feature/:id/complete' do
  respond Feature.complete(session['user'], params['id'])
end

def respond(feature)
  if feature.class == Feature
    return feature.to_json
  else
    error 410, feature
  end
end

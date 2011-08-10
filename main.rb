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
  if session['login'] == nil and request.path != '/login'
    redirect '/login'
  end
end

get '/' do
  #File.read(File.join('public', 'index.html'))
  erb :index
end

get '/login' do
  erb :login
end

post '/login' do
  session['login'] = params['login']
  redirect '/'
  #File.read(File.join('public', 'login.html'))
end

get '/logout' do
  session['login'] = nil
  redirect '/login'
end

get '/features' do        
  Feature.all.to_json
end

put '/feature' do
  f = Feature.new(:title => params["feature"], 
                  :status => "Backlog",
                  :state => "Ready")
  f.comments << Comment.new(:comment => "Created Feature")
  if f.save
    return f.to_json
  end
  error 410, "yer mom"
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

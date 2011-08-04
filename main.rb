require 'rubygems'     
require 'sinatra'         
require 'json'         

load './model.rb'

class Feature 
  include MongoMapper::Document
  key :title, String
end

get '/' do
  puts
  File.read(File.join('public', 'index.html'))
end

get '/features' do        
  3.times do |i|; puts; end
  Feature.all.to_json
end

post '/feature/:id/state' do
  3.times do; puts; end
  puts "***"
  puts params

  f = Feature.find(params['id'])
  if f
    puts f.state
    c = "Changing state from " + f.state + " to " + params['state']
    f.state = params['state']
    c = f.comments << Comment.new(:comment => c)
    if f.save
      return c.to_json
    end
  end
  error 410, "yer moms mom" 
end

put '/feature/:id/comment' do
  puts "***"
  puts params
  puts params["comment"]

  f = Feature.find(params['id'])

  if f 
    c = f.comments << Comment.new(:comment => params["comment"])
    if f.save
      return c.to_json
    end
  end
  error 410, "yer mom"

end

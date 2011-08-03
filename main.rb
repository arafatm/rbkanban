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

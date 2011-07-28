require 'rubygems'     
require 'sinatra'         
require 'json'         

load './model.rb'

class Feature 
  include MongoMapper::Document
  key :title, String
end

get '/' do        
  content_type :json
  Feature.all.to_json
end

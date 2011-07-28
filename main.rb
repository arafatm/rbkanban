require 'rubygems'     
require 'sinatra'         
require 'json'         

MongoMapper.connection = Mongo::Connection.new('localhost')
MongoMapper.database = 'kanban'

class Feature 
  include MongoMapper::Document
  key :title, String
end

get '/' do        
  content_type :json
  Feature.all.to_json
end

get '/:id' do
end

get '/add' do
  feature = Feature.new
  feature.title = 'Feature ' + rand
  feature.save
end

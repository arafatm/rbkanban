require 'rubygems'     
require 'json'         
require 'mongo_mapper'

MongoMapper.connection = Mongo::Connection.new('localhost')
MongoMapper.database = 'kanban'

class Feature 
  include MongoMapper::Document
  key :title, String
  key :status, String
  key :state, String

  key :comments, Array
  
end

class Comment
  include MongoMapper::Document
  key :comment, String
  key :createdon, Time
end


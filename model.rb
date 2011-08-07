require 'rubygems'     
require 'bundler/setup'
require 'json'         
require 'mongo_mapper'

MongoMapper.connection = Mongo::Connection.new('localhost')
MongoMapper.database = 'kanban'

class Feature 
  include MongoMapper::Document
  key :title, String
  key :status, String
  key :state, String
  many :comments
  timestamps!
  
end

class Comment
  include MongoMapper::EmbeddedDocument
  plugin MongoMapper::Plugins::Timestamps

  key :comment, String
  timestamps!
end


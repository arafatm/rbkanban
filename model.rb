require 'rubygems'     
require 'bundler/setup'
require 'json'         
require 'mongo_mapper'

MongoMapper.connection = Mongo::Connection.new('staff.mongohq.com', 10014)
MongoMapper.database = 'rbkanban'
MongoMapper.database.authenticate('rbkanban', 'rbkanban')

class Feature 
  include MongoMapper::Document
  key :title, String
  key :status, String
  key :state, String
  many :comments
  timestamps!

  def user
    comments.last.user
  end

  def addComment(user, comment) 
    c = comments << Comment.new(:comment => comment, :user => user)
    if save
      return c
    else
      return nil
    end
  end
  
end

class Comment
  include MongoMapper::EmbeddedDocument
  plugin MongoMapper::Plugins::Timestamps

  key :comment, String
  key :user, String
  timestamps!
end


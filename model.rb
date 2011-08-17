require 'rubygems'     
require 'bundler/setup'
require 'json'         
require 'mongo_mapper'

if ENV['RACK_ENV'] == 'production'
  MongoMapper.connection = Mongo::Connection.new('staff.mongohq.com', 10014)
  MongoMapper.database = 'rbkanban'
  MongoMapper.database.authenticate('rbkanban', 'rbkanban')
else
  MongoMapper.connection = Mongo::Connection.new('localhost')
  MongoMapper.database = 'rbkanban'
  MongoMapper.database.authenticate('rbkanban', 'rbkanban')
end

class Feature 
  include MongoMapper::Document
  key :title, String
  key :status, String
  key :state, String
  key :complete, Boolean
  many :comments
  timestamps!

  def user
    comments.last.user
  end

  def self.create(user, title)
    f = Feature.new(:title => title, 
                    :status => "Backlog",
                    :state => "Ready",
                    :complete => false)
    f.comments << Comment.new(:user => user,
                              :comment => "Created Feature")
    if f.save
      return f
    else
      return "Error creating Feature"
    end
  end
  def self.complete(user, id)
    f = Feature.find(id)
    if f.class == Feature
      f.complete = true
      c = f.comments << Comment.new(:user => user,
                                    :comment => "Completed")
      if f.save
        return f
      else
        return "Error completing Feature"
      end
    else
      return "Could not find Feature"
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


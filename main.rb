require 'rubygems'     
require 'sinatra'         
require 'json'         


get '/' do        
  content_type :json
  { :a => 'aa', :b => 'bb'}.to_json
end

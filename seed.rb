load "./model.rb"

features = Feature.all
features.each do |f|
  f.destroy
end
comments = Comment.all
comments.each do |c|
  c.destroy
end

statuses = ["Backlog", "Analysis", "Dev", "Verify", "Done"]
states = ["Ready", "Progress", "Impeded"]
10.times do |i|
  f = Feature.new(:title => "Feature #{i}",
                  :status => statuses[rand(statuses.size)],
                  :state => states[rand(states.size)])
  5.times do |j|
    c = Comment.new(:comment => "Comment #{j}",
                    :createdon => DateTime.now - (rand(5)))
    f.comments << c.to_mongo
  end
  f.save
end

load "./model.rb"

features = Feature.all
features.each do |f|
  f.destroy
end

statuses = ["Backlog", "Analysis", "Dev", "Verify", "Release"]
states = ["Ready", "Progress", "Impeded"]
10.times do |i|
  t1 = Time.now - (rand(60*60*24*30)) 
  f = Feature.new(:title => "Feature #{i}",
                  :status => statuses[rand(statuses.size)],
                  :state => states[rand(states.size)],
                  :complete => false)
  rand(5).to_i.times do |j|
    t = t1 + rand(60*60*24*30) 
    while t > Time.now
      t = t1 + rand(60*60*24*30) 
    end
    t1 = t
    f.comments << Comment.new(:comment => "Comment #{j}", :created_at => t1)
  end
  f.save
end

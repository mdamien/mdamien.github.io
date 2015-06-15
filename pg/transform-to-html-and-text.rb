require 'nokogiri'

elements = Dir['articles/*'].map { |f| e = Nokogiri::HTML(File.read(f))
    .css('table:last').first }.compact

File.write('all.html', elements.map(&:to_html).join("\n\n<h1><br>#####################<br></h1>\n\n"))
File.write('all.txt', elements.map(&:content).join("\n\n#####################\n\n"))

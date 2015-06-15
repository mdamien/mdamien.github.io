require 'nokogiri'
require 'open-uri'
require 'digest/sha1'

cachefile = 'cache.marshal'

if File.exists?(cachefile)
  hrefs = Marshal.load(File.read(cachefile))
else
  urls = ['http://www.paulgraham.com/ind.html']
  23.times { |i| urls << "http://www.paulgraham.com/ind_#{i+1}.html" }
  pages = urls.map { |url| open(url).read }
  hrefs = pages.map { |p| Nokogiri::HTML(p).css('table tr td a').map { |i| i['href'] } }
  hrefs = hrefs.flatten.sort.uniq
  hrefs = hrefs.map {|h| 'http://www.paulgraham.com/' + h }
  File.write(cachefile, Marshal.dump(hrefs))
end

articles = []
hrefs.each_slice(10) do |urls_slice|
  threads = []
  urls_slice.each do |url|
    threads << Thread.new(url) do |url|
      name = 'articles/' + Digest::SHA1.hexdigest(url) + '-' + url.gsub(/[^a-zA-Z0-9]/, '-')
      if File.exists?(name)
        print '|'
      else
        begin
          File.write(name, open(url).read)
          print '.'
        rescue
          print 'x'
        end
      end
    end
  end
  threads.each(&:join)
end

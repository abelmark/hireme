var request = require('request');
var cheerio = require('cheerio');

module.exports = {

	indeed: function(search, where) {
		return function(callback){
			request("http://www.indeed.com/jobs?q=" + search + "&l=" + where + "/", function(error, response, data){
				if(!error && response.statusCode == 200){
					var $ = cheerio.load(data);
					var links = $('.result').map(function(link){
						return {
              site: "Indeed",
              title: $(this).children(".jobtitle").text(),
              url: ("http://www.indeed.com" + $(this).find(".turnstileLink").attr("href")),
              company: $(this).find(".company").text(),
              description: $(this).find(".summary").text()
            }
          }).get();
					callback(null, links);
				}
			}, 500)
		}
	},

	job: function(search, where) {
		return function(callback){
			request("http://www.job.com/job-search/results/?titleSearch=&titleWhere=&q="+  search + "&l=" + where + "&geonameid=#.VsvJJZMrLVo", function(error, response, data){
				if(!error && response.statusCode == 200){
					var $ = cheerio.load(data);
					var links = $('.m-result').map(function(link){
						return {
              site: "Job.com",
              title: $(this).find(".job-title").text(),
              url: "http://www.job.com/" + $(this).find("a").text(),
              company: $(this).find(".company").text(),
              description: $(this).find(".description").text()
            }
          }).get();
					callback(null, links);
				}
			}, 1000)
		}
	},

	simply: function(search, where) {
		return function(callback){
			request("http://www.simplyhired.com/search?q=" + search + "&l=" + where, function(error, response, data){
				if(!error && response.statusCode == 200){
					var $ = cheerio.load(data);
					var links = $('.js-jobs .card').map(function(link){
						return {
							site: "Simply Hired",
							title: $(this).find(".serp-title").text(),
							url: "http://www.simplyhired.com" + $(this).find(".js-job-link").attr("href"),
							company: $(this).find(".serp-subtitle").text(),
							description: $(this).find(".serp-snippet").text()
						}
					}).get();
					callback(null, links);
				}
			}, 1500)
		}
	}
}


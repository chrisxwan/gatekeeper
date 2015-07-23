# GateKeeper

I strongly believe in Facebook as a platform for friends to keep in touch with each other. However, recently, I feel like Facebook has become more and more of a cess pool for people to post their opinions. You know what I'm talking about -- those 200-word manifestos about gay marriage or Donald Trump or police brutality. Although these are important issues, I do not think that these opinions belong on Facebook; I really think they actually belong on personal blogs that people will read only if they *want* to read. 

So, here's GateKeeper, a Google Chrome extension built to customize your Facebook feed. Here are some of the features:

- Block posts related to current Twitter trends in the USA. People tend to post on Facebook about things that are trending, so let's just get rid of that. Twitter has a really restricted API limit, so I'm using CircleCI to call the Twitter API every ~7 minutes and throw the trends as a JSON file onto RackSpace. The extension makes a simple GET request to RackSpace to grab the trends.

- Block posts by keyword. In case Twitter doesn't catch some of the things you don't want to see, you can block them yourself. I snipe the posts on the feed (and the ticker sidebar) and run them through a NLP API.

- Block by mood. Filter out sadder posts. I run the posts through a sentiment analysis API. 


If you have any suggestions or want to contribute to this project, please feel free to add an issue or submit a pull request!


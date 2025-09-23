var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/bot-handler.js
var API_ROOT = "https://7kmjvblyk7kqm2fyxkcvgcjvq40fsxxl.lambda-url.us-east-1.on.aws/";
var bot_handler_default = {
  /**
   * @param {Request<unknown, CfProperties<unknown>>} request
   * @param {any} env
   */
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};
async function handleRequest(req, env) {
  const ua = req.headers.get("user-agent") || "";
  const url = new URL(req.url);
  const tweetId = url.searchParams.get("tweet_id");
  if (isCrawler(ua) && tweetId) {
    console.log("Crawler detected:", req.headers["user-agent"]);
    console.log("Looking for tweet id: ", tweetId);
    return getScraperTweet(tweetId);
  }
  return await env.ASSETS.fetch(req);
}
__name(handleRequest, "handleRequest");
function isCrawler(userAgent) {
  const crawlers = ["googlebot", "bingbot", "yandex", "baiduspider", "discordbot", "facebookexternalhit"];
  return userAgent && crawlers.some((crawler) => userAgent.toLowerCase().includes(crawler));
}
__name(isCrawler, "isCrawler");
async function getScraperTweet(tweet_id) {
  const query = encodeURIComponent(JSON.stringify({ tweetFilter: { tweet_id }, page: 0, pageSize: 1 }));
  console.log(API_ROOT + "getTweets?input=" + query);
  const resp = await fetch(API_ROOT + "getTweets?input=" + query);
  const data = await resp.json();
  console.log(data)
  const tweetData = data.result.data[0];
  const mediaUrl = typeof tweetData.media_url != "undefined" ? tweetData.media_url[0] : "https://furryslop.com/favicon.ico";
  return new Response(
    `<!DOCTYPE html>
     <html lang="en">
     <head>
        <title>${tweetData.handle}</title>
        <meta name="twitter:site" content="Furryslop">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${tweetData.handle}">
        <meta name="twitter:description" content="${tweetData.content}">
        <meta name="twitter:image" content="${mediaUrl}">

        <meta property="og:site_name" content="Furryslop">
        <meta property="og:title" content="${tweetData.handle}">
        <meta property="og:description" content="${tweetData.content}">
        <meta property="og:image" content="${mediaUrl}">
        <meta property="og:type" content="article">
     </head>
     <body>
       <div id="root"></div>
     </body>
     </html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
__name(getScraperTweet, "getScraperTweet");
export {
  bot_handler_default as default
};
//# sourceMappingURL=bot-handler.js.map

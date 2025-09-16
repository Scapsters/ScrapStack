const API_ROOT = "https://7kmjvblyk7kqm2fyxkcvgcjvq40fsxxl.lambda-url.us-east-1.on.aws/";

export default {
  /**
   * @param {Request<unknown, CfProperties<unknown>>} request
   * @param {any} env
   */
  async fetch(request, env) {
    return handleRequest(request, env)
  },
};

/**
 * @param {Request<unknown, CfProperties<unknown>>} req
 */
async function handleRequest(req, env) {
  console.log("hello world");

  const ua = req.headers.get("user-agent") || "";
  const url = new URL(req.url);
  const tweetId = url.searchParams.get("tweet_id");

  if (isCrawler(ua) && tweetId) {
    console.log('Crawler detected:', req.headers['user-agent'])
    console.log('Looking for tweet id: ', tweetId)
    return getScraperTweet(tweetId);
  }

    return await env.ASSETS.fetch(req);
}

/**
 * @param {string} userAgent
 */
function isCrawler(userAgent) {
  const crawlers = ["googlebot", "bingbot", "yandex", "baiduspider", "discordbot", "facebookexternalhit"];
  return userAgent && crawlers.some((crawler) => userAgent.toLowerCase().includes(crawler));
}

/**
 * @param {string} tweet_id
 */
async function getScraperTweet(tweet_id) {
  const query = encodeURIComponent(JSON.stringify({ tweetFilter: { tweet_id: tweet_id }, page: 1, pageSize: 1 }));
  console.log(API_ROOT + "getTweets?input=" + query)
  const resp = await fetch(API_ROOT + "getTweets?input=" + query);
  const data = await resp.json();
  const tweetData = data.result.data[0];

  const mediaUrl =
    tweetData.media_url
      ? tweetData.media_url[0]
      : "https://furryslop.com/favicon.ico"
      

  return new Response(
    `<!DOCTYPE html>
     <html lang="en">
     <head>
       <title>${tweetData.handle}</title>
       <meta name="twitter:site" content="@${tweetData.handle}">
       <meta name="twitter:title" content="${tweetData.handle}">
       <meta name="twitter:description" content="${tweetData.content}">
       <meta name="twitter:card" content="summary_large_image">
       <meta name="twitter:image:src" content="${mediaUrl}">
     </head>
     <body>
       <div id="root"></div>
     </body>
     </html>`,
    { headers: { "content-type": "text/html" } }
  );
}
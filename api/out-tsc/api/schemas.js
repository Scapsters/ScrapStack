import z from "zod";
var DBObject = z.object({ _id: z.string() }).strict();
export var zMeowSchema = z.object({
    name: z.string(),
    value: z.number(),
}).strict();
export var zMeowDB = zMeowSchema.and(DBObject);
export var zUserSchema = z.object({
    userToken: z.string(),
    viewedPosts: z.array(z.string())
});
export var zUserDB = zUserSchema.and(DBObject);
export var zTweetSchema = z.object({
    stackUsername: z.string(),
    tweet_id: z.string(),
    tweet_link: z.string(),
    date_time: z.string(),
    content: z.string(),
    user: z.string(),
    handle: z.string(),
    is_quote_tweet: z.boolean(),
    replying_to: z.string(),
    media_url: z.array(z.string()),
    has_media: z.boolean(),
    profile_img: z.string(),
});
export var zTweetDB = zTweetSchema.and(DBObject);
export var zStackSchema = z.object({
    twitterHandle: z.string(),
    postCount: z.number()
});
export var zStackDB = zStackSchema.and(DBObject);

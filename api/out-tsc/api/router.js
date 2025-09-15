var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { initTRPC, TRPCError } from '@trpc/server';
import { createHash } from 'node:crypto';
import z from 'zod';
import { zStackSchema, zTweetSchema } from './schemas.js';
import { getSecretString } from './secrets.js';
import { getFromHeaders } from '../utils/http.js';
//TODO: rate limiting with cloudflare
var t = initTRPC
    .meta()
    .context()
    .create();
var publicProcedure = t.procedure;
var ACKNOWLEDGE_DESCRIPTION = "Whether the operation was acknowledged";
var isUserProcedure = t.procedure.use(function hasSession(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, userToken, user, addedUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = opts.ctx;
                    userToken = getFromHeaders('userToken', ctx);
                    return [4 /*yield*/, ctx.User.findOne({ identifier: userToken })];
                case 1:
                    user = _a.sent();
                    if (!!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.User.insertOne({ userToken: userToken, viewedPosts: [] })];
                case 2:
                    addedUser = (_a.sent()).acknowledged;
                    if (!addedUser)
                        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JIT user creation not acknowledged' });
                    return [4 /*yield*/, ctx.User.findOne({ userToken: userToken })];
                case 3:
                    user = _a.sent();
                    if (!user)
                        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JIT user creation acknowledged but not found' });
                    _a.label = 4;
                case 4: return [2 /*return*/, opts.next({ ctx: __assign(__assign({}, ctx), { user: user }) })];
            }
        });
    });
});
var isAdminProcedure = t.procedure.use(function isAdmin(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, adminPassword, adminAnswer, isAdmin;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctx = opts.ctx;
                    adminPassword = getFromHeaders('authorization', ctx).split(' ')[1];
                    return [4 /*yield*/, getSecretString('ADMIN_ANSWER')];
                case 1:
                    adminAnswer = _a.sent();
                    isAdmin = !!adminPassword && createHash('sha256').update(adminPassword).digest('hex') == adminAnswer;
                    if (!isAdmin)
                        throw new TRPCError({ code: 'UNAUTHORIZED' });
                    return [2 /*return*/, opts.next({ ctx: __assign(__assign({}, ctx), { isAdmin: true }) })];
            }
        });
    });
});
function queryRandomTweets(Tweet, filter) {
    return __awaiter(this, void 0, void 0, function () {
        var tweetIds, sampledIds, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Tweet.find(filter).project({ _id: 1 }).toArray()];
                case 1:
                    tweetIds = _a.sent();
                    sampledIds = [];
                    for (i = 0; i < Math.min(20, tweetIds.length); i++) { // Sample either 20 or the amount of IDs, whichever is smaller
                        sampledIds.push(tweetIds.splice(Math.floor(Math.random() * tweetIds.length - 1), 1)[0]._id); // Remove IDs as they are sampled
                    }
                    return [4 /*yield*/, Tweet.find({ _id: { $in: sampledIds } }).toArray()];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
export var router = t.router({
    // User
    deleteUser: isUserProcedure
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.User.deleteOne(ctx.User)];
                case 1: return [2 /*return*/, (_c.sent()).acknowledged];
            }
        });
    }); }),
    markTweet: isUserProcedure
        .input(z.array(zTweetSchema))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.User.updateOne(ctx.user, {
                        $push: { viewedPosts: { $each: input.map(function (tweet) { return tweet.tweet_id; }) } },
                    })];
                case 1: return [2 /*return*/, (_c.sent()).acknowledged];
            }
        });
    }); }),
    // Tweet
    getRandomTweets: publicProcedure
        .input(zTweetSchema.pick({ stackUsername: true }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, queryRandomTweets(ctx.Tweet, input)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getRandomUnviewedTweets: isUserProcedure
        .input(zTweetSchema.pick({ stackUsername: true }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, queryRandomTweets(ctx.Tweet, {
                        stackUsername: input.stackUsername,
                        tweet_id: { $nin: ctx.user.viewedPosts },
                    })];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    getTweets: publicProcedure
        .input(z.object({
        tweetFilter: zTweetSchema.or(z.record(zTweetSchema.keyof(), z.any())).describe("Accepts either a plain tweet filter or a mongodb filter object"),
        tweetSorter: z.optional(z.record(zTweetSchema.keyof(), z.literal(1).or(z.literal(-1))).describe("A record with keys of tweet properties, and values of 1 (ascending) or -1 (descending)")),
        page: z.number(),
        pageSize: z.number()
    }))
        .output(z.array(z.object({ metadata: z.array(z.object({ count: z.number() })), data: z.array(zTweetSchema) })))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, ctx.Tweet
                        .aggregate([
                        { $match: input.tweetFilter },
                        { $sort: (_c = input.tweetSorter) !== null && _c !== void 0 ? _c : { tweet_id: 1 } },
                        {
                            $facet: {
                                metadata: [{ $count: 'count' }],
                                data: [{ $skip: (input.page - 1) * input.pageSize }, { $limit: input.pageSize }]
                            }
                        }
                    ]).toArray()];
                case 1: return [2 /*return*/, _d.sent()];
            }
        });
    }); }),
    createTweets: isAdminProcedure
        .input(z.array(zTweetSchema))
        .output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.Tweet.insertMany(input)];
                case 1: return [2 /*return*/, (_c.sent()).acknowledged];
            }
        });
    }); }),
    // Stack
    getStacks: publicProcedure
        .input(zStackSchema.partial())
        .output(z.array(zStackSchema))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.Stack.find(input).toArray()];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); }),
    createStack: isAdminProcedure
        .input(zStackSchema.pick({ twitterHandle: true }))
        .output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.Stack.insertOne(__assign({ postCount: 0 }, input))];
                case 1: return [2 /*return*/, (_c.sent()).acknowledged];
            }
        });
    }); }),
    deleteStack: isAdminProcedure
        .input(zStackSchema.pick({ twitterHandle: true }))
        .output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.Stack.deleteOne(__assign({}, input))];
                case 1: return [2 /*return*/, (_c.sent()).acknowledged];
            }
        });
    }); }),
});

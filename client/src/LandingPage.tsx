export function LandingPage() {
    return (
        <>
            {/* Banner */}
            <div className="bg-dark w-full h-200 2xl:h-230 text-light square">
                <div className="flex flex-col items-center w-full">
                    {/* Title */}
                    <p className="mt-10 lg:mt-40 w-min lg:w-max text-6xl sm:text-8xl">Your likes, unprivated.</p>
                    {/* Subheader */}
                    <div className="mt-14 w-70vw font-light text-md sm:text-2xl">
                        <p className="inline-block"> Contact me: </p>

                        <a
                            className="inline-block ml-1 text-light/80 hover:underline"
                            href="https://discord.com/users/481133728450609162"
                        >
                            <img alt="Discord" src="discordlogo.png" className="inline-block mr-2 ml-3 size-8" />
                            {''}
                            scapsters
                        </a>
                        <a className="inline-block ml-1 text-light/80 hover:underline" href="https://x.com/Scappy11">
                            <img alt="Discord" src="twitterlogo.png" className="inline-block mr-2 ml-3 size-8" />
                            {''}
                            Scappy11
                        </a>
                    </div>
                </div>
                {/* Timeline */}
                <div className="mt-10 lg:mt-60 2xl:mt-90">
                    {/* Desktop Timeline */}
                    <div className="invisible lg:visible absolute bg-cyan w-6/10 h-4" />
                    <div className="invisible lg:visible left-1/10 absolute bg-cyan rounded-md w-3 h-20 -translate-y-8" />
                    <div className="invisible lg:visible left-3/10 absolute bg-cyan rounded-md w-3 h-20 -translate-y-8" />
                    <div className="invisible lg:visible left-6/10 absolute bg-cyan rounded-md w-3 h-20 -translate-y-8" />

                    {/* Mobile Timeline*/}
                    <div className="lg:invisible visible left-3/10 absolute bg-cyan mt-15 w-4 h-80" />
                    <div className="lg:invisible visible left-3/10 absolute bg-linear-to-b from-transparent to-cyan mt-15 w-4 h-10 -translate-y-10" />
                    <div className="lg:invisible visible left-3/10 absolute bg-cyan mt-15 rounded-md w-20 h-3 -translate-x-8 translate-y-10" />
                    <div className="lg:invisible visible left-3/10 absolute bg-cyan mt-15 rounded-md w-20 h-3 -translate-x-8 translate-y-50" />
                    <div className="lg:invisible visible left-3/10 absolute bg-cyan mt-15 rounded-md w-20 h-3 -translate-x-8 translate-y-80" />

                    {/* Desktop Labels */}
                    <div className="invisible lg:visible text-cyan">
                        <p className="left-1/10 absolute w-80 text-2xl text-center -translate-x-40 translate-y-14">
                            {' '}
                            June 2024{' '}
                        </p>
                        <p className="left-3/10 absolute w-80 text-2xl text-center -translate-x-40 translate-y-14">
                            {' '}
                            July 2024{' '}
                        </p>
                        <p className="left-6/10 absolute w-80 text-2xl text-center -translate-x-40 translate-y-14">
                            {' '}
                            Sept 2025{' '}
                        </p>

                        <p className="left-1/10 absolute w-60 text-3xl text-center -translate-x-28 -translate-y-30">
                            {' '}
                            Public Likes Removed ):{' '}
                        </p>
                        <img
                            alt="Discord"
                            src="yeah.jpg"
                            className="left-3/10 absolute rounded-lg w-40 aspect-auto -translate-x-18 -translate-y-30"
                        />
                        <p className="top-116 2xl:top-146 left-6/10 absolute h-7/5 text-6xl text-center -translate-x-1/2 brand">
                            {' '}
                            Scrapstack{' '}
                        </p>
                    </div>

                    {/* Mobile Labels */}
                    <div className="lg:invisible visible text-cyan">
                        <p className="left-3/10 absolute mt-15 w-min text-xl text-center -translate-x-22 translate-y-0">
                            {' '}
                            June 2024{' '}
                        </p>
                        <p className="left-3/10 absolute mt-15 w-min text-xl text-center -translate-x-22 translate-y-40">
                            {' '}
                            July 2024{' '}
                        </p>
                        <p className="left-3/10 absolute mt-15 w-min text-xl text-center -translate-x-22 translate-y-70">
                            {' '}
                            Sept 2025{' '}
                        </p>

                        <p className="left-3/10 absolute mt-15 w-40 text-2xl text-center translate-x-15 translate-y-3">
                            {' '}
                            Public Likes Removed ):{' '}
                        </p>
                        <img
                            alt="Discord"
                            src="yeah.jpg"
                            className="left-3/10 absolute mt-15 rounded-lg w-40 aspect-auto translate-x-15 translate-y-41"
                        />
                        <p className="top-175 md:left-3/10 absolute sm:ml-13 w-full! md:w-80! h-min text-5xl text-center brand">
                            {' '}
                            Scrapstack{' '}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center w-full text-lg">
                <div className="px-10 w-full md:w-200 text-dark">
                    <h1>Your likes, public again.</h1>
                    <p className="mt-5">
                        Give your followers and everyone else the ability to view and search your liked posts again. No
                        need to repost each and every tweet you like. Just post a link to your Scrapstack site in your
                        bio, and anyone can view your likes with just a click.
                    </p>
                    <h1>Your likes, searchable.</h1>
                    <p className="mt-5">
                        With your liked posts in our database, you can search them freely and effectively.
                    </p>
                </div>
                <div className="flex flex-col items-center bg-cyan-dark mt-10 py-10 w-full text-light">
                    <div className="px-10 w-full md:w-200">
                        <p className="font-bold text-cyan-light text-2xl">Get Started</p>
                        <p className="mt-5">
                            If you're interested, please reach out at @scappy11 on Twitter, or @scapsters on Discord.
                            Also, please read the disclaimers below.
                        </p>
                        <p className="mt-5">
                            Even if you aren't technical, still reach out! I have no problem taking the time to explain
                            any security concerns.
                        </p>
                    </div>
                </div>
                <div className="px-10 w-full md:w-200 text-dark">
                    <h1>What's the catch?</h1>
                    <p className="mt-5">
                        Because I don't have $5,000 dollars to sacrifice to the Twitter API, in order to access your
                        liked posts, you have to provide your login cookies to a script. This is risky. To be as
                        transparent as possible, we have both an explanation, and some precautions.
                    </p>
                    <p className="mt-15 font-bold text-cyan-dark">What's a login cookie?</p>
                    <p className="mt-5">
                        When you sign into Twitter, you provide your username and password. In exchange, your browser is
                        given a long, random string of characters that temporarily says “I'm me!” Cookies are good
                        because they are <span className="font-bold">restricted</span>.
                    </p>
                    <p className="mt-5">
                        Login cookies <span className="font-bold text-cyan-dark underline">cannot</span>:
                    </p>
                    <ul>
                        <li>Make you lose access to your account, by changing your password or otherwise</li>
                        <li>View private info about you like your email address and location</li>
                    </ul>
                    <p className="mt-5">
                        Login cookies <span className="font-bold text-cyan-dark underline">can</span>:
                    </p>
                    <ul>
                        <li>View likes, bookmarks</li>
                        <li>Follow unsavory political figures</li>
                        <li>Make tweets as you</li>
                    </ul>
                    <p className="mt-5">
                        While we promise (and can show) that our script doesn't do these things, you should know its
                        possible.
                    </p>
                    <p className="mt-5">
                        To see for yourself, go to{' '}
                        <a href="https://x.com/settings/account" className="text-cyan hover:underline">
                            https://x.com/settings/account
                        </a>{' '}
                        and attempt to take these actions. You're required to use your password. So, with just your
                        login cookies, less is at risk.
                    </p>
                    <p className="mt-15 font-bold text-cyan-dark">What precautions do we take?</p>
                    <ul>
                        <li className="mt-5!">
                            We send you the script that will gather your liked posts, so that you can run it locally.
                            That means we won't ever see your cookies.
                        </li>
                        <li className="mt-5!">
                            The script is so small that we can review it with you, and even have an AI check it for
                            safety.
                        </li>
                    </ul>
                    <p className="mt-10 w-max font-bold">
                        The risk for you is our script sending your cookies to us, which should{' '}
                        <span className="underline">never</span> happen.
                    </p>
                    <h1>Small note from me</h1>
                    <p className="mt-5">
                        This project was originally just for me, so that I could easily view/search/sort my originally
                        5k, now ~11k images of furry art I have liked, but I thought it might be interesting for some
                        people who wish they could show their likes to others. My particular inspiration are the furry
                        artists that used their likes page as a way to show off cool art from smaller artists.
                    </p>
                    <p className="mt-5 mb-10">
                        I'm not looking for money or anything, this landing page only exists because I thought it'd be
                        fun to practice making "startup"-looking websites, since it seems my career will be web
                        development.
                    </p>
                </div>
            </div>
        </>
    )
}

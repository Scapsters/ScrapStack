import { useNavigate } from "react-router-dom"

export function LandingPage() {
    return (
        <>
            {/* Banner */}
            <div className="w-full h-200 2xl:h-230 bg-dark square text-light">
                <div className="flex flex-col items-center w-full">
                    {/* Title */}
                    <p className="mt-10 text-6xl lg:mt-40 sm:text-8xl w-min lg:w-max">Your likes, unprivated.</p> 
                    {/* Subheader */}
                    <div className="font-light mt-14 text-md sm:text-2xl w-70vw">
                        <p className="inline-block"> Contact me: </p>
                        
                        <a className="inline-block ml-1 text-light/80 hover:underline" href="https://discord.com/users/481133728450609162">
                            <img alt="Discord" src="discordlogo.png" className="inline-block ml-3 mr-2 size-8" />{""}
                            scapsters
                        </a>   
                        <a className="inline-block ml-1 text-light/80 hover:underline" href="https://x.com/Scappy11">
                            <img alt="Discord" src="twitterlogo.png" className="inline-block ml-3 mr-2 size-8" />{""}
                            Scappy11
                        </a>   
                    </div>
                </div>
                {/* Timeline */}
                <div className="mt-10 lg:mt-60 2xl:mt-90">
                    {/* Desktop Timeline */}
                    <div className="absolute invisible h-4 lg:visible w-6/10 bg-cyan" />
                    <div className="absolute invisible w-3 h-20 -translate-y-8 rounded-md lg:visible left-1/10 bg-cyan"/>
                    <div className="absolute invisible w-3 h-20 -translate-y-8 rounded-md lg:visible left-3/10 bg-cyan"/>
                    <div className="absolute invisible w-3 h-20 -translate-y-8 rounded-md lg:visible left-6/10 bg-cyan"/>

                    {/* Mobile Timeline*/}
                    <div className="absolute visible w-4 lg:invisible h-80 left-3/10 bg-cyan" />
                    <div className="absolute visible w-4 h-10 -translate-y-10 lg:invisible left-3/10 bg-linear-to-b from-transparent to-cyan" />
                    <div className="absolute visible w-20 h-3 -translate-x-8 translate-y-10 rounded-md lg:invisible left-3/10 bg-cyan"/>
                    <div className="absolute visible w-20 h-3 -translate-x-8 rounded-md lg:invisible translate-y-50 left-3/10 bg-cyan"/>
                    <div className="absolute visible w-20 h-3 -translate-x-8 rounded-md lg:invisible translate-y-80 left-3/10 bg-cyan"/>

                    {/* Desktop Labels */}
                    <div className="invisible text-cyan lg:visible">
                        <p className="absolute text-2xl text-center -translate-x-40 translate-y-14 left-1/10 w-80"> June 2024 </p>
                        <p className="absolute text-2xl text-center -translate-x-40 translate-y-14 left-3/10 w-80"> July 2024 </p>
                        <p className="absolute text-2xl text-center -translate-x-40 translate-y-14 left-6/10 w-80"> Sept 2025 </p>
                        
                        <p className="absolute text-3xl text-center -translate-y-30 left-1/10 -translate-x-28 w-60"> Public Likes Removed ): </p>
                        <img alt="Discord" src="yeah.jpg" className="absolute w-40 rounded-lg -translate-y-30 left-3/10 -translate-x-18 aspect-auto" /> 
                        <p className="absolute text-6xl text-center top-116 2xl:top-146 left-19/40 brand h-7/5"> Scrapstack </p>
                    </div>

                    {/* Mobile Labels */}
                    <div className="visible text-cyan lg:invisible">
                        <p className="absolute text-xl text-center translate-y-0 -translate-x-22 left-3/10 w-min"> June 2024 </p>
                        <p className="absolute text-xl text-center translate-y-40 -translate-x-22 left-3/10 w-min"> July 2024 </p>
                        <p className="absolute text-xl text-center translate-y-70 -translate-x-22 left-3/10 w-min"> Sept 2025 </p>
                        
                        <p className="absolute w-40 text-2xl text-center translate-y-3 left-3/10 translate-x-15"> Public Likes Removed ): </p>
                        <img alt="Discord" src="yeah.jpg" className="absolute w-40 rounded-lg translate-y-41 left-3/10 translate-x-15 aspect-auto" /> 
                        <p className="absolute w-full! md:w-80! text-5xl text-center top-180 h-min md:left-3/10 brand"> Scrapstack </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center w-full text-lg">
                <div className="w-full px-10 text-dark md:w-200">
                    <h1>Your likes, public again.</h1>
                    <p className="mt-5">
                        Give your followers and everyone else the ability to view and search your liked posts again. 
                        No need to repost each and every tweet you like. Just post a link to your Scrapstack site in 
                        your bio, and anyone can view your likes with just a click.
                    </p>
                    <h1>Your likes, searchable.</h1>
                    <p className="mt-5">
                        With your liked posts in our database, you can search them freely and effectively.
                    </p>
                </div>
                <div className="flex flex-col items-center w-full py-10 mt-10 bg-cyan-dark text-light">
                    <div className="w-full px-10 md:w-200">
                        <p className="text-2xl font-bold text-cyan-light">Get Started</p>
                        <p className="mt-5">
                            If you're interested, please reach out at @scappy11 on Twitter, or @scapsters on Discord. 
                            Also, please read the disclaimers below.
                        </p>
                        <p className="mt-5">
                            Even if you aren't technical, still reach out! I have no problem taking the time to explain any security concerns.
                        </p>
                    </div>
                </div>    
                <div className="w-full px-10 text-dark md:w-200">
                    <h1>What's the catch?</h1>
                    <p className="mt-5">
                        Because I don't have $5,000 dollars to sacrifice to the Twitter API, in order to access your liked posts, 
                        you have to provide your login cookies to a script. This is risky. To be as transparent as possible,
                        we have both an explanation, and some precautions.
                    </p>
                    <p className="font-bold mt-15 text-cyan-dark">What's a login cookie?</p>
                    <p className="mt-5">
                        When you sign into Twitter, you provide your username and password. 
                        In exchange, your browser is given a long, random string of characters that temporarily says 
                        “I'm me!” Cookies are good because they are <span className="font-bold">restricted</span>.
                    </p>
                    <p className="mt-5">Login cookies <span className="font-bold underline text-cyan-dark">cannot</span>:</p>
                    <ul>
                        <li>Make you lose access to your account, by changing your password or otherwise</li>
                        <li>View private info about you like your email address and location</li>
                    </ul>
                    <p className="mt-5">Login cookies <span className="font-bold underline text-cyan-dark">can</span>:</p>
                    <ul>
                        <li>View likes, bookmarks</li>
                        <li>Follow unsavory political figures</li>
                        <li>Make tweets as you</li>
                    </ul>
                    <p className="mt-5">
                        While we promise (and can show) that our script doesn't do these things, you should know its possible.
                    </p>
                    <p className="mt-5">
                        To see for yourself, go to <a href="https://x.com/settings/account" className="text-cyan hover:underline">https://x.com/settings/account</a> and attempt to take these actions. 
                        You're required to use your password. So, with just your login cookies, less is at risk.
                    </p>
                    <p className="font-bold mt-15 text-cyan-dark">What precautions do we take?</p>
                    <ul>
                        <li className="mt-5!">We send you the script that will gather your liked posts, so that you can run it locally. That means we won't ever see your cookies.</li>
                        <li className="mt-5!">The script is so small that we can review it with you, and even have an AI check it for safety.</li>
                    </ul>
                    <p className="mt-10 font-bold w-max">
                        The risk for you is our script sending your cookies to us, which 
                        should <span className="underline">never</span> happen.
                    </p>
                    <h1>
                        Small note from me
                    </h1>
                    <p className="mt-5">
                        This project was originally just for me, so that I could easily view/search/sort my originally 5k, 
                        now ~11k images of furry art I have liked, but I thought it might be interesting for some people who 
                        wish they could show their likes to others. My particular inspiration are the furry artists that used 
                        their likes page as a way to show off cool art from smaller artists.
                    </p>
                    <p className="mt-5 mb-10">
                        I'm not looking for money or anything, this landing page only exists because I thought it'd be fun 
                        to practice making "startup"-looking websites, since it seems my career will be web development.
                    </p>
                </div>
            </div>
        </>
    )
}

export function TopBar() {
    const navigate = useNavigate()
    return (
        <>
            <div className="h-20 border-b-10 bg-cyan border-b-cyan-light text-light">
                <div className="flex items-center justify-between h-full px-10 text-xl">
                    <button className="text-2xl cursor-pointer hover:underline" onClick={() => navigate("/")}>ScrapStack</button>
                    <button className="cursor-pointer hover:underline" onClick={() => navigate("/search")}>Search Stacks</button>
                </div>
            </div>
        </>
    )
}


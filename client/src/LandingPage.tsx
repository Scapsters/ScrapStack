export default function LandingPage() {
    return (<>
        {/* Banner */}
        <div className="flex justify-center w-full h-155 sm:h-145 bg-primaryLight">
            <div>
                {/* Primary Timeline */}
                <div className="relative top-12.5 right-31 sm:right-61 w-min">
                    <div className="absolute bg-primary w-1.75 -top-12.5 h-124"></div>
                    <div className="absolute bg-primary w-12 h-1.75 -left-5 top-15 rounded-md"></div>
                    <div className="absolute bg-primary w-12 h-1.75 -left-5 top-50 sm:top-35 rounded-md"></div>
                    <div className="absolute bg-primary w-12 h-1.75 -left-5 top-110 rounded-md"></div>
                </div>
                {/* Shadow Timeline */}
                <div className="relative top-10 right-30 sm:right-60 w-min">
                    <div className="absolute bg-primaryDark w-1.75 -top-10 h-121"></div>
                    <div className="absolute bg-primaryDark w-12 h-1.75 -left-4.75 top-15 rounded-md"></div>
                    <div className="absolute bg-primaryDark w-12 h-1.75 -left-4.75 top-50 sm:top-35 rounded-md"></div>
                    <div className="absolute bg-primaryDark w-12 h-1.75 -left-4.75 top-110 rounded-md"></div>
                </div>
                <div className="relative text-2xl font-bold sm:text-3xl right-120">
                    {/* First Row of Text */}
                    <div className="relative top-17 sm:top-20">
                        <div className="absolute -top-4 sm:top-4 text-primary left-98 sm:left-15">
                            <p className="text-right w-max">June 2024</p>
                        </div>
                        <div className="absolute top-4 sm:top-1 left-98 sm:left-70 text-primaryDark">
                            <p className="text-left w-max">Public Likes Removed</p>
                        </div>
                        <div className="absolute text-sm top-11 sm:top-8 sm:text-lg left-98 sm:left-70 text-primaryDark">
                            <p className="text-left w-60 sm:w-max">so Elon could Like nasty stuff on Twitter</p>
                        </div>
                    </div>
                    {/* Second Row of Text */}
                    <div className="relative top-52 sm:top-40">
                        <div className="absolute -top-4 sm:top-4 text-primary left-98 sm:left-15">
                            <p className="text-right w-max">July 2024</p>
                        </div>
                        <div className="absolute top-4 sm:top-1 left-98 sm:left-70 text-primaryDark">
                            <p className="text-left w-max">The "Yeah!"s</p>
                        </div>
                        <div className="absolute text-sm top-11 sm:top-8 sm:text-lg left-98 sm:left-70 text-primaryDark">
                            <p className="text-left w-60 sm:w-max">Lowk spam</p>
                        </div>
                    </div>
                    {/* Inbetween Text */}
                    <div className="relative top-70">
                        <div className="absolute text-lg top-16 sm:top-8 left-98 sm:left-70 text-primaryDark">
                            <p className="text-right w-max">What now...?</p>
                        </div>
                    </div>
                    {/* Third Row of Text */}
                    <div className="relative top-115">
                        <div className="absolute top-4 text-primary left-15">
                            <p className="text-right w-max">July 2024</p>
                        </div>
                        <div className="absolute text-6xl top-10 sm:-top-10 sm:text-8xl left-80 sm:left-70 text-accent-dark">
                            <p className="text-right w-max">ScrapStack</p>
                        </div>
                        <div className="absolute text-lg top-26 sm:top-16 left-80 sm:left-70 text-primaryDark">
                            <p className="text-right w-max">A reasonable set of compromises</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div>

        </div>
    </>)
}

export function TopBar() {
    return (<>
        <div className="flex h-20 bg-primary justify-">
            
        </div>
    </>)
}

export function SideBar() {
    return (<>
    
    </>)
}
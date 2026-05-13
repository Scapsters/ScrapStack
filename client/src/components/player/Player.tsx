import ReactPlayer from "react-player"
import {
	MediaController,
	MediaControlBar,
	MediaTimeRange,
	MediaPlayButton,
	MediaMuteButton,
	MediaFullscreenButton,
} from "media-chrome/react"
import { useContext, useRef } from "react"
import { playerContext } from "@/components/player/context"
import { useIsVisible } from "@/lib/useIsVisible"

export default function Player(props: Parameters<typeof ReactPlayer>[0]) {

	const visibilityRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isVisible] = useIsVisible(visibilityRef)

	const { isMuted, setIsMuted } = useContext(playerContext)
	
	return (
		<div 
			ref={visibilityRef}	
		>
			<MediaController
				className={`min-w-0 max-w-[90dvw] lg:max-w-[40dvw]`}
			>
				<ReactPlayer
					ref={videoRef}
					slot="media"
					{...props}
					loop={true}
					muted={isMuted}
					autoPlay={isVisible}
					controls={false}
					style={{
						width: "100%",
						height: "100%",
					}}
				></ReactPlayer>
				<MediaControlBar>
					<MediaPlayButton style={{ width: "30%", maxWidth: "120px" }} />
					<MediaTimeRange />
					<MediaMuteButton onClick={() => setIsMuted && setIsMuted(false)} style={{ width: "30%", maxWidth: "80px" }}/>
					<MediaFullscreenButton style={{ width: "30%", maxWidth: "120px" }} />
				</MediaControlBar>
			</MediaController>
		</div>
	)
}
import ReactPlayer from "react-player";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaVolumeRange,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";

export default function Player(props: Parameters<typeof ReactPlayer>[0]) {
  return (
    <MediaController
    className="h-60 md:h-80 lg:h-120 aspect-auto"
    >
      <ReactPlayer
        slot="media"
        {...props}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
        }}
      ></ReactPlayer>
      <MediaControlBar>
        <MediaPlayButton />
        <MediaTimeRange />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
}
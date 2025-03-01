import { motion } from "framer-motion";
import type { TwitchColour, TwitchStream } from "../types/twitch";
import FavoriteButton from "./buttons/FavoriteButton";
import { useMemo } from "react";

function parseRgba(colour: TwitchColour) {
  const justColours = colour.colorRgb.replace("rgb(", "").replace(")", "");
  return `rgba(${justColours},0.7)`;
}

interface ChannelProps {
  data: TwitchStream;
  hidden: boolean;
  favorite?: boolean;
  setFavorites: (old: boolean) => void;
}

function Channel({
  data,
  hidden,
  favorite = false,
  setFavorites,
}: ChannelProps) {
  const {
    title,
    user_name,
    user_login,
    viewer_count,
    game_name,
    profile_image_url,
    average_color,
  } = data;

  const truncatedTitle = useMemo(() => {
    const truncationLength = 66;
    if (title.length > truncationLength) {
      return `${title.substring(0, truncationLength - 3)}...`;
    }

    return title;
  }, [title]);

  const parsedColour = average_color ? parseRgba(average_color) : "#000";

  return (
    <div
      title={title}
      hidden={hidden}
      className="relative border-none bg-none p-0"
    >
      <motion.button
        className="m-2.5 h-32 w-[80vw] cursor-pointer rounded-2xl border-none bg-none"
        style={{
          backgroundColor: parsedColour,
          color: average_color?.isLight ? "#000" : "#FFF",
          boxShadow: `0 0 10px ${parsedColour}`,
        }}
        onClick={() => window.open(`https://twitch.tv/${user_login}`)}
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          className="float-left m-2.5 h-28 w-28 rounded-2xl border-none bg-none"
          src={profile_image_url}
          crossOrigin="anonymous"
          alt={`${user_name} stream thumbnail`}
        />
        <div className="prose left-32 flex h-full max-w-sm flex-col items-center justify-center text-[2.3vw]">
          <h1 className="overflow-hidden text-sm">{truncatedTitle}</h1>
          <p>
            <b>{user_name}</b> is currently playing <b>{game_name}</b> for{" "}
            <b>
              {new Intl.NumberFormat(navigator.language).format(viewer_count)}
            </b>{" "}
            viewers
          </p>
        </div>
      </motion.button>
      <FavoriteButton favorite={favorite} toggleFavorite={setFavorites} />
    </div>
  );
}

export default Channel;
